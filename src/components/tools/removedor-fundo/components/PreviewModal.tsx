
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ImageFile } from '../types';
import { RemovalOptions, removeBackgroundClientSide, analyzeSolidBackgroundHSV } from '../utils/imageProcessor';
import Spinner from './Spinner';
import Button from './Button';
import { FeatherIcon, ArrowUturnLeftIcon, ClipboardIcon, DownloadIcon, EyedropperIcon, XCircleIcon, MagicWandIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, CurveSmoothIcon, LayersIcon, ColorSwatchIcon, ShadowIcon, DropletIcon, SunIcon, ContrastIcon, SaturationIcon, CropIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, EyeIcon, EraserIcon, RestoreBrushIcon, RotateClockwiseIcon, FlipHorizontalIcon, RedoIcon } from './Icons';
import { useTranslation } from '../utils/localization';
import { toastEventManager } from '../utils/fileUtils';

interface PreviewModalProps {
  images: ImageFile[];
  currentIndex: number;
  options: RemovalOptions;
  onClose: () => void;
  onApply: (imageId: string, newOptions: RemovalOptions, processedUrl: string, removalInfo: ImageFile['removalInfo'], newFile?: File) => void;
  onRevert: (imageId: string) => void;
  onNavigate: (newIndex: number) => void;
}

type PreviewBg = 'dark' | 'light' | 'checkerboard';
type Tool = 'erase' | 'restore' | 'crop' | 'refine';

const HISTORY_LIMIT = 30;

// Componente reutilizável para um controle deslizante (slider)
const SliderControl: React.FC<{ id: string, label: string, value: number, min: number, max: number, step?: number, onChange: (val: number) => void, icon?: React.ReactNode, title?: string, disabled?: boolean, description?: string }> =
  ({ id, label, value, min, max, step = 1, onChange, icon, title, disabled, description }) => (
    <div className={disabled ? 'opacity-40 pointer-events-none transition-opacity' : 'transition-opacity'}>
      <label htmlFor={id} className="flex items-center text-sm font-semibold text-text-primary mb-1" title={title}>
        {icon}{label} <span className="ml-2 font-normal text-text-secondary">({value})</span>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-primary" />
      {description && <p className="text-xs text-text-secondary mt-1 px-1">{description}</p>}
    </div>
  );

// Componente reutilizável para um seletor de cor
const ColorControl: React.FC<{ id: string, label: string, value: string, onChange: (val: string) => void, disabled?: boolean }> =
  ({ id, label, value, onChange, disabled }) => (
    <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
      <label htmlFor={id} className="block text-sm font-semibold text-text-primary mb-1">{label}</label>
      <div className="relative">
        <input id={id} type="color" value={value} disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="p-1 h-10 w-full block bg-white rounded-lg border border-gray-300 cursor-pointer disabled:cursor-not-allowed" />
      </div>
    </div>
  );

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="py-2 border-b border-gray-200 last:border-b-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-2">
        <h4 className="text-md font-semibold text-text-primary">{title}</h4>
        <ChevronRightIcon className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="pt-2 pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, isActive?: boolean, disabled?: boolean }> = ({ icon, label, onClick, isActive = false, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center gap-1.5 p-3 text-sm font-semibold border rounded-lg transition-colors w-full h-full aspect-square
        ${isActive ? 'bg-accent-primary text-white border-transparent shadow-md' : 'bg-white text-text-primary border-gray-200 hover:bg-gray-100 hover:border-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 hover:bg-gray-50' : ''}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);


/**
 * Modal para ajuste fino e pré-visualização em tempo real da remoção de fundo.
 */
