import type { CapaTemplate, ImageFile, ProductInfo, CanvasLayout, CanvasElement } from '../../types';

/**
 * Grid Assimétrico Moderno
 * Ideal para 8-15 imagens
 * Estilo: Modern
 */
export const gridAssimetrico: CapaTemplate = {
    id: 'grid-assimetrico',
    name: 'Grid Assimétrico Moderno',
    description: 'Layout moderno com tamanhos variados',
    minImages: 8,
    maxImages: 15,
    style: 'modern',
    etiquetaPosition: 'center',
    preview: '/templates/previews/grid-assimetrico.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo): CanvasLayout => {
        const width = 2400;
        const height = 3000;
        const margin = 80;
        const gap = 30;

        const elements: CanvasElement[] = [];

        // Padrão assimétrico: grande, pequena, pequena, média, etc
        const pattern = [
            { w: 2, h: 2 }, // Grande
            { w: 1, h: 1 }, // Pequena
            { w: 1, h: 1 }, // Pequena
            { w: 2, h: 1 }, // Horizontal
            { w: 1, h: 2 }, // Vertical
            { w: 1, h: 1 }, // Pequena
            { w: 2, h: 2 }, // Grande
        ];

        const baseSize = 350;
        let x = margin;
        let y = margin + 350; // Espaço para etiqueta
        let maxHeightInRow = 0;
        let currentRowWidth = 0;

        for (let i = 0; i < count; i++) {
            const p = pattern[i % pattern.length];
            const imgWidth = baseSize * p.w + gap * (p.w - 1);
            const imgHeight = baseSize * p.h + gap * (p.h - 1);

            // Quebra de linha se não couber
            if (currentRowWidth + imgWidth > width - margin * 2 && currentRowWidth > 0) {
                x = margin;
                y += maxHeightInRow + gap;
                maxHeightInRow = 0;
                currentRowWidth = 0;
            }

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: x,
                y: y,
                width: imgWidth,
                height: imgHeight,
                zIndex: 1,
            });

            x += imgWidth + gap;
            currentRowWidth += imgWidth + gap;
            maxHeightInRow = Math.max(maxHeightInRow, imgHeight);
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#FAFAFA',
            },
            elements,
            etiqueta: {
                style: 'geometric-tag',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: margin,
                y: margin,
                width: width - margin * 2,
                height: 280,
            },
        };
    },
};

/**
 * Mood Board
 * Ideal para 20-50 imagens
 * Estilo: Modern/Playful
 */
export const moodBoard: CapaTemplate = {
    id: 'mood-board',
    name: 'Mood Board',
    description: 'Disposição orgânica estilo mood board',
    minImages: 20,
    maxImages: 50,
    style: 'modern',
    etiquetaPosition: 'top',
    preview: '/templates/previews/mood-board.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo): CanvasLayout => {
        const width = 3000;
        const height = 4000;
        const margin = 100;
        const gap = 20;

        const elements: CanvasElement[] = [];

        // Tamanhos variados para mood board
        const sizes = [200, 250, 300, 350, 400];

        let x = margin;
        let y = margin + 350;
        let maxHeightInRow = 0;

        for (let i = 0; i < count; i++) {
            const size = sizes[Math.floor(Math.random() * sizes.length)];

            // Quebra de linha
            if (x + size > width - margin) {
                x = margin;
                y += maxHeightInRow + gap;
                maxHeightInRow = 0;
            }

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: x,
                y: y,
                width: size,
                height: size,
                rotation: Math.random() * 4 - 2, // Leve rotação
                zIndex: i,
                shadow: {
                    color: 'rgba(0,0,0,0.1)',
                    blur: 15,
                    offsetX: 2,
                    offsetY: 4,
                },
            });

            x += size + gap;
            maxHeightInRow = Math.max(maxHeightInRow, size);
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F5F5F5',
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: margin,
                y: margin,
                width: width - margin * 2,
                height: 280,
            },
        };
    },
};

