import React, { useState, useEffect, useCallback } from 'react';
import { ImageFile } from '../types';
import { DownloadIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from './Icons';
import Button from './Button';
import { useTranslation } from '../utils/localization';

interface GalleryModalProps {
  images: ImageFile[];
  startIndex: number;
  onClose: () => void;
  onDownload: (url: string, filename: string) => void;
}

/**
 * Componente de modal para visualização em tela cheia das imagens processadas.
 * Permite navegação entre as imagens, download e fechamento.
 */
const GalleryModal: React.FC<GalleryModalProps> = ({ images, startIndex, onClose, onDownload }) => {
  const { t } = useTranslation();
  // Estado para controlar qual imagem está sendo exibida atualmente.
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);

  // Navega para a próxima imagem, voltando ao início se chegar ao fim (loop).
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  // Navega para a imagem anterior, indo para o final se estiver no início (loop).
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  // Efeito para a apresentação automática de slides.
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      const timer = setTimeout(() => {
        goToNext();
      }, 2000); // 2 segundos
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentIndex, goToNext, images.length]);


  // Efeito para adicionar e remover listeners de teclado para navegação e fechamento.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Função de limpeza para remover o listener quando o componente é desmontado.
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToNext, goToPrevious]);

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  // Gera o nome do arquivo para download.
  const originalName = currentImage.file.name.split('.').slice(0, -1).join('.');
  const downloadFilename = `${originalName}_${t('imageCard.processedFileSuffix')}.png`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose} // Fecha o modal ao clicar no fundo.
      role="dialog"
      aria-modal="true"
    >
      {/* Estilos para a animação de fade-in do modal */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
      `}</style>

      {/* Título do Modal */}
      <header className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-lg font-semibold bg-black/30 px-4 py-2 rounded-lg">
          {images.length > 1
            ? t('galleryModal.titleMultiple', { current: currentIndex + 1, total: images.length })
            : t('galleryModal.titleSingle')}
      </header>
      
      {/* Botões de Navegação */}
      <button
        onClick={(e) => { e.stopPropagation(); goToPrevious(); }} // Impede que o clique feche o modal
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all z-10"
        aria-label={t('galleryModal.previous')}
      >
        <ChevronLeftIcon className="w-8 h-8" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); goToNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all z-10"
        aria-label={t('galleryModal.next')}
      >
        <ChevronRightIcon className="w-8 h-8" />
      </button>

      {/* Conteúdo Principal (Imagem e Controles) */}
      <div 
        className="relative flex flex-col items-center justify-center w-full h-full"
        onClick={(e) => e.stopPropagation()} // Impede que o clique na área da imagem feche o modal
      >
        <div className="w-full h-full flex items-center justify-center p-16">
          <img
            src={currentImage.processedURL!}
            alt={`${t('galleryModal.processedAlt')} ${currentImage.file.name}`}
            className="max-w-full max-h-full object-contain bg-gray-800 rounded-lg shadow-2xl"
          />
        </div>
        
        {/* Barra de informações e download na parte inferior */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center gap-4 bg-black/50 backdrop-blur-md p-3 rounded-lg text-white">
          <p className="text-sm font-medium truncate max-w-xs">{currentImage.file.name}</p>
          <div className="flex items-center gap-3">
             {images.length > 1 && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                  title={isPlaying ? t('galleryModal.pauseSlideshow') : t('galleryModal.playSlideshow')}
                >
                  {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </button>
             )}
            <Button onClick={() => onDownload(currentImage.processedURL!, downloadFilename)}>
              <DownloadIcon className="w-5 h-5 mr-2" />
              {t('galleryModal.download')}
            </Button>
          </div>
        </div>
      </div>

       {/* Botão de Fechar */}
       <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all"
        aria-label={t('galleryModal.close')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default GalleryModal;