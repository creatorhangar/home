'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
// Header removed (handled by Layout)
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

// Carrega as opções iniciais do localStorage ou usa padrões.
const getInitialOptions = (): ProcessingOptions => {
  const defaults: ProcessingOptions = {
    tolerance: 30,
    edgeSoftness: 0,
    edgeRefinement: -1, // Sutilmente "come" a borda para remover halos brancos.
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
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Mescla os padrões com os salvos para garantir que todas as chaves existam
      return {
        ...defaults,
        ...parsed,
        outline: { ...defaults.outline, ...parsed.outline },
        dropShadow: { ...defaults.dropShadow, ...parsed.dropShadow },
        background: { ...defaults.background, ...parsed.background },
      };
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage", error);
  }
  return defaults;
};

// Carrega a preferência de fundo de pré-visualização do localStorage.
const getInitialPreviewBg = (): PreviewBg => {
  const saved = localStorage.getItem(PREVIEW_BG_STORAGE_key);
  if (saved === 'dark' || saved === 'light' || saved === 'checkerboard') {
    return saved;
  }
  return 'dark';
};


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
  // Estado para o sistema de notificações (toasts).
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Funções para adicionar e remover toasts.
  const dismissToast = useCallback((id: number) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((key: string, type: 'success' | 'error' | 'info', params?: Record<string, any>) => {
    const id = Date.now();
    const message = t(key, params);
    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);
  }, [t]);

  // Inscreve-se no gerenciador de eventos de toast para receber notificações de outras partes do app.
  useEffect(() => {
    const unsubscribe = toastEventManager.subscribe(addToast);
    return unsubscribe; // Limpa a inscrição ao desmontar o componente.
  }, [addToast]);

  const { incrementUsage } = useUsage();
  const router = useRouter();

  // Hook customizado que encapsula toda a lógica de processamento de imagens.
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

  // Estado para as opções de processamento, incluindo o novo modo.
  const [options, setOptions] = useState<ProcessingOptions>(getInitialOptions);
  const [isSilhouetteMode, setIsSilhouetteMode] = useState(options.mode === 'silhouette');
  const [globalPreviewBg, setGlobalPreviewBg] = useState<PreviewBg>(getInitialPreviewBg());
  const [showExportModal, setShowExportModal] = useState(false);

  // Salva a preferência de fundo de pré-visualização no localStorage sempre que ela muda.
  useEffect(() => {
    try {
      localStorage.setItem(PREVIEW_BG_STORAGE_key, globalPreviewBg);
    } catch (error) {
      console.error("Failed to save preview background setting to localStorage", error);
    }
  }, [globalPreviewBg]);

  // SEO removido pois é SPA/NextJS page

  // Mantém o estado do toggle sincronizado com as opções.
  useEffect(() => {
    setIsSilhouetteMode(options.mode === 'silhouette');
  }, [options.mode]);

  // Estado para controlar a visibilidade e o conteúdo dos modais.
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  // Lógica para colar imagens da área de transferência.
  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          // Cria um novo nome de arquivo para evitar conflitos.
          const newFile = new File([file], `pasted-${Date.now()}.${file.type.split('/')[1]}`, { type: file.type });
          files.push(newFile);
        }
      }
    }

    if (files.length > 0) {
      toastEventManager.emit('toasts.pasted', 'info', { count: files.length });
      // Converte a lista de arquivos para um FileList para usar a função addImages.
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      addImages(dataTransfer.files);
    }
  }, [addImages]);

  // Adiciona e remove o listener de 'paste' no window.
  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);


  // Estado derivado para controlar a UI (ex: desabilitar botões).
  const hasDoneImages = useMemo(() => images.some(img => img.status === 'done'), [images]);
  const canClear = images.length > 0 && !isProcessing;
  const hasPendingImages = pendingImages.length > 0;
  const canRevertAll = useMemo(() => images.some(img => img.status === ImageStatus.Done || img.status === ImageStatus.Error), [images]);

  // `useMemo` otimiza o cálculo, que só será refeito quando a lista de `images` mudar.
  const doneImages = useMemo(() => images.filter(img => img.status === ImageStatus.Done), [images]);

  // Abre a galeria na imagem clicada.
  const handleOpenGallery = (imageId: string) => {
    const index = doneImages.findIndex(img => img.id === imageId);
    if (index > -1) {
      setGalleryIndex(index);
    }
  };

  // Abre o modal de pré-visualização na imagem clicada.
  const handleOpenPreview = (imageId: string) => {
    const index = images.findIndex(img => img.id === imageId);
    if (index > -1) {
      setPreviewIndex(index);
    }
  };


  // Aplica as alterações feitas no modal de pré-visualização e salva no localStorage.
  const handleApplyPreviewChanges = (imageId: string, newOptions: RemovalOptions, processedUrl: string, removalInfo: ImageFile['removalInfo'], newFile?: File) => {
    const fullNewOptions: ProcessingOptions = { ...options, ...newOptions };

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(fullNewOptions));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }

    setOptions(fullNewOptions);

    const updates: Partial<ImageFile> = {
      processedURL: processedUrl,
      status: ImageStatus.Done,
      removalInfo,
    };
    if (newFile) {
      updates.file = newFile;
    }

    updateImage(imageId, updates);
  };

  // Encontra a imagem a ser exibida no modal de pré-visualização.
  const previewImage = useMemo(() => {
    if (previewIndex === null) return null;
    return images[previewIndex] ?? null;
  }, [previewIndex, images]);

  const handleRevertInModal = useCallback(() => {
    if (previewIndex !== null) {
      const imageId = images[previewIndex].id;
      revertImage(imageId);
      setPreviewIndex(null);
    }
  }, [previewIndex, images, revertImage]);


  // Calcula as estatísticas de progresso para a barra de progresso.
  const progressStats = useMemo(() => {
    if (images.length === 0) {
      return { processedCount: 0, totalCount: 0, percentage: 0 };
    }
    const processedCount = images.filter(
      (img) => img.status === ImageStatus.Done || img.status === ImageStatus.Error
    ).length;

    const percentage = images.length > 0 ? (processedCount / images.length) * 100 : 0;

    return { processedCount, totalCount: images.length, percentage };
  }, [images]);

  // Alterna entre os modos de processamento e define os padrões.
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

  // Exibe um spinner enquanto as imagens da sessão anterior estão sendo carregadas do banco de dados.
  const isE2E = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('e2e');

  useEffect(() => {
    if (isE2E) {
      try { clearAll(); } catch { }
    }
  }, [isE2E]);

  // Wrapper limits
  const handleLimitedDownloadAll = async () => {
    try {
      await incrementUsage();
      downloadAllAsZip();
    } catch (error: any) {
      if (error.message === 'LIMIT_REACHED') {
        alert('Você atingiu o limite de 5 downloads diários do plano Grátis. Atualize para o Pro para downloads ilimitados!');
        router.push('/dashboard?upgrade=true');
      } else {
        console.error(error);
        toastEventManager.emit('toasts.error', 'system.error' as any);
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen font-sans">
        {(isDBLoading && !isE2E) && (
          <div className="fixed inset-0 flex items-center justify-center bg-creme z-50">
            <Spinner className="w-10 h-10" />
          </div>
        )}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        {/* Header removed from here */}
        <main className="container mx-auto px-4 py-8 max-w-7xl">

          {images.length === 0 ? (
            // --- TELA INICIAL ---
            <>
              <ImageUploader
                onFilesAdded={addImages}
                isProcessing={isProcessing}
              />
              <footer className="text-center mt-12 space-y-6 text-text-secondary">
                <div>
                  <h3 className="text-sm font-bold mb-2 flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600" />
                    {t('controlPanel.privacy')}
                  </h3>
                  <p className="text-xs max-w-sm mx-auto" dangerouslySetInnerHTML={{ __html: t('controlPanel.privacyDesc') }}>
                  </p>
                </div>
              </footer>
            </>
          ) : (
            // --- TELA COM IMAGENS ---
            <div className="space-y-8">
              {/* PAINEL DE AÇÕES */}
              <div className="bg-white/70 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-lg border border-white/30 space-y-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-grow space-y-4">
                    <Button
                      onClick={processImages}
                      disabled={!hasPendingImages || isProcessing}
                      isLoading={isProcessing && hasPendingImages}
                      size="large"
                      className="w-full"
                      title={!hasPendingImages ? t('controlPanel.allProcessedTooltip') : ""}
                    >
                      {isProcessing && hasPendingImages ? t('controlPanel.processing') : t('controlPanel.processButton', { count: pendingImages.length })}
                    </Button>
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium text-text-secondary">
                          <span className="font-semibold text-text-primary">{t('controlPanel.processing')}</span>
                          <span>{t('controlPanel.processedOf', { processed: progressStats.processedCount, total: progressStats.totalCount })}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-accent-primary h-2.5 rounded-full progress-bar-transition"
                            style={{ width: `${progressStats.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 lg:w-80">
                    <ImageUploader onFilesAdded={addImages} isProcessing={isProcessing} compact />
                  </div>
                </div>

                <hr className="border-gray-200/80" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Controles de Configuração */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">{t('settings.title')}</h3>
                    {/* Seletor de Modo de Processamento */}
                    <div className="flex items-center justify-between">
                      <label htmlFor="silhouette-mode-toggle" className="flex items-center gap-3 cursor-pointer pr-4">
                        <SparklesIcon className="w-5 h-5 text-accent-primary flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-text-primary">{t('controlPanel.silhouetteMode')}</h4>
                          <p className="text-xs text-text-secondary">{t('settings.silhouetteDesc')}</p>
                        </div>
                      </label>
                      <ToggleSwitch
                        id="silhouette-mode-toggle"
                        checked={isSilhouetteMode}
                        onChange={handleModeChange}
                      />
                    </div>
                    {/* Seletor de Fundo */}
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">{t('controlPanel.backgroundPreview')}</label>
                      <div className="flex items-center gap-1 rounded-md bg-gray-100 p-1 border border-gray-200 w-full justify-around">
                        <button onClick={() => setGlobalPreviewBg('dark')} title={t('imageCard.darkBg')} className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${globalPreviewBg === 'dark' ? 'bg-accent-primary text-white shadow' : 'text-text-secondary hover:bg-white'}`}>{t('previewModal.bgDark')}</button>
                        <button onClick={() => setGlobalPreviewBg('light')} title={t('imageCard.lightBg')} className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${globalPreviewBg === 'light' ? 'bg-accent-primary text-white shadow' : 'text-text-secondary hover:bg-white'}`}>{t('previewModal.bgLight')}</button>
                        <button onClick={() => setGlobalPreviewBg('checkerboard')} title={t('imageCard.checkerboardBg')} className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${globalPreviewBg === 'checkerboard' ? 'bg-accent-primary text-white shadow' : 'text-text-secondary hover:bg-white'}`}>{t('previewModal.bgGrid')}</button>
                      </div>
                    </div>
                  </div>
                  {/* Ações Gerais */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">{t('settings.actions')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button
                        onClick={handleLimitedDownloadAll}
                        disabled={!hasDoneImages || isProcessing}
                        variant="primary"
                        className="w-full"
                        title={
                          !hasDoneImages
                            ? t('controlPanel.noImagesToDownloadTooltip')
                            : t('controlPanel.downloadAllTooltip')
                        }
                      >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        <span>{t('controlPanel.downloadAll')}</span>
                      </Button>
                      <Button
                        onClick={() => setShowExportModal(true)}
                        disabled={!hasDoneImages || isProcessing}
                        variant="secondary"
                        className="w-full"
                        title={!hasDoneImages ? t('controlPanel.noImagesToDownloadTooltip') : t('controlPanel.exportImages')}
                      >
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        <span>{t('controlPanel.exportImages')}</span>
                      </Button>
                      <Button
                        onClick={revertAll}
                        disabled={!canRevertAll || isProcessing}
                        variant="secondary"
                        className="w-full"
                        title={!canRevertAll ? t('controlPanel.noImagesToRevertTooltip') : t('controlPanel.revertAllTooltip')}
                      >
                        <ArrowPathIcon className="w-5 h-5 mr-2" />
                        {t('controlPanel.revertAll')}
                      </Button>
                      <Button onClick={clearAll} disabled={!canClear} variant="secondary" className="w-full">
                        <TrashIcon className="w-5 h-5 mr-2" />
                        {t('controlPanel.clearAll')}
                      </Button>
                    </div>
                  </div>
                </div>

              </div>

              {/* GRADE DE IMAGENS */}
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
        </main>

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
                    alert('Limite atingido! Atualize para Pro.');
                    router.push('/dashboard?upgrade=true');
                  }
                }
              }}
              onExportOne={(id, cfg) => exportarImagem(id, cfg as any)}
            />
          </React.Suspense>
        )}

      </div>
    </ErrorBoundary>
  );
};