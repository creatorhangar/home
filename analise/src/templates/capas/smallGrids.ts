import type { CapaTemplate, ImageFile, ProductInfo, CanvasLayout } from '../../types';

/**
 * Hero Single - 1 Imagem
 * Ideal para 1 imagem
 * Estilo: Impactante
 */
export const heroSingle: CapaTemplate = {
    id: 'hero-single',
    name: 'Hero Single',
    description: 'Destaque total para uma única imagem',
    minImages: 1,
    maxImages: 1,
    style: 'elegant',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/hero-single.jpg',

    layoutFn: (images: ImageFile[], _count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const margin = 100;

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F5F5F5',
            },
            elements: [
                {
                    type: 'image',
                    imageUrl: images[0].url,
                    x: margin,
                    y: margin,
                    width: width - margin * 2,
                    height: height - margin * 2 - 300,
                    zIndex: 1,
                    shadow: {
                        color: 'rgba(0,0,0,0.2)',
                        blur: 30,
                        offsetX: 0,
                        offsetY: 15,
                    },
                }
            ],
            etiqueta: {
                style: 'premium-gold',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 400,
                y: height - 350,
                width: 800,
                height: 250,
            },
        };
    },
};

/**
 * Split Duo - 2 Imagens
 * Ideal para 2 imagens
 */
export const splitDuo: CapaTemplate = {
    id: 'split-duo',
    name: 'Split Duo',
    description: 'Duas imagens lado a lado',
    minImages: 2,
    maxImages: 2,
    style: 'modern',
    etiquetaPosition: 'center',
    preview: '/templates/previews/split-duo.jpg',

    layoutFn: (images: ImageFile[], _count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const gap = 20;

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#FFFFFF',
            },
            elements: [
                {
                    type: 'image',
                    imageUrl: images[0].url,
                    x: 0,
                    y: 0,
                    width: width / 2 - gap / 2,
                    height: height,
                    zIndex: 1,
                },
                {
                    type: 'image',
                    imageUrl: images[1].url,
                    x: width / 2 + gap / 2,
                    y: 0,
                    width: width / 2 - gap / 2,
                    height: height,
                    zIndex: 1,
                }
            ],
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 300,
                y: height / 2 - 125,
                width: 600,
                height: 250,
            },
        };
    },
};

/**
 * Trio Balance - 3 Imagens
 * Ideal para 3 imagens
 */
export const trioBalance: CapaTemplate = {
    id: 'trio-balance',
    name: 'Trio Balance',
    description: 'Uma principal e duas secundárias',
    minImages: 3,
    maxImages: 3,
    style: 'minimal',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/trio-balance.jpg',

    layoutFn: (images: ImageFile[], _count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const gap = 30;
        const margin = 60;

        // Layout: Esquerda Grande (2/3), Direita 2 Pequenas (1/3)
        const leftWidth = (width - margin * 2 - gap) * 0.6;
        const rightWidth = (width - margin * 2 - gap) * 0.4;

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#FAFAFA',
            },
            elements: [
                {
                    type: 'image',
                    imageUrl: images[0].url,
                    x: margin,
                    y: margin,
                    width: leftWidth,
                    height: height - margin * 2,
                    zIndex: 1,
                },
                {
                    type: 'image',
                    imageUrl: images[1].url,
                    x: margin + leftWidth + gap,
                    y: margin,
                    width: rightWidth,
                    height: (height - margin * 2 - gap) / 2,
                    zIndex: 1,
                },
                {
                    type: 'image',
                    imageUrl: images[2].url,
                    x: margin + leftWidth + gap,
                    y: margin + (height - margin * 2 - gap) / 2 + gap,
                    width: rightWidth,
                    height: (height - margin * 2 - gap) / 2,
                    zIndex: 1,
                }
            ],
            etiqueta: {
                style: 'geometric-tag',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: margin + 40,
                y: height - 300,
                width: leftWidth - 80,
                height: 200,
            },
        };
    },
};

/**
 * Grid 2x2 - 4 Imagens
 */
export const grid2x2: CapaTemplate = {
    id: 'grid-2x2',
    name: 'Grid 2x2 Clássico',
    description: 'Quatro imagens em grid perfeito',
    minImages: 4,
    maxImages: 4,
    style: 'modern',
    etiquetaPosition: 'center',
    preview: '/templates/previews/grid-2x2.jpg',

    layoutFn: (images: ImageFile[], _count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const gap = 40;
        const margin = 80;
        const size = (width - margin * 2 - gap) / 2;

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F0F0F0',
            },
            elements: [
                { type: 'image', imageUrl: images[0].url, x: margin, y: margin, width: size, height: size, zIndex: 1 },
                { type: 'image', imageUrl: images[1].url, x: margin + size + gap, y: margin, width: size, height: size, zIndex: 1 },
                { type: 'image', imageUrl: images[2].url, x: margin, y: margin + size + gap, width: size, height: size, zIndex: 1 },
                { type: 'image', imageUrl: images[3].url, x: margin + size + gap, y: margin + size + gap, width: size, height: size, zIndex: 1 },
            ],
            etiqueta: {
                style: 'vintage-badge',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 250,
                y: height / 2 - 250,
                width: 500,
                height: 500,
            },
        };
    },
};

export const smallCapaTemplates: CapaTemplate[] = [
    heroSingle,
    splitDuo,
    trioBalance,
    grid2x2,
];
