import { ImageFile } from '../types';

export interface RemovalOptions {
  tolerance: number; // Quão diferente uma cor pode ser da cor alvo para ser removida.
  edgeSoftness?: number; // Quão suave ou borrada a borda do recorte será.
  edgeRefinement?: number; // Novo: -10 a 10. Negativo encolhe, positivo expande.
  contourSmoothing?: number; // Novo: 0-100. Suaviza o contorno para um efeito de ilustração.
  colorDecontamination?: number; // Novo: 0-100. Força da remoção de vazamento de cor.
  sticker?: boolean; // Novo: Habilita os efeitos de adesivo (contorno/sombra).
  outline?: {
      color: string;
      width: number;
  };
  dropShadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
  };
  brightness?: number; // 0-200. Padrão 100.
  contrast?: number; // 0-200. Padrão 100.
  saturation?: number; // 0-200. Padrão 100.
  background?: { // Opções para o fundo da imagem final.
    output: 'transparent' | 'color';
    color: string;
  };
  mode?: 'floodfill' | 'silhouette' | 'chroma' | 'grabcut';
  removalInfo?: Array<{
    color: { r: number; g: number; b: number; a: number; };
    point?: { x: number; y: number; };
    isAuto: boolean;
  }>;
  openingIterations?: number; // Iterações de abertura morfológica (erosão seguida de dilatação)
  closingIterations?: number; // Iterações de fechamento morfológico (dilatação seguida de erosão)
  grabcut?: {
    bbox?: { x: number; y: number; width: number; height: number };
    iterations?: number;
    fgScribbles?: Array<{ x: number; y: number }>;
    bgScribbles?: Array<{ x: number; y: number }>;
    useWorker?: boolean;
    lambda?: number;
  };
  bilateralIntensity?: number;
  bilateralSigmaSpace?: number;
  bilateralSigmaColor?: number;
  bilateralEdgesOnly?: boolean;
  // Opções específicas para o preset de fundo sólido
  colorSpace?: 'HSV' | 'YUV';
  samplingCentralPercent?: number; // 10-50 (default 20)
  refinementKernel?: 3 | 5; // 3 -> leve; 5 -> intenso
  autoTolerance?: boolean;
  toleranceMin?: number;
  toleranceMax?: number;
  hsvUseWorker?: boolean;
  autoGradientCheck?: boolean;
  autoBackgroundValidation?: boolean;
  uniformity?: number; // 0-100. Exige maior consistência de cor para considerar fundo.
}

/**
 * Analisa os pixels dos cantos de uma imagem para encontrar a cor mais dominante.
 * Útil para detectar automaticamente a cor de fundo (ex: em imagens com fundo branco ou verde).
 * @param img - O elemento HTMLImageElement a ser analisado.
 * @returns Um objeto {r, g, b} ou null se a análise falhar.
 */
export const detectDominantBorderColor = (img: HTMLImageElement): { r: number; g: number; b: number; } | null => {
    const canvas = document.createElement('canvas');
    const { width, height } = img;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const colorCounts = new Map<string, number>();
    
    // Amostra uma região de cada canto em vez de apenas os pixels da borda.
    const sampleSize = Math.max(1, Math.min(10, Math.floor(width / 4), Math.floor(height / 4)));
    if (sampleSize < 1) return null; // A imagem é muito pequena.

    const locations = [
        { x: 0, y: 0 }, // Canto superior esquerdo
        { x: width - sampleSize, y: 0 }, // Canto superior direito
        { x: 0, y: height - sampleSize }, // Canto inferior esquerdo
        { x: width - sampleSize, y: height - sampleSize }, // Canto inferior direito
    ];

    for (const loc of locations) {
        for (let y = loc.y; y < loc.y + sampleSize; y++) {
            for (let x = loc.x; x < loc.x + sampleSize; x++) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                // Ignora pixels transparentes/semi-transparentes para uma detecção mais precisa.
                if (a < 128) continue;

                const key = `${r},${g},${b}`;
                colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
            }
        }
    }

    if (colorCounts.size === 0) return null;

    // Encontra a cor mais frequente.
    let maxCount = 0;
    let dominantColorKey = colorCounts.keys().next().value as string | undefined;
    for (const [key, count] of colorCounts.entries()) {
        if (count > maxCount) {
            maxCount = count;
            dominantColorKey = key;
        }
    }
    if (!dominantColorKey) return null;
    const [r, g, b] = dominantColorKey.split(',').map(Number);
    return { r, g, b };
}

const deltaE = (p: { l:number;a:number;b:number }, q: { l:number;a:number;b:number }) => {
  const dl = p.l - q.l, da = p.a - q.a, db = p.b - q.b;
  return Math.sqrt(dl*dl + da*da + db*db);
};

const computeEdgeMap = (imageData: ImageData, width: number, height: number): Float32Array => {
  const d = imageData.data; const g = new Float32Array(width * height);
  const lum = (r:number,g:number,b:number)=> 0.2126*r + 0.7152*g + 0.0722*b;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y*width + x)*4;
      const Lx1 = lum(d[i-4], d[i-3], d[i-2]);
      const Lx2 = lum(d[i+4], d[i+5], d[i+6]);
      const Ly1 = lum(d[i-4*width], d[i-4*width+1], d[i-4*width+2]);
      const Ly2 = lum(d[i+4*width], d[i+4*width+1], d[i+4*width+2]);
      const gx = Lx2 - Lx1; const gy = Ly2 - Ly1; g[y*width + x] = Math.sqrt(gx*gx + gy*gy);
    }
  }
  return g;
};

const validateBackgroundUniformityLAB = (
  imageData: ImageData,
  width: number,
  height: number
): { uniform: boolean; meanDelta: number; varDelta: number; hasGradient: boolean } => {
  const d = imageData.data;
  const sampleLab = (x:number,y:number)=>{ const i=(y*width+x)*4; return srgbToLab(d[i], d[i+1], d[i+2]); };
  const stepX = Math.max(1, Math.floor(width/64));
  const stepY = Math.max(1, Math.floor(height/64));
  const corners = [ sampleLab(0,0), sampleLab(width-1,0), sampleLab(0,height-1), sampleLab(width-1,height-1) ];
  const meanCorner = { l: (corners[0].l+corners[1].l+corners[2].l+corners[3].l)/4,
                       a: (corners[0].a+corners[1].a+corners[2].a+corners[3].a)/4,
                       b: (corners[0].b+corners[1].b+corners[2].b+corners[3].b)/4 };
  let sum=0, sum2=0, n=0;
  for (let x=0;x<width;x+=stepX){ const p1=sampleLab(x,0), p2=sampleLab(x,height-1); const d1=deltaE(p1,meanCorner), d2=deltaE(p2,meanCorner); sum+=d1+d2; sum2+=d1*d1+d2*d2; n+=2; }
  for (let y=0;y<height;y+=stepY){ const p1=sampleLab(0,y), p2=sampleLab(width-1,y); const d1=deltaE(p1,meanCorner), d2=deltaE(p2,meanCorner); sum+=d1+d2; sum2+=d1*d1+d2*d2; n+=2; }
  const meanDelta = sum/Math.max(1,n); const varDelta = Math.max(0, sum2/Math.max(1,n) - meanDelta*meanDelta);
  let gradSum = 0, gradN = 0;
  for (let x=1;x<width;x+=stepX){ const i1=(0*width + x)*4, i0=(0*width + (x-1))*4; const L = d[i1]*0.2126 + d[i1+1]*0.7152 + d[i1+2]*0.0722; const L0 = d[i0]*0.2126 + d[i0+1]*0.7152 + d[i0+2]*0.0722; gradSum += Math.abs(L - L0); gradN++; }
  for (let y=1;y<height;y+=stepY){ const i1=(y*width + 0)*4, i0=((y-1)*width + 0)*4; const L = d[i1]*0.2126 + d[i1+1]*0.7152 + d[i1+2]*0.0722; const L0 = d[i0]*0.2126 + d[i0+1]*0.7152 + d[i0+2]*0.0722; gradSum += Math.abs(L - L0); gradN++; }
  const hasGradient = (gradSum/Math.max(1,gradN)) > 6;
  const uniform = meanDelta < 5 && varDelta < 8;
  return { uniform, meanDelta, varDelta, hasGradient };
};

