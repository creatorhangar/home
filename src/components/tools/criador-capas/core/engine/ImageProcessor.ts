import type { ImageFile } from '../../types';

/**
 * Image Processor - Redimensiona, otimiza e converte imagens
 */
export class ImageProcessor {
    /**
     * Carrega uma imagem e retorna objeto Image
     */
    static async loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    /**
     * Processa arquivo de imagem e retorna ImageFile
     */
    static async processImageFile(file: File): Promise<ImageFile> {
        const url = URL.createObjectURL(file);
        const img = await this.loadImage(url);

        // Gera thumbnail
        const thumbnail = await this.generateThumbnail(img, 200);

        return {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            url,
            thumbnail,
            width: img.width,
            height: img.height,
        };
    }

    /**
     * Processa múltiplos arquivos
     */
    static async processMultipleFiles(files: File[]): Promise<ImageFile[]> {
        const promises = files.map(file => this.processImageFile(file));
        return Promise.all(promises);
    }

    /**
     * Gera thumbnail de uma imagem
     */
    static async generateThumbnail(
        img: HTMLImageElement,
        maxSize: number
    ): Promise<string> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Calcula dimensões mantendo proporção
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > maxSize) {
                height = (height / width) * maxSize;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width / height) * maxSize;
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        return canvas.toDataURL('image/webp', 0.8);
    }

    /**
     * Redimensiona imagem para caber em dimensões específicas
     */
    static async resizeImage(
        img: HTMLImageElement,
        maxWidth: number,
        maxHeight: number,
        fit: 'cover' | 'contain' = 'cover'
    ): Promise<HTMLCanvasElement> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const aspectRatio = img.width / img.height;
        const targetAspect = maxWidth / maxHeight;

        let drawWidth = img.width;
        let drawHeight = img.height;
        let offsetX = 0;
        let offsetY = 0;

        if (fit === 'cover') {
            // Preenche todo o espaço, cortando se necessário
            if (aspectRatio > targetAspect) {
                // Imagem mais larga
                drawHeight = img.height;
                drawWidth = img.height * targetAspect;
                offsetX = (img.width - drawWidth) / 2;
            } else {
                // Imagem mais alta
                drawWidth = img.width;
                drawHeight = img.width / targetAspect;
                offsetY = (img.height - drawHeight) / 2;
            }
        } else {
            // Contain - cabe inteiro, pode ter espaço vazio
            if (aspectRatio > targetAspect) {
                drawWidth = maxWidth;
                drawHeight = maxWidth / aspectRatio;
            } else {
                drawHeight = maxHeight;
                drawWidth = maxHeight * aspectRatio;
            }
        }

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        if (fit === 'cover') {
            ctx.drawImage(
                img,
                offsetX, offsetY, drawWidth, drawHeight,
                0, 0, maxWidth, maxHeight
            );
        } else {
            const x = (maxWidth - drawWidth) / 2;
            const y = (maxHeight - drawHeight) / 2;
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
        }

        return canvas;
    }

    /**
     * Converte canvas para Blob
     */
    static async canvasToBlob(
        canvas: HTMLCanvasElement,
        format: 'png' | 'jpg' | 'webp' = 'png',
        quality: number = 0.92
    ): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert canvas to blob'));
                    }
                },
                mimeType,
                quality
            );
        });
    }

    /**
     * Limpa URLs de objeto criadas
     */
    static cleanupImageUrls(images: ImageFile[]): void {
        images.forEach(img => {
            if (img.url.startsWith('blob:')) {
                URL.revokeObjectURL(img.url);
            }
            if (img.thumbnail?.startsWith('blob:')) {
                URL.revokeObjectURL(img.thumbnail);
            }
        });
    }
}
