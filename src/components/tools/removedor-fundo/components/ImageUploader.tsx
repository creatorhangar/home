
import React, { useState, useCallback } from 'react';
import { UploadIcon, SparklesIcon, DownloadIcon } from './Icons';
import { useTranslation } from '../utils/localization';

// --- Image Uploader Component ---
// Lida com a adição de arquivos via arrastar e soltar (drag-and-drop) ou seleção de arquivo.
interface ImageUploaderProps {
  onFilesAdded: (files: FileList) => boolean;
  isProcessing: boolean;
  compact?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesAdded, isProcessing, compact = false }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isDropError, setIsDropError] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!isProcessing && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const hasInvalidFiles = onFilesAdded(e.dataTransfer.files);
      if (hasInvalidFiles) {
        setIsDropError(true);
        setTimeout(() => setIsDropError(false), 500); // Mostra um feedback visual de erro por 500ms
      }
    }
  }, [onFilesAdded, isProcessing]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const hasInvalidFiles = onFilesAdded(e.target.files);
        if (hasInvalidFiles) {
          setIsDropError(true);
          setTimeout(() => setIsDropError(false), 500);
        }
        e.target.value = ''; // Reseta o input para permitir selecionar o mesmo arquivo novamente
    }
  };
  
  const baseDropzoneClasses = "relative flex items-center justify-center w-full border-2 border-dashed rounded-2xl transition-all duration-300";
  const stateClasses = isDragging ? 'border-accent-primary ring-2 ring-accent-primary' 
                     : isDropError ? 'border-red-500' 
                     : '';
  const behaviorClasses = isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  // Renderização compacta, usada quando já existem imagens na grade.
  if (compact) {
    return (
      <div 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${baseDropzoneClasses} ${stateClasses} ${behaviorClasses} p-4 bg-creme hover:bg-white border-gray-300 hover:border-accent-secondary`}
      >
        <label htmlFor="file-upload-compact" className="flex items-center gap-4 cursor-pointer w-full justify-center text-center">
            <UploadIcon className="w-6 h-6 text-text-secondary" />
            <div className="text-left">
                <p className="font-semibold text-text-primary text-sm">{t('uploader.addMore')}</p>
                <p className="text-xs text-text-secondary">{t('uploader.dragOrClickHere')}</p>
            </div>
            <input
                id="file-upload-compact"
                name="file-upload-compact"
                type="file"
                multiple={true}
                accept="image/png, image/jpeg, image/webp"
                className="sr-only"
                onChange={handleFileChange}
                disabled={isProcessing}
            />
        </label>
      </div>
    );
  }

  // Renderização padrão, tela cheia.
  return (
    <div>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`${baseDropzoneClasses} ${stateClasses} ${behaviorClasses} flex-col min-h-[40vh] p-12 bg-white/60 backdrop-blur-xl border-transparent shadow-lg`}
        >
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center text-center cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center mb-4">
                  <UploadIcon className="w-8 h-8 text-accent-primary" />
              </div>
              <p className="text-lg font-semibold text-text-primary">
                  {t('uploader.dragOrClick')}
              </p>
              <p className="text-text-secondary">{t('uploader.formats')}</p>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple={true}
                accept="image/png, image/jpeg, image/webp"
                className="sr-only"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
          </label>
        </div>

        {/* Guia "Como Funciona" */}
        <div className="mt-12">
            <h2 className="text-center text-2xl font-bold font-serif text-text-primary mb-8">{t('controlPanel.howItWorks')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {/* Step 1 */}
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-secondary/20 flex items-center justify-center text-accent-primary">
                       <UploadIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-text-primary">{t('howItWorks.step1_title')}</h3>
                    <p className="text-sm text-text-secondary mt-1">{t('howItWorks.step1_desc')}</p>
                </div>
                {/* Step 2 */}
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-secondary/20 flex items-center justify-center text-accent-primary">
                       <SparklesIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-text-primary">{t('howItWorks.step2_title')}</h3>
                    <p className="text-sm text-text-secondary mt-1">{t('howItWorks.step2_desc')}</p>
                </div>
                {/* Step 3 */}
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-secondary/20 flex items-center justify-center text-accent-primary">
                       <DownloadIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-text-primary">{t('howItWorks.step3_title')}</h3>
                    <p className="text-sm text-text-secondary mt-1">{t('howItWorks.step3_desc')}</p>
                </div>
            </div>
        </div>

    </div>
  );
};

export default ImageUploader;