const rgbToUV = (r: number, g: number, b: number): { u: number; v: number } => {
  const u = r * -0.169 + g * -0.331 + b * 0.5 + 0.5;
  const v = r * 0.5 + g * -0.419 + b * -0.081 + 0.5;
  return { u, v };
};

// Conversão rápida e precisa para HSV
const rgbToHSV = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
  const d = max - min;
  let h = 0;
  if (d === 0) h = 0;
  else if (max === rf) h = ((gf - bf) / d) % 6;
  else if (max === gf) h = (bf - rf) / d + 2;
  else h = (rf - gf) / d + 4;
  h *= 60; if (h < 0) h += 360;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  return { h, s, v };
};

// Histograma HSV na região central com bins configuráveis
const computeHSVHistogram = (
  imageData: ImageData,
  width: number,
  height: number,
  centralPercent = 30,
  hBinDeg = 5,
  sBinPct = 5,
  vBinPct = 5
): { hist: Uint32Array; hBins: number; sBins: number; vBins: number; total: number } => {
  const cx = Math.floor((width * (100 - centralPercent)) / 200);
  const cy = Math.floor((height * (100 - centralPercent)) / 200);
  const cw = Math.max(1, Math.floor(width * (centralPercent / 100)));
  const ch = Math.max(1, Math.floor(height * (centralPercent / 100)));
  const hBins = Math.max(1, Math.floor(360 / hBinDeg));
  const sBins = Math.max(1, Math.floor(100 / sBinPct));
  const vBins = Math.max(1, Math.floor(100 / vBinPct));
  const hist = new Uint32Array(hBins * sBins * vBins);
  const data = imageData.data;
  let total = 0;
  for (let y = cy; y < cy + ch; y++) {
    for (let x = cx; x < cx + cw; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a < 64) continue;
      const { h, s, v } = rgbToHSV(data[i], data[i + 1], data[i + 2]);
      const hi = Math.min(hBins - 1, Math.floor(h / hBinDeg));
      const si = Math.min(sBins - 1, Math.floor((s * 100) / sBinPct));
      const vi = Math.min(vBins - 1, Math.floor((v * 100) / vBinPct));
      const idx = (hi * sBins + si) * vBins + vi;
      hist[idx]++;
      total++;
    }
  }
  return { hist, hBins, sBins, vBins, total };
};

// Detecta moda HSV e confiança na região central
const detectDominantCentralHSV = (
  imageData: ImageData,
  width: number,
  height: number,
  centralPercent = 30
): { hsv: { h: number; s: number; v: number }; confidence: number } | null => {
  const { hist, hBins, sBins, vBins, total } = computeHSVHistogram(imageData, width, height, centralPercent);
  if (total === 0) return null;
  let maxIdx = 0, maxCount = 0;
  for (let i = 0; i < hist.length; i++) {
    const c = hist[i];
    if (c > maxCount) { maxCount = c; maxIdx = i; }
  }
  const confidence = maxCount / total;
  const hi = Math.floor(maxIdx / (sBins * vBins));
  const rem = maxIdx % (sBins * vBins);
  const si = Math.floor(rem / vBins);
  const vi = rem % vBins;
  const h = hi * (360 / hBins) + (360 / hBins) / 2;
  const s = (si * (100 / sBins) + (100 / sBins) / 2) / 100;
  const v = (vi * (100 / vBins) + (100 / vBins) / 2) / 100;
  return { hsv: { h, s, v }, confidence };
};

// Estima uniformidade nas bordas comparando H/S/V com a cor chave
const estimateBorderUniformityHSV = (
  imageData: ImageData,
  width: number,
  height: number,
  keyHSV: { h: number; s: number; v: number }
): { uniformity: number; variance: number } => {
  const data = imageData.data;
  const sample = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return rgbToHSV(data[i], data[i + 1], data[i + 2]);
  };
  const stepX = Math.max(1, Math.floor(width / 64));
  const stepY = Math.max(1, Math.floor(height / 64));
  let sumH = 0, sumS = 0, sumV = 0, sumH2 = 0, sumS2 = 0, sumV2 = 0, n = 0;
  const push = (hsv: { h: number; s: number; v: number }) => {
    // distância angular em H
    let dh = Math.abs(hsv.h - keyHSV.h); if (dh > 180) dh = 360 - dh; dh /= 180;
    const ds = Math.abs(hsv.s - keyHSV.s);
    const dv = Math.abs(hsv.v - keyHSV.v);
    const d = (dh + ds + dv) / 3;
    sumV += d; sumV2 += d * d; n++;
  };
  for (let x = 0; x < width; x += stepX) { push(sample(x, 0)); push(sample(x, height - 1)); }
  for (let y = 0; y < height; y += stepY) { push(sample(0, y)); push(sample(width - 1, y)); }
  if (n === 0) return { uniformity: 0, variance: 1 };
  const mean = sumV / n;
  const varv = Math.max(0, sumV2 / n - mean * mean);
  const variance = varv;
  const uniformity = Math.max(0, 1 - Math.min(1, variance));
  return { uniformity, variance };
};

// Aplicação de chroma key em HSV gerando alfa 8 bits
const applyChromaHSV = (
  src: ImageData,
  dst: ImageData,
  keyHSV: { h: number; s: number; v: number },
  tolerance: number
) => {
  const sData = src.data;
  const dData = dst.data;
  const tol = Math.max(1, tolerance);
  for (let i = 0; i < sData.length; i += 4) {
    const hsv = rgbToHSV(sData[i], sData[i + 1], sData[i + 2]);
    let dh = Math.abs(hsv.h - keyHSV.h); if (dh > 180) dh = 360 - dh; // graus
    const ds = Math.abs(hsv.s - keyHSV.s);
    const dv = Math.abs(hsv.v - keyHSV.v);
    const mH = dh / 180; // 0..1
    const mS = ds; // 0..1
    const mV = dv; // 0..1
    const dist = (mH * 0.5 + mS * 0.3 + mV * 0.2); // pesos
    const distScaled = dist * 100; // escala para 0..100
    let alpha = 255 * (1 - Math.min(1, distScaled / tol));
    alpha = Math.max(0, Math.min(255, alpha));
    dData[i] = alpha; dData[i + 1] = alpha; dData[i + 2] = alpha; dData[i + 3] = alpha;
  }
};
const borderAlphaMean = (mask: ImageData, width: number, height: number): number => {
  const d = mask.data;
  let sum = 0, n = 0;
  const stepX = Math.max(1, Math.floor(width / 256));
  const stepY = Math.max(1, Math.floor(height / 256));
  for (let x = 0; x < width; x += stepX) {
    const i1 = (0 * width + x) * 4;
    const i2 = ((height - 1) * width + x) * 4;
    sum += d[i1]; n++;
    sum += d[i2]; n++;
  }
  for (let y = 0; y < height; y += stepY) {
    const i1 = (y * width + 0) * 4;
    const i2 = (y * width + (width - 1)) * 4;
    sum += d[i1]; n++;
    sum += d[i2]; n++;
  }
  return n ? sum / n : 0;
};

