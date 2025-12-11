'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ImageGrid from './components/ImageGrid';
import { useImageProcessor } from './hooks/useImageProcessor';
import { TrashIcon, DownloadIcon, ShieldCheckIcon, SparklesIcon, UploadIcon, ArrowPathIcon } from './components/Icons';
import { RemovalOptions } from './utils/imageProcessor';
const PreviewModal = React.lazy(() => import('./components/PreviewModal'));
const GalleryModal = React.lazy(() => import('./components/GalleryModal'));
const ExportModal = React.lazy(() => import('./components/ExportModal'));
import { useUsage } from '@/lib/hooks/useUsage';
import { useRouter } from 'next/navigation';
import { ImageFile, ImageStatus } from './types';
import Button from './components/Button';
import { toastEventManager } from './utils/fileUtils';
import ImageUploader from './components/ImageUploader';
import { Toast, ToastContainer } from './components/Toast';
import { useTranslation } from './utils/localization';
import Spinner from './components/Spinner';
import ErrorBoundary from './components/ErrorBoundary';
import { FreeLimitModal } from '@/components/ui/FreeLimitModal';
import { PanelLeft, PanelRight, ChevronDown, ChevronRight, Settings2, Image as ImageIcon, Layers, Sliders } from 'lucide-react';

// --- Estrutura de Opções de Processamento ---
interface ProcessingOptions extends RemovalOptions {
  tolerance: number;
  edgeSoftness: number;
  edgeRefinement: number;
  contourSmoothing: number;
  colorDecontamination: number;
  sticker: boolean;
  outline: { color: string; width: number; };
  dropShadow: { color: string; blur: number; offsetX: number; offsetY: number; };
  brightness: number;
  contrast: number;
  saturation: number;
  mode: 'floodfill' | 'silhouette' | 'chroma' | 'grabcut';
  bilateralIntensity?: number;
  bilateralSigmaSpace?: number;
  bilateralSigmaColor?: number;
  bilateralEdgesOnly?: boolean;
}

const SETTINGS_STORAGE_KEY = 'ips_removal_settings';
type PreviewBg = 'dark' | 'light' | 'checkerboard';
const PREVIEW_BG_STORAGE_key = 'ips_preview_bg';

// Carrega as opções iniciais (padrões). A leitura do localStorage acontece no useEffect.
const getInitialOptions = (): ProcessingOptions => {
  return {
    tolerance: 30,
    edgeSoftness: 0,
    edgeRefinement: -1,
    contourSmoothing: 0,
    colorDecontamination: 50,
    sticker: false,
    outline: { color: '#ffffff', width: 10 },
    dropShadow: { color: 'rgba(0,0,0,0.4)', blur: 10, offsetX: 5, offsetY: 5 },
    brightness: 100,
    contrast: 100,
    saturation: 100,
    background: {
      output: 'transparent',
      color: '#ffffff',
    },
    mode: 'floodfill',
    bilateralIntensity: 0,
    bilateralSigmaSpace: 3,
    bilateralSigmaColor: 25,
    bilateralEdgesOnly: true,
  };
};

const getInitialPreviewBg = (): PreviewBg => 'dark';

// --- Componente de Toggle Switch ---
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent-secondary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
    </label>
  );
};

