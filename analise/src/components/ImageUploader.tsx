import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImageFile } from '../types';
import { ImageProcessor } from '../core/engine/ImageProcessor';

interface ImageUploaderProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  minImages?: number;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onImagesChange,
  minImages = 1,
  maxImages = 50
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) return;

    // Limita ao máximo permitido
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = imageFiles.slice(0, remainingSlots);

    try {
      const newImages: ImageFile[] = await Promise.all(
        filesToProcess.map(async (file) => {
          return await ImageProcessor.processImageFile(file);
        })
      );

      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('Erro ao processar imagens:', error);
    }
  }, [images, maxImages, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
    e.target.value = '';
  }, [handleFiles]);

  const removeImage = useCallback((id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  }, [images, onImagesChange]);

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <div
        className={`upload-zone relative overflow-hidden group ${isDragging ? 'upload-zone-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />

        <label htmlFor="file-upload" className="cursor-pointer relative z-10 w-full h-full flex flex-col items-center justify-center">
          <motion.div
            animate={{ scale: isDragging ? 1.05 : 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className={`p-8 rounded-full transition-all duration-300 ${isDragging ? 'bg-primary/20 glow-primary' : 'bg-white/5 group-hover:bg-primary/10'}`}>
              <Upload className={`w-12 h-12 transition-colors ${isDragging ? 'text-primary' : 'text-white/40 group-hover:text-primary'}`} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold font-display">
                Arraste suas imagens
              </h3>
              <p className="text-white/60 text-lg">
                ou clique para selecionar
              </p>
              <p className="text-sm text-white/40 pt-2">
                Suporta de {minImages} a {maxImages} imagens (PNG, JPG, WebP)
              </p>
            </div>
          </motion.div>
        </label>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Galeria ({images.length})
            </h4>
            <span className="text-xs text-white/40 uppercase tracking-wider font-medium">
              {images.length < minImages ? `Faltam ${minImages - images.length}` : 'Pronto para gerar'}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            <AnimatePresence mode="popLayout">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="relative group aspect-square"
                >
                  <div className="w-full h-full rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-primary/50 transition-colors">
                    <img
                      src={image.thumbnail || image.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Remove Button - Only visible on hover */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeImage(image.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg backdrop-blur-sm"
                    title="Remover imagem"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add More Button (Mini) */}
            {images.length < maxImages && (
              <label htmlFor="file-upload" className="cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-full min-h-[100px] rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-white/40 hover:text-primary transition-all"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-medium">Adicionar</span>
                </motion.div>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Status Message */}
      <AnimatePresence>
        {images.length < minImages && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-accent-orange/10 border border-accent-orange/30 text-accent-orange text-center"
          >
            Adicione pelo menos {minImages - images.length} imagens para continuar
          </motion.div>
        )}

        {images.length >= minImages && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-center font-medium"
          >
            ✓ Pronto para gerar capas!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