// Blur gaussiano simples sobre alfa (3x3 ou 5x5)
const gaussianBlurAlpha = (mask: ImageData, width: number, height: number, kernel: 3 | 5, sigma = 0.5) => {
  const src = mask.data;
  const out = new Uint8ClampedArray(src.length);
  const k = kernel === 3 ? [
    0.27901, 0.44198, 0.27901,
  ] : [
    0.06136, 0.24477, 0.38774, 0.24477, 0.06136,
  ];
  const rad = kernel === 3 ? 1 : 2;
  // Passo horizontal
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let dx = -rad; dx <= rad; dx++) {
        const nx = Math.min(width - 1, Math.max(0, x + dx));
        const o = (y * width + nx) * 4;
        acc += k[dx + rad] * src[o];
      }
      const o = (y * width + x) * 4;
      out[o] = out[o + 1] = out[o + 2] = out[o + 3] = acc | 0;
    }
  }
  // Passo vertical
  const out2 = new Uint8ClampedArray(src.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let dy = -rad; dy <= rad; dy++) {
        const ny = Math.min(height - 1, Math.max(0, y + dy));
        const o = (ny * width + x) * 4;
        acc += k[dy + rad] * out[o];
      }
      const o = (y * width + x) * 4;
      out2[o] = out2[o + 1] = out2[o + 2] = out2[o + 3] = acc | 0;
    }
  }
  for (let i = 0; i < src.length; i++) mask.data[i] = out2[i];
};

const srgbToLab = (r: number, g: number, b: number): { l: number; a: number; b: number } => {
  const srgbToLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const R = srgbToLinear(r / 255);
  const G = srgbToLinear(g / 255);
  const B = srgbToLinear(b / 255);
  const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
  const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;
  const xr = X / 0.95047;
  const yr = Y / 1.00000;
  const zr = Z / 1.08883;
  const fx = xr > 0.008856 ? Math.pow(xr, 1/3) : (7.787 * xr) + 16/116;
  const fy = yr > 0.008856 ? Math.pow(yr, 1/3) : (7.787 * yr) + 16/116;
  const fz = zr > 0.008856 ? Math.pow(zr, 1/3) : (7.787 * zr) + 16/116;
  const L = (116 * fy) - 16;
  const A = 500 * (fx - fy);
  const Bc = 200 * (fy - fz);
  return { l: L, a: A, b: Bc };
};

export const analyzeSolidBackgroundHSV = (
  imageData: ImageData,
  width: number,
  height: number,
  centralPercent = 30
): {
  keyHSV: { h: number; s: number; v: number } | null;
  confidence: number;
  uniformity: number;
  histogram: { hist: Uint32Array; hBins: number; sBins: number; vBins: number; total: number };
} => {
  const central = detectDominantCentralHSV(imageData, width, height, centralPercent);
  const keyHSV = central ? central.hsv : null;
  const confidence = central ? central.confidence : 0;
  const histogram = computeHSVHistogram(imageData, width, height, centralPercent);
  let uniformity = 0;
  if (keyHSV) uniformity = estimateBorderUniformityHSV(imageData, width, height, keyHSV).uniformity;
  return { keyHSV, confidence, uniformity, histogram };
};

const erodeMask = (mask: ImageData, width: number, height: number): ImageData => {
  const src = mask.data;
  const out = new ImageData(width, height);
  const dst = out.data;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let min = 255;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const idx = ((y + j) * width + (x + i)) * 4;
          min = Math.min(min, src[idx]);
        }
      }
      const o = (y * width + x) * 4;
      dst[o] = dst[o + 1] = dst[o + 2] = dst[o + 3] = min;
    }
  }
  return out;
};

const dilateMask = (mask: ImageData, width: number, height: number): ImageData => {
  const src = mask.data;
  const out = new ImageData(width, height);
  const dst = out.data;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let max = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const idx = ((y + j) * width + (x + i)) * 4;
          max = Math.max(max, src[idx]);
        }
      }
      const o = (y * width + x) * 4;
      dst[o] = dst[o + 1] = dst[o + 2] = dst[o + 3] = max;
    }
  }
  return out;
};

const applyOpening = (maskCtx: CanvasRenderingContext2D, width: number, height: number, iterations: number) => {
  if (!iterations || iterations <= 0) return;
  for (let k = 0; k < iterations; k++) {
    const current = maskCtx.getImageData(0, 0, width, height);
    const eroded = erodeMask(current, width, height);
    maskCtx.putImageData(eroded, 0, 0);
    const afterErode = maskCtx.getImageData(0, 0, width, height);
    const dilated = dilateMask(afterErode, width, height);
    maskCtx.putImageData(dilated, 0, 0);
  }
};

const applyClosing = (maskCtx: CanvasRenderingContext2D, width: number, height: number, iterations: number) => {
  if (!iterations || iterations <= 0) return;
  for (let k = 0; k < iterations; k++) {
    const current = maskCtx.getImageData(0, 0, width, height);
    const dilated = dilateMask(current, width, height);
    maskCtx.putImageData(dilated, 0, 0);
    const afterDilate = maskCtx.getImageData(0, 0, width, height);
    const eroded = erodeMask(afterDilate, width, height);
    maskCtx.putImageData(eroded, 0, 0);
  }
};

const applyJointBilateralOnMask = (
  srcImageData: ImageData,
  maskCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sigmaSpace: number,
  sigmaColor: number,
  edgesOnly: boolean
) => {
  const mask = maskCtx.getImageData(0, 0, width, height);
  const out = maskCtx.createImageData(width, height);
  const src = srcImageData.data;
  const msrc = mask.data;
  const mdst = out.data;
  const radius = Math.max(1, Math.round(sigmaSpace * 2));
  const twoSigmaSpace2 = 2 * sigmaSpace * sigmaSpace;
  const twoSigmaColor2 = 2 * sigmaColor * sigmaColor;
  const spatial = new Float32Array((2*radius+1)*(2*radius+1));
  let si = 0;
  for (let j = -radius; j <= radius; j++) {
    for (let i = -radius; i <= radius; i++) {
      const d2 = i*i + j*j;
      spatial[si++] = Math.exp(-d2 / twoSigmaSpace2);
    }
  }
  const idxSpatial = (dx: number, dy: number) => (dy + radius) * (2*radius+1) + (dx + radius);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const a0 = msrc[o];
      if (edgesOnly && (a0 === 0 || a0 === 255)) { mdst[o]=a0; mdst[o+1]=a0; mdst[o+2]=a0; mdst[o+3]=a0; continue; }
      const r0 = src[o], g0 = src[o+1], b0 = src[o+2];
      const lab0 = srgbToLab(r0, g0, b0);
      let wsum = 0;
      let asum = 0;
      for (let j = -radius; j <= radius; j++) {
        const ny = y + j; if (ny < 0 || ny >= height) continue;
        for (let i = -radius; i <= radius; i++) {
          const nx = x + i; if (nx < 0 || nx >= width) continue;
          const n = (ny * width + nx) * 4;
          const rl = src[n], gl = src[n+1], bl = src[n+2];
          const labn = srgbToLab(rl, gl, bl);
          const dl = lab0.l - labn.l, da = lab0.a - labn.a, db = lab0.b - labn.b;
          const dr2 = dl*dl + da*da + db*db;
          const w = spatial[idxSpatial(i,j)] * Math.exp(-dr2 / twoSigmaColor2);
          wsum += w;
          asum += w * msrc[n];
        }
      }
      const aval = wsum > 0 ? Math.round(asum / wsum) : a0;
      mdst[o] = aval; mdst[o+1] = aval; mdst[o+2] = aval; mdst[o+3] = aval;
    }
  }
  maskCtx.putImageData(out, 0, 0);
};


