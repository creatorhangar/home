let cancelMap: Record<string, boolean> = {};

const srgbToLab = (r: number, g: number, b: number) => {
  const lin = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const R = lin(r / 255), G = lin(g / 255), B = lin(b / 255);
  const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
  const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;
  const xr = X / 0.95047, yr = Y / 1.0, zr = Z / 1.08883;
  const fx = xr > 0.008856 ? Math.pow(xr, 1/3) : (7.787 * xr) + 16/116;
  const fy = yr > 0.008856 ? Math.pow(yr, 1/3) : (7.787 * yr) + 16/116;
  const fz = zr > 0.008856 ? Math.pow(zr, 1/3) : (7.787 * zr) + 16/116;
  const L = (116 * fy) - 16, A = 500 * (fx - fy), Bc = 200 * (fy - fz);
  return { l: L, a: A, b: Bc };
};

const computeMeanVar = (data: Uint8ClampedArray, width: number, height: number, labels: Uint8Array, sel: (i:number)=>boolean) => {
  let mr=0, mg=0, mb=0, c=0;
  for (let i = 0; i < width*height; i++) {
    if (!sel(i)) continue;
    const j = i*4; mr += data[j]; mg += data[j+1]; mb += data[j+2]; c++;
  }
  if (c === 0) return { mean:[0,0,0], var:[1,1,1] };
  mr/=c; mg/=c; mb/=c;
  let vr=0, vg=0, vb=0;
  for (let i = 0; i < width*height; i++) {
    if (!sel(i)) continue;
    const j = i*4; const dr = data[j]-mr, dg = data[j+1]-mg, db = data[j+2]-mb;
    vr += dr*dr; vg += dg*dg; vb += db*db;
  }
  vr = Math.max(vr/c, 1); vg = Math.max(vg/c, 1); vb = Math.max(vb/c, 1);
  return { mean:[mr,mg,mb], var:[vr,vg,vb] };
};

type WorkerMsg = {
  task?: 'graphcut' | 'iterative' | 'morph' | 'filter';
  taskId?: string;
  imageData: ImageData;
  width: number;
  height: number;
  options: any;
};

const postProgress = (taskId: string | undefined, stage: string, iter: number, progress: number) => {
  (self as any).postMessage({ type: 'progress', taskId, stage, iter, progress });
};

// Dinic Max-Flow implementation for grid graph
class Dinic {
  n: number; head: Int32Array; to: Int32Array; cap: Float64Array; next: Int32Array; level: Int32Array; it: Int32Array; idx: number;
  constructor(nodeCount: number, maxEdges: number) {
    this.n = nodeCount;
    this.head = new Int32Array(nodeCount).fill(-1);
    this.to = new Int32Array(maxEdges);
    this.cap = new Float64Array(maxEdges);
    this.next = new Int32Array(maxEdges);
    this.level = new Int32Array(nodeCount);
    this.it = new Int32Array(nodeCount);
    this.idx = 0;
  }
  addEdge(u: number, v: number, c: number) {
    this.to[this.idx] = v; this.cap[this.idx] = c; this.next[this.idx] = this.head[u]; this.head[u] = this.idx++;
    this.to[this.idx] = u; this.cap[this.idx] = 0; this.next[this.idx] = this.head[v]; this.head[v] = this.idx++;
  }
  bfs(s: number, t: number): boolean {
    this.level.fill(-1); const q = new Int32Array(this.n); let h=0, r=0; q[r++] = s; this.level[s] = 0;
    while (h < r) { const u = q[h++]; for (let e = this.head[u]; e !== -1; e = this.next[e]) { const v = this.to[e]; if (this.cap[e] > 1e-9 && this.level[v] < 0) { this.level[v] = this.level[u] + 1; q[r++] = v; } } }
    return this.level[t] >= 0;
  }
  dfs(u: number, t: number, f: number): number {
    if (u === t) return f;
    for (let e = this.it[u]; e !== -1; e = this.next[e]) {
      this.it[u] = e;
      const v = this.to[e];
      if (this.cap[e] > 1e-9 && this.level[v] === this.level[u] + 1) {
        const ret = this.dfs(v, t, Math.min(f, this.cap[e]));
        if (ret > 0) { this.cap[e] -= ret; this.cap[e^1] += ret; return ret; }
      }
    }
    return 0;
  }
  maxflow(s: number, t: number): number {
    let flow = 0;
    while (this.bfs(s, t)) {
      this.it.set(this.head);
      let f; while ((f = this.dfs(s, t, 1e18)) > 0) { flow += f; }
    }
    return flow;
  }
  reachableFromSource(s: number): Uint8Array {
    const vis = new Uint8Array(this.n);
    const stack = new Int32Array(this.n); let top = 0; stack[top++] = s; vis[s] = 1;
    while (top) { const u = stack[--top]; for (let e = this.head[u]; e !== -1; e = this.next[e]) { const v = this.to[e]; if (this.cap[e] > 1e-9 && !vis[v]) { vis[v] = 1; stack[top++] = v; } } }
    return vis;
  }
}

