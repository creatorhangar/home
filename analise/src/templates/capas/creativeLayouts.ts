import type { CapaTemplate, ImageFile, ProductInfo, CanvasLayout, CanvasElement } from '../../types';

/**
 * Livro Aberto - estilo scrapbook
 * Ideal para 10-20 imagens
 * Estilo: Vintage/Playful
 */
export const livroAberto: CapaTemplate = {
    id: 'livro-aberto',
    name: 'Livro Aberto',
    description: 'Layout estilo livro aberto com vista de páginas',
    minImages: 10,
    maxImages: 20,
    style: 'vintage',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/livro-aberto.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const pageMargin = 60; // Reduzido
        const imageSize = 350; // Aumentado
        const gap = 20; // Reduzido

        // Cálculo de altura dinâmica
        // const imagesPerSide = Math.ceil(count / 2);
        // const rowsPerSide = Math.ceil(imagesPerSide / 3); // 3 colunas por página
        // const contentHeight = rowsPerSide * (imageSize + gap);
        // const height = Math.max(1600, contentHeight + 600); // Mínimo 1600
        // Use passed height but ensure content fits or scales?
        // For "Livro Aberto", it's a specific look. Let's use passed height.

        const elements: CanvasElement[] = [];

        // Fundo do livro (sombra)
        elements.push({
            type: 'shape',
            x: 100,
            y: 100,
            width: width - 200,
            height: height - 200,
            fill: '#000000',
            opacity: 0.1,
            zIndex: 0,
            shadow: {
                color: 'rgba(0,0,0,0.3)',
                blur: 40,
                offsetX: 0,
                offsetY: 20,
            },
        });

        // Fundo do livro (páginas)
        elements.push({
            type: 'shape',
            x: 50,
            y: 50,
            width: width - 100,
            height: height - 100,
            fill: '#FFFEF9',
            stroke: '#D4C5B0',
            strokeWidth: 2,
            zIndex: 1,
        });

        // Linha central (dobra do livro)
        elements.push({
            type: 'shape',
            x: width / 2 - 2,
            y: 50,
            width: 4,
            height: height - 100,
            fill: '#E0D5C0',
            zIndex: 2,
        });

        const leftImages = Math.ceil(count / 2);

        // Página esquerda
        let leftX = pageMargin + 100;
        let leftY = pageMargin + 100;
        for (let i = 0; i < leftImages; i++) {
            if (i > 0 && i % 3 === 0) {
                leftX = pageMargin + 100;
                leftY += imageSize + gap;
            }

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: leftX,
                y: leftY,
                width: imageSize,
                height: imageSize,
                rotation: Math.random() * 4 - 2, // Rotação mais sutil
                zIndex: 3 + i,
                shadow: {
                    color: 'rgba(0,0,0,0.15)',
                    blur: 10,
                    offsetX: 2,
                    offsetY: 4,
                },
            });

            leftX += imageSize + gap;
        }

        // Página direita
        let rightX = width / 2 + pageMargin;
        let rightY = pageMargin + 100;
        for (let i = leftImages; i < count; i++) {
            const idx = i - leftImages;
            if (idx > 0 && idx % 3 === 0) {
                rightX = width / 2 + pageMargin;
                rightY += imageSize + gap;
            }

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: rightX,
                y: rightY,
                width: imageSize,
                height: imageSize,
                rotation: Math.random() * 4 - 2,
                zIndex: 3 + i,
                shadow: {
                    color: 'rgba(0,0,0,0.15)',
                    blur: 10,
                    offsetX: 2,
                    offsetY: 4,
                },
            });

            rightX += imageSize + gap;
        }

        return {
            width,
            height,
            background: {
                type: 'gradient',
                gradient: {
                    type: 'radial',
                    colors: ['#E8E0D5', '#D4C5B0'],
                },
            },
            elements,
            etiqueta: {
                style: 'vintage-badge',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 300,
                y: height - 250,
                width: 600,
                height: 200,
            },
        };
    },
};

/**
 * Empilhado com Rotação
 * Ideal para 5-8 imagens
 * Estilo: Playful
 */
