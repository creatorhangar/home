
import React, { useRef, useCallback, useEffect } from 'react';
import { ImageFile, ImageStatus } from '../types';
import Spinner from './Spinner';
import { CheckCircleIcon, XCircleIcon, DownloadIcon, EyeIcon, ArrowUturnLeftIcon, SparklesIcon, PencilIcon, UserIcon, CubeIcon, EyedropperIcon } from './Icons';
import { detectDominantBorderColor } from '../utils/imageProcessor';
import { useTranslation } from '../utils/localization';

type PreviewBg = 'dark' | 'light' | 'checkerboard';

interface ImageCardProps {
  image: ImageFile;
  onDownload: (url: string, filename: string) => void;
  onUpdateImage: (id: string, updates: Partial<ImageFile>) => void;
  onPreview: (id: string) => void;
  onRevert: (id: string) => void;
  onOpenGallery: (id: string) => void;
  globalPreviewBg: PreviewBg;
  onProcessImage: (id: string) => void;
}

// Componente para exibir um indicador de status visual (processando, concluído, erro).
const StatusIndicator: React.FC<{ status: ImageStatus; progress?: { stage: string; iter?: number; pct?: number } }> = ({ status, progress }) => {
  switch (status) {
    case ImageStatus.Processing:
      return (
        <div className="absolute top-2 right-2 bg-white/80 rounded-md shadow p-2 flex items-center gap-2">
          <Spinner />
          <div className="text-xs text-text-primary">
            <p>Processando… {typeof progress?.pct === 'number' ? `${progress.pct}%` : ''}</p>
            {progress?.stage && <p className="text-[10px] text-text-secondary">{progress.stage}{typeof progress.iter === 'number' ? ` · iteração ${progress.iter+1}` : ''}</p>}
          </div>
        </div>
      );
    case ImageStatus.Done:
      return <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-green-500 bg-white rounded-full" />;
    case ImageStatus.Error:
       return <XCircleIcon className="absolute top-2 right-2 w-6 h-6 text-red-500 bg-white rounded-full" />;
    default:
      return null;
  }
};

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onDownload,
  onUpdateImage,
  onPreview,
  onRevert,
  onOpenGallery,
  globalPreviewBg,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bgClasses: Record<PreviewBg, string> = {
    dark: 'bg-gray-800',
    light: 'bg-gray-100',
    checkerboard: 'checkerboard-bg',
  };
  
  // Este efeito desenha a imagem original em um canvas oculto para detecção de cor.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = image.originalURL;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Se nenhuma cor foi definida ainda, detecta a cor da borda automaticamente.
      if (!image.removalInfo || image.removalInfo.length === 0) {
        const dominantColor = detectDominantBorderColor(img);
        if (dominantColor) {
          onUpdateImage(image.id, { removalInfo: [{ color: { ...dominantColor, a: 255 }, isAuto: true }] });
        } else {
          // Usa branco como padrão se a detecção falhar.
          onUpdateImage(image.id, { removalInfo: [{ color: { r: 255, g: 255, b: 255, a: 255 }, isAuto: true }] });
        }
      }
    };
  }, [image.originalURL, image.id, onUpdateImage, image.removalInfo]);
  
  const handleAutoDetectColor = useCallback((e: React.MouseEvent) => {
      e.stopPropagation(); // Impede que o clique abra o modal de edição
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = image.originalURL;
      img.onload = () => {
          const dominantColor = detectDominantBorderColor(img);
          if (dominantColor) {
              onUpdateImage(image.id, { removalInfo: [{ color: { ...dominantColor, a: 255 }, isAuto: true }] });
          }
      };
  }, [image.id, image.originalURL, onUpdateImage]);


  const originalName = image.file.name.split('.').slice(0, -1).join('.');
  const downloadFilename = `${originalName}_${t('imageCard.processedFileSuffix')}.png`;

  return (
    <div className="relative aspect-square rounded-lg overflow-hidden shadow-card-shadow group bg-gray-100">
      {/* Canvas oculto para seleção de cor */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Área de Exibição da Imagem */}
      <div className={`w-full h-full ${bgClasses[globalPreviewBg]} flex items-center justify-center`}>
        <img
          src={image.processedURL || image.originalURL}
          alt={image.status === 'done' ? `${t('imageCard.processedAlt')} ${image.file.name}` : image.file.name}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Indicador de Status */}
      <StatusIndicator status={image.status} progress={image.progress} />
      
      {/* Overlay de Ações (aparece no hover) */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 flex flex-col items-center justify-center p-4">
        
        {/* Ação Principal: Editar */}
        {(image.status === 'pending' || image.status === 'done') && (
            <button
                onClick={() => onPreview(image.id)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-md shadow hover:bg-white hover:scale-105 transition-all text-text-primary font-semibold"
                title={t('imageCard.edit')}
            >
                <PencilIcon className="w-4 h-4" />
                <span>{t('imageCard.edit')}</span>
            </button>
        )}

        {/* Mensagem de Erro */}
        {image.status === 'error' && (
           <p className="text-center text-white bg-red-500/80 px-3 py-2 rounded-lg" title={image.error || t('imageCard.error')}>
             {t('imageCard.error')}
           </p>
        )}

      </div>
      
      {/* Overlay de ações secundárias (canto inferior) */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 flex items-center gap-1.5">
        {image.status === 'done' && (
          <>
            <button onClick={() => onOpenGallery(image.id)} className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white" title={t('galleryModal.close')} aria-label={t('galleryModal.close')}><EyeIcon className="w-4 h-4 text-text-primary" /></button>
            <button onClick={() => onDownload(image.processedURL!, downloadFilename)} className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white" title={t('imageCard.download')} aria-label={t('imageCard.download')}><DownloadIcon className="w-4 h-4 text-text-primary" /></button>
          </>
        )}
        {(image.status === 'error' || image.status === 'done') && (
          <button onClick={() => onRevert(image.id)} className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white" title={t('imageCard.revert')} aria-label={t('imageCard.revert')}><ArrowUturnLeftIcon className="w-4 h-4 text-text-primary" /></button>
        )}
      </div>

      {/* Presets rápidos (canto inferior esquerdo) */}
      {image.status !== 'processing' && (
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300">
          <div className="flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow">
            {['auto','portrait','product','green'].map((preset) => {
              const isActive = (() => {
                const co = image.customOptions;
                if (!co) return false;
                if (preset === 'auto') return (co.mode || 'floodfill') === 'floodfill';
                if (preset === 'portrait') return co.mode === 'grabcut';
                if (preset === 'product') return co.mode === 'grabcut';
                if (preset === 'green') return co.mode === 'chroma' && (co.colorSpace === 'YUV');
                return false;
              })();
              const label = preset === 'auto' ? t('imageCard.presetAuto') || 'Auto' : preset === 'portrait' ? t('imageCard.presetPortrait') || 'Retrato' : preset === 'product' ? t('imageCard.presetProduct') || 'Produto' : t('imageCard.presetGreen') || 'Green';
              const icon = preset === 'auto' ? <SparklesIcon className="w-4 h-4 mr-1" /> : preset === 'portrait' ? <UserIcon className="w-4 h-4 mr-1" /> : preset === 'product' ? <CubeIcon className="w-4 h-4 mr-1" /> : <EyedropperIcon className="w-4 h-4 mr-1" />;
              return (
                <button
                  key={preset}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (preset === 'auto') {
                      onUpdateImage(image.id, { customOptions: { mode: 'floodfill' } as any });
                    } else if (preset === 'portrait') {
                      onUpdateImage(image.id, { customOptions: { mode: 'grabcut', grabcut: { lambda: 50 } } as any });
                    } else if (preset === 'product') {
                      onUpdateImage(image.id, { customOptions: { mode: 'grabcut', grabcut: { lambda: 50 } } as any });
                    } else if (preset === 'green') {
                      onUpdateImage(image.id, { customOptions: { mode: 'chroma', tolerance: 40, colorSpace: 'YUV' } as any });
                    }
                  }}
                  className={`px-2 py-1 text-[10px] rounded-full border flex items-center whitespace-nowrap ${isActive ? 'bg-accent-primary text-white border-transparent' : 'bg-white text-text-secondary border-gray-200 hover:bg-gray-100'}`}
                  title={label}
                >
                  {icon}{label}
                </button>
              );
            })}
            <button
              onClick={(e) => { e.stopPropagation(); onProcessImage(image.id); }}
              className="ml-1 px-2 py-1 text-[10px] rounded-full border bg-white text-text-secondary border-gray-200 hover:bg-gray-100"
              title={t('imageCard.applyPresetProcess') || 'Aplicar e processar'}
            >
              {t('imageCard.applyPresetProcess') || 'Aplicar e processar'}
            </button>
          </div>
        </div>
      )}

       {/* Overlay de Cor (canto superior) */}
      {image.status === 'pending' && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300">
            <div className="flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow">
                <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: image.removalInfo?.[0]?.color ? `rgba(${image.removalInfo[0].color.r}, ${image.removalInfo[0].color.g}, ${image.removalInfo[0].color.b}, 1)` : '#fff' }}
                    title={t('imageCard.selectedColor')}
                />
                <button
                    onClick={handleAutoDetectColor}
                    className="flex items-center pr-1"
                    title={t('imageCard.autoDetect')}
                    aria-label={t('imageCard.autoDetect')}
                >
                    <SparklesIcon className="w-4 h-4 text-accent-secondary hover:text-accent-primary transition-colors" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