self.onmessage = (e: MessageEvent) => {
  const { imageData, width, height, options, task, taskId } = e.data as WorkerMsg;
  if (task === 'cancel' && taskId) { cancelMap[taskId] = true; return; }

  const data = imageData.data;
  const iters = (options?.grabcut?.iterations ?? 5) as number;
  const bbox = options?.grabcut?.bbox ?? { x: 0, y: 0, width, height };
  const fgPts = options?.grabcut?.fgScribbles ?? [];
  const bgPts = options?.grabcut?.bgScribbles ?? [];

  const GC_BGD = 0, GC_FGD = 1, GC_PR_BGD = 2, GC_PR_FGD = 3;
  const labels = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const inside = x >= bbox.x && x < bbox.x + bbox.width && y >= bbox.y && y < bbox.y + bbox.height;
      labels[i] = inside ? GC_PR_FGD : GC_BGD;
    }
  }
  for (const p of fgPts) {
    const ix = Math.round(p.x), iy = Math.round(p.y);
    if (ix >= 0 && ix < width && iy >= 0 && iy < height) labels[iy * width + ix] = GC_FGD;
  }
  for (const p of bgPts) {
    const ix = Math.round(p.x), iy = Math.round(p.y);
    if (ix >= 0 && ix < width && iy >= 0 && iy < height) labels[iy * width + ix] = GC_BGD;
  }

  const nodeIndex = (x: number, y: number) => (y - bbox.y) * bbox.width + (x - bbox.x);
  const nodeCount = bbox.width * bbox.height;
  const S = nodeCount, T = nodeCount + 1;

  const computeBeta = () => {
    let sum = 0; let cnt = 0;
    for (let y = bbox.y; y < bbox.y + bbox.height; y+=2) {
      for (let x = bbox.x; x < bbox.x + bbox.width; x+=2) {
        const i = (y*width + x)*4;
        const pLab = srgbToLab(data[i], data[i+1], data[i+2]);
        const nx = x+1 < bbox.x + bbox.width ? x+1 : x; const ny = y;
        const j = (ny*width + nx)*4;
        const qLab = srgbToLab(data[j], data[j+1], data[j+2]);
        const dl = pLab.l - qLab.l, da = pLab.a - qLab.a, db = pLab.b - qLab.b;
        sum += dl*dl + da*da + db*db; cnt++;
      }
    }
    const avg = cnt ? sum / cnt : 1;
    return 1 / (2 * avg);
  };
  const beta = computeBeta();
  const lambda = options?.grabcut?.lambda ?? 50;

  const isSeedFG = new Uint8Array(width * height);
  const isSeedBG = new Uint8Array(width * height);
  for (const p of fgPts) { const ix = Math.round(p.x), iy = Math.round(p.y); if (ix>=0&&ix<width&&iy>=0&&iy<height) isSeedFG[iy*width+ix] = 1; }
  for (const p of bgPts) { const ix = Math.round(p.x), iy = Math.round(p.y); if (ix>=0&&ix<width&&iy>=0&&iy<height) isSeedBG[iy*width+ix] = 1; }

  for (let t = 0; t < iters; t++) {
    if (taskId && cancelMap[taskId]) break;
    postProgress(taskId, 'gmm', t, 0.1);
    const fgStats = computeMeanVar(data, width, height, labels, i => labels[i] === GC_FGD || labels[i] === GC_PR_FGD);
    const bgStats = computeMeanVar(data, width, height, labels, i => labels[i] === GC_BGD || labels[i] === GC_PR_BGD);

    const maxEdgesEstimate = nodeCount * (4 + 2) * 2;
    const dinic = new Dinic(nodeCount + 2, Math.max(8, maxEdgesEstimate));

    for (let y = bbox.y; y < bbox.y + bbox.height; y++) {
      for (let x = bbox.x; x < bbox.x + bbox.width; x++) {
        const idx = y*width + x; const n = nodeIndex(x,y);
        const j = idx*4; const r = data[j], g = data[j+1], b = data[j+2];
        const df0 = r - fgStats.mean[0], df1 = g - fgStats.mean[1], df2 = b - fgStats.mean[2];
        const db0 = r - bgStats.mean[0], db1 = g - bgStats.mean[1], db2 = b - bgStats.mean[2];
        const Dfg = (df0*df0)/fgStats.var[0] + (df1*df1)/fgStats.var[1] + (df2*df2)/fgStats.var[2];
        const Dbg = (db0*db0)/bgStats.var[0] + (db1*db1)/bgStats.var[1] + (db2*db2)/bgStats.var[2];
        const INF = 1e6;
        if (isSeedFG[idx]) { dinic.addEdge(S, n, INF); dinic.addEdge(n, T, 0); }
        else if (isSeedBG[idx]) { dinic.addEdge(S, n, 0); dinic.addEdge(n, T, INF); }
        else { dinic.addEdge(S, n, Dfg); dinic.addEdge(n, T, Dbg); }

        const pLab = srgbToLab(r,g,b);
        if (x+1 < bbox.x + bbox.width) {
          const idx2 = y*width + (x+1); const j2 = idx2*4; const qLab = srgbToLab(data[j2], data[j2+1], data[j2+2]);
          const dl = pLab.l - qLab.l, da = pLab.a - qLab.a, db = pLab.b - qLab.b;
          const w = lambda * Math.exp(-beta * (dl*dl + da*da + db*db));
          dinic.addEdge(n, nodeIndex(x+1, y), w);
          dinic.addEdge(nodeIndex(x+1, y), n, w);
        }
        if (y+1 < bbox.y + bbox.height) {
          const idx2 = (y+1)*width + x; const j2 = idx2*4; const qLab = srgbToLab(data[j2], data[j2+1], data[j2+2]);
          const dl = pLab.l - qLab.l, da = pLab.a - qLab.a, db = pLab.b - qLab.b;
          const w = lambda * Math.exp(-beta * (dl*dl + da*da + db*db));
          dinic.addEdge(n, nodeIndex(x, y+1), w);
          dinic.addEdge(nodeIndex(x, y+1), n, w);
        }
      }
    }

    postProgress(taskId, 'cut', t, 0.4);
    dinic.maxflow(S, T);
    const reachable = dinic.reachableFromSource(S);

    for (let y = bbox.y; y < bbox.y + bbox.height; y++) {
      for (let x = bbox.x; x < bbox.x + bbox.width; x++) {
        const i = y*width + x; const n = nodeIndex(x,y);
        labels[i] = reachable[n] ? GC_PR_FGD : GC_PR_BGD;
      }
    }
    postProgress(taskId, 'update', t, 0.8);
  }

  const maskBuffer = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width*height; i++) {
    maskBuffer[i] = (labels[i] === GC_FGD || labels[i] === GC_PR_FGD) ? 255 : 0;
  }
  (self as any).postMessage({ type: 'result', taskId, maskBuffer }, [maskBuffer.buffer]);
};