/**
 * Remove o fundo de uma imagem usando um algoritmo de preenchimento (flood fill) no lado do cliente.
 * @param originalURL - A URL da imagem original (pode ser um Object URL).
 * @param options - As opções de remoção, como tolerância e suavidade da borda.
 * @returns Uma Promise que resolve com a string base64 da imagem processada (sem o prefixo 'data:image/png;base64,').
 */
export const removeBackgroundClientSide = (
  originalURL: string,
  options: RemovalOptions = { tolerance: 20 },
  onProgress?: (evt: { stage: string; iter: number; progress: number }) => void,
  onCancelable?: (cancel: () => void) => void,
  onMetrics?: (evt: { stage: string; duration: number }) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Necessário para evitar erros de 'tainted canvas'.

    img.onload = async () => {
      // --- PASSO 1: Configuração do Canvas Principal ---
      const canvas = document.createElement('canvas');
      const { width, height } = img;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return reject(new Error('Não foi possível obter o contexto do canvas'));
      }

      ctx.drawImage(img, 0, 0);

      try {
        const tTotalStart = performance.now();
        const originalImageData = ctx.getImageData(0, 0, width, height);
        let selectedMode = options.mode || 'floodfill';
        if (selectedMode === 'floodfill') {
          selectedMode = autoDetectMode(originalImageData, width, height);
        }

        // --- PASSO 2: Criação da Máscara de Recorte ---
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
        if (!maskCtx) return reject(new Error('Não foi possível criar o contexto da máscara'));
        
        const maskImageData = maskCtx.createImageData(width, height);

        const removalInfo = options.removalInfo ? [...options.removalInfo] : [];
        if (options.mode !== 'silhouette' && removalInfo.length === 0) {
            const detectedColor = detectDominantBorderColor(img);
            if (detectedColor) {
                removalInfo.push({ color: { ...detectedColor, a: 255 }, isAuto: true });
            } else {
                // Usa branco como padrão se a detecção falhar, começando pelo canto.
                removalInfo.push({ color: { r: 255, g: 255, b: 255, a: 255 }, point: { x: 0, y: 0 }, isAuto: true });
            }
        }

        if (selectedMode === 'silhouette') {
            // MODO SILHUETA: Mantém os pixels escuros e remove os claros.
            const data = originalImageData.data;
            const maskData = maskImageData.data;
            const tolerance = options.tolerance ?? 25;
            const maxDistance = 255;
            const threshold = (tolerance / 100) * maxDistance;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                const value = (luminance < threshold) ? 255 : 0;
                maskData[i] = value;
                maskData[i + 1] = value;
                maskData[i + 2] = value;
                maskData[i + 3] = value;
            }

        } else if (selectedMode === 'chroma') {
            const similarity = options.tolerance ?? 40; // 25-55 no preset
            const centralPct = options.samplingCentralPercent ?? 20;
            const useHSV = options.colorSpace === 'HSV';
            const data = originalImageData.data;
            const maskData = maskImageData.data;
            let keyColor = (options.removalInfo && options.removalInfo.length > 0) ? options.removalInfo[0].color : { r: 255, g: 255, b: 255, a: 255 };
            const manualPin = (options.removalInfo || []).find(info => !!info.point && !info.isAuto);
            const effUniformity = Math.max(0, Math.min(100, options.uniformity ?? 0));
            const effectiveTolerance = Math.max(1, similarity - Math.round(effUniformity * 0.4));
            if (useHSV) {
              const rgbToHSVLocal = (r:number,g:number,b:number) => rgbToHSV(r,g,b);
              const analysis = manualPin ? null : detectDominantCentralHSV(originalImageData, width, height, centralPct);
              if (manualPin) {
                const keyHSV = rgbToHSVLocal(manualPin.color.r, manualPin.color.g, manualPin.color.b);
                if (options.hsvUseWorker || (width*height) > (1920*1080)) {
                  const out = await computeChromaHSVInWorker(originalImageData, width, height, keyHSV, effectiveTolerance, (options.refinementKernel ?? 3) as 3|5, onProgress, onCancelable);
                  maskCtx.putImageData(out, 0, 0);
                } else {
                  applyChromaHSV(originalImageData, maskImageData, keyHSV, effectiveTolerance);
                }
              } else if (analysis && analysis.confidence > 0.6) {
                const keyHSV = analysis.hsv;
                // Uniformidade nas bordas; fallback se necessário
                const { uniformity, variance } = estimateBorderUniformityHSV(originalImageData, width, height, keyHSV);
                if (uniformity < 0.8) {
                  // Tentar segunda moda: varrer o histograma e escolher próximo maior
                  const { hist, hBins, sBins, vBins, total } = computeHSVHistogram(originalImageData, width, height, centralPct);
                  let max1 = 0, idx1 = 0, max2 = 0, idx2 = 0;
                  for (let i = 0; i < hist.length; i++) {
                    const c = hist[i];
                    if (c > max1) { max2 = max1; idx2 = idx1; max1 = c; idx1 = i; }
                    else if (c > max2) { max2 = c; idx2 = i; }
                  }
                  const hi = Math.floor(idx2 / (sBins * vBins));
                  const rem = idx2 % (sBins * vBins);
                  const si = Math.floor(rem / vBins);
                  const vi = rem % vBins;
                  const keyHSV2 = {
                    h: hi * (360 / hBins) + (360 / hBins) / 2,
                    s: (si * (100 / sBins) + (100 / sBins) / 2) / 100,
                    v: (vi * (100 / vBins) + (100 / vBins) / 2) / 100,
                  };
                  // Escolher o que dá melhor uniformidade
                  const u1 = estimateBorderUniformityHSV(originalImageData, width, height, keyHSV).uniformity;
                  const u2 = estimateBorderUniformityHSV(originalImageData, width, height, keyHSV2).uniformity;
                  const best = u2 > u1 ? keyHSV2 : keyHSV;
                  let bestTol = effectiveTolerance;
                  if (options.autoTolerance) {
                    const tolMin = options.toleranceMin ?? 35;
                    const tolMax = options.toleranceMax ?? 45;
                    let bestScore = Number.POSITIVE_INFINITY;
                    const tStart = performance.now();
                    for (let t = tolMin; t <= tolMax; t++) {
                      const tmp = new ImageData(width, height);
                      applyChromaHSV(originalImageData, tmp, best, t);
                      const score = borderAlphaMean(tmp, width, height);
                      if (score < bestScore) { bestScore = score; bestTol = t; }
                      if (performance.now() - tStart > 50) break;
                    }
                  }
                  if (options.hsvUseWorker || (width*height) > (1920*1080)) {
                    const out = await computeChromaHSVInWorker(originalImageData, width, height, best, bestTol, (options.refinementKernel ?? 3) as 3|5, onProgress, onCancelable);
                    maskCtx.putImageData(out, 0, 0);
                  } else {
                    applyChromaHSV(originalImageData, maskImageData, best, bestTol);
                  }
                } else {
                  let bestTol2 = effectiveTolerance;
                  if (options.autoTolerance) {
                    const tolMin = options.toleranceMin ?? 35;
                    const tolMax = options.toleranceMax ?? 45;
                    let bestScore = Number.POSITIVE_INFINITY;
                    const tStart = performance.now();
                    for (let t = tolMin; t <= tolMax; t++) {
                      const tmp = new ImageData(width, height);
                      applyChromaHSV(originalImageData, tmp, keyHSV, t);
                      const score = borderAlphaMean(tmp, width, height);
                      if (score < bestScore) { bestScore = score; bestTol2 = t; }
                      if (performance.now() - tStart > 50) break;
                    }
                  }
                  if (options.hsvUseWorker || (width*height) > (1920*1080)) {
                    const out = await computeChromaHSVInWorker(originalImageData, width, height, keyHSV, bestTol2, (options.refinementKernel ?? 3) as 3|5, onProgress, onCancelable);
                    maskCtx.putImageData(out, 0, 0);
                  } else {
                    applyChromaHSV(originalImageData, maskImageData, keyHSV, bestTol2);
                  }
                }
              } else {
                // Fallback para YUV se confiança baixa
                const keyUV = rgbToUV(keyColor.r, keyColor.g, keyColor.b);
                const tol = Math.max(1, similarity);
                const tolSq = tol * tol;
                for (let i = 0; i < data.length; i += 4) {
                  const { u, v } = rgbToUV(data[i], data[i + 1], data[i + 2]);
                  const du = u - keyUV.u; const dv = v - keyUV.v;
                  const distSq = (du * du + dv * dv) * 10000;
                  let alpha = 255 * (1 - Math.min(1, distSq / tolSq));
                  alpha = Math.max(0, Math.min(255, alpha));
                  maskData[i] = maskData[i + 1] = maskData[i + 2] = maskData[i + 3] = Math.round(alpha);
                }
              }
            } else {
              // Caminho original (YUV)
              const keyUV = rgbToUV(keyColor.r, keyColor.g, keyColor.b);
              const tol = Math.max(1, similarity);
              const tolSq = tol * tol;
              for (let i = 0; i < data.length; i += 4) {
                const { u, v } = rgbToUV(data[i], data[i + 1], data[i + 2]);
                const du = u - keyUV.u; const dv = v - keyUV.v;
                const distSq = (du * du + dv * dv) * 10000;
                let alpha = 255 * (1 - Math.min(1, distSq / tolSq));
                alpha = Math.max(0, Math.min(255, alpha));
                maskData[i] = maskData[i + 1] = maskData[i + 2] = maskData[i + 3] = Math.round(alpha);
              }
            }
            // Refinamento de borda gaussiano conforme preset
            const kernel = (options.refinementKernel ?? 3) as 3 | 5;
            // Se usou worker, a máscara já chega suavizada; caso contrário, aplica blur local
            const m = maskCtx.getImageData(0,0,width,height);
            if (m.data.some((v,idx)=> idx%4===0 && v!==0 && v!==255)) {
              gaussianBlurAlpha(m, width, height, kernel, 0.5);
              maskCtx.putImageData(m, 0, 0);
            } else {
              gaussianBlurAlpha(maskImageData, width, height, kernel, 0.5);
            }
        } else if (selectedMode === 'grabcut') {
            const tGraphStart = performance.now();
            const data = originalImageData.data;
            let maskDataRef = maskImageData.data;
            const iters = options.grabcut?.iterations ?? 5;
            const bbox = options.grabcut?.bbox ?? { x: 0, y: 0, width, height };
            const fgPts = options.grabcut?.fgScribbles ?? [];
            const bgPts = options.grabcut?.bgScribbles ?? [];
            if (options.grabcut?.useWorker) {
              try {
                const workerMask = await computeGrabCutMaskInWorker(originalImageData, width, height, options, onProgress, onCancelable);
                maskCtx.putImageData(workerMask, 0, 0);
                // Recarrega a referência para continuar o pipeline
                const m = maskCtx.getImageData(0, 0, width, height);
                maskDataRef = m.data;
                if (onMetrics) onMetrics({ stage: 'graphcut', duration: performance.now() - tGraphStart });
              } catch {
                // Fallback local se worker falhar
              }
            }
            const labels = new Uint8Array(width * height);
            const GC_BGD = 0, GC_FGD = 1, GC_PR_BGD = 2, GC_PR_FGD = 3;
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

            const meanVar = (sel: (i:number)=>boolean) => {
              let mr=0, mg=0, mb=0, c=0;
              for (let i = 0; i < width*height; i++) {
                if (!sel(i)) continue;
                const j = i*4;
                mr += data[j]; mg += data[j+1]; mb += data[j+2]; c++;
              }
              if (c === 0) return { mean:[0,0,0], var:[1,1,1] };
              mr/=c; mg/=c; mb/=c;
              let vr=0, vg=0, vb=0;
              for (let i = 0; i < width*height; i++) {
                if (!sel(i)) continue;
                const j = i*4;
                const dr = data[j]-mr, dg = data[j+1]-mg, db = data[j+2]-mb;
                vr += dr*dr; vg += dg*dg; vb += db*db;
              }
              vr = Math.max(vr/c, 1); vg = Math.max(vg/c, 1); vb = Math.max(vb/c, 1);
              return { mean:[mr,mg,mb], var:[vr,vg,vb] };
            };

            for (let t = 0; t < iters; t++) {
              const fgStats = meanVar(i => labels[i] === GC_FGD || labels[i] === GC_PR_FGD);
              const bgStats = meanVar(i => labels[i] === GC_BGD || labels[i] === GC_PR_BGD);
              for (let y = bbox.y; y < bbox.y + bbox.height; y++) {
                for (let x = bbox.x; x < bbox.x + bbox.width; x++) {
                  const i = y*width + x;
                  const j = i*4;
                  if (labels[i] === GC_FGD || labels[i] === GC_BGD) continue;
                  const r = data[j], g = data[j+1], b = data[j+2];
                  const df0 = r - fgStats.mean[0], df1 = g - fgStats.mean[1], df2 = b - fgStats.mean[2];
                  const db0 = r - bgStats.mean[0], db1 = g - bgStats.mean[1], db2 = b - bgStats.mean[2];
                  const nll_fg = (df0*df0)/fgStats.var[0] + (df1*df1)/fgStats.var[1] + (df2*df2)/fgStats.var[2];
                  const nll_bg = (db0*db0)/bgStats.var[0] + (db1*db1)/bgStats.var[1] + (db2*db2)/bgStats.var[2];
                  labels[i] = nll_fg < nll_bg ? GC_PR_FGD : GC_PR_BGD;
                }
              }
            }

            if (!options.grabcut?.useWorker) {
              for (let i = 0; i < width*height; i++) {
                const value = (labels[i] === GC_FGD || labels[i] === GC_PR_FGD) ? 255 : 0;
                const j = i*4;
                maskDataRef[j] = value; maskDataRef[j+1] = value; maskDataRef[j+2] = value; maskDataRef[j+3] = value;
              }
              if (onMetrics) onMetrics({ stage: 'graphcut_iterative', duration: performance.now() - tGraphStart });
            }
        } else {
            // MODO PADRÃO (FLOOD FILL): Detecta o fundo a partir de um ponto de origem ou das bordas.
            const data = originalImageData.data;
            const visited = new Uint8Array(width * height);
            const tolerance = Math.max(0, Math.min(100, options.tolerance));
            const edgeMap = computeEdgeMap(originalImageData, width, height);
            const edgeStop = Math.max(10, Math.min(50, (options.edgeRefinement ?? 0) > 0 ? 25 : 20));

            for (const info of removalInfo) {
                 const targetColor = info.color;
                 if (!targetColor) continue;

                 const { r: targetR, g: targetG, b: targetB } = targetColor;
                 const queue: number[] = [];
                 
                 if (info.point) {
                    const index = Math.round(info.point.y) * width + Math.round(info.point.x);
                    if (!visited[index]) {
                      queue.push(index);
                      visited[index] = 1;
                    }
                 } else {
                     for (let y = 0; y < height; y++) {
                         for (let x = 0; x < width; x++) {
                             if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
                                 const index = y * width + x;
                                 if (visited[index]) continue;

                                 const dataIndex = index * 4;
                                 const r = data[dataIndex], g = data[dataIndex + 1], b = data[dataIndex + 2];
                                 const dE = deltaE(srgbToLab(r,g,b), srgbToLab(targetR,targetG,targetB));
                                 const deltaThreshold = Math.max(3, Math.min(60, tolerance));
                                 if (dE < deltaThreshold) {
                                     visited[index] = 1;
                                     queue.push(index);
                                 }
                             }
                         }
                     }
                 }

                 if (queue.length === 0) continue;

                 let head = 0;
                 while (head < queue.length) {
                     const pixelIndex = queue[head++];
                     const x = pixelIndex % width;
                     const y = Math.floor(pixelIndex / width);
                     
                     const neighbors = [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }];

                     for (const { dx, dy } of neighbors) {
                         const nx = x + dx, ny = y + dy;
                         if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                             const neighborIndex = ny * width + nx;
                             if (!visited[neighborIndex]) {
                                 const neighborDataIndex = neighborIndex * 4;
                                 const nr = data[neighborDataIndex], ng = data[neighborDataIndex + 1], nb = data[neighborDataIndex + 2];
                                 const dE2 = deltaE(srgbToLab(nr,ng,nb), srgbToLab(targetR,targetG,targetB));
                                 const deltaThreshold2 = Math.max(3, Math.min(60, tolerance));
                                 if (edgeMap[neighborIndex] > edgeStop) continue;
                                 if (dE2 < deltaThreshold2) {
                                     visited[neighborIndex] = 1;
                                     queue.push(neighborIndex);
                                 }
                             }
                         }
                     }
                 }
            }
            let visitedCount = 0; for (let i=0;i<visited.length;i++){ if (visited[i]) visitedCount++; }
            const ratio = visitedCount / visited.length;
            if (ratio > 0.95 || ratio < 0.05) {
                try {
                  const workerMask = await computeGrabCutMaskInWorker(originalImageData, width, height, { grabcut: { useWorker: true, iterations: 3, bbox: { x:0, y:0, width, height }, lambda: 60 } } as any, onProgress, onCancelable);
                  maskCtx.putImageData(workerMask, 0, 0);
                } catch {
                  for (let i = 0; i < visited.length; i++) {
                    const value = visited[i] ? 0 : 255;
                    maskImageData.data[i * 4] = value;
                    maskImageData.data[i * 4 + 1] = value;
                    maskImageData.data[i * 4 + 2] = value;
                    maskImageData.data[i * 4 + 3] = value;
                  }
                }
            } else {
              for (let i = 0; i < visited.length; i++) {
                const value = visited[i] ? 0 : 255;
                maskImageData.data[i * 4] = value;
                maskImageData.data[i * 4 + 1] = value;
                maskImageData.data[i * 4 + 2] = value;
                maskImageData.data[i * 4 + 3] = value;
              }
            }
        }
        
        maskCtx.putImageData(maskImageData, 0, 0);

        // --- PASSO 3: PIPELINE DE REFINAMENTO DE MÁSCARA (NOVO MÉTODO) ---

        const openingIterations = options.openingIterations ?? 0;
        const closingIterations = options.closingIterations ?? 0;
        const tMorphStart = performance.now();
        if (openingIterations > 0 || closingIterations > 0) {
            const largeImage = width * height >= 3000 * 2000;
            if (largeImage) {
              try {
                const m = maskCtx.getImageData(0, 0, width, height);
                const processedMask = await computeMorphologyInWorker(m, width, height, openingIterations, closingIterations, onProgress, onCancelable);
                maskCtx.putImageData(processedMask, 0, 0);
                if (onMetrics) onMetrics({ stage: 'morph', duration: performance.now() - tMorphStart });
              } catch {
                if (openingIterations > 0) applyOpening(maskCtx, width, height, openingIterations);
                if (closingIterations > 0) applyClosing(maskCtx, width, height, closingIterations);
                if (onMetrics) onMetrics({ stage: 'morph', duration: performance.now() - tMorphStart });
              }
            } else {
              if (openingIterations > 0) applyOpening(maskCtx, width, height, openingIterations);
              if (closingIterations > 0) applyClosing(maskCtx, width, height, closingIterations);
              if (onMetrics) onMetrics({ stage: 'morph', duration: performance.now() - tMorphStart });
            }
        }

        const bilateralIntensity = options.bilateralIntensity ?? 0;
        if (bilateralIntensity > 0) {
            const tBilateralStart = performance.now();
            const sigmaSpace = options.bilateralSigmaSpace ?? 3;
            const sigmaColor = options.bilateralSigmaColor ?? Math.max(1, bilateralIntensity * 0.4);
            const edgesOnly = options.bilateralEdgesOnly ?? true;
            const largeImage = width * height >= 3000 * 2000;
            if (largeImage) {
              try {
                const m = maskCtx.getImageData(0, 0, width, height);
                const filteredMask = await computeFilterInWorker(originalImageData, m, width, height, sigmaSpace, sigmaColor, edgesOnly, onProgress, onCancelable);
                maskCtx.putImageData(filteredMask, 0, 0);
              } catch {
                applyJointBilateralOnMask(originalImageData, maskCtx, width, height, sigmaSpace, sigmaColor, edgesOnly);
              }
            } else {
              applyJointBilateralOnMask(originalImageData, maskCtx, width, height, sigmaSpace, sigmaColor, edgesOnly);
            }
            if (onMetrics) onMetrics({ stage: 'bilateral', duration: performance.now() - tBilateralStart });
        }

        // Etapa 0: Suavização de Contorno (anti-aliasing)
        const contourSmoothing = options.contourSmoothing ?? 0;
        const tContourStart = performance.now();
        if (contourSmoothing > 0) {
            const blurAmount = contourSmoothing * 0.05; // Mapeia 100 para um blur de 5px
            maskCtx.filter = `blur(${blurAmount}px)`;
            maskCtx.drawImage(maskCanvas, 0, 0); // Desenha sobre si mesmo com o filtro

            // Aplica um "levels" para tornar a borda nítida novamente, mas suavizada
            const maskData = maskCtx.getImageData(0, 0, width, height);
            const data = maskData.data;
            const threshold = 128; // Ponto médio
            for (let i = 0; i < data.length; i += 4) {
                const value = data[i];
                const newValue = value > threshold ? 255 : 0;
                data[i] = data[i+1] = data[i+2] = data[i+3] = newValue;
            }
            maskCtx.putImageData(maskData, 0, 0);
            maskCtx.filter = 'none';
            if (onMetrics) onMetrics({ stage: 'contour_smoothing', duration: performance.now() - tContourStart });
        }


        // Etapa 1: Desfoque da Borda (Blur) - Cria a transição suave
        const edgeSoftness = options.edgeSoftness ?? 0;
        const tEdgeBlurStart = performance.now();
        if (edgeSoftness > 0) {
            const amount = edgeSoftness * 0.1; // Mapeia 50 para um blur de 5px
            maskCtx.filter = `blur(${amount}px)`;
            maskCtx.drawImage(maskCanvas, 0, 0); // Desenha sobre si mesmo com o filtro
            maskCtx.filter = 'none';
            if (onMetrics) onMetrics({ stage: 'edge_blur', duration: performance.now() - tEdgeBlurStart });
        }

        // Etapa 2: Ajuste de Níveis (Erosão/Dilatação com anti-aliasing)
        const edgeRefinement = options.edgeRefinement ?? 0;
        if (edgeRefinement !== 0) {
            const tEdgeRefineStart = performance.now();
            const maskData = maskCtx.getImageData(0, 0, width, height);
            const data = maskData.data;
            // Mapeia o slider de -10 a 10 para um ajuste de ponto de preto/branco de 0 a 128
            const blackPoint = Math.max(0, ((-edgeRefinement) / 10) * 128);
            const whitePoint = 255;
            const range = whitePoint - blackPoint;

            if (range > 0) {
                for (let i = 0; i < data.length; i += 4) {
                    const value = data[i]; // R, G e B são iguais em uma máscara de tons de cinza
                    let newValue = 0;
                    if (value > blackPoint) {
                        newValue = Math.round(((value - blackPoint) / range) * 255);
                    }
                    // Garante que o valor não exceda 255
                    newValue = Math.min(255, newValue);
                    data[i] = data[i + 1] = data[i + 2] = data[i + 3] = newValue;
                }
            }
            maskCtx.putImageData(maskData, 0, 0);
            if (onMetrics) onMetrics({ stage: 'edge_refinement', duration: performance.now() - tEdgeRefineStart });
        }

        const finalMaskCanvas = maskCanvas;

        // --- PASSO 4: Composição do Objeto Principal ---
        const subjectCanvas = document.createElement('canvas');
        subjectCanvas.width = width;
        subjectCanvas.height = height;
        const subjectCtx = subjectCanvas.getContext('2d');
        if (!subjectCtx) return reject(new Error('Não foi possível criar o contexto do objeto'));
        
        subjectCtx.drawImage(img, 0, 0);

        // --- PASSO 5: Descontaminação de Cor (Remoção de Halos) ---
        const decontamination = options.colorDecontamination ?? 0;
        if (decontamination > 0 && options.mode !== 'silhouette' && removalInfo.length > 0) {
            const spillColor = removalInfo[0].color; // Usa a primeira cor como referência
            const { r: sr, g: sg, b: sb } = spillColor;

            const subjectImageData = subjectCtx.getImageData(0, 0, width, height);
            const subjectData = subjectImageData.data;
            const finalMaskCtx = finalMaskCanvas.getContext('2d', { willReadFrequently: true });
            const cleanMaskData = finalMaskCtx!.getImageData(0, 0, width, height).data;

            for (let i = 0; i < subjectData.length; i += 4) {
                const alpha = cleanMaskData[i + 3];
                // Aplica apenas em pixels de borda (semi-transparentes)
                if (alpha > 0 && alpha < 255) {
                    const r = subjectData[i];
                    const g = subjectData[i + 1];
                    const b = subjectData[i + 2];
                    
                    // A força do efeito é maior em pixels mais transparentes
                    const strength = (decontamination / 100) * (1 - alpha / 255);
                    
                    // Empurra a cor do pixel para longe da cor do vazamento
                    const newR = r + (r - sr) * strength;
                    const newG = g + (g - sg) * strength;
                    const newB = b + (b - sb) * strength;

                    subjectData[i] = Math.max(0, Math.min(255, newR));
                    subjectData[i + 1] = Math.max(0, Math.min(255, newG));
                    subjectData[i + 2] = Math.max(0, Math.min(255, newB));
                }
            }
            subjectCtx.putImageData(subjectImageData, 0, 0);
        }

        // Aplica a máscara final ao objeto
        subjectCtx.globalCompositeOperation = 'destination-in';
        subjectCtx.drawImage(finalMaskCanvas, 0, 0);
        subjectCtx.globalCompositeOperation = 'source-over';


        // --- PASSO 6: Composição Final com Efeitos ---
        const tComposeStart = performance.now();
        ctx.clearRect(0, 0, width, height);
        if (options.background?.output === 'color' && options.background.color) {
          ctx.fillStyle = options.background.color;
          ctx.fillRect(0, 0, width, height);
        }
        
        // Efeito de Sombra Projetada
        if (options.sticker && options.dropShadow) {
            ctx.shadowColor = options.dropShadow.color;
            ctx.shadowBlur = options.dropShadow.blur;
            ctx.shadowOffsetX = options.dropShadow.offsetX;
            ctx.shadowOffsetY = options.dropShadow.offsetY;
        }

        // Efeito de Contorno
        if (options.sticker && options.outline && options.outline.width > 0) {
            const outlineCanvas = document.createElement('canvas');
            outlineCanvas.width = width;
            outlineCanvas.height = height;
            const outlineCtx = outlineCanvas.getContext('2d');
            if (outlineCtx) {
                // Desenha a sombra para criar o contorno
                outlineCtx.shadowColor = options.outline.color;
                outlineCtx.shadowBlur = options.outline.width;
                // Desenha a forma várias vezes para um contorno mais sólido
                for (let i = 0; i < 4; i++) {
                   outlineCtx.drawImage(subjectCanvas, 0, 0);
                }
                ctx.drawImage(outlineCanvas, 0, 0);
            }
        }
        
        // Aplica filtros de imagem antes de desenhar o objeto
        const brightness = options.brightness ?? 100;
        const contrast = options.contrast ?? 100;
        const saturation = options.saturation ?? 100;
        const filters: string[] = [];
        if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
        if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
        if (saturation !== 100) filters.push(`saturate(${saturation}%)`);
        
        if (filters.length > 0) {
            ctx.filter = filters.join(' ');
        }
        
        // Desenha o objeto principal por cima de tudo
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.drawImage(subjectCanvas, 0, 0);

        // Reseta o filtro
        ctx.filter = 'none';
        if (onMetrics) onMetrics({ stage: 'compose', duration: performance.now() - tComposeStart });
        if (onMetrics) onMetrics({ stage: 'total', duration: performance.now() - tTotalStart });
        resolve(canvas.toDataURL('image/png').split(',')[1]);

      } catch (e) {
        reject(new Error("Falha ao processar dados da imagem. A imagem pode ser de uma fonte protegida (CORS)."));
      }
    };

    img.onerror = () => {
      reject(new Error('Falha ao carregar a imagem para processamento.'));
    };

    img.src = originalURL;
  });
};
const computeGrabCutMaskInWorker = (
  imageData: ImageData,
  width: number,
  height: number,
  options: RemovalOptions,
  onProgress?: (evt: { stage: string; iter: number; progress: number }) => void,
  onCancelable?: (cancel: () => void) => void
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(new URL('../workers/grabcutWorker.ts', import.meta.url), { type: 'module' });
      const taskId = Math.random().toString(36).slice(2);
      if (onCancelable) {
        onCancelable(() => { worker.postMessage({ task: 'cancel', taskId }); });
      }
      worker.onmessage = (e) => {
        if (e.data?.type === 'progress' && onProgress) {
          onProgress({ stage: e.data.stage, iter: e.data.iter, progress: e.data.progress });
          return;
        }
        if (e.data?.type === 'result') {
          const { maskBuffer } = e.data as { maskBuffer: Uint8ClampedArray };
          const mask = new ImageData(width, height);
          for (let i = 0; i < width * height; i++) {
            const v = maskBuffer[i];
            const o = i * 4;
            mask.data[o] = v;
            mask.data[o + 1] = v;
            mask.data[o + 2] = v;
            mask.data[o + 3] = v;
          }
          worker.terminate();
          resolve(mask);
        }
      };
      worker.onerror = (err) => {
        worker.terminate();
        reject(err);
      };
      worker.postMessage({ task: 'graphcut', taskId, imageData, width, height, options });
    } catch (err) {
      reject(err);
    }
  });
};