/**
 * Showcase Produto Único + Grid
 * Ideal para 10-15 imagens
 * Estilo: Elegant/Modern
 */
export const showcaseProdutoGrid: CapaTemplate = {
    id: 'showcase-produto-grid',
    name: 'Showcase Produto + Grid',
    description: 'Destaque principal com grid de miniaturas',
    minImages: 10,
    maxImages: 15,
    style: 'elegant',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/showcase-produto.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo): CanvasLayout => {
        const width = 2400;
        const height = 3000;
        const margin = 100;
        const gap = 30;

        const elements: CanvasElement[] = [];

        // Imagem destaque (primeira imagem)
        const heroSize = 1200;
        const heroX = (width - heroSize) / 2;
        const heroY = margin + 300;

        elements.push({
            type: 'image',
            imageUrl: images[0].url,
            x: heroX,
            y: heroY,
            width: heroSize,
            height: heroSize,
            zIndex: 2,
            shadow: {
                color: 'rgba(0,0,0,0.2)',
                blur: 40,
                offsetX: 0,
                offsetY: 20,
            },
        });

        // Grid de miniaturas (resto das imagens)
        const thumbSize = 180;
        const thumbsPerRow = Math.floor((width - margin * 2) / (thumbSize + gap));
        const thumbStartY = heroY + heroSize + 80;

        for (let i = 1; i < count; i++) {
            const idx = i - 1;
            const col = idx % thumbsPerRow;
            const row = Math.floor(idx / thumbsPerRow);

            const thumbX = margin + col * (thumbSize + gap);
            const thumbY = thumbStartY + row * (thumbSize + gap);

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: thumbX,
                y: thumbY,
                width: thumbSize,
                height: thumbSize,
                zIndex: 1,
            });
        }

        return {
            width,
            height,
            background: {
                type: 'gradient',
                gradient: {
                    type: 'linear',
                    colors: ['#FFFFFF', '#F8F8F8'],
                    angle: 180,
                },
            },
            elements,
            etiqueta: {
                style: 'premium-gold',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: (width - 900) / 2,
                y: margin,
                width: 900,
                height: 250,
            },
        };
    },
};

/**
 * Grid Diagonal Dinâmico
 * Ideal para 12-20 imagens
 * Estilo: Modern/Playful
 */
export const gridDiagonal: CapaTemplate = {
    id: 'grid-diagonal',
    name: 'Grid Diagonal Dinâmico',
    description: 'Layout diagonal com movimento visual',
    minImages: 12,
    maxImages: 20,
    style: 'playful',
    etiquetaPosition: 'corner',
    preview: '/templates/previews/grid-diagonal.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo): CanvasLayout => {
        const width = 2600;
        const height = 3000;
        const imageSize = 400;
        const gap = 50;
        const offsetStep = 120;

        const elements: CanvasElement[] = [];

        // Criar diagonal começando do canto superior esquerdo
        let x = 200;
        let y = 400;

        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: x + col * (imageSize + gap) + row * offsetStep,
                y: y + row * (imageSize + gap / 2),
                width: imageSize,
                height: imageSize,
                rotation: -5 + col * 3, // Rotação sutil variada
                zIndex: count - i,
                shadow: {
                    color: 'rgba(0,0,0,0.15)',
                    blur: 20,
                    offsetX: 5,
                    offsetY: 10,
                },
            });
        }

        return {
            width,
            height,
            background: {
                type: 'gradient',
                gradient: {
                    type: 'linear',
                    colors: ['#FDFBF7', '#E8E4DD'],
                    angle: 45,
                },
            },
            elements,
            etiqueta: {
                style: 'simple-banner',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: 100,
                y: 100,
                width: 700,
                height: 220,
            },
        };
    },
};

export const advancedCapaTemplates: CapaTemplate[] = [
    gridAssimetrico,
    moodBoard,
    showcaseProdutoGrid,
    gridDiagonal,
];