const PreviewModal: React.FC<PreviewModalProps> = ({ images, currentIndex, options, onClose, onApply, onRevert, onNavigate }) => {
  const { t } = useTranslation();
  const image = images[currentIndex];

  const [isLoading, setIsLoading] = useState(true);
  const [previewBg, setPreviewBg] = useState<PreviewBg>('dark');
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [scribbleMode, setScribbleMode] = useState<null | 'fg' | 'bg'>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState(false);
  const [benchResults, setBenchResults] = useState<Array<{ label: string; width: number; height: number; total: number; stages: Record<string, number> }>>([]);
  const [suiteRunning, setSuiteRunning] = useState(false);
  const [suiteCategories, setSuiteCategories] = useState<Record<string, 'portrait' | 'product' | 'solid' | 'green'>>({});
  const [suiteResults, setSuiteResults] = useState<Array<{ id: string; name: string; category: string; total: number; edgeRatio: number; pass: boolean }>>([]);
  const [modeLocal, setModeLocal] = useState<'simple' | 'quick-fix' | 'advanced'>('simple');
  const [needsQuickFix, setNeedsQuickFix] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [comparePos, setComparePos] = useState(50);

  // Estado para ferramentas manuais
  const [activeTool, setActiveTool] = useState<Tool | null>('refine');
  const [brushSize, setBrushSize] = useState(30);
  const [brushHardness, setBrushHardness] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showOriginalOverlay, setShowOriginalOverlay] = useState(false);

  // Estado para o histórico de edições (Undo/Redo)
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isNavigatingHistory = useRef(false);

  // --- Refs dos Canvas ---
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageCanvasRef = useRef<HTMLCanvasElement>(null);
  const pickerCanvasRef = useRef<HTMLCanvasElement>(null);
  const brushCanvasRef = useRef(document.createElement('canvas'));

  const lastPos = useRef<{ x: number, y: number } | null>(null);

  const [localOptions, setLocalOptions] = useState<RemovalOptions>({ ...options });
  const [localRemovalInfo, setLocalRemovalInfo] = useState<ImageFile['removalInfo']>([]);

  const [initialOptions, setInitialOptions] = useState<RemovalOptions | null>(null);
  const [initialInfo, setInitialInfo] = useState<ImageFile['removalInfo'] | null>(null);

  const [zoomState, setZoomState] = useState({ visible: false, x: 0, y: 0, color: 'rgba(0,0,0,0)', bgX: 0, bgY: 0, bgWidth: 0, bgHeight: 0 });
  const [brushCursor, setBrushCursor] = useState({ visible: false, x: 0, y: 0 });
  const [imageRenderInfo, setImageRenderInfo] = useState({ x: 0, y: 0, width: 1, height: 1, scale: 1 });

  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [croppedImageSource, setCroppedImageSource] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showMaskPreview, setShowMaskPreview] = useState(false);
  const [uniformityValue, setUniformityValue] = useState(0);
  const histCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskPreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let timer: any = null;
    const run = () => {
      const originalCanvas = originalImageCanvasRef.current;
      if (!originalCanvas) return;
      const w = originalCanvas.width;
      const h = originalCanvas.height;
      if (!w || !h) return;
      const ctx = originalCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      const imgData = ctx.getImageData(0, 0, w, h);
      const centralPct = (localOptions as any).samplingCentralPercent ?? 20;
      const analysis = analyzeSolidBackgroundHSV(imgData, w, h, centralPct);
      setUniformityValue(analysis.uniformity);
      const canvas = histCanvasRef.current;
      if (canvas) {
        canvas.width = 200; canvas.height = 60;
        const cctx = canvas.getContext('2d');
        if (cctx) {
          cctx.clearRect(0, 0, canvas.width, canvas.height);
          const hBins = analysis.histogram.hBins;
          const sBins = analysis.histogram.sBins;
          const vBins = analysis.histogram.vBins;
          const hist = analysis.histogram.hist;
          const hueCounts = new Array(hBins).fill(0);
          for (let hi = 0; hi < hBins; hi++) {
            let sum = 0;
            for (let si = 0; si < sBins; si++) {
              for (let vi = 0; vi < vBins; vi++) {
                const idx = (hi * sBins + si) * vBins + vi;
                sum += hist[idx];
              }
            }
            hueCounts[hi] = sum;
          }
          const max = Math.max(1, ...hueCounts);
          const barW = canvas.width / hBins;
          cctx.fillStyle = '#4b6bfb';
          for (let i = 0; i < hBins; i++) {
            const h = Math.round((hueCounts[i] / max) * canvas.height);
            cctx.fillRect(i * barW, canvas.height - h, barW - 1, h);
          }
        }
      }
      if (showMaskPreview) {
        const mcanvas = maskPreviewCanvasRef.current;
        if (mcanvas) {
          mcanvas.width = 200; mcanvas.height = 200;
          const mctx = mcanvas.getContext('2d');
          if (mctx) {
            const mask = mctx.createImageData(w, h);
            const keyHSV = analysis.keyHSV || { h: 0, s: 0, v: 1 };
            const tol = localOptions.tolerance ?? 40;
            const tempCanvas = document.createElement('canvas'); tempCanvas.width = w; tempCanvas.height = h;
            const tctx = tempCanvas.getContext('2d');
            if (tctx) {
              tctx.putImageData(imgData, 0, 0);
              const sData = imgData.data; const dData = mask.data;
              for (let i = 0; i < sData.length; i += 4) {
                const rf = sData[i], gf = sData[i + 1], bf = sData[i + 2];
                const hsv = (window as any).__rgbToHSV ? (window as any).__rgbToHSV(rf, gf, bf) : null;
                const hsvLocal = hsv || (function () {
                  const rf2 = rf / 255, gf2 = gf / 255, bf2 = bf / 255; const max = Math.max(rf2, gf2, bf2), min = Math.min(rf2, gf2, bf2); const d = max - min; let h = 0; if (d === 0) h = 0; else if (max === rf2) h = ((gf2 - bf2) / d) % 6; else if (max === gf2) h = (bf2 - rf2) / d + 2; else h = (rf2 - gf2) / d + 4; h *= 60; if (h < 0) h += 360; const v = max; const s = max === 0 ? 0 : d / max; return { h, s, v };
                })();
                let dh = Math.abs(hsvLocal.h - keyHSV.h); if (dh > 180) dh = 360 - dh; const ds = Math.abs(hsvLocal.s - keyHSV.s); const dv = Math.abs(hsvLocal.v - keyHSV.v);
                const dist = (dh / 180 * 0.5 + ds * 0.3 + dv * 0.2) * 100;
                let a = 255 * (1 - Math.min(1, dist / Math.max(1, tol)));
                a = Math.max(0, Math.min(255, a));
                dData[i] = dData[i + 1] = dData[i + 2] = dData[i + 3] = a | 0;
              }
              const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h;
              const tmpCtx = tmp.getContext('2d');
              if (tmpCtx) { tmpCtx.putImageData(mask, 0, 0); mctx.drawImage(tmp, 0, 0, 200, 200); }
            }
          }
        }
      }
    };
    if (isCalibrating) {
      timer = setInterval(run, 33);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isCalibrating, localOptions, showMaskPreview]);
  const panState = useRef({ isPanning: false, startX: 0, startY: 0, startPan: { x: 0, y: 0 } });
  const touchState = useRef({ isPinching: false, isPanning: false, startDist: 0, startPan: { x: 0, y: 0 }, startZoom: 1, startPoints: [{ x: 0, y: 0 }] }).current;

  // --- Lógica de Histórico (Undo/Redo) ---
  const pushToHistory = useCallback((canvasState: string) => {
    if (isNavigatingHistory.current || history[historyIndex] === canvasState) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(canvasState);

    if (newHistory.length > HISTORY_LIMIT) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const drawResultToCanvas = useCallback((imageUrl: string) => {
    const canvas = displayCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      updateImageRenderInfo();
    };
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isNavigatingHistory.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      drawResultToCanvas(history[newIndex]);
    }
  }, [history, historyIndex, drawResultToCanvas]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isNavigatingHistory.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      drawResultToCanvas(history[newIndex]);
    }
  }, [history, historyIndex, drawResultToCanvas]);

  // --- Funções Principais ---
  const cancelRef = useRef<(() => void) | null>(null);
  const previewRef = useRef<{ timer: number; lastKey: string }>({ timer: 0, lastKey: '' });
  const lastSourceRef = useRef<string | null>(null);
  const inFlightIdRef = useRef<number>(0);
  const [progress, setProgress] = useState<{ stage: string; iter: number; progress: number } | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);

  const generatePreview = useCallback(async (
    currentOpts: RemovalOptions,
    currentInfo: ImageFile['removalInfo'],
    sourceOverride?: string
  ) => {
    setIsLoading(true);
    setProgress(null);
    setError(null);
    try {
      const sourceUrl = sourceOverride || croppedImageSource || image.originalURL;
      const imgEl = new Image(); imgEl.crossOrigin = 'Anonymous'; imgEl.src = sourceUrl;
      await new Promise<void>((resolve, reject) => { imgEl.onload = () => resolve(); imgEl.onerror = () => reject(new Error('load')); });
      const large = imgEl.width * imgEl.height > 2048 * 2048;
      if (large) {
        const shorter = Math.max(512, Math.min(1024, Math.floor(Math.sqrt(imgEl.width * imgEl.height / 2))));
        const aspect = imgEl.width / imgEl.height;
        const w = aspect >= 1 ? shorter : Math.round(shorter * aspect);
        const h = aspect >= 1 ? Math.round(shorter / aspect) : shorter;
        const resizedUrl = await (async () => {
          const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); if (!ctx) return sourceUrl; ctx.drawImage(imgEl, 0, 0, w, h); return canvas.toDataURL('image/png');
        })();
        const lowBase64 = await removeBackgroundClientSide(
          resizedUrl,
          { ...currentOpts, removalInfo: currentInfo },
          (evt) => setProgress({ stage: 'prévia', iter: evt.iter, progress: evt.progress }),
          (cancel) => { cancelRef.current = cancel; }
        );
        const lowUrl = `data:image/png;base64,${lowBase64}`;
        if (inFlightIdRef.current) {
          drawResultToCanvas(lowUrl);
          pushToHistory(lowUrl);
        }
      }
      const resultBase64 = await removeBackgroundClientSide(
        sourceUrl,
        { ...currentOpts, removalInfo: currentInfo },
        (evt) => setProgress(evt),
        (cancel) => { cancelRef.current = cancel; }
      );
      const url = `data:image/png;base64,${resultBase64}`;
      if (inFlightIdRef.current) {
        drawResultToCanvas(url);
        pushToHistory(url);
      }
      try {
        const canvas = displayCanvasRef.current;
        const ctx = canvas?.getContext('2d', { willReadFrequently: true });
        if (canvas && ctx) {
          const w = canvas.width, h = canvas.height;
          const img = ctx.getImageData(0, 0, w, h).data;
          let edgeMix = 0, edgeCount = 0;
          const border = Math.max(2, Math.round(Math.min(w, h) * 0.01));
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              if (x < border || x >= w - border || y < border || y >= h - border) {
                const a = img[(y * w + x) * 4 + 3];
                if (a > 0 && a < 255) edgeMix++;
                edgeCount++;
              }
            }
          }
          const ratio = edgeCount ? edgeMix / edgeCount : 0;
          setNeedsQuickFix(ratio > 0.12);
          if (ratio > 0.12 && modeLocal === 'simple') setModeLocal('quick-fix');
        }
      } catch { }
    } catch (e: any) {
      setError(e.message || t('previewModal.generateError'));
    } finally {
      setIsLoading(false);
      isNavigatingHistory.current = false;
      cancelRef.current = null;
    }
  }, [image.originalURL, t, drawResultToCanvas, croppedImageSource, pushToHistory]);

  const resizeImageToResolution = useCallback(async (sourceUrl: string, targetW: number, targetH: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetW; canvas.height = targetH;
        const ctx = canvas.getContext('2d'); if (!ctx) { reject(new Error('ctx')); return; }
        const ir = img.width / img.height; const tr = targetW / targetH;
        let dw = targetW, dh = targetH, sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (ir > tr) { sh = Math.round(img.width / tr); sy = Math.floor((img.height - sh) / 2); }
        else if (ir < tr) { sw = Math.round(img.height * tr); sx = Math.floor((img.width - sw) / 2); }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('load'));
      img.src = sourceUrl;
    });
  }, []);

  const handleBenchmark = useCallback(async () => {
    if (isBenchmarkRunning) return;
    setIsBenchmarkRunning(true);
    setBenchResults([]);
    const sourceUrl = croppedImageSource || image.originalURL;
    const targets = [
      { label: 'HD', w: 1920, h: 1080 },
      { label: '4K', w: 3840, h: 2160 },
      { label: '8K', w: 7680, h: 4320 },
    ];
    for (const t of targets) {
      try {
        const resized = await resizeImageToResolution(sourceUrl, t.w, t.h);
        const stages: Record<string, number> = {};
        const base64 = await removeBackgroundClientSide(resized, { ...localOptions, removalInfo: localRemovalInfo }, undefined, undefined, (evt) => { stages[evt.stage] = (stages[evt.stage] || 0) + evt.duration; });
        const total = stages['total'] || 0;
        setBenchResults(prev => [...prev, { label: t.label, width: t.w, height: t.h, total, stages }]);
      } catch { }
    }
    setIsBenchmarkRunning(false);
  }, [isBenchmarkRunning, resizeImageToResolution, croppedImageSource, image.originalURL, localOptions, localRemovalInfo]);

  const computeEdgeRatioFromDataUrl = useCallback(async (dataUrl: string) => {
    return new Promise<number>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        if (!ctx) { resolve(0); return; }
        ctx.drawImage(img, 0, 0);
        const w = c.width, h = c.height;
        const data = ctx.getImageData(0, 0, w, h).data;
        let edgeMix = 0, edgeCount = 0;
        const border = Math.max(2, Math.round(Math.min(w, h) * 0.01));
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (x < border || x >= w - border || y < border || y >= h - border) {
              const a = data[(y * w + x) * 4 + 3];
              if (a > 0 && a < 255) edgeMix++;
              edgeCount++;
            }
          }
        }
        resolve(edgeCount ? edgeMix / edgeCount : 0);
      };
      img.src = dataUrl;
    });
  }, []);

  const handleRunSuite = useCallback(async () => {
    if (suiteRunning) return;
    setSuiteRunning(true);
    setSuiteResults([]);
    try {
      for (const img of images) {
        const category = suiteCategories[img.id] || 'solid';
        let opts: RemovalOptions = { tolerance: 40 } as any;
        if (category === 'solid') {
          opts = { mode: 'chroma', colorSpace: 'HSV', tolerance: 40, autoTolerance: true, toleranceMin: 35, toleranceMax: 45, samplingCentralPercent: 20, refinementKernel: 3 } as any;
        } else if (category === 'green') {
          opts = { mode: 'chroma', colorSpace: 'YUV', tolerance: 40 } as any;
        } else if (category === 'portrait' || category === 'product') {
          opts = { mode: 'grabcut', grabcut: { iterations: 5, lambda: 50, useWorker: true } } as any;
        }
        const stages: Record<string, number> = {};
        let total = 0;
        try {
          const base64 = await removeBackgroundClientSide(img.originalURL, opts, undefined, undefined, (evt) => { stages[evt.stage] = (stages[evt.stage] || 0) + evt.duration; });
          total = stages['total'] || 0;
          const url = `data:image/png;base64,${base64}`;
          const edgeRatio = await computeEdgeRatioFromDataUrl(url);
          let pass = true;
          if (category === 'solid' || category === 'green') {
            pass = edgeRatio < 0.08 && total <= 5000;
          } else {
            pass = edgeRatio < 0.12;
          }
          setSuiteResults(prev => [...prev, { id: img.id, name: img.file.name, category, total, edgeRatio, pass }]);
        } catch { }
      }
    } finally {
      setSuiteRunning(false);
    }
  }, [suiteRunning, images, suiteCategories, computeEdgeRatioFromDataUrl]);

  const handleCopyBenchmark = useCallback(async () => {
    try {
      const text = JSON.stringify(benchResults, null, 2);
      await navigator.clipboard.writeText(text);
      toastEventManager.emit('toasts.copied', 'success');
    } catch {
      toastEventManager.emit('toasts.copyError', 'error');
    }
  }, [benchResults]);

  const handleRevertToOriginal = useCallback(() => {
    if (initialOptions && initialInfo !== null) {
      setLocalOptions(initialOptions);
      setLocalRemovalInfo(initialInfo);
      setHistory([]);
      setHistoryIndex(-1);
      setCroppedImageSource(null);
      // Passa a URL original para garantir que estamos revertendo o corte também
      generatePreview(initialOptions, initialInfo, image.originalURL);
    }
  }, [initialOptions, initialInfo, generatePreview, image.originalURL]);

  useEffect(() => {
    const newOptions: RemovalOptions = {
      ...options,
      contourSmoothing: options.contourSmoothing ?? 0,
      colorDecontamination: options.colorDecontamination ?? 50,
      sticker: options.sticker ?? false,
      outline: { color: '#ffffff', width: 10, ...options.outline },
      dropShadow: { color: 'rgba(0,0,0,0.4)', blur: 10, offsetX: 5, offsetY: 5, ...options.dropShadow },
      brightness: options.brightness ?? 100,
      contrast: options.contrast ?? 100,
      saturation: options.saturation ?? 100,
      bilateralIntensity: options.bilateralIntensity ?? 0,
      bilateralSigmaSpace: options.bilateralSigmaSpace ?? 3,
      bilateralSigmaColor: options.bilateralSigmaColor ?? 25,
      bilateralEdgesOnly: options.bilateralEdgesOnly ?? true,
    };
    const newInfo = image.removalInfo || [];
    setLocalOptions(newOptions);
    setInitialOptions(JSON.parse(JSON.stringify(newOptions))); // Deep copy
    setLocalRemovalInfo(newInfo);
    setInitialInfo(JSON.parse(JSON.stringify(newInfo))); // Deep copy

    setCrop({ x: 0, y: 0, width: 100, height: 100 });
    setCroppedImageSource(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHistory([]);
    setHistoryIndex(-1);
    setError(null);
    setIsPicking(false);
    setActiveTool('refine');
    setShowOriginalOverlay(false);

    const initialUrl = image.processedURL && JSON.stringify(options.background) === JSON.stringify(newOptions.background)
      ? image.processedURL
      : null;

    if (initialUrl) {
      drawResultToCanvas(initialUrl);
      pushToHistory(initialUrl);
      setIsLoading(false);
    } else {
      generatePreview(newOptions, newInfo);
    }
  }, [image.id, image.processedURL, image.removalInfo, options, generatePreview, drawResultToCanvas, pushToHistory]);

  useEffect(() => {
    if (isNavigatingHistory.current || initialOptions === null || activeTool === 'crop') return;
    if (JSON.stringify(localOptions) === JSON.stringify(initialOptions) && JSON.stringify(localRemovalInfo) === JSON.stringify(initialInfo)) return;
    const key = JSON.stringify({ o: localOptions, r: localRemovalInfo, s: croppedImageSource || image.originalURL });
    if (previewRef.current.lastKey === key) return;
    if (previewRef.current.timer) clearTimeout(previewRef.current.timer);
    previewRef.current.timer = window.setTimeout(() => {
      previewRef.current.lastKey = key;
      if (cancelRef.current) cancelRef.current();
      inFlightIdRef.current = Date.now();
      generatePreview(localOptions, localRemovalInfo);
      setIsPicking(false);
    }, 300);
  }, [localOptions, localRemovalInfo, initialOptions, initialInfo, activeTool, croppedImageSource, image.originalURL]);

  useEffect(() => {
    const originalCanvas = originalImageCanvasRef.current;
    const pickerCanvas = pickerCanvasRef.current;
    const oCtx = originalCanvas?.getContext('2d');
    const pCtx = pickerCanvas?.getContext('2d', { willReadFrequently: true });
    if (!originalCanvas || !pickerCanvas || !oCtx || !pCtx) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    const src = croppedImageSource || image.originalURL;
    if (lastSourceRef.current === src) return;
    lastSourceRef.current = src;
    img.src = src;
    img.onload = () => {
      originalCanvas.width = pickerCanvas.width = img.width;
      originalCanvas.height = pickerCanvas.height = img.height;
      oCtx.drawImage(img, 0, 0);
      pCtx.drawImage(img, 0, 0);

      if (activeTool === 'crop') {
        drawResultToCanvas(src);
      }
      updateImageRenderInfo();
    };
  }, [image.originalURL, croppedImageSource, activeTool, drawResultToCanvas]);

  useEffect(() => {
    const brushCanvas = brushCanvasRef.current;
    const radius = 50;
    brushCanvas.width = radius * 2;
    brushCanvas.height = radius * 2;
    const brushCtx = brushCanvas.getContext('2d');
    if (!brushCtx) return;
    brushCtx.clearRect(0, 0, radius * 2, radius * 2);

    const grad = brushCtx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    const hardnessStop = Math.max(0, Math.min(1, brushHardness / 100));
    const midPoint = hardnessStop + (1 - hardnessStop) / 2;
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(hardnessStop, 'rgba(0,0,0,1)');
    grad.addColorStop(midPoint, 'rgba(0,0,0,0.5)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    brushCtx.fillStyle = grad;
    brushCtx.fillRect(0, 0, radius * 2, radius * 2);
  }, [brushHardness]);

  const updateImageRenderInfo = useCallback(() => {
    const canvas = displayCanvasRef.current;
    if (canvas && imageContainerRef.current) {
      const { width: naturalWidth, height: naturalHeight } = canvas;
      const containerRect = imageContainerRef.current.getBoundingClientRect();

      if (naturalWidth === 0 || naturalHeight === 0) return;

      const containerRatio = containerRect.width / containerRect.height;
      const imageRatio = naturalWidth / naturalHeight;

      let renderWidth, renderHeight;
      if (containerRatio > imageRatio) {
        renderHeight = containerRect.height;
        renderWidth = renderHeight * imageRatio;
      } else {
        renderWidth = containerRect.width;
        renderHeight = renderWidth / imageRatio;
      }

      const x = containerRect.left + (containerRect.width - renderWidth) / 2;
      const y = containerRect.top + (containerRect.height - renderHeight) / 2;

      const source = displayCanvasRef.current;
      const scale = source ? renderWidth / source.width : 1;

      setImageRenderInfo({ x, y, width: renderWidth, height: renderHeight, scale });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateImageRenderInfo);
    updateImageRenderInfo();
    return () => window.removeEventListener('resize', updateImageRenderInfo);
  }, [updateImageRenderInfo]);

  const handleApply = async () => {
    const canvas = displayCanvasRef.current;
    if (canvas) {
      setIsApplying(true);
      let finalFile: File | undefined = undefined;

      if (croppedImageSource) {
        const blob = await (await fetch(croppedImageSource)).blob();
        finalFile = new File([blob], `edited_${image.file.name}`, { type: blob.type });
      }

      const finalUrl = canvas.toDataURL('image/png');
      onApply(image.id, localOptions, finalUrl, localRemovalInfo, finalFile);
      setTimeout(() => onClose(), 1200);
    }
  };


  const getCanvasCoordinates = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return { x, y };
  };

  const drawOnCanvas = useCallback((x: number, y: number) => {
    const displayCtx = displayCanvasRef.current?.getContext('2d');
    const originalCanvas = originalImageCanvasRef.current;
    if (!displayCtx || !originalCanvas) return;

    const actualBrushSize = brushSize / (imageRenderInfo.scale * zoom);

    const interpolate = (start: { x: number, y: number }, end: { x: number, y: number }) => {
      const points = [];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.hypot(dx, dy);
      const step = actualBrushSize / 4;

      for (let i = 0; i < dist; i += step) {
        const p = i / dist;
        points.push({ x: start.x + dx * p, y: start.y + dy * p });
      }
      points.push(end);
      return points;
    };

    const pointsToDraw = lastPos.current ? interpolate(lastPos.current, { x, y }) : [{ x, y }];

    for (const point of pointsToDraw) {
      if (activeTool === 'erase') {
        displayCtx.globalCompositeOperation = 'destination-out';
        displayCtx.drawImage(brushCanvasRef.current, point.x - actualBrushSize / 2, point.y - actualBrushSize / 2, actualBrushSize, actualBrushSize);
      } else if (activeTool === 'restore') {
        displayCtx.save();
        displayCtx.globalCompositeOperation = 'source-over';
        displayCtx.drawImage(brushCanvasRef.current, point.x - actualBrushSize / 2, point.y - actualBrushSize / 2, actualBrushSize, actualBrushSize);
        displayCtx.globalCompositeOperation = 'source-in';
        displayCtx.drawImage(originalCanvas, 0, 0);
        displayCtx.restore();
      }
    }

    lastPos.current = { x, y };
  }, [activeTool, brushSize, imageRenderInfo.scale, zoom]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'erase' || activeTool === 'restore') {
      isNavigatingHistory.current = false;
      setIsDrawing(true);
      const coords = getCanvasCoordinates(e);
      if (coords) {
        lastPos.current = coords;
        drawOnCanvas(coords.x, coords.y);
      }
    } else if (!isPicking && activeTool !== 'crop') {
      handlePanStart(e);
    }
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panState.current.isPanning) {
      handlePanMove(e);
      return;
    }

    setBrushCursor({ visible: true, x: e.clientX, y: e.clientY });

    if (isDrawing && (activeTool === 'erase' || activeTool === 'restore')) {
      const coords = getCanvasCoordinates(e);
      if (coords) drawOnCanvas(coords.x, coords.y);
    }

    if (isPicking) handlePickerMouseMove(e);
  };
  const handleMouseUp = () => {
    if (isDrawing) {
      const canvas = displayCanvasRef.current;
      if (canvas) pushToHistory(canvas.toDataURL('image/png'));
    }
    setIsDrawing(false);
    lastPos.current = null;
    handlePanEnd();
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      const canvas = displayCanvasRef.current;
      if (canvas) pushToHistory(canvas.toDataURL('image/png'));
    }
    setIsDrawing(false);
    lastPos.current = null;
    setBrushCursor({ visible: false, x: 0, y: 0 });
    if (isPicking) setZoomState(prev => ({ ...prev, visible: false }));
    handlePanEnd();
  };

  const toggleTool = (tool: Tool) => {
    setActiveTool(prev => (prev === tool ? null : tool));
    setIsPicking(false);
    if (tool !== 'crop' && activeTool === 'crop') {
      generatePreview(localOptions, localRemovalInfo);
    }
  };


  const anyToolActive = isPicking || !!activeTool;
  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button !== 0 || anyToolActive) return;
    e.preventDefault();
    panState.current = { isPanning: true, startX: e.clientX, startY: e.clientY, startPan: pan, };
  };
  const handlePanMove = (e: React.MouseEvent) => {
    if (!panState.current.isPanning) return;
    e.preventDefault();
    const dx = e.clientX - panState.current.startX;
    const dy = e.clientY - panState.current.startY;
    setPan({ x: panState.current.startPan.x + dx, y: panState.current.startPan.y + dy, });
  };
  const handlePanEnd = () => {
    panState.current.isPanning = false;
  };
  const handleWheelZoom = (e: React.WheelEvent) => {
    if (anyToolActive) return;
    e.preventDefault();
    const container = imageContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const clampedZoom = Math.max(1, Math.min(newZoom, 8));

    const newPanX = mouseX - (mouseX - pan.x) * (clampedZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (clampedZoom / zoom);

    setZoom(clampedZoom);
    setPan({ x: newPanX, y: newPanY });
  };
  const handleZoomIn = () => setZoom(z => Math.min(z * 1.25, 8));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.25, 1));

  const getDist = (p1: { x: number, y: number }, p2: { x: number, y: number }) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  const handleTouchStart = (e: React.TouchEvent) => {
    if (anyToolActive) return;
    e.preventDefault();
    const touches = e.touches;
    const rect = imageContainerRef.current!.getBoundingClientRect();
    const relativeTouches = Array.from(touches).map(t => ({ x: t.clientX - rect.left, y: t.clientY - rect.top }));

    if (touches.length === 1) {
      touchState.isPanning = true;
      touchState.startPoints = relativeTouches;
      touchState.startPan = pan;
    } else if (touches.length === 2) {
      touchState.isPanning = false;
      touchState.isPinching = true;
      touchState.startDist = getDist(relativeTouches[0], relativeTouches[1]);
      touchState.startZoom = zoom;
      touchState.startPan = pan;
      touchState.startPoints = relativeTouches;
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (anyToolActive) return;
    e.preventDefault();
    const touches = e.touches;
    const rect = imageContainerRef.current!.getBoundingClientRect();
    const relativeTouches = Array.from(touches).map(t => ({ x: t.clientX - rect.left, y: t.clientY - rect.top }));

    if (touchState.isPanning && touches.length === 1) {
      const dx = relativeTouches[0].x - touchState.startPoints[0].x;
      const dy = relativeTouches[0].y - touchState.startPoints[0].y;
      setPan({
        x: touchState.startPan.x + dx,
        y: touchState.startPan.y + dy,
      });
    } else if (touchState.isPinching && touches.length === 2) {
      const newDist = getDist(relativeTouches[0], relativeTouches[1]);
      if (touchState.startDist === 0) return;
      const scale = newDist / touchState.startDist;
      const newZoom = touchState.startZoom * scale;
      const clampedZoom = Math.max(1, Math.min(newZoom, 8));

      const startMidpoint = {
        x: (touchState.startPoints[0].x + touchState.startPoints[1].x) / 2,
        y: (touchState.startPoints[0].y + touchState.startPoints[1].y) / 2,
      };

      const newPanX = startMidpoint.x - (startMidpoint.x - touchState.startPan.x) * (clampedZoom / touchState.startZoom);
      const newPanY = startMidpoint.y - (startMidpoint.y - touchState.startPan.y) * (clampedZoom / touchState.startZoom);

      setZoom(clampedZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (anyToolActive) return;
    touchState.isPinching = false;
    if (e.touches.length > 0) {
      const rect = imageContainerRef.current!.getBoundingClientRect();
      const relativeTouches = Array.from(e.touches).map(t => ({ x: t.clientX - rect.left, y: t.clientY - rect.top }));
      touchState.isPanning = true;
      touchState.startPoints = relativeTouches;
      touchState.startPan = pan;
    } else {
      touchState.isPanning = false;
    }
  };


  const updateLocalOption = <K extends keyof RemovalOptions>(key: K, value: RemovalOptions[K]) => {
    setLocalOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedOption = <K extends keyof RemovalOptions, N extends keyof NonNullable<RemovalOptions[K]>>(key: K, nestedKey: N, value: NonNullable<RemovalOptions[K]>[N]) => {
    setLocalOptions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [nestedKey]: value
      }
    }));
  };

  const bgClasses: Record<PreviewBg, string> = {
    dark: 'bg-gray-800',
    light: 'bg-gray-100',
    checkerboard: 'checkerboard-bg',
  };

  const applyPreset = (v: 'auto' | 'portrait' | 'product' | 'green' | 'solid' | 'logo') => {
    if (v === 'auto') {
      updateLocalOption('mode', 'floodfill' as any);
    } else if (v === 'portrait' || v === 'product') {
      updateLocalOption('mode', 'grabcut' as any);
      updateLocalOption('grabcut', { ...(localOptions.grabcut || {}), lambda: 50 } as any);
    } else if (v === 'green') {
      updateLocalOption('mode', 'chroma' as any);
      updateLocalOption('tolerance', 40);
      updateLocalOption('colorSpace', 'YUV' as any);
    } else if (v === 'solid') {
      updateLocalOption('mode', 'chroma' as any);
      updateLocalOption('tolerance', 40);
      updateLocalOption('colorSpace', 'HSV' as any);
      updateLocalOption('samplingCentralPercent', 20);
      updateLocalOption('refinementKernel', 3 as any);
    } else if (v === 'logo') {
      updateLocalOption('mode', 'silhouette' as any);
      updateLocalOption('closingIterations', 1);
    }
    generatePreview({ ...localOptions }, localRemovalInfo);
  };

  const handlePickColor = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pickerCanvasRef.current || !displayCanvasRef.current) return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    const { x: canvasX, y: canvasY } = coords;

    const canvas = pickerCanvasRef.current;
    if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
        const color = { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
        setLocalRemovalInfo(prev => [...(prev || []), { color, point: { x: canvasX, y: canvasY }, isAuto: false }]);
      }
    }
  };
  const handlePickScribble = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scribbleMode) return;
    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    const point = { x: Math.round(coords.x), y: Math.round(coords.y) };
    const current = (localOptions.grabcut || {}) as any;
    const fgArr = current.fgScribbles || [];
    const bgArr = current.bgScribbles || [];
    if (scribbleMode === 'fg') fgArr.push(point); else bgArr.push(point);
    updateLocalOption('grabcut', { ...current, fgScribbles: fgArr, bgScribbles: bgArr } as any);
    generatePreview({ ...localOptions, grabcut: { ...current, fgScribbles: fgArr, bgScribbles: bgArr } }, localRemovalInfo);
  };

  const handlePickerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPicking || !pickerCanvasRef.current || !displayCanvasRef.current) {
      if (zoomState.visible) setZoomState(prev => ({ ...prev, visible: false }));
      return;
    }

    const coords = getCanvasCoordinates(e);
    const canvas = pickerCanvasRef.current;
    const { x: canvasX, y: canvasY } = coords || { x: -1, y: -1 };

    const displayRect = displayCanvasRef.current.getBoundingClientRect();
    if (e.clientX < displayRect.left || e.clientX > displayRect.right || e.clientY < displayRect.top || e.clientY > displayRect.bottom) {
      if (zoomState.visible) setZoomState(prev => ({ ...prev, visible: false }));
      return;
    }

    let color = 'rgba(0,0,0,0)';
    if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
        color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      }
    }

    setZoomState({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      color,
      bgX: -(canvasX * 5 - 60),
      bgY: -(canvasY * 5 - 60),
      bgWidth: canvas.width * 5,
      bgHeight: canvas.height * 5,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeTool) setActiveTool(null);
        else if (isPicking) setIsPicking(false);
        else onClose();
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
      else if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isPicking, activeTool, currentIndex, images.length, onNavigate, handleUndo, handleRedo]);

  const handleDownload = useCallback(() => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const originalName = image.file.name.split('.').slice(0, -1).join('.');
    const downloadFilename = `${originalName}_${t('imageCard.processedFileSuffix')}.png`;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [image.file.name, t]);

  const handleCopy = async () => {
    const canvas = displayCanvasRef.current;
    if (!canvas || !navigator.clipboard?.write) {
      toastEventManager.emit('toasts.copyError', 'error');
      return;
    }
    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          setIsCopied(true);
          toastEventManager.emit('toasts.copied', 'success');
          setTimeout(() => setIsCopied(false), 2000);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy image:', err);
      toastEventManager.emit('toasts.copyError', 'error');
    }
  };

  const handleTransform = (type: 'rotate' | 'flip') => {
    const sourceCanvas = originalImageCanvasRef.current;
    if (!sourceCanvas) return;

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    if (type === 'rotate') {
      tempCanvas.width = sourceCanvas.height;
      tempCanvas.height = sourceCanvas.width;
      ctx.translate(tempCanvas.width, 0);
      ctx.rotate(90 * Math.PI / 180);
    } else { // flip
      tempCanvas.width = sourceCanvas.width;
      tempCanvas.height = sourceCanvas.height;
      ctx.translate(tempCanvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(sourceCanvas, 0, 0);

    const dataUrl = tempCanvas.toDataURL();
    setCroppedImageSource(dataUrl);
    drawResultToCanvas(dataUrl);
    pushToHistory(dataUrl);
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
  };

  const handleApplyCrop = () => {
    const sourceCanvas = originalImageCanvasRef.current;
    if (!sourceCanvas) return;
    const sx = Math.round((crop.x / 100) * sourceCanvas.width);
    const sy = Math.round((crop.y / 100) * sourceCanvas.height);
    const sWidth = Math.round((crop.width / 100) * sourceCanvas.width);
    const sHeight = Math.round((crop.height / 100) * sourceCanvas.height);
    setActiveTool(null);
    if ((localOptions.mode || 'floodfill') === 'grabcut') {
      const current = (localOptions.grabcut || {}) as any;
      const next = { ...current, bbox: { x: sx, y: sy, width: sWidth, height: sHeight } };
      updateLocalOption('grabcut', next as any);
      generatePreview({ ...localOptions, grabcut: next }, localRemovalInfo);
    } else {
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;
      tempCanvas.width = sWidth;
      tempCanvas.height = sHeight;
      ctx.drawImage(sourceCanvas, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      const dataUrl = tempCanvas.toDataURL();
      setCroppedImageSource(dataUrl);
      generatePreview(localOptions, localRemovalInfo, dataUrl);
    }
  };

  const hasChanged = useMemo(() => historyIndex > 0, [historyIndex]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    >
      <canvas ref={pickerCanvasRef} className="hidden" />
      <canvas ref={originalImageCanvasRef} className="hidden" />

      {isPicking && zoomState.visible && (
        <div
          className="zoom-loupe"
          style={{ left: `${zoomState.x + 20}px`, top: `${zoomState.y + 20}px`, backgroundImage: `url(${croppedImageSource || image.originalURL})`, backgroundPosition: `${zoomState.bgX}px ${zoomState.bgY}px`, backgroundSize: `${zoomState.bgWidth}px ${zoomState.bgHeight}px` }}
        >
          <div className="zoom-loupe-crosshair" /><div className="zoom-loupe-color-swatch">{zoomState.color}</div>
        </div>
      )}

      {(activeTool === 'erase' || activeTool === 'restore') && brushCursor.visible && (
        <div
          className="brush-cursor"
          style={{
            left: `${brushCursor.x}px`,
            top: `${brushCursor.y}px`,
            width: `${brushSize}px`,
            height: `${brushSize}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      <div
        className="bg-creme rounded-lg shadow-2xl w-full max-w-screen-xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="font-semibold text-lg text-text-primary truncate pr-4" title={image.file.name}>
            {t('previewModal.editingTitle')} {image.file.name}
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary" aria-label={t('previewModal.close')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <main
            ref={imageContainerRef}
            className={`relative flex-grow p-4 overflow-hidden flex items-center justify-center ${bgClasses[previewBg]} touch-none`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={isPicking ? handlePickColor : (scribbleMode ? handlePickScribble : undefined)}
            onWheel={handleWheelZoom}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: panState.current.isPanning ? 'grabbing' : (zoom > 1 && !anyToolActive) ? 'grab' : isPicking ? 'cursor-eyedropper-zoom' : (activeTool === 'erase' || activeTool === 'restore') ? 'none' : 'default'
            }}
          >
            <div
              className={`relative`}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  width: imageRenderInfo.width / zoom,
                  height: imageRenderInfo.height / zoom,
                  opacity: showOriginalOverlay && (activeTool === 'erase' || activeTool === 'restore') ? 0.3 : 0,
                  backgroundImage: `url(${croppedImageSource || image.originalURL})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  zIndex: 0,
                }}
              />
              {showCompare && (
                <div
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    width: (imageRenderInfo.width / zoom) * (comparePos / 100),
                    height: imageRenderInfo.height / zoom,
                    backgroundImage: `url(${croppedImageSource || image.originalURL})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'left center',
                    zIndex: 2,
                  }}
                />
              )}

              <canvas
                ref={displayCanvasRef}
                className={isPicking ? 'cursor-eyedropper-zoom' : (activeTool === 'erase' || activeTool === 'restore') ? 'cursor-none' : ''}
                style={{
                  display: 'block',
                  width: imageRenderInfo.width / zoom,
                  height: imageRenderInfo.height / zoom,
                  position: 'relative',
                  zIndex: 1,
                }}
              />

              {activeTool === 'crop' && (
                <CropTool
                  imageRenderInfo={imageRenderInfo}
                  crop={crop}
                  setCrop={setCrop}
                />
              )}

              {isLoading && activeTool !== 'crop' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-md">
                    <Spinner />
                    <div>
                      <p className="text-white">{t('previewModal.generatingPreview')}</p>
                      {progress && <>
                        <p className="text-white text-xs">{progress.stage} · {t('previewModal.iteration') || 'Iteração'} {progress.iter + 1}</p>
                        <div className="w-48 h-2 bg-white/30 rounded-full mt-2">
                          <div className="h-2 bg-accent-primary rounded-full" style={{ width: `${Math.min(100, Math.max(0, Math.round(progress.progress * 100)))}%` }} />
                        </div>
                      </>}
                    </div>
                    {cancelRef.current && (
                      <Button variant="secondary" onClick={() => { cancelRef.current?.(); }}>
                        {t('previewModal.cancel')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center text-red-400 text-center p-4">
                  <p>{error}</p>
                </div>
              )}
            </div>

            <button onClick={() => onNavigate(currentIndex - 1)} disabled={currentIndex === 0} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all z-10 disabled:opacity-30 disabled:cursor-not-allowed" aria-label={t('previewModal.previous')}>
              <ChevronLeftIcon className="w-8 h-8" />
            </button>
            <button onClick={() => onNavigate(currentIndex + 1)} disabled={currentIndex === images.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all z-10 disabled:opacity-30 disabled:cursor-not-allowed" aria-label={t('previewModal.next')}>
              <ChevronRightIcon className="w-8 h-8" />
            </button>
          </main>

          <aside className="w-full md:w-[420px] bg-white/60 backdrop-blur-lg p-6 border-l border-gray-200/80 overflow-y-auto flex-shrink-0">
            <div className="p-4 text-sm text-text-secondary">
              {t('previewModal.tools')}
            </div>
            <div className="flex items-center justify-between p-3 bg-white/70 rounded-md border border-gray-200">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${needsQuickFix ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {needsQuickFix ? '⚠️ ' + (t('previewModal.qualityNeedsAdjust') || 'Precisa ajuste') : '✓ ' + (t('previewModal.qualityOk') || 'Ótimo resultado')}
                </span>
              </div>
              <div className="text-xs text-text-secondary">
                {modeLocal === 'simple' ? (t('previewModal.simpleModeTitle') || 'Modo Simplificado') : modeLocal === 'quick-fix' ? (t('previewModal.quickFixTitle') || 'Ajustes Rápidos') : t('previewModal.tools')}
              </div>
            </div>

            <div>
              <div>
                <h4 className="text-lg font-semibold text-text-primary mb-4">{t('previewModal.tools')}</h4>
                <div className="grid grid-cols-4 gap-3">
                  <ToolButton label={t('previewModal.refineTool')} icon={<MagicWandIcon className="w-6 h-6" />} onClick={() => toggleTool('refine')} isActive={activeTool === 'refine'} disabled={isLoading} />
                  <ToolButton label={t('previewModal.crop')} icon={<CropIcon className="w-6 h-6" />} onClick={() => toggleTool('crop')} isActive={activeTool === 'crop'} disabled={isLoading} />
                  <ToolButton label={t('previewModal.erase')} icon={<EraserIcon className="w-6 h-6" />} onClick={() => toggleTool('erase')} isActive={activeTool === 'erase'} disabled={isLoading} />
                  <ToolButton label={t('previewModal.restore')} icon={<RestoreBrushIcon className="w-6 h-6" />} onClick={() => toggleTool('restore')} isActive={activeTool === 'restore'} disabled={isLoading} />
                </div>
              </div>

              {(activeTool === 'erase' || activeTool === 'restore') && (
                <div className='bg-gray-100/80 p-4 rounded-lg space-y-4'>
                  <h4 className="text-md font-semibold text-text-primary">{activeTool === 'erase' ? t('previewModal.erase') : t('previewModal.restore')}</h4>
                  <SliderControl id="brush-size" label={t('previewModal.brushSize')} value={brushSize} min={5} max={100} onChange={setBrushSize} />
                  <SliderControl id="brush-hardness" label={t('previewModal.brushHardness')} value={brushHardness} min={0} max={100} onChange={setBrushHardness} />
                  <div className="flex items-center justify-between">
                    <label htmlFor="show-original-toggle" className="flex items-center gap-3 cursor-pointer pr-4">
                      <EyeIcon className="w-5 h-5 text-accent-primary flex-shrink-0" />
                      <h5 className="font-semibold text-text-primary text-sm">{t('previewModal.showOriginal')}</h5>
                    </label>
                    <input type="checkbox" id="show-original-toggle" className="sr-only peer" checked={showOriginalOverlay} onChange={(e) => setShowOriginalOverlay(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent-secondary peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                  </div>
                </div>
              )}

              {activeTool === 'crop' && (
                <div className='bg-gray-100/80 p-4 rounded-lg space-y-3'>
                  <h4 className="text-md font-semibold text-text-primary">{t('previewModal.crop')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleTransform('rotate')} className="flex items-center justify-center gap-2 p-2 text-sm bg-white rounded-md border border-gray-200 hover:bg-gray-100"><RotateClockwiseIcon className="w-5 h-5" /> {t('previewModal.rotateRight')}</button>
                    <button onClick={() => handleTransform('flip')} className="flex items-center justify-center gap-2 p-2 text-sm bg-white rounded-md border border-gray-200 hover:bg-gray-100"><FlipHorizontalIcon className="w-5 h-5" /> {t('previewModal.flipHorizontal')}</button>
                  </div>
                  <p className="text-xs text-text-secondary text-center pt-2">Ajuste a área de corte na imagem.</p>
                  <div className="flex flex-col gap-2">
                    <Button variant="primary" onClick={handleApplyCrop}>{t('previewModal.applyCrop')}</Button>
                    <Button variant="secondary" onClick={() => setActiveTool(null)}>{t('previewModal.cancelCrop')}</Button>
                  </div>
                </div>
              )}

              {activeTool === 'refine' && (
                <div className='bg-gray-100/80 p-4 rounded-lg'>
                  <div className="-my-2">
                    <Accordion title={t('previewModal.liveAdjustments')} defaultOpen={true}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 w-full">
                          {['Definir área', 'Ajustar parâmetros', 'Refino manual', 'Aplicar'].map((label, idx) => (
                            <button key={idx} onClick={() => setActiveTool(idx === 0 ? 'crop' : idx === 2 ? 'refine' : null)} className={`text-xs px-2 py-1 rounded ${(idx === 0 && activeTool === 'crop') || (idx === 2 && activeTool === 'refine') ? 'bg-accent-primary text-white' : 'bg-white text-text-secondary border border-gray-200'}`}>{label}</button>
                          ))}
                        </div>
                        <Button variant="secondary" onClick={() => {
                          if (activeTool === 'crop') { setActiveTool('refine'); }
                          else if ((activeTool as string) === 'refine') { updateLocalOption('grabcut', { ...((localOptions.grabcut || {}) as any), useWorker: true } as any); generatePreview({ ...localOptions, grabcut: { ...((localOptions.grabcut || {}) as any), useWorker: true } }, localRemovalInfo); }
                          else { setActiveTool('crop'); }
                        }}>{t('previewModal.nextStep') || 'Próximo passo'}</Button>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label className="flex items-center text-sm font-semibold text-text-primary mb-1">
                            {t('previewModal.mode') || 'Modo de Remoção'}
                          </label>
                          <select
                            value={localOptions.mode || 'floodfill'}
                            onChange={(e) => updateLocalOption('mode', e.target.value as any)}
                            className="w-full p-2 bg-white rounded-md border border-gray-300 text-sm"
                          >
                            <option value="floodfill">{t('previewModal.modeFloodfill') || 'Automático'}</option>
                            <option value="grabcut">{t('previewModal.modeGrabcut') || 'GrabCut'}</option>
                            <option value="chroma">{t('previewModal.modeChroma') || 'Chroma Key'}</option>
                            <option value="silhouette">{t('previewModal.modeSilhouette') || 'Silhueta'}</option>
                          </select>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <select
                              value={(() => { if (!localOptions.mode || localOptions.mode === 'floodfill') return 'auto'; if (localOptions.mode === 'grabcut') return 'portrait'; if (localOptions.mode === 'chroma') return 'green'; if (localOptions.mode === 'silhouette') return 'logo'; return 'auto'; })()}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === 'auto') { updateLocalOption('mode', 'floodfill' as any); }
                                else if (v === 'portrait' || v === 'product') { updateLocalOption('mode', 'grabcut' as any); updateLocalOption('grabcut', { ...((localOptions.grabcut || {}) as any), lambda: 50 } as any); }
                                else if (v === 'green') { updateLocalOption('mode', 'chroma' as any); updateLocalOption('tolerance', 40); updateLocalOption('colorSpace', 'YUV' as any); }
                                else if (v === 'solid') { updateLocalOption('mode', 'chroma' as any); updateLocalOption('tolerance', 40); updateLocalOption('colorSpace', 'HSV' as any); updateLocalOption('samplingCentralPercent', 20); updateLocalOption('refinementKernel', 3 as any); }
                                else if (v === 'logo') { updateLocalOption('mode', 'silhouette' as any); updateLocalOption('closingIterations', 1); }
                              }}
                              className="w-full p-2 bg-white rounded-md border border-gray-300 text-sm"
                            >
                              <option value="auto">{t('previewModal.presetAuto')}</option>
                              <option value="portrait">{t('previewModal.presetPortrait')}</option>
                              <option value="product">{t('previewModal.presetProduct')}</option>
                              <option value="logo">{t('previewModal.presetLogo')}</option>
                              <option value="green">{t('previewModal.presetGreen')}</option>
                              <option value="solid">{t('previewModal.presetSolid')}</option>
                            </select>
                            <p className="text-xs text-text-secondary self-center">{t('previewModal.presetHelp') || 'Escolha um tipo e nós ajustamos os parâmetros.'}</p>
                          </div>
                        </div>
                        <SliderControl id="preview-tolerance" label={t('previewModal.tolerance')} value={localOptions.tolerance} min={0} max={100} step={1} onChange={(v) => updateLocalOption('tolerance', v)} description={t('previewModal.toleranceDesc')} />
                        {localOptions.mode === 'chroma' && (
                          <div className="flex flex-col gap-3 mt-2">
                            <div className="flex items-center gap-3">
                              <Button variant="secondary" onClick={() => setIsPicking(true)}>{t('previewModal.addPin') || 'Selecionar cor do fundo'}</Button>
                            </div>
                            <SliderControl id="preview-uniformity" label={t('previewModal.uniformity') || 'Uniformidade'} value={(localOptions as any).uniformity ?? 0} min={0} max={100} step={1} onChange={(v) => updateLocalOption('uniformity' as any, v)} description={t('previewModal.toleranceDesc')} />
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={(localOptions as any).autoTolerance || false} onChange={(e) => updateLocalOption('autoTolerance', e.target.checked as any)} /><span>{t('previewModal.autoTolerance') || 'Auto-ajuste da tolerância (35–45)'}</span></label>
                          </div>
                        )}
                        <SliderControl id="preview-softness" label={t('previewModal.edgeSoftness')} value={localOptions.edgeSoftness ?? 0} min={0} max={50} onChange={(v) => updateLocalOption('edgeSoftness', v)} icon={<FeatherIcon className="w-4 h-4 mr-2" />} description={t('previewModal.edgeSoftnessDesc')} />
                        <SliderControl id="preview-refinement" label={t('previewModal.edgeRefinement')} value={localOptions.edgeRefinement ?? 0} min={-10} max={10} onChange={(v) => updateLocalOption('edgeRefinement', v)} icon={<MagicWandIcon className="w-4 h-4 mr-2" />} description={t('previewModal.edgeRefinementDesc')} />
                        <SliderControl id="preview-smoothing" label={t('previewModal.contourSmoothing')} value={localOptions.contourSmoothing ?? 0} min={0} max={100} onChange={(v) => updateLocalOption('contourSmoothing', v)} icon={<CurveSmoothIcon className="w-4 h-4 mr-2" />} description={t('previewModal.contourSmoothingDesc')} />
                        {advancedMode && (
                          <>
                            <SliderControl id="preview-opening" label={t('previewModal.opening') || 'Opening (remover ruído)'} value={localOptions.openingIterations ?? 0} min={0} max={3} onChange={(v) => updateLocalOption('openingIterations', v)} description={t('previewModal.openingDesc') || 'Erosão seguida de dilatação para limpar ruído pequeno'} />
                            <SliderControl id="preview-closing" label={t('previewModal.closing') || 'Closing (fechar buracos)'} value={localOptions.closingIterations ?? 0} min={0} max={3} onChange={(v) => updateLocalOption('closingIterations', v)} description={t('previewModal.closingDesc') || 'Dilatação seguida de erosão para fechar buracos'} />
                          </>
                        )}
                        <SliderControl id="preview-decontamination" label={t('previewModal.colorDecontamination')} value={localOptions.colorDecontamination ?? 0} min={0} max={100} onChange={(v) => updateLocalOption('colorDecontamination', v)} icon={<DropletIcon className="w-4 h-4 mr-2" />} description={t('previewModal.colorDecontaminationDesc')} />

                        {localOptions.mode === 'grabcut' && (
                          <div className="space-y-3 pt-2">
                            <SliderControl id="grabcut-iters" label={t('previewModal.iterations') || 'Iterações'} value={localOptions.grabcut?.iterations ?? 5} min={1} max={10} onChange={(v) => updateLocalOption('grabcut', { ...((localOptions.grabcut || {}) as any), iterations: v } as any)} />
                            <SliderControl id="grabcut-lambda" label={t('previewModal.lambda') || 'Suavidade (λ)'} value={localOptions.grabcut?.lambda ?? 50} min={5} max={150} step={5} onChange={(v) => updateLocalOption('grabcut', { ...((localOptions.grabcut || {}) as any), lambda: v } as any)} description={t('previewModal.lambdaDesc') || 'Maior λ mantêm bordas mais suaves; menor, mais detalhadas.'} />
                            <div className="grid grid-cols-3 gap-2">
                              <Button variant="secondary" onClick={() => toggleTool('crop')} disabled={isLoading}>{t('previewModal.defineArea') || 'Definir área (retângulo)'}</Button>
                              <Button variant="secondary" onClick={() => setScribbleMode('fg')} disabled={isLoading}>{t('previewModal.markFG') || 'Marcar FG'}</Button>
                              <Button variant="secondary" onClick={() => setScribbleMode('bg')} disabled={isLoading}>{t('previewModal.markBG') || 'Marcar BG'}</Button>
                            </div>
                            <p className="text-xs text-text-secondary">1) Defina a área com o retângulo. 2) Marque FG/BG se necessário. 3) Clique em Refinar.</p>
                            <Button variant="primary" onClick={() => { if (isLoading) return; updateLocalOption('grabcut', { ...((localOptions.grabcut || {}) as any), useWorker: true } as any); setScribbleMode(null); setIsPicking(false); generatePreview({ ...localOptions, grabcut: { ...((localOptions.grabcut || {}) as any), useWorker: true } }, localRemovalInfo); }} disabled={isLoading}>
                              {t('previewModal.refine') || 'Refinar (GraphCut)'}
                            </Button>
                            {(localOptions.grabcut?.fgScribbles?.length || 0) + (localOptions.grabcut?.bgScribbles?.length || 0) > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs text-text-secondary">Scribbles: FG {localOptions.grabcut?.fgScribbles?.length || 0} / BG {localOptions.grabcut?.bgScribbles?.length || 0}</p>
                                <Button variant="secondary" onClick={() => updateLocalOption('grabcut', { ...(localOptions.grabcut || {}), fgScribbles: [], bgScribbles: [] } as any)}>{t('previewModal.clearScribbles') || 'Limpar scribbles'}</Button>
                              </div>
                            )}
                          </div>
                        )}
                        {localOptions.mode === 'chroma' && (
                          <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-sm font-semibold text-text-primary mb-1 block">{t('previewModal.refinement')}</label>
                                <div className="flex gap-2">
                                  <button className={`px-2 py-1 text-xs rounded border ${(localOptions as any).refinementKernel === 3 ? 'bg-accent-primary text-white border-transparent' : 'border-gray-300 text-text-secondary'}`} onClick={() => updateLocalOption('refinementKernel', 3 as any)}>{t('previewModal.refinementLight') || 'Leve (3x3)'}</button>
                                  <button className={`px-2 py-1 text-xs rounded border ${(localOptions as any).refinementKernel === 5 ? 'bg-accent-primary text-white border-transparent' : 'border-gray-300 text-text-secondary'}`} onClick={() => updateLocalOption('refinementKernel', 5 as any)}>{t('previewModal.refinementStrong') || 'Intenso (5x5)'}</button>
                                </div>
                              </div>
                              <div>
                                <SliderControl id="sampling-central" label={t('previewModal.samplingCentral') || 'Amostragem Central'} value={(localOptions as any).samplingCentralPercent ?? 20} min={10} max={50} step={1} onChange={(v) => updateLocalOption('samplingCentralPercent', v)} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 items-center">
                              <button className="px-2 py-1 text-xs rounded border border-gray-300 text-text-secondary hover:bg-gray-100" onClick={() => setIsCalibrating((prev) => !prev)}>{isCalibrating ? (t('previewModal.stopCalibration') || 'Parar calibração') : (t('previewModal.quickCalibration') || 'Calibração rápida')}</button>
                              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={showMaskPreview} onChange={(e) => setShowMaskPreview(e.target.checked)} /><span>{t('previewModal.maskPreviewToggle') || 'Mostrar máscara alpha'}</span></label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 items-start">
                              <div>
                                <h5 className="text-sm font-semibold text-text-primary mb-1">{t('previewModal.uniformity') || 'Uniformidade'}</h5>
                                <div className="text-xs text-text-secondary">{Math.round(uniformityValue * 100)}%</div>
                              </div>
                              <div>
                                <h5 className="text-sm font-semibold text-text-primary mb-1">{t('previewModal.histogramTitle') || 'Histograma HSV'}</h5>
                                <canvas ref={histCanvasRef} className="w-full h-24 bg-white border border-gray-200 rounded" />
                              </div>
                            </div>
                            {showMaskPreview && (
                              <div>
                                <h5 className="text-sm font-semibold text-text-primary mb-1">{t('previewModal.maskPreview') || 'Prévia da Máscara'}</h5>
                                <canvas ref={maskPreviewCanvasRef} className="w-full h-24 bg-white border border-gray-200 rounded" />
                              </div>
                            )}
                          </div>
                        )}

                        {localRemovalInfo && localRemovalInfo.length > 0 && (
                          <div className="space-y-2 max-h-24 overflow-y-auto pr-2 pt-2">
                            {localRemovalInfo.map((info, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white/80 rounded-md">
                                <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-md border-2 border-white shadow-sm checkerboard-bg"><div className="w-full h-full" style={{ backgroundColor: `rgba(${info.color.r}, ${info.color.g}, ${info.color.b}, 1)` }} /></div><p className="text-xs text-gray-600">{info.isAuto ? t('previewModal.autoDetected') : t('previewModal.manualSelection')}</p></div>
                                <button onClick={() => setLocalRemovalInfo(prev => prev?.filter((_, i) => i !== index))} className="text-gray-400 hover:text-red-500"><XCircleIcon className="w-5 h-5" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button onClick={() => setIsPicking(!isPicking)} className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold border rounded-lg transition-colors mt-4 ${isPicking ? 'bg-accent-primary text-white border-transparent shadow' : 'bg-transparent text-text-secondary border-gray-300 hover:bg-gray-100'}`} title={t('previewModal.pickingColorTooltip')}><EyedropperIcon className="w-5 h-5" /><span>{isPicking ? t('previewModal.donePicking') : t('previewModal.addPin')}</span></button>
                      </div>
                    </Accordion>

                    {advancedMode && (
                      <Accordion title={t('previewModal.benchmark') || 'Benchmark'}>
                        <div className="space-y-3">
                          <Button variant="secondary" onClick={handleBenchmark} disabled={isBenchmarkRunning}>{isBenchmarkRunning ? (t('previewModal.benchmarkRunning') || 'Benchmark em execução...') : (t('previewModal.runBenchmark') || 'Executar Benchmark')}</Button>
                          {benchResults.length > 0 && (
                            <div className="space-y-2">
                              {benchResults.map((r, i) => (
                                <div key={i} className="p-2 bg-white/80 rounded-md">
                                  <p className="text-sm font-semibold text-text-primary">{r.label} {r.width}×{r.height} — {Math.round(r.total)} ms</p>
                                  <p className="text-xs text-text-secondary">{['graphcut', 'graphcut_iterative', 'morph', 'bilateral', 'contour_smoothing', 'edge_blur', 'edge_refinement', 'compose'].filter(k => r.stages[k]).map(k => `${k}: ${Math.round(r.stages[k])} ms`).join(' · ')}</p>
                                </div>
                              ))}
                              <div className="pt-1">
                                <Button variant="secondary" onClick={handleCopyBenchmark}>{t('previewModal.copy') || 'Copiar resultados'}</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Accordion>
                    )}

                    <Accordion title={t('previewModal.testSuite') || 'Suite de Testes'}>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 items-center">
                          <label className="text-sm font-semibold text-text-primary">{t('previewModal.category') || 'Categoria'}</label>
                          <select value={suiteCategories[image.id] || 'solid'} onChange={(e) => setSuiteCategories(prev => ({ ...prev, [image.id]: e.target.value as any }))} className="w-full p-2 bg-white rounded-md border border-gray-300 text-sm">
                            <option value="solid">{t('previewModal.presetSolid')}</option>
                            <option value="green">{t('previewModal.presetGreen')}</option>
                            <option value="portrait">{t('previewModal.presetPortrait')}</option>
                            <option value="product">{t('previewModal.presetProduct')}</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" onClick={handleRunSuite} disabled={suiteRunning}>{suiteRunning ? (t('previewModal.suiteRunning') || 'Rodando suite...') : (t('previewModal.runSuite') || 'Executar Suite')}</Button>
                          <Button variant="secondary" onClick={async () => { try { const text = JSON.stringify(suiteResults, null, 2); await navigator.clipboard.writeText(text); toastEventManager.emit('toasts.copied', 'success'); } catch { toastEventManager.emit('toasts.copyError', 'error'); } }} disabled={suiteResults.length === 0}>{t('previewModal.copy') || 'Copiar resultados'}</Button>
                        </div>
                        {suiteResults.length > 0 && (
                          <div className="space-y-2">
                            {suiteResults.map((r, i) => (
                              <div key={i} className="p-2 bg-white/80 rounded-md flex items-center justify-between">
                                <div className="text-sm font-semibold text-text-primary">{r.name} — {r.category} — {Math.round(r.total)} ms</div>
                                <div className={`text-xs ${r.pass ? 'text-green-700' : 'text-red-700'}`}>{r.pass ? (t('previewModal.pass') || 'OK') : (t('previewModal.fail') || 'Falhou')} · edge {Math.round(r.edgeRatio * 100)}%</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Accordion>

                    <Accordion title={t('previewModal.imageAdjustments')}>
                      <div className="space-y-4">
                        <SliderControl id="brightness" label={t('previewModal.brightness')} value={localOptions.brightness ?? 100} min={0} max={200} onChange={(v) => updateLocalOption('brightness', v)} icon={<SunIcon className="w-4 h-4 mr-2" />} />
                        <SliderControl id="contrast" label={t('previewModal.contrast')} value={localOptions.contrast ?? 100} min={0} max={200} onChange={(v) => updateLocalOption('contrast', v)} icon={<ContrastIcon className="w-4 h-4 mr-2" />} />
                        <SliderControl id="saturation" label={t('previewModal.saturation')} value={localOptions.saturation ?? 100} min={0} max={200} onChange={(v) => updateLocalOption('saturation', v)} icon={<SaturationIcon className="w-4 h-4 mr-2" />} />
                      </div>
                    </Accordion>

                    {advancedMode && (
                      <Accordion title={t('previewModal.creativeEffects')}>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-100/50 rounded-lg">
                            <label htmlFor="sticker-toggle" className="flex items-center gap-3 cursor-pointer pr-4">
                              <LayersIcon className="w-5 h-5 text-accent-primary flex-shrink-0" />
                              <div><h5 className="font-semibold text-text-primary">{t('previewModal.stickerEffect')}</h5><p className="text-xs text-text-secondary">{t('previewModal.stickerEffectDesc')}</p></div>
                            </label>
                            <input type="checkbox" id="sticker-toggle" className="sr-only peer" checked={localOptions.sticker} onChange={(e) => updateLocalOption('sticker', e.target.checked)} />
                            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent-secondary peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                          </div>

                          <div className={`space-y-4 transition-opacity ${localOptions.sticker ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <div>
                              <h5 className="font-semibold text-sm text-text-primary mb-2 flex items-center"><ColorSwatchIcon className="w-4 h-4 mr-2" />{t('previewModal.outline')}</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <ColorControl id="outline-color" label={t('previewModal.color')} value={localOptions.outline?.color ?? '#ffffff'} onChange={(v) => updateNestedOption('outline', 'color', v)} />
                                <SliderControl id="outline-width" label={t('previewModal.width')} value={localOptions.outline?.width ?? 10} min={0} max={50} onChange={(v) => updateNestedOption('outline', 'width', v)} />
                              </div>
                            </div>
                            <div>
                              <h5 className="font-semibold text-sm text-text-primary mb-2 flex items-center"><ShadowIcon className="w-4 h-4 mr-2" />{t('previewModal.dropShadow')}</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <ColorControl id="shadow-color" label={t('previewModal.color')} value={localOptions.dropShadow?.color ?? '#000000'} onChange={(v) => updateNestedOption('dropShadow', 'color', v)} />
                                <SliderControl id="shadow-blur" label={t('previewModal.blur')} value={localOptions.dropShadow?.blur ?? 10} min={0} max={50} onChange={(v) => updateNestedOption('dropShadow', 'blur', v)} />
                                <SliderControl id="shadow-offset-x" label={t('previewModal.offsetX')} value={localOptions.dropShadow?.offsetX ?? 5} min={-50} max={50} onChange={(v) => updateNestedOption('dropShadow', 'offsetX', v)} />
                                <SliderControl id="shadow-offset-y" label={t('previewModal.offsetY')} value={localOptions.dropShadow?.offsetY ?? 5} min={-50} max={50} onChange={(v) => updateNestedOption('dropShadow', 'offsetY', v)} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Accordion>
                    )}
                  </div>
                </div>
              )}
              <div className="pt-2">
                <Button variant="secondary" onClick={() => setModeLocal('simple')}>Voltar ao Simples</Button>
              </div>
            </div>
          </aside>
        </div>

        <footer className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 rounded-md bg-gray-100 p-1 border border-gray-200">
            <button onClick={() => setPreviewBg('dark')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${previewBg === 'dark' ? 'bg-accent-primary text-white shadow' : 'text-text-secondary hover:bg-white'}`}>{t('previewModal.bgDark')}</button>
            <button onClick={() => setPreviewBg('light')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${previewBg === 'light' ? 'bg-accent-primary text-white shadow' : 'text-text-secondary hover:bg-white'}`}>{t('previewModal.bgLight')}</button>
            <button onClick={() => setPreviewBg('checkerboard')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${previewBg === 'checkerboard' ? 'bg-accent-primary text-white shadow' : 'text-text-secondary hover:bg-white'}`}>{t('previewModal.bgGrid')}</button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleZoomOut} disabled={zoom <= 1} className="p-1 disabled:opacity-50"><MagnifyingGlassMinusIcon className="w-5 h-5 text-text-secondary" /></button>
            <input type="range" min="1" max="8" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-24 accent-accent-primary" />
            <button onClick={handleZoomIn} disabled={zoom >= 8} className="p-1 disabled:opacity-50"><MagnifyingGlassPlusIcon className="w-5 h-5 text-text-secondary" /></button>
            <Button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} variant="secondary" className="px-2 py-1 text-xs">{t('previewModal.zoomReset')}</Button>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-text-secondary">{t('previewModal.beforeAfter') || 'Antes/Depois'}</label>
              <input type="checkbox" checked={showCompare} onChange={(e) => setShowCompare(e.target.checked)} />
              {showCompare && (
                <input type="range" min="0" max="100" step="1" value={comparePos} onChange={(e) => setComparePos(parseInt(e.target.value, 10))} className="w-24 accent-accent-primary" />
              )}
            </div>
            <Button onClick={handleRevertToOriginal} variant="secondary" title={t('previewModal.revert')} disabled={isApplying}><ArrowPathIcon className="w-5 h-5" /></Button>
            <Button onClick={handleUndo} variant="secondary" title={t('previewModal.undo')} disabled={historyIndex <= 0 || isApplying}><ArrowUturnLeftIcon className="w-5 h-5" /></Button>
            <Button onClick={handleRedo} variant="secondary" title={t('previewModal.redo')} disabled={historyIndex >= history.length - 1 || isApplying}><RedoIcon className="w-5 h-5" /></Button>
            <Button onClick={handleCopy} variant="secondary" disabled={isLoading || !!error || isCopied || isApplying} title={t('previewModal.copy')}>
              <ClipboardIcon className="w-5 h-5 mr-2" />
              <span>{isCopied ? t('previewModal.copied') : t('previewModal.copy')}</span>
            </Button>
            <Button onClick={handleDownload} variant="secondary" disabled={isLoading || !!error || isApplying} title={t('galleryModal.download')}>
              <DownloadIcon className="w-5 h-5 mr-2" />
              <span>{t('galleryModal.download')}</span>
            </Button>
            <Button onClick={onClose} variant="secondary" disabled={isApplying}>{t('previewModal.cancel')}</Button>
            <Button onClick={handleApply} disabled={isLoading || !!error || isApplying || !hasChanged}>
              {isApplying ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  {t('previewModal.applied')}
                </>
              ) : (
                t('previewModal.apply')
              )}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};


interface CropToolProps {
  imageRenderInfo: { x: number, y: number, width: number, height: number, scale: number };
  crop: { x: number; y: number; width: number; height: number };
  setCrop: React.Dispatch<React.SetStateAction<{ x: number; y: number; width: number; height: number }>>;
}

const CropTool: React.FC<CropToolProps> = ({ crop, setCrop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isResizing: false,
    isDragging: false,
    handle: '',
    startX: 0,
    startY: 0,
    startCrop: { ...crop },
  }).current;

  const getHandlePositions = (handle: string) => {
    let left: string | number = 'auto'; let top: string | number = 'auto'; let right: string | number = 'auto'; let bottom: string | number = 'auto';
    if (handle.includes('n')) top = -6; if (handle.includes('s')) bottom = -6; if (handle.includes('w')) left = -6; if (handle.includes('e')) right = -6;
    if (handle.length === 1 && (handle === 'n' || handle === 's')) left = '50%';
    if (handle.length === 1 && (handle === 'w' || handle === 'e')) top = '50%';
    let transform = 'none';
    if (left === '50%' && top !== '50%') transform = 'translateX(-50%)';
    if (top === '50%' && left !== '50%') transform = 'translateY(-50%)';
    if (left === '50%' && top === '50%') transform = 'translate(-50%, -50%)';
    return { left, top, right, bottom, transform };
  };
  const handleMouseDown = (e: React.MouseEvent, handle = 'move') => {
    e.preventDefault(); e.stopPropagation();
    dragState.isResizing = handle !== 'move'; dragState.isDragging = handle === 'move';
    dragState.handle = handle; dragState.startX = e.clientX; dragState.startY = e.clientY; dragState.startCrop = { ...crop };
    window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    const dxPercent = (e.clientX - dragState.startX) / container.clientWidth * 100;
    const dyPercent = (e.clientY - dragState.startY) / container.clientHeight * 100;
    let newCrop = { ...dragState.startCrop };
    if (dragState.isDragging) {
      newCrop.x = Math.max(0, Math.min(100 - newCrop.width, dragState.startCrop.x + dxPercent));
      newCrop.y = Math.max(0, Math.min(100 - newCrop.height, dragState.startCrop.y + dyPercent));
    } else if (dragState.isResizing) {
      const minSize = 5;
      if (dragState.handle.includes('n')) {
        const newY = Math.max(0, dragState.startCrop.y + dyPercent);
        const newHeight = Math.max(minSize, dragState.startCrop.height - (newY - dragState.startCrop.y));
        if (newY + newHeight <= 100) { newCrop.y = newY; newCrop.height = newHeight; }
      }
      if (dragState.handle.includes('s')) { newCrop.height = Math.max(minSize, Math.min(100 - newCrop.y, dragState.startCrop.height + dyPercent)); }
      if (dragState.handle.includes('w')) {
        const newX = Math.max(0, dragState.startCrop.x + dxPercent);
        const newWidth = Math.max(minSize, dragState.startCrop.width - (newX - dragState.startCrop.x));
        if (newX + newWidth <= 100) { newCrop.x = newX; newCrop.width = newWidth; }
      }
      if (dragState.handle.includes('e')) { newCrop.width = Math.max(minSize, Math.min(100 - newCrop.x, dragState.startCrop.width + dxPercent)); }
    }
    setCrop(newCrop);
  }, [dragState, setCrop]);

  const handleMouseUp = useCallback(() => {
    dragState.isDragging = false; dragState.isResizing = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, dragState]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" style={{
        clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${crop.y}%, ${crop.x}% ${crop.y}%, ${crop.x}% ${crop.y + crop.height}%, ${crop.x + crop.width}% ${crop.y + crop.height}%, ${crop.x + crop.width}% ${crop.y}%, 0% ${crop.y}%)`,
      }} />
      <div className="absolute border-2 border-white/80 pointer-events-auto" style={{ left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.width}%`, height: `${crop.height}%`, cursor: 'move', }} onMouseDown={(e) => handleMouseDown(e)}>
        {['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].map(handle => (
          <div key={handle} className={`absolute w-3 h-3 bg-white rounded-full cursor-${handle}-resize`} style={getHandlePositions(handle)} onMouseDown={(e) => handleMouseDown(e, handle)} />
        ))}
      </div>
    </div>
  );
};


export default PreviewModal;