const computeMorphologyInWorker = (
  maskImageData: ImageData,
  width: number,
  height: number,
  opening: number,
  closing: number,
  onProgress?: (evt: { stage: string; iter: number; progress: number }) => void,
  onCancelable?: (cancel: () => void) => void
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(new URL('../workers/grabcutWorker.ts', import.meta.url), { type: 'module' });
      const taskId = Math.random().toString(36).slice(2);
      if (onCancelable) onCancelable(() => { worker.postMessage({ task: 'cancel', taskId }); });
      worker.onmessage = (e) => {
        if (e.data?.type === 'progress' && onProgress) { onProgress({ stage: e.data.stage, iter: e.data.iter, progress: e.data.progress }); return; }
        if (e.data?.type === 'result') {
          const { maskBuffer } = e.data as { maskBuffer: Uint8ClampedArray };
          const out = new ImageData(width, height);
          for (let i=0;i<width*height;i++){ const v=maskBuffer[i]; const o=i*4; out.data[o]=out.data[o+1]=out.data[o+2]=out.data[o+3]=v; }
          worker.terminate(); resolve(out);
        }
      };
      worker.onerror = (err) => { worker.terminate(); reject(err); };
      worker.postMessage({ task: 'morph', taskId, imageData: maskImageData, width, height, options: { openingIterations: opening, closingIterations: closing } });
    } catch (err) { reject(err); }
  });
};

