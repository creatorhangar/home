import type { CapaTemplate, ImageFile, ProductInfo, CanvasLayout, CanvasElement } from '../../types';

/**
 * Grid 2 Colunas com Etiqueta Central
 * Ideal para 8-16 imagens
 * Estilo: Elegante e organizado
 */
export const grid2ColEtiquetaCentro: CapaTemplate = {
    id: 'grid-2col-etiqueta-centro',
    name: 'Grid 2 Colunas + Etiqueta',
    description: 'Layout elegante com 2 colunas e etiqueta centralizada',
    minImages: 8,
    maxImages: 16,
    style: 'elegant',
    etiquetaPosition: 'center',
    preview: '/templates/previews/grid-2col.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo): CanvasLayout => {
        const width = 2000;
        const margin = 40; // Reduzido de 80
        const gap = 20; // Reduzido de 40
        const imageSize = (width - margin * 2 - gap) / 2;
        const etiquetaHeight = 300; // Espaço reservado para etiqueta

        const imagesPerSide = Math.floor(count / 2);
        const topRows = Math.ceil(imagesPerSide / 2);
        const bottomRows = Math.ceil((count - imagesPerSide) / 2);

        // Altura dinâmica
        const height = margin +
            (topRows * (imageSize + gap)) +
            etiquetaHeight +
            (bottomRows * (imageSize + gap)) +
            margin;

        const elements: CanvasElement[] = [];

        // Primeira metade - antes da etiqueta
        for (let i = 0; i < imagesPerSide; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: margin + col * (imageSize + gap),
                y: margin + row * (imageSize + gap),
                width: imageSize,
                height: imageSize,
                zIndex: 1,
            });
        }

        // Posição Y da etiqueta
        const etiquetaY = margin + topRows * (imageSize + gap);

        // Segunda metade - depois da etiqueta
        for (let i = imagesPerSide; i < count; i++) {
            const idx = i - imagesPerSide;
            const col = idx % 2;
            const row = Math.floor(idx / 2);

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: margin + col * (imageSize + gap),
                y: etiquetaY + etiquetaHeight + row * (imageSize + gap), // + gap extra se quiser
                width: imageSize,
                height: imageSize,
                zIndex: 1,
            });
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F8F7F4',
            },
            elements,
            etiqueta: {
                style: 'elegant-frame',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 400,
                y: etiquetaY + (etiquetaHeight - 250) / 2, // Centralizado no espaço
                width: 800,
                height: 250,
            },
        };
    },
};

/**
 * Grid Vertical Elegante
 * Ideal para 5-10 imagens
 * Estilo: Minimalista
 */
export const gridVerticalElegante: CapaTemplate = {
    id: 'grid-vertical-elegante',
    name: 'Grid Vertical Elegante',
    description: 'Layout vertical minimalista com texto integrado',
    minImages: 5,
    maxImages: 10,
    style: 'minimal',
    etiquetaPosition: 'center',
    preview: '/templates/previews/grid-vertical.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo): CanvasLayout => {
        const width = 1200;
        const margin = 40; // Reduzido de 60
        const imageWidth = width - margin * 2;
        const imageHeight = 800; // Aumentado para preencher mais
        const gap = 20; // Reduzido de 30
        const textSectionHeight = 400;

        const half = Math.ceil(count / 2);
        const remaining = count - half;

        // Altura dinâmica
        const height = margin +
            (half * (imageHeight + gap)) +
            textSectionHeight +
            (remaining * (imageHeight + gap)) +
            margin;

        const elements: CanvasElement[] = [];
        let currentY = margin;

        // Primeira metade de imagens
        for (let i = 0; i < half; i++) {
            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: margin,
                y: currentY,
                width: imageWidth,
                height: imageHeight,
                zIndex: 1,
            });
            currentY += imageHeight + gap;
        }

        // Área de texto
        const textY = currentY + (textSectionHeight - 250) / 2;
        currentY += textSectionHeight;

        // Segunda metade de imagens
        for (let i = half; i < count; i++) {
            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: margin,
                y: currentY,
                width: imageWidth,
                height: imageHeight,
                zIndex: 1,
            });
            currentY += imageHeight + gap;
        }

        return {
            width,
            height,
            background: {
                type: 'gradient',
                gradient: {
                    type: 'linear',
                    colors: ['#FFFFFF', '#F5F5F5'],
                    angle: 180,
                },
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle || productInfo.description,
                x: margin,
                y: textY,
                width: imageWidth,
                height: 250,
            },
        };
    },
};

/**
 * Grid 3 Colunas Compacto
 * Ideal para 15-30 imagens
 * Estilo: Moderno
 */
export const grid3ColCompacto: CapaTemplate = {
    id: 'grid-3col-compacto',
    name: 'Grid 3 Colunas Compacto',
    description: 'Layout compacto para muitas imagens',
    minImages: 15,
    maxImages: 30,
    style: 'modern',
    etiquetaPosition: 'top',
    preview: '/templates/previews/grid-3col.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo): CanvasLayout => {
        const width = 2400;
        const margin = 40; // Reduzido de 80
        const gap = 15; // Reduzido de 30
        const imageSize = (width - margin * 2 - gap * 2) / 3;
        const headerHeight = 400;

        const rows = Math.ceil(count / 3);

        // Altura dinâmica
        const height = margin + headerHeight + (rows * (imageSize + gap)) + margin;

        const elements: CanvasElement[] = [];

        // Gerar grid 3 colunas
        for (let i = 0; i < count; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: margin + col * (imageSize + gap),
                y: margin + headerHeight + row * (imageSize + gap),
                width: imageSize,
                height: imageSize,
                zIndex: 1,
            });
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
                y: margin + (headerHeight - 280) / 2,
                width: width - margin * 2,
                height: 280,
            },
        };
    },
};

// Export all templates
export const builtinCapaTemplates: CapaTemplate[] = [
    grid2ColEtiquetaCentro,
    gridVerticalElegante,
    grid3ColCompacto,
];
