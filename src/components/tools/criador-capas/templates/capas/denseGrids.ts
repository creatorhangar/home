import type { CapaTemplate, ImageFile, ProductInfo, CanvasLayout, CanvasElement } from '../../types';

/**
 * Mosaic Grid (Masonry Style)
 * Ideal para 10-30 imagens
 * Estilo: Moderno/Denso
 */
export const mosaicGrid: CapaTemplate = {
    id: 'mosaic-grid',
    name: 'Mosaic Grid (Denso)',
    description: 'Grid estilo mosaico com espaçamento mínimo',
    minImages: 10,
    maxImages: 30,
    style: 'modern',
    etiquetaPosition: 'center',
    preview: '/templates/previews/mosaic.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const gap = 10; // Espaçamento mínimo
        const cols = 4;
        const imageWidth = (width - (gap * (cols - 1))) / cols;
        const imageHeight = imageWidth; // Quadrado por padrão

        // Mosaic usually expands, but if we want fixed ratio, we might need to crop or scale.
        // For now, let's respect the width and let height be what it needs to be IF it's a scrolling layout,
        // BUT the user wants fixed aspect ratio output.
        // So we should probably just use the passed height for the canvas, and if content overflows, it clips.
        // Or better: fit the rows into the height.

        // Let's stick to the original logic for mosaic which calculates height, BUT we must return the requested width/height for the canvas.
        // If the content is smaller/larger, we might need to center it.

        const contentHeight = Math.ceil(count / cols) * (imageHeight + gap);

        // Ensure we have at least 4 images for a good mosaic, otherwise duplicate
        const workingImages = [...images];
        while (workingImages.length < 4) {
            workingImages.push(...images);
        }

        // Smart distribution: if 5 images, 2 big, 3 small?
        // For now, let's keep the simple grid but ensure it fills the space better

        const elements: CanvasElement[] = [];

        for (let i = 0; i < count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            elements.push({
                type: 'image',
                imageUrl: images[i % images.length].url,
                x: col * (imageWidth + gap),
                y: row * (imageHeight + gap),
                width: imageWidth,
                height: imageHeight,
                zIndex: 1,
            });
        }

        // Proportional Label Sizing
        const labelWidth = width * 0.8; // 80% of width
        const labelHeight = height * 0.25; // 25% of height

        return {
            width,
            height: Math.max(height, contentHeight),
            background: {
                type: 'solid',
                color: '#FFFFFF',
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: (width - labelWidth) / 2,
                y: (height - labelHeight) / 2, // Center
                width: labelWidth,
                height: labelHeight,
            },
        };
    },
};

/**
 * Full Coverage Grid
 * Ideal para 4-12 imagens
 * Estilo: Impactante
 */
export const fullCoverageGrid: CapaTemplate = {
    id: 'full-coverage',
    name: 'Full Coverage (Sem Bordas)',
    description: 'Imagens cobrindo 100% da área sem bordas',
    minImages: 4,
    maxImages: 12,
    style: 'modern',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/grid-3x4.jpg',

    layoutFn: (images: ImageFile[], _count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const margin = 80;
        const gap = 20;

        const elements: CanvasElement[] = [];

        // Grid 3x4 (12 slots) - Adapt to aspect ratio?
        // If 1:1, maybe 3x3?
        // Let's keep 3x4 logic but stretch cells to fit the container.
        const cols = 3;
        const rows = 4;
        const cellW = (width - (margin * 2) - (gap * (cols - 1))) / cols;
        const cellH = (height - (margin * 2) - (gap * (rows - 1))) / rows;

        images.forEach((img, i) => {
            if (i >= 12) return;
            const col = i % cols;
            const row = Math.floor(i / cols);

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: margin + (col * (cellW + gap)),
                y: margin + (row * (cellH + gap)),
                width: cellW,
                height: cellH,
                zIndex: 1
            });
        });

        return {
            width,
            height,
            background: { type: 'solid', color: '#FFFFFF' },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: margin,
                y: height - (height * 0.15) - margin, // 15% from bottom
                width: width - (margin * 2),
                height: height * 0.15 // 15% height
            }
        };
    }
};

export const denseCapaTemplates: CapaTemplate[] = [
    mosaicGrid,
    fullCoverageGrid,
];