// --- Componente Principal da Aplicação ---
export default function RemovedorFundoTool() {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((key: string, type: 'success' | 'error' | 'info', params?: Record<string, any>) => {
    const id = Date.now();
    const message = t(key, params);
    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);
  }, [t]);

  useEffect(() => {
    const unsubscribe = toastEventManager.subscribe(addToast);
    return unsubscribe;
  }, [addToast]);

  const { incrementUsage } = useUsage('removedor-fundo', 5);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const router = useRouter();

  const {
    images,
    isProcessing,
    isDBLoading,
    pendingImages,
    addImages,
    processPendingImages,
    processImageById,
    exportarLote,
    exportarImagem,
    downloadAllAsZip,
    clearAll,
    downloadImage,
    revertImage,
    revertAll,
    updateImage,
  } = useImageProcessor();

  const [options, setOptions] = useState<ProcessingOptions>(getInitialOptions);
  const [isSilhouetteMode, setIsSilhouetteMode] = useState(options.mode === 'silhouette');
  const [globalPreviewBg, setGlobalPreviewBg] = useState<PreviewBg>(getInitialPreviewBg());
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Layout State
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // Carrega as configurações do localStorage após a montagem do componente
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setOptions(prev => ({
          ...prev,
          ...parsed,
          outline: { ...prev.outline, ...(parsed.outline || {}) },
          dropShadow: { ...prev.dropShadow, ...(parsed.dropShadow || {}) },
          background: { ...prev.background, ...(parsed.background || {}) },
        }));
      }

      const savedBg = localStorage.getItem(PREVIEW_BG_STORAGE_key);
      if (savedBg === 'dark' || savedBg === 'light' || savedBg === 'checkerboard') {
        setGlobalPreviewBg(savedBg as PreviewBg);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);

  // Salva a preferência de fundo de pré-visualização no localStorage sempre que ela muda.
  useEffect(() => {
    try {
      localStorage.setItem(PREVIEW_BG_STORAGE_key, globalPreviewBg);
    } catch (error) {
      console.error("Failed to save preview background setting to localStorage", error);
    }
  }, [globalPreviewBg]);

  // Mantém o estado do toggle sincronizado com as opções.
  useEffect(() => {
    setIsSilhouetteMode(options.mode === 'silhouette');
  }, [options.mode]);

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const newFile = new File([file], `pasted-${Date.now()}.${file.type.split('/')[1]}`, { type: file.type });
          files.push(newFile);
        }
      }
    }

    if (files.length > 0) {
      toastEventManager.emit('toasts.pasted', 'info', { count: files.length });
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      addImages(dataTransfer.files);
    }
  }, [addImages]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const hasDoneImages = useMemo(() => images.some(img => img.status === 'done'), [images]);
  const canClear = images.length > 0 && !isProcessing;
  const hasPendingImages = pendingImages.length > 0;
  const canRevertAll = useMemo(() => images.some(img => img.status === ImageStatus.Done || img.status === ImageStatus.Error), [images]);
  const doneImages = useMemo(() => images.filter(img => img.status === ImageStatus.Done), [images]);

  const handleOpenGallery = (imageId: string) => {
    const index = doneImages.findIndex(img => img.id === imageId);
    if (index > -1) setGalleryIndex(index);
  };

  const handleOpenPreview = (imageId: string) => {
    const index = images.findIndex(img => img.id === imageId);
    if (index > -1) setPreviewIndex(index);
  };

  const handleApplyPreviewChanges = (imageId: string, newOptions: RemovalOptions, processedUrl: string, removalInfo: ImageFile['removalInfo'], newFile?: File) => {
    const fullNewOptions: ProcessingOptions = { ...options, ...newOptions };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(fullNewOptions));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
    setOptions(fullNewOptions);
    const updates: Partial<ImageFile> = { processedURL: processedUrl, status: ImageStatus.Done, removalInfo };
    if (newFile) updates.file = newFile;
    updateImage(imageId, updates);
  };

  const handleRevertInModal = useCallback(() => {
    if (previewIndex !== null) {
      const imageId = images[previewIndex].id;
      revertImage(imageId);
      setPreviewIndex(null);
    }
  }, [previewIndex, images, revertImage]);

  const progressStats = useMemo(() => {
    if (images.length === 0) return { processedCount: 0, totalCount: 0, percentage: 0 };
    const processedCount = images.filter(img => img.status === ImageStatus.Done || img.status === ImageStatus.Error).length;
    const percentage = images.length > 0 ? (processedCount / images.length) * 100 : 0;
    return { processedCount, totalCount: images.length, percentage };
  }, [images]);

  const handleModeChange = (isSilhouette: boolean) => {
    const floodfillDefaults = { tolerance: 30, edgeSoftness: 0 };
    setOptions(prev => ({
      ...prev,
      mode: isSilhouette ? 'silhouette' : 'floodfill',
      tolerance: isSilhouette ? 25 : floodfillDefaults.tolerance,
      edgeSoftness: isSilhouette ? 5 : floodfillDefaults.edgeSoftness,
    }));
  };

  const processImages = () => {
    processPendingImages(options);
  };

  const isE2E = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('e2e');
  useEffect(() => {
    if (isE2E) {
      try { clearAll(); } catch { }
    }
  }, [isE2E]);

  const handleLimitedDownloadAll = async () => {
    try {
      await incrementUsage();
      downloadAllAsZip();
    } catch (error: any) {
      if (error.message === 'LIMIT_REACHED') {
        setShowLimitModal(true);
      } else {
        console.error(error);
        toastEventManager.emit('toasts.error', 'system.error' as any);
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 overflow-hidden font-sans">
        {(isDBLoading && !isE2E) && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50 backdrop-blur-sm">
            <Spinner className="w-10 h-10 text-ui-primary" />
          </div>
        )}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        {/* Top Bar for Mobile / Collapsed Actions */}
        <div className="bg-white border-b border-gray-200 p-2 flex items-center justify-between shrink-0 h-14 z-20">
             <div className="flex items-center gap-2">
                 <button onClick={() => setLeftOpen(!leftOpen)} className={`p-2 rounded-md hover:bg-gray-100 ${leftOpen ? 'bg-gray-100 text-ui-primary' : 'text-gray-500'}`}>
                    <PanelLeft className="w-5 h-5" />
                 </button>
                 <span className="font-heading font-semibold text-gray-800 hidden sm:block">Removedor de Fundo</span>
             </div>
             <div className="flex items-center gap-2">
                 <button onClick={() => setRightOpen(!rightOpen)} className={`p-2 rounded-md hover:bg-gray-100 ${rightOpen ? 'bg-gray-100 text-ui-primary' : 'text-gray-500'}`}>
                    <PanelRight className="w-5 h-5" />
                 </button>
             </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
             {/* LEFT SIDEBAR: Uploads & List */}
             <aside className={`${leftOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full opacity-0'} transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col absolute lg:relative h-full z-10 shrink-0 shadow-xl lg:shadow-none`}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-sm text-gray-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Suas Imagens
                    </h3>
                    <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{images.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <ImageUploader onFilesAdded={addImages} isProcessing={isProcessing} compact />
                    
                    {images.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-sm">Nenhuma imagem adicionada.</p>
                        </div>
                    )}

                    {/* Pending Actions */}
                    {hasPendingImages && (
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-blue-700">{pendingImages.length} pendentes</span>
                                {isProcessing && <Spinner className="w-3 h-3 text-blue-600" />}
                            </div>
                           <Button
                              onClick={processImages}
                              disabled={!hasPendingImages || isProcessing}
                              isLoading={isProcessing && hasPendingImages}
                              size="small"
                              className="w-full text-sm"
                            >
                              {isProcessing ? t('controlPanel.processing') : 'Processar Pendentes'}
                            </Button>
                        </div>
                    )}
                    
                     {/* Global Actions */}
                     <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={() => setShowExportModal(true)}
                            disabled={!hasDoneImages || isProcessing}
                            variant="secondary"
                            className="w-full text-xs"
                        >
                            <SparklesIcon className="w-4 h-4 mr-1" />
                            Exportar
                        </Button>
                        <Button onClick={clearAll} disabled={!canClear} variant="secondary" className="w-full text-xs text-red-600 hover:bg-red-50 hover:border-red-200">
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Limpar
                        </Button>
                     </div>
                </div>
             </aside>

             {/* MAIN CONTENT: Canvas/Grid */}
             <main className="flex-1 overflow-hidden relative bg-gray-100/50 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                     {images.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 border-2 border-dashed border-gray-200 rounded-3xl m-4 bg-white/50">
                             <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                 <UploadIcon className="w-8 h-8 opacity-50" />
                             </div>
                             <div className="text-center">
                                 <h3 className="text-lg font-medium text-gray-700">Comece por aqui</h3>
                                 <p className="text-sm">Adicione imagens na barra lateral para começar.</p>
                             </div>
                         </div>
                     ) : (
                        <div className="pb-20">
                             <ImageGrid
                                images={images}
                                onDownload={downloadImage}
                                onUpdateImage={updateImage}
                                onPreview={handleOpenPreview}
                                onRevert={revertImage}
                                onOpenGallery={handleOpenGallery}
                                globalPreviewBg={globalPreviewBg}
                                onProcessImage={(id: string) => processImageById(id, options)}
                              />
                        </div>
                     )}
                </div>
             </main>

             {/* RIGHT SIDEBAR: Settings */}
             <aside className={`${rightOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full opacity-0'} transition-all duration-300 ease-in-out bg-white border-l border-gray-200 flex flex-col absolute lg:relative h-full z-10 shrink-0 right-0 shadow-xl lg:shadow-none`}>
                 <div className="p-4 border-b border-gray-100">
                    <h3 className="font-heading font-semibold text-sm text-gray-700 flex items-center gap-2">
                        <Settings2 className="w-4 h-4" />
                        Configurações
                    </h3>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Mode Selection */}
                    <div className="space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Modo Silhueta</span>
                            <ToggleSwitch
                                id="silhouette-mode-toggle"
                                checked={isSilhouetteMode}
                                onChange={handleModeChange}
                            />
                         </div>
                         <p className="text-xs text-gray-500 leading-relaxed">
                             {t('settings.silhouetteDesc')}
                         </p>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Preview Background */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('controlPanel.backgroundPreview')}</label>
                      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                        {['dark', 'light', 'checkerboard'].map((bg) => (
                           <button
                             key={bg}
                             onClick={() => setGlobalPreviewBg(bg as PreviewBg)}
                             className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${globalPreviewBg === bg ? 'bg-white text-ui-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                           >
                            {bg === 'checkerboard' ? 'Grid' : bg.charAt(0).toUpperCase() + bg.slice(1)}
                           </button>
                        ))}
                      </div>
                    </div>
                    
                    <hr className="border-gray-100" />
                    
                     {/* Stats */}
                     {images.length > 0 && (
                         <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
                             <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Resumo</div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-600">Total</span>
                                 <span className="font-medium">{images.length}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-600">Processadas</span>
                                 <span className="font-medium text-green-600">{progressStats.processedCount}</span>
                             </div>
                             {isProcessing && (
                                <div className="pt-2">
                                     <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div className="bg-ui-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progressStats.percentage}%` }}></div>
                                     </div>
                                </div>
                             )}
                         </div>
                     )}
                 </div>
                 
                 <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <Button
                        onClick={handleLimitedDownloadAll}
                        disabled={!hasDoneImages || isProcessing}
                        variant="primary"
                        className="w-full"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        {t('controlPanel.downloadAll')}
                    </Button>
                 </div>
             </aside>
        </div>

        {/* Renderização condicional dos modais */}
        {previewIndex !== null && (
          <React.Suspense fallback={<Spinner />}>
            <PreviewModal
              images={images}
              currentIndex={previewIndex}
              options={options}
              onClose={() => setPreviewIndex(null)}
              onApply={handleApplyPreviewChanges}
              onRevert={handleRevertInModal}
              onNavigate={setPreviewIndex}
            />
          </React.Suspense>
        )}

        {galleryIndex !== null && (
          <React.Suspense fallback={<Spinner />}>
            <GalleryModal
              images={doneImages}
              startIndex={galleryIndex}
              onClose={() => setGalleryIndex(null)}
              onDownload={downloadImage}
            />
          </React.Suspense>
        )}

        {showExportModal && (
          <React.Suspense fallback={<Spinner />}>
            <ExportModal
              images={images}
              onClose={() => setShowExportModal(false)}
              onExport={async (cfg, onProgress) => {
                try {
                  await incrementUsage();
                  setShowExportModal(false);
                  exportarLote(cfg as any, onProgress);
                } catch (error: any) {
                  if (error.message === 'LIMIT_REACHED') {
                    setShowExportModal(false);
                    setShowLimitModal(true);
                  }
                }
              }}
              onExportOne={(id, cfg) => exportarImagem(id, cfg as any)}
            />
          </React.Suspense>
        )}

        <FreeLimitModal
          isOpen={showLimitModal}
          toolName="Removedor de Fundo"
          limit={5}
        />

      </div>
    </ErrorBoundary>
  );
}