import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ImageFile, ConfiguracaoExportacao } from '../types';
import Button from './Button';
import { XCircleIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, ColorSwatchIcon } from './Icons';
import { useTranslation } from '../utils/localization';

type FitMode = 'contain' | 'cover' | 'fill';


interface ExportModalProps {
  images: ImageFile[];
  onClose: () => void;
  onExport: (config: ConfiguracaoExportacao, onProgress?: (current: number, total: number) => void) => Promise<void> | void;
  onExportOne?: (imageId: string, config: ConfiguracaoExportacao) => Promise<void> | void;
}

const paletaNeutros = ['#F5F5F0','#E8DCC4','#C9B8A0','#A69885','#8B8378','#5C5751','#3D3935','#FFFFFF'];
const paletaSuaves = ['#F7E7DC','#E8D5C4','#D4C5B9','#C5B8AA','#B8A99A','#E0D5C7','#D9C6B0','#F2EAE1'];

const presets: Record<string, { w: number; h: number }> = {
  '1:1': { w: 1080, h: 1080 },
  '4:5': { w: 1080, h: 1350 },
  '16:9': { w: 1920, h: 1080 },
  '9:16': { w: 1080, h: 1920 },
  '3:4': { w: 1080, h: 1440 },
  '4:3': { w: 1440, h: 1080 },
  '2:3': { w: 1000, h: 1500 },
  '21:9': { w: 2560, h: 1080 },
  '1.91:1': { w: 1200, h: 628 },
};