export const empilhadoRotacao: CapaTemplate = {
    id: 'empilhado-rotacao',
    name: 'Empilhado com Rotação',
    description: 'Imagens empilhadas com rotações dinâmicas',
    minImages: 5,
    maxImages: 8,
    style: 'playful',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/empilhado.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const imageSize = 800; // Aumentado
        const startY = 200;
        const offset = 150; // Mais sobreposição vertical

        // Altura dinâmica
        // const height = startY + (count * offset) + imageSize + 300;
        // Use passed height

        const elements: CanvasElement[] = [];
        const centerX = width / 2;

        for (let i = 0; i < count; i++) {
            const rotation = (i - count / 2) * 6;
            const yPos = startY + i * offset;

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: centerX - imageSize / 2,
                y: yPos,
                width: imageSize,
                height: imageSize,
                rotation: rotation,
                zIndex: i,
                shadow: {
                    color: 'rgba(0,0,0,0.2)',
                    blur: 30,
                    offsetX: rotation / 2,
                    offsetY: 15,
                },
            });
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F7F6F3',
            },
            elements,
            etiqueta: {
                style: 'rustic-label',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: centerX - 350,
                y: height - 300,
                width: 700,
                height: 250,
            },
        };
    },
};

/**
 * Fan/Leque
 * Ideal para 6-12 imagens
 * Estilo: Elegant
 */
export const fanLeque: CapaTemplate = {
    id: 'fan-leque',
    name: 'Fan/Leque',
    description: 'Disposição em leque elegante',
    minImages: 6,
    maxImages: 12,
    style: 'elegant',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/fan.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const imageWidth = 450;
        const imageHeight = 650;
        const centerX = width / 2;
        const centerY = 800;
        const radius = 550;

        const elements: CanvasElement[] = [];
        const angleStep = 90 / (count - 1);
        const startAngle = -45;

        for (let i = 0; i < count; i++) {
            const angle = startAngle + angleStep * i;
            const rad = (angle * Math.PI) / 180;

            // Posição em arco
            const x = centerX + Math.sin(rad) * radius - imageWidth / 2;
            const y = centerY - Math.cos(rad) * radius * 0.4;

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: x,
                y: y,
                width: imageWidth,
                height: imageHeight,
                rotation: angle,
                zIndex: count - i,
                shadow: {
                    color: 'rgba(0,0,0,0.25)',
                    blur: 25,
                    offsetX: Math.sin(rad) * 10,
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
                    colors: ['#FDFCFB', '#E8E7E4'],
                    angle: 135,
                },
            },
            elements,
            etiqueta: {
                style: 'elegant-frame',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: centerX - 400,
                y: height - 300,
                width: 800,
                height: 250,
            },
        };
    },
};

/**
 * Polaroid Stack
 * Ideal para 6-12 imagens
 * Estilo: Vintage
 */
export const polaroidStack: CapaTemplate = {
    id: 'polaroid-stack',
    name: 'Polaroid Stack',
    description: 'Estilo polaroid empilhadas',
    minImages: 6,
    maxImages: 12,
    style: 'vintage',
    etiquetaPosition: 'top',
    preview: '/templates/previews/polaroid.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const polaroidWidth = 500;
        const polaroidHeight = 620;
        const imageSize = 460;
        const margin = 40;

        const cols = 3;
        // const rows = Math.ceil(count / cols);

        // Altura dinâmica
        // const height = margin + 300 + (rows * (polaroidHeight - 100)) + margin; // -100 para overlap
        // Use passed height

        const elements: CanvasElement[] = [];

        for (let i = 0; i < count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Randomização controlada
            const randomX = (Math.random() - 0.5) * 40;
            const randomY = (Math.random() - 0.5) * 40;

            const x = margin + col * (polaroidWidth + 40) + randomX;
            const y = margin + 300 + row * (polaroidHeight - 100) + randomY;

            // Frame polaroid
            elements.push({
                type: 'shape',
                x: x,
                y: y,
                width: polaroidWidth,
                height: polaroidHeight,
                fill: '#FFFFFF',
                zIndex: i * 2,
                rotation: Math.random() * 6 - 3,
                shadow: {
                    color: 'rgba(0,0,0,0.2)',
                    blur: 5, // Reduced from 20 for performance
                    offsetX: 5,
                    offsetY: 8,
                },
            });

            // Imagem dentro do frame
            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: x + 20,
                y: y + 20,
                width: imageSize,
                height: imageSize,
                zIndex: i * 2 + 1,
                rotation: Math.random() * 6 - 3,
            });
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#EAE4D8',
            },
            elements,
            etiqueta: {
                style: 'vintage-badge',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 400,
                y: margin,
                width: 800,
                height: 250,
            },
        };
    },
};

export const creativeCapaTemplates: CapaTemplate[] = [
    livroAberto,
    empilhadoRotacao,
    fanLeque,
    polaroidStack,
];