const computeFilterInWorker = (
  srcImageData: ImageData,
  maskImageData: ImageData,
  width: number,
  height: number,
  sigmaSpace: number,
  sigmaColor: number,
  edgesOnly: boolean,
  onProgress?: (evt: { stage: string; iter: number; progress: number }) => void,
  onCancelable?: (cancel: () => void) => void
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(new URL('../workers/grabcutWorker.ts', import.meta.url), { type: 'module' });
      const taskId = Math.random().toString(36).slice(2);
      if (onCancelable) onCancelable(() => { worker.postMessage({ task: 'cancel', taskId }); });
      worker.onmessage = (e) => {
        if (e.data?.type === 'progress' && onProgress) { onProgress({ stage: e.data.stage, iter: e.data.iter, progress: e.data.progress }); return; }
        if (e.data?.type === 'result') {
          const { maskBuffer } = e.data as { maskBuffer: Uint8ClampedArray };
          const out = new ImageData(width, height);
          for (let i=0;i<width*height;i++){ const v=maskBuffer[i]; const o=i*4; out.data[o]=out.data[o+1]=out.data[o+2]=out.data[o+3]=v; }
          worker.terminate(); resolve(out);
        }
      };
      worker.onerror = (err) => { worker.terminate(); reject(err); };
      // Reaproveita estrutura do worker: envia máscara no imageData e usa src nos options
      const composite = new ImageData(new Uint8ClampedArray(maskImageData.data), width, height);
      worker.postMessage({ task: 'filter', taskId, imageData: composite, width, height, options: { sigmaSpace, sigmaColor, edgesOnly, srcImageData } });
    } catch (err) { reject(err); }
  });
};
const computeChromaHSVInWorker = (
  srcImageData: ImageData,
  width: number,
  height: number,
  keyHSV: { h:number; s:number; v:number },
  tolerance: number,
  refinementKernel: 3 | 5,
  onProgress?: (evt: { stage: string; iter: number; progress: number }) => void,
  onCancelable?: (cancel: () => void) => void,
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(new URL('../workers/grabcutWorker.ts', import.meta.url), { type: 'module' });
      const taskId = Math.random().toString(36).slice(2);
      if (onCancelable) onCancelable(() => { worker.postMessage({ task: 'cancel', taskId }); });
      worker.onmessage = (e) => {
        if (e.data?.type === 'progress' && onProgress) { onProgress({ stage: e.data.stage, iter: e.data.iter, progress: e.data.progress }); return; }
        if (e.data?.type === 'result') {
          const { maskBuffer } = e.data as { maskBuffer: Uint8ClampedArray };
          const out = new ImageData(width, height);
          for (let i=0;i<width*height;i++){ const v=maskBuffer[i]; const o=i*4; out.data[o]=out.data[o+1]=out.data[o+2]=out.data[o+3]=v; }
          worker.terminate(); resolve(out);
        }
      };
      worker.onerror = (err) => { worker.terminate(); reject(err); };
      worker.postMessage({ task: 'chromaHSV', taskId, imageData: srcImageData, width, height, options: { keyHSV, tolerance, refinementKernel } });
    } catch (err) { reject(err); }
  });
};
const autoDetectMode = (imageData: ImageData, width: number, height: number): 'grabcut' | 'chroma' | 'silhouette' | 'floodfill' => {
  const data = imageData.data;
  const sample = (x: number, y: number) => { const i=(y*width + x)*4; return [data[i], data[i+1], data[i+2]]; };
  let sum=0, sumSq=0, count=0;
  let greenCount=0;
  const rgbToUVLocal = (r:number,g:number,b:number) => ({ u: r * -0.169 + g * -0.331 + b * 0.5 + 0.5, v: r * 0.5 + g * -0.419 + b * -0.081 + 0.5 });
  for (let x=0;x<width;x+=Math.max(1, Math.floor(width/64))) {
    const [r1,g1,b1]=sample(x,0), [r2,g2,b2]=sample(x,height-1);
    const l1=0.2126*r1+0.7152*g1+0.0722*b1; const l2=0.2126*r2+0.7152*g2+0.0722*b2;
    sum+=l1+l2; sumSq+=l1*l1+l2*l2; count+=2;
    const uv1=rgbToUVLocal(r1,g1,b1), uv2=rgbToUVLocal(r2,g2,b2);
    const isGreen=(u:number,v:number)=> (v<0.35 && u>0.55) || (v<0.45 && u>0.6);
    if (isGreen(uv1.u,uv1.v)) greenCount++; if (isGreen(uv2.u,uv2.v)) greenCount++;
  }
  for (let y=0;y<height;y+=Math.max(1, Math.floor(height/64))) {
    const [r1,g1,b1]=sample(0,y), [r2,g2,b2]=sample(width-1,y);
    const l1=0.2126*r1+0.7152*g1+0.0722*b1; const l2=0.2126*r2+0.7152*g2+0.0722*b2;
    sum+=l1+l2; sumSq+=l1*l1+l2*l2; count+=2;
    const uv1=rgbToUVLocal(r1,g1,b1), uv2=rgbToUVLocal(r2,g2,b2);
    const isGreen=(u:number,v:number)=> (v<0.35 && u>0.55) || (v<0.45 && u>0.6);
    if (isGreen(uv1.u,uv1.v)) greenCount++; if (isGreen(uv2.u,uv2.v)) greenCount++;
  }
  const mean = sum / Math.max(1,count);
  const varL = Math.max(0, (sumSq / Math.max(1,count)) - mean*mean);
  const greenRatio = greenCount / Math.max(1,count);
  const labCheck = validateBackgroundUniformityLAB(imageData, width, height);
  if (!labCheck.hasGradient && labCheck.uniform && (mean > 200 || mean < 40)) return 'floodfill';
  if (greenRatio > 0.35) return 'chroma';
  // HSV central: se houver forte moda e bordas uniformes, escolher chroma
  const central = detectDominantCentralHSV(imageData, width, height, 30);
  if (central && central.confidence > 0.6) {
    const { uniformity } = estimateBorderUniformityHSV(imageData, width, height, central.hsv);
    if (uniformity > 0.8) return 'chroma';
  }
  if (varL < 200 || labCheck.hasGradient) return 'grabcut';
  // paleta reduzida: amostrar interior
  const bins = new Set<number>();
  for (let y = Math.floor(height / 4); y < Math.floor((3 * height) / 4); y += Math.max(1, Math.floor(height / 64))) {
    for (let x = Math.floor(width / 4); x < Math.floor((3 * width) / 4); x += Math.max(1, Math.floor(width / 64))) {
      const i=(y*width + x)*4; const r=data[i]>>4, g=data[i+1]>>4, b=data[i+2]>>4; bins.add((r<<8)|(g<<4)|b);
    }
  }
  if (bins.size < 64) return 'silhouette';
  return 'grabcut';
};