const ExportModal: React.FC<ExportModalProps> = ({ images, onClose, onExport, onExportOne }) => {
  const { t } = useTranslation();
  const doneImages = images.filter(i => i.status === 'done' && i.processedURL);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [config, setConfig] = useState<ConfiguracaoExportacao>({
    fundos: { tipo: 'quadriculado', paletaSelecionada: null },
    dimensoes: { modo: 'preset', preset: '4:5' },
    ajustes: { padding: 10, fitMode: 'contain', centralizar: true, manterProporcao: true },
    formato: { tipo: 'png' },
    circle: { enabled: false, borderColor: '#ffffff', borderWidth: 0 },
  });

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const coresSelecionadas = useMemo(() => {
    if (config.fundos.tipo === 'cor-solida' && config.fundos.corSolida) return [config.fundos.corSolida];
    if (config.fundos.tipo === 'cores-personalizadas') {
      if (config.fundos.paletaSelecionada === 'neutros') return paletaNeutros;
      if (config.fundos.paletaSelecionada === 'suaves') return paletaSuaves;
      return config.fundos.coresPersonalizadas && config.fundos.coresPersonalizadas.length > 0 ? config.fundos.coresPersonalizadas : paletaSuaves;
    }
    return [];
  }, [config]);

  const getFundoPorIndice = (index: number) => {
    if (config.fundos.tipo === 'quadriculado' || config.fundos.tipo === 'branco' || config.fundos.tipo === 'preto') return null;
    if (config.fundos.tipo === 'cor-solida') return config.fundos.corSolida || '#FFFFFF';
    const arr = coresSelecionadas;
    if (!arr.length) return '#FFFFFF';
    if (config.fundos.modoAplicacao === 'aleatorio') {
      const r = Math.floor(Math.random() * arr.length);
      return arr[r];
    }
    return arr[index % arr.length];
  };

  const getTargetSize = (img: HTMLImageElement): { width: number; height: number } => {
    if (config.dimensoes.modo === 'original') return { width: img.naturalWidth, height: img.naturalHeight };
    if (config.dimensoes.modo === 'preset' && config.dimensoes.preset) {
      const p = presets[config.dimensoes.preset];
      return { width: p.w, height: p.h };
    }
    const w = Math.max(100, Math.min(10000, config.dimensoes.custom?.width || 1080));
    const h = Math.max(100, Math.min(10000, config.dimensoes.custom?.height || 1350));
    return { width: w, height: h };
  };

  const calcularEncaixe = (imgW: number, imgH: number, canvasW: number, canvasH: number, padding: number, mode: FitMode) => {
    const areaW = Math.max(0, canvasW - padding * 2);
    const areaH = Math.max(0, canvasH - padding * 2);
    let width = canvasW, height = canvasH;
    if (mode === 'contain') {
      const scale = Math.min(areaW / imgW, areaH / imgH);
      width = imgW * scale;
      height = imgH * scale;
    } else if (mode === 'cover') {
      const scale = Math.max(canvasW / imgW, canvasH / imgH);
      width = imgW * scale;
      height = imgH * scale;
    }
    const x = Math.floor((canvasW - width) / 2);
    const y = Math.floor((canvasH - height) / 2);
    return { x, y, width, height };
  };

  const renderPreview = async () => {
    const canvas = previewCanvasRef.current;
    const image = doneImages[currentIndex];
    if (!canvas || !image?.processedURL) return;
    const imgEl = new Image();
    imgEl.src = image.processedURL;
    await new Promise<void>((resolve) => { imgEl.onload = () => resolve(); });
    const { width, height } = getTargetSize(imgEl);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const bg = getFundoPorIndice(currentIndex);
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
    }
    const bounds = calcularEncaixe(imgEl.naturalWidth, imgEl.naturalHeight, width, height, Math.max(0, Math.min(50, config.ajustes.padding)), config.ajustes.fitMode);
    ctx.drawImage(imgEl, bounds.x, bounds.y, bounds.width, bounds.height);
  };

  useEffect(() => { renderPreview(); }, [currentIndex, config, doneImages.length]);

  const isColorsValid = (() => {
    if (config.fundos.tipo === 'cores-personalizadas') {
      const count = (config.fundos.coresPersonalizadas || []).length;
      const hasPalette = !!config.fundos.paletaSelecionada;
      return count > 0 || hasPalette;
    }
    return true;
  })();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">{t('exportModal.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">{t('exportModal.visualize')}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, tipo: 'quadriculado' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.fundos.tipo==='quadriculado'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.optionCheckerboard')}</button>
                <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, tipo: 'branco' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.fundos.tipo==='branco'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.optionWhite')}</button>
                <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, tipo: 'preto' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.fundos.tipo==='preto'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.optionBlack')}</button>
                <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, tipo: 'cor-solida' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.fundos.tipo==='cor-solida'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.optionSolidColor')}</button>
                <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, tipo: 'cores-personalizadas', modoAplicacao: prev.fundos.modoAplicacao || 'sequencial' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.fundos.tipo==='cores-personalizadas'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.optionCustomColors')}</button>
              </div>
              <p className="text-xs text-gray-600 mt-2">{t('exportModal.infoTransparency')}</p>
            </div>

            {config.fundos.tipo === 'cor-solida' && (
              <div className="flex items-center gap-3">
                <ColorSwatchIcon className="w-5 h-5" />
                <input type="color" value={config.fundos.corSolida || '#FFFFFF'} onChange={(e) => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, corSolida: e.target.value } }))} />
              </div>
            )}

            {config.fundos.tipo === 'cores-personalizadas' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, modoAplicacao: 'sequencial' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.fundos.modoAplicacao==='sequencial'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.modeSequential')}</button>
                  <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, modoAplicacao: 'aleatorio' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.fundos.modoAplicacao==='aleatorio'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.modeRandom')}</button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, paletaSelecionada: 'neutros' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.fundos.paletaSelecionada==='neutros'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.paletteNeutrals')}</button>
                  <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, paletaSelecionada: 'suaves' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.fundos.paletaSelecionada==='suaves'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.paletteSofts')}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(config.fundos.coresPersonalizadas || []).map((c, idx) => (
                    <button key={idx} onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, coresPersonalizadas: (prev.fundos.coresPersonalizadas || []).filter((_, i) => i !== idx) } }))} className="w-8 h-8 rounded-md border" style={{ background: c }} />
                  ))}
                  <label className="w-8 h-8 rounded-md border flex items-center justify-center cursor-pointer">
                    <input type="color" className="opacity-0 absolute" onChange={(e) => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, coresPersonalizadas: [ ...(prev.fundos.coresPersonalizadas || []), e.target.value ] } }))} />
                    <span className="text-xs">+</span>
                  </label>
                  <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, coresPersonalizadas: [] } }))} className="px-3 py-1 text-xs rounded-md border">{t('exportModal.clearAll')}</button>
                </div>
                <p className="text-xs text-gray-600">{t('exportModal.selectedColorsCount', { count: (config.fundos.coresPersonalizadas || []).length })}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-semibold">{t('exportModal.dimensions')}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setConfig(prev => ({ ...prev, dimensoes: { modo: 'original' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.dimensoes.modo==='original'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.original')}</button>
                <button onClick={() => setConfig(prev => ({ ...prev, dimensoes: { modo: 'preset', preset: prev.dimensoes.preset || '4:5' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.dimensoes.modo==='preset'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.preset')}</button>
                <button onClick={() => setConfig(prev => ({ ...prev, dimensoes: { modo: 'personalizado', custom: prev.dimensoes.custom || { width: 1200, height: 1600 } } }))} className={`px-3 py-1 text-xs rounded-md border ${config.dimensoes.modo==='personalizado'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.custom')}</button>
              </div>
              {config.dimensoes.modo === 'preset' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {Object.keys(presets).map((key) => (
                    <button key={key} onClick={() => setConfig(prev => ({ ...prev, dimensoes: { modo: 'preset', preset: key as any } }))} className={`px-2 py-2 text-xs rounded-md border ${config.dimensoes.preset===key?'bg-accent-primary text-white':'bg-white'}`}>{key} {presets[key].w}×{presets[key].h}px</button>
                  ))}
                  <button onClick={() => setConfig(prev => ({ ...prev, circle: { enabled: true, borderColor: prev.circle?.borderColor ?? '#ffffff', borderWidth: prev.circle?.borderWidth ?? 0 } }))} className={`px-2 py-2 text-xs rounded-md border ${config.circle?.enabled ? 'bg-accent-primary text-white' : 'bg-white'}`}>{t('exportModal.circlePreset')}</button>
                </div>
              )}
              {config.dimensoes.modo === 'personalizado' && (
                <div className="flex items-center gap-3 mt-2">
                  <div>
                    <label className="text-xs">{t('exportModal.width')}</label>
                    <input type="number" min={100} max={10000} value={config.dimensoes.custom?.width || 1200} onChange={(e) => setConfig(prev => ({ ...prev, dimensoes: { modo: 'personalizado', custom: { width: Number(e.target.value), height: prev.dimensoes.custom?.height || 1600 } } }))} className="border rounded px-2 py-1 w-24" />
                  </div>
                  <div>
                    <label className="text-xs">{t('exportModal.height')}</label>
                    <input type="number" min={100} max={10000} value={config.dimensoes.custom?.height || 1600} onChange={(e) => setConfig(prev => ({ ...prev, dimensoes: { modo: 'personalizado', custom: { width: prev.dimensoes.custom?.width || 1200, height: Number(e.target.value) } } }))} className="border rounded px-2 py-1 w-24" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 mt-3">
                <button onClick={() => setConfig(prev => ({ ...prev, ajustes: { ...prev.ajustes, fitMode: 'contain' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.ajustes.fitMode==='contain'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.fitAdjust')}</button>
                <button onClick={() => setConfig(prev => ({ ...prev, ajustes: { ...prev.ajustes, fitMode: 'cover' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.ajustes.fitMode==='cover'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.fitCover')}</button>
                <button onClick={() => setConfig(prev => ({ ...prev, ajustes: { ...prev.ajustes, fitMode: 'fill' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.ajustes.fitMode==='fill'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.fitFill')}</button>
              </div>
              <div className="mt-2">
                <label className="text-xs">{t('exportModal.padding')}: {config.ajustes.padding}px</label>
                <input type="range" min={0} max={50} value={config.ajustes.padding} onChange={(e) => setConfig(prev => ({ ...prev, ajustes: { ...prev.ajustes, padding: Number(e.target.value) } }))} className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={config.ajustes.manterProporcao} onChange={(e) => setConfig(prev => ({ ...prev, ajustes: { ...prev.ajustes, manterProporcao: e.target.checked } }))} /><span>{t('exportModal.maintainProportion')}</span></label>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={config.ajustes.centralizar} onChange={(e) => setConfig(prev => ({ ...prev, ajustes: { ...prev.ajustes, centralizar: e.target.checked } }))} /><span>{t('exportModal.center')}</span></label>
              </div>

              {config.circle?.enabled && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{t('exportModal.borderColor')}</span>
                    <input type="color" value={config.circle?.borderColor || '#ffffff'} onChange={(e) => setConfig(prev => ({ ...prev, circle: { enabled: prev.circle?.enabled ?? true, borderColor: e.target.value, borderWidth: prev.circle?.borderWidth ?? 0 } }))} />
                  </div>
                  <div>
                    <label className="text-xs">{t('exportModal.borderWidth')}: {config.circle?.borderWidth || 0}px</label>
                    <input type="range" min={0} max={50} value={config.circle?.borderWidth || 0} onChange={(e) => setConfig(prev => ({ ...prev, circle: { enabled: prev.circle?.enabled ?? true, borderColor: prev.circle?.borderColor ?? '#ffffff', borderWidth: Number(e.target.value) } }))} className="w-full" />
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded p-2">
              <p className="text-sm font-semibold mb-2">{t('exportModal.preview', { current: currentIndex+1, total: doneImages.length })}</p>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setCurrentIndex(i => Math.max(0, i-1))} className="px-2 py-1 text-xs rounded-md border" title={t('exportModal.previous')}><ChevronLeftIcon className="w-4 h-4" /></button>
                <button onClick={() => setCurrentIndex(i => Math.min(doneImages.length-1, i+1))} className="px-2 py-1 text-xs rounded-md border" title={t('exportModal.next')}><ChevronRightIcon className="w-4 h-4" /></button>
              </div>
              <canvas ref={previewCanvasRef} className="w-full max-h-[360px] border rounded" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded p-2">
              <p className="text-sm font-semibold mb-2">{t('exportModal.appliedColors')}</p>
              <div className="space-y-1 max-h-64 overflow-auto">
                {doneImages.map((img, idx) => {
                  const c = getFundoPorIndice(idx);
                  return (
                    <div key={img.id} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-sm border" style={{ background: c || 'transparent' }} />
                      <span className="text-xs">{img.file.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, modoAplicacao: 'aleatorio' } }))} className="px-3 py-1 text-xs rounded-md border">{t('exportModal.randomize')}</button>
                <button onClick={() => setConfig(prev => ({ ...prev, fundos: { ...prev.fundos, modoAplicacao: 'sequencial' } }))} className="px-3 py-1 text-xs rounded-md border">{t('exportModal.modeSequential')}</button>
              </div>
            </div>

            <div className="border rounded p-2">
              <p className="text-sm font-semibold mb-2">{t('exportModal.format')}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setConfig(prev => ({ ...prev, formato: { ...prev.formato, tipo: 'png' } }))} className={`px-3 py-1 text-xs rounded-md border ${config.formato.tipo==='png'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.png')}</button>
                <button onClick={() => setConfig(prev => ({ ...prev, formato: { ...prev.formato, tipo: 'jpg', qualidade: prev.formato.qualidade || 90 } }))} className={`px-3 py-1 text-xs rounded-md border ${config.formato.tipo==='jpg'?'bg-accent-primary text-white':'bg-white'}`}>{t('exportModal.jpg')}</button>
              </div>
              {config.formato.tipo === 'jpg' && (
                <div className="mt-2">
                  <label className="text-xs">{t('exportModal.quality')}: {config.formato.qualidade || 90}%</label>
                  <input type="range" min={50} max={100} value={config.formato.qualidade || 90} onChange={(e) => setConfig(prev => ({ ...prev, formato: { ...prev.formato, qualidade: Number(e.target.value) } }))} className="w-full" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              {isExporting && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-accent-primary h-2.5 rounded-full" style={{ width: `${progress.total ? Math.round((progress.current / progress.total) * 100) : 0}%` }}></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={async () => { setIsExporting(true); setProgress({ current: 0, total: doneImages.length }); await onExport(config, (cur, tot) => setProgress({ current: cur, total: tot })); setIsExporting(false); }} variant="primary" className="w-full" disabled={!doneImages.length || !isColorsValid}><DownloadIcon className="w-5 h-5 mr-2" /><span>{t('exportModal.exportAll')}</span></Button>
                <Button onClick={async () => { if (!doneImages[currentIndex]) return; await onExportOne?.(doneImages[currentIndex].id, config); }} variant="secondary" className="w-full" disabled={!doneImages.length || !isColorsValid}><DownloadIcon className="w-5 h-5 mr-2" /><span>{t('exportModal.exportCurrent')}</span></Button>
              </div>
            </div>
            {!isColorsValid && <p className="text-xs text-red-600 mt-1">{t('exportModal.errorNoColors')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;