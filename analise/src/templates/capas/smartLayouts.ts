import type { CapaTemplate, ImageFile, ProductInfo, CanvasLayout, CanvasElement } from '../../types';

/**
 * Smart Grid Adaptive
 * Adapta-se perfeitamente a qualquer quantidade de imagens (1-20)
 * Estilo: Clean/Professional
 */
export const smartGridAdaptive: CapaTemplate = {
    id: 'smart-grid-adaptive',
    name: 'Smart Grid (Auto)',
    description: 'Layout inteligente que se adapta à quantidade de imagens',
    minImages: 1,
    maxImages: 50,
    style: 'modern',
    etiquetaPosition: 'center',
    preview: '/templates/previews/smart-grid.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const margin = 100;
        const gap = 20;

        const elements: CanvasElement[] = [];
        const availableWidth = width - (margin * 2);
        const availableHeight = height - (margin * 2);

        // Lógica Adaptativa Baseada na Contagem
        if (count === 1) {
            // 1. Single Hero
            elements.push({
                type: 'image',
                imageUrl: images[0].url,
                x: margin,
                y: margin,
                width: availableWidth,
                height: availableHeight,
                zIndex: 1
            });
        }
        else if (count <= 4) {
            // 2-4: Layouts de Destaque
            if (count === 2) {
                // Split Vertical
                const itemWidth = (availableWidth - gap) / 2;
                images.forEach((img, i) => {
                    elements.push({
                        type: 'image',
                        imageUrl: img.url,
                        x: margin + (i * (itemWidth + gap)),
                        y: margin,
                        width: itemWidth,
                        height: availableHeight,
                        zIndex: 1
                    });
                });
            } else if (count === 3) {
                // 1 Big Left, 2 Small Right
                const bigWidth = (availableWidth - gap) * 0.6;
                const smallWidth = (availableWidth - gap) * 0.4;
                const smallHeight = (availableHeight - gap) / 2;

                // Big
                elements.push({
                    type: 'image',
                    imageUrl: images[0].url,
                    x: margin,
                    y: margin,
                    width: bigWidth,
                    height: availableHeight,
                    zIndex: 1
                });

                // Smalls
                [1, 2].forEach((idx, i) => {
                    elements.push({
                        type: 'image',
                        imageUrl: images[idx].url,
                        x: margin + bigWidth + gap,
                        y: margin + (i * (smallHeight + gap)),
                        width: smallWidth,
                        height: smallHeight,
                        zIndex: 1
                    });
                });
            } else {
                // 4: 2x2 Grid
                const itemW = (availableWidth - gap) / 2;
                const itemH = (availableHeight - gap) / 2;
                images.forEach((img, i) => {
                    const col = i % 2;
                    const row = Math.floor(i / 2);
                    elements.push({
                        type: 'image',
                        imageUrl: img.url,
                        x: margin + (col * (itemW + gap)),
                        y: margin + (row * (itemH + gap)),
                        width: itemW,
                        height: itemH,
                        zIndex: 1
                    });
                });
            }
        }
        else if (count <= 9) {
            // 5-9: Grids Balanceados
            // Determinar melhor grid (ex: 6 -> 2x3, 9 -> 3x3)
            let cols = 2;
            if (count >= 7) cols = 3;

            // Se for 5 ou 7 (ímpares chatos), usar layout "Hero + Grid"
            if (count === 5 || count === 7) {
                const heroHeight = availableHeight * 0.5;
                const gridHeight = availableHeight * 0.5 - gap;

                // Hero (Top)
                elements.push({
                    type: 'image',
                    imageUrl: images[0].url,
                    x: margin,
                    y: margin,
                    width: availableWidth,
                    height: heroHeight,
                    zIndex: 1
                });

                // Grid (Bottom)
                const remaining = count - 1;
                const gridCols = Math.ceil(remaining / 2); // ex: 4 -> 2, 6 -> 3
                const itemW = (availableWidth - (gap * (gridCols - 1))) / gridCols;
                // const itemH = gridHeight; // Uma linha só se possível, ou duas

                // Simplificação: Grid inferior de 1 ou 2 linhas
                // Para 5 (1 hero + 4): 4 em baixo (1 linha) ou 2x2
                // Vamos fazer grid uniforme em baixo
                const bottomRows = Math.ceil(remaining / gridCols);
                const bottomItemH = (gridHeight - (gap * (bottomRows - 1))) / bottomRows;

                for (let i = 1; i < count; i++) {
                    const gridIdx = i - 1;
                    const col = gridIdx % gridCols;
                    const row = Math.floor(gridIdx / gridCols);

                    elements.push({
                        type: 'image',
                        imageUrl: images[i].url,
                        x: margin + (col * (itemW + gap)),
                        y: margin + heroHeight + gap + (row * (bottomItemH + gap)),
                        width: itemW,
                        height: bottomItemH,
                        zIndex: 1
                    });
                }
            } else {
                // Grid Uniforme (6, 8, 9)
                const rows = Math.ceil(count / cols);
                const itemW = (availableWidth - (gap * (cols - 1))) / cols;
                const itemH = (availableHeight - (gap * (rows - 1))) / rows;

                images.forEach((img, i) => {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    elements.push({
                        type: 'image',
                        imageUrl: img.url,
                        x: margin + (col * (itemW + gap)),
                        y: margin + (row * (itemH + gap)),
                        width: itemW,
                        height: itemH,
                        zIndex: 1
                    });
                });
            }
        }
        else {
            // 10+: Masonry Denso ou Grid Uniforme
            // Para garantir que nada seja cortado demais, Grid Uniforme é mais seguro para grandes quantidades
            const cols = count >= 16 ? 4 : 3;
            const rows = Math.ceil(count / cols);

            const itemW = (availableWidth - (gap * (cols - 1))) / cols;
            const itemH = (availableHeight - (gap * (rows - 1))) / rows;

            images.forEach((img, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                elements.push({
                    type: 'image',
                    imageUrl: img.url,
                    x: margin + (col * (itemW + gap)),
                    y: margin + (row * (itemH + gap)),
                    width: itemW,
                    height: itemH,
                    zIndex: 1
                });
            });
        }

        return {
            width,
            height,
            background: {
                type: 'image', // Usar a primeira imagem como fundo borrado (contextual)
                imageUrl: images[0].url,
                opacity: 0.2 // Bem suave
            },
            elements,
            etiqueta: {
                style: 'premium-gold', // Novo estilo premium
                mainText: productInfo.name,
                subText: productInfo.subtitle || `${count} Arquivos`,
                x: margin,
                y: (height - 300) / 2, // Centralizado verticalmente por padrão
                width: availableWidth,
                height: 300
            }
        };
    },
};

/**
 * Organic Masonry
 * Encaixe perfeito sem buracos (Bin Packing simplificado)
 */
export const organicMasonry: CapaTemplate = {
    id: 'organic-masonry',
    name: 'Organic Masonry',
    description: 'Encaixe orgânico sem espaços vazios',
    minImages: 5,
    maxImages: 20,
    style: 'modern',
    etiquetaPosition: 'floating',
    preview: '/templates/previews/masonry.jpg',

    layoutFn: (images: ImageFile[], _count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const margin = 60;
        const gap = 20;

        // Algoritmo simples de colunas (Waterfall)
        const numCols = 3;
        const colWidth = (width - (margin * 2) - (gap * (numCols - 1))) / numCols;
        const colHeights = new Array(numCols).fill(margin);

        const elements: CanvasElement[] = [];

        images.forEach((img, _i) => {
            // Encontrar coluna mais curta
            const minH = Math.min(...colHeights);
            const colIdx = colHeights.indexOf(minH);

            // Altura proporcional (aspect ratio)
            // Limitando altura máxima para não ficar muito linguiça
            const aspectRatio = img.width / img.height;
            let itemHeight = colWidth / aspectRatio;

            // Clamp height (min 200, max 600)
            itemHeight = Math.max(200, Math.min(itemHeight, 600));

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: margin + (colIdx * (colWidth + gap)),
                y: colHeights[colIdx],
                width: colWidth,
                height: itemHeight,
                zIndex: 1,
                shadow: {
                    color: 'rgba(0,0,0,0.1)',
                    blur: 10,
                    offsetX: 2,
                    offsetY: 2
                }
            });

            colHeights[colIdx] += itemHeight + gap;
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F8F9FA'
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 400,
                y: height - 400,
                width: 800,
                height: 250
            }
        };
    }
};

export const smartCapaTemplates: CapaTemplate[] = [
    smartGridAdaptive,
    organicMasonry
];
