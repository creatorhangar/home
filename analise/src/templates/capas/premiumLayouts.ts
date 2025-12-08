import type { CapaTemplate, ImageFile, ProductInfo, CanvasLayout, CanvasElement } from '../../types';
import { createWashiTape, createPin, createShadow, randomRange, randomChoice, createRNG } from './layoutUtils';


/**
 * Digital Paper Strips
 * Inspirado na referência de Natal (Boho Christmas)
 * Tiras verticais que mostram o padrão completo
 */
export const digitalPaperStrips: CapaTemplate = {
    id: 'digital-paper-strips',
    name: 'Digital Paper Strips',
    description: 'Tiras verticais ideais para papéis digitais e texturas',
    minImages: 4,
    maxImages: 12,
    style: 'elegant',
    etiquetaPosition: 'center',
    preview: '/templates/previews/strips.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        // Configuração das tiras
        const stripCount = Math.min(count, 6); // Máximo 6 tiras para não ficar muito fino
        const stripWidth = width / stripCount;
        const showText = options?.showText ?? true;

        const elements: CanvasElement[] = [];

        for (let i = 0; i < stripCount; i++) {
            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: i * stripWidth,
                y: 0,
                width: stripWidth,
                height: height,
                zIndex: 1,
                // Sem crop para mostrar o padrão inteiro verticalmente
                // Mas se a imagem for muito larga, vai cortar as laterais (o que é esperado para tiras)
            });

            // Sombra interna entre as tiras para dar profundidade
            if (i > 0) {
                elements.push({
                    type: 'shape',
                    x: i * stripWidth,
                    y: 0,
                    width: 2,
                    height: height,
                    fill: 'rgba(0,0,0,0.1)',
                    zIndex: 2
                });
            }
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#FFFFFF',
            },
            elements,
            etiqueta: showText ? {
                style: 'elegant-frame', // Será renderizado como Scalloped/Vintage
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 400,
                y: height / 2 - 200,
                width: 800,
                height: 400,
                colors: {
                    bg: '#F9F5E9', // Papel creme
                    text: '#2C1810', // Marrom escuro
                    border: '#D4C5B0',
                    accent: '#8B4513'
                }
            } : undefined,
        };
    },
};

/**
 * Sticker Scatter (Pilha de Adesivos)
 * Inspirado na referência "Faith Labels"
 * Elementos espalhados com sombras realistas
 */
export const stickerScatter: CapaTemplate = {
    id: 'sticker-scatter',
    name: 'Sticker Scatter (Pilha)',
    description: 'Elementos espalhados com efeito de adesivo realista',
    minImages: 8,
    maxImages: 20,
    style: 'playful',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/stickers.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        const elements: CanvasElement[] = [];
        const rng = options?.seed ? createRNG(options.seed) : Math.random;
        const showText = options?.showText ?? true;

        // Spacing controls the "spread" area
        // Low spacing = clustered in center
        // High spacing = spread to edges
        const spacing = options?.spacing ?? 0.5;

        // Margin decreases as spacing increases
        // If text is hidden, we can use more vertical space at the bottom
        const bottomMarginFactor = showText ? 1 : 0.5;

        const maxMargin = width * 0.3; // Very clustered
        const minMargin = 50; // Very spread
        const margin = maxMargin - (spacing * (maxMargin - minMargin));

        const safeW = width - margin * 2;
        const safeH = height - margin * 2;

        // Adjust safe area center if text is hidden to use full height
        const centerY = showText ? (height - margin * 2) / 2 + margin : height / 2;

        for (let i = 0; i < count; i++) {
            // Random position within safe area
            // We use a slight grid bias to ensure coverage but add heavy jitter for "pile" look
            const col = i % 3;
            const row = Math.floor(i / 3);
            const gridW = safeW / 3;
            const gridH = safeH / Math.ceil(count / 3);

            const baseX = margin + (col * gridW) + (gridW / 2);
            // Adjust Y to be centered relative to the adjusted center
            const baseY = margin + (row * gridH) + (gridH / 2);

            // Jitter increases with spacing too? Or maybe constant?
            // Let's make jitter proportional to grid size
            const jitterX = (rng() - 0.5) * gridW * (0.8 + spacing * 0.5);
            const jitterY = (rng() - 0.5) * gridH * (0.8 + spacing * 0.5);

            const x = baseX + jitterX;
            const y = baseY + jitterY;

            const rotation = (rng() - 0.5) * 45; // +/- 22.5 deg
            const scale = 0.8 + rng() * 0.4;

            const itemWidth = 350 * scale;
            const itemHeight = itemWidth; // Stickers usually square/roundish

            // Sticker Border (White)
            elements.push({
                type: 'shape',
                x: x - itemWidth / 2 - 10,
                y: y - itemHeight / 2 - 10,
                width: itemWidth + 20,
                height: itemHeight + 20,
                fill: '#FFFFFF',
                rotation: rotation,
                zIndex: i * 2, // Order matters for "pile" effect
                rx: 15,
                ry: 15,
                shadow: {
                    color: 'rgba(0,0,0,0.2)',
                    blur: 15,
                    offsetX: 5,
                    offsetY: 8
                }
            });

            // Image
            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: x - itemWidth / 2,
                y: y - itemHeight / 2,
                width: itemWidth,
                height: itemHeight,
                rotation: rotation,
                zIndex: i * 2 + 1,
            });
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#E8DCC4',
            },
            elements,
            etiqueta: showText ? {
                style: 'vintage-badge',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - (width * 0.35),
                y: height - (height * 0.25),
                width: width * 0.7,
                height: height * 0.2,
                colors: {
                    bg: '#759895',
                    text: '#FFFFFF',
                    border: '#FFFFFF',
                    accent: '#2F4F4F'
                }
            } : undefined,
        };
    },
};

// import { createShadow, randomRange } from './layoutUtils'; // Moved to top

/**
 * Journal Spread
 * Inspirado na referência de caderno aberto
 * Visual de mesa de trabalho
 */
export const journalSpread: CapaTemplate = {
    id: 'journal-spread',
    name: 'Journal Spread',
    description: 'Visual de caderno aberto com colunas verticais e sobreposição',
    minImages: 6,
    maxImages: 15,
    style: 'vintage',
    etiquetaPosition: 'corner',
    preview: '/templates/previews/journal.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        const elements: CanvasElement[] = [];
        const rng = options?.seed ? createRNG(options.seed) : Math.random;
        const showText = options?.showText ?? true;

        // Spacing controls overlap
        // 0 = lots of overlap (cluttered)
        // 1 = no overlap (clean)
        const spacing = options?.spacing ?? 0.5;

        // 1. Background (Open Journal Look)
        // We simulate a double-page spread
        const bookWidth = width * 0.95;
        const bookHeight = height * 0.95;
        const bookX = (width - bookWidth) / 2;
        const bookY = (height - bookHeight) / 2;

        // Book Cover/Shadow
        elements.push({
            type: 'shape',
            x: bookX,
            y: bookY,
            width: bookWidth,
            height: bookHeight,
            fill: '#3E2723',
            zIndex: 0,
            rx: 5,
            ry: 5,
            shadow: createShadow(30, 0, 20, 0.4)
        });

        // Pages
        elements.push({
            type: 'shape',
            x: bookX + 10,
            y: bookY + 5,
            width: bookWidth - 20,
            height: bookHeight - 10,
            fill: '#F5F5DC', // Cream paper
            zIndex: 1
        });

        // Center Fold
        elements.push({
            type: 'shape',
            x: width / 2 - 2,
            y: bookY + 5,
            width: 4,
            height: bookHeight - 10,
            fill: 'rgba(0,0,0,0.1)',
            zIndex: 2
        });

        // 2. Content Layout - Vertical Columns with Overlap
        // We split the book into 2 pages, each having 1 or 2 columns
        const leftPageX = bookX + 40;
        const rightPageX = width / 2 + 20;
        const pageWidth = (bookWidth / 2) - 60;

        // Distribute images between left and right pages
        const leftCount = Math.ceil(count / 2);
        const rightCount = count - leftCount;

        const layoutPage = (startIndex: number, pageCount: number, startX: number) => {
            const cols = 2; // 2 columns per page
            const colWidth = pageWidth / cols;
            const colY = [bookY + 80, bookY + 80]; // Track Y position for each column

            for (let i = 0; i < pageCount; i++) {
                const imgIdx = startIndex + i;
                if (imgIdx >= images.length) break;

                // Select column (shortest first or alternating)
                const col = i % cols;

                const x = startX + (col * colWidth) + (colWidth * 0.05); // slight padding
                const y = colY[col];

                // Random height for "handmade" feel
                const imgWidth = colWidth * 0.9;
                const aspectRatio = randomRange(0.8, 1.4, rng); // Varying aspect ratios
                const imgHeight = imgWidth * aspectRatio;

                const rotation = randomRange(-3, 3, rng);

                // Image Frame (Polaroid or cutout style)
                elements.push({
                    type: 'shape',
                    x: x - 10,
                    y: y - 10,
                    width: imgWidth + 20,
                    height: imgHeight + 40, // More space at bottom for "caption" look
                    fill: '#FFFFFF',
                    rotation: rotation,
                    zIndex: 10 + imgIdx,
                    shadow: createShadow(5, 2, 3, 0.15)
                });

                // Image
                elements.push({
                    type: 'image',
                    imageUrl: images[imgIdx].url,
                    x: x,
                    y: y,
                    width: imgWidth,
                    height: imgHeight,
                    rotation: rotation,
                    zIndex: 11 + imgIdx,
                });

                // Washi Tape at top
                if (rng() > 0.3) {
                    elements.push({
                        type: 'shape',
                        x: x + imgWidth / 2 - 30,
                        y: y - 15,
                        width: 60,
                        height: 20,
                        fill: 'rgba(200, 100, 100, 0.6)', // Reddish tape
                        rotation: rotation + randomRange(-5, 5, rng),
                        zIndex: 12 + imgIdx
                    });
                }

                // Update column Y with overlap
                // Overlap: subtract some amount from height
                // Spacing 0 = 80px overlap
                // Spacing 1 = -20px overlap (gap)
                const maxOverlap = 80;
                const minOverlap = -20;
                const overlap = maxOverlap - (spacing * (maxOverlap - minOverlap));

                colY[col] += (imgHeight - overlap);
            }
        };

        layoutPage(0, leftCount, leftPageX);
        layoutPage(leftCount, rightCount, rightPageX);

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#D7CCC8', // Desk surface
            },
            elements,
            etiqueta: showText ? {
                style: 'rustic-label',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width - 600,
                y: height - 200,
                width: 500,
                height: 150,
                colors: {
                    bg: '#FFF8E1',
                    text: '#3E2723',
                    border: '#8D6E63',
                    accent: '#8D6E63'
                }
            } : undefined,
        };
    },
};



/**
 * Floating Elements (Elementos Flutuantes)
 * Ideal para PNGs transparentes (stickers, objetos isolados)
 * Sem bordas ou fundos nos elementos
 */
export const floatingElements: CapaTemplate = {
    id: 'floating-elements',
    name: 'Floating Elements (PNG)',
    description: 'Elementos flutuantes ideais para imagens com fundo transparente',
    minImages: 5,
    maxImages: 15,
    style: 'playful',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/floating.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        const elements: CanvasElement[] = [];
        const rng = options?.seed ? createRNG(options.seed) : Math.random;
        const showText = options?.showText ?? true;

        // Grid orgânico
        const cols = 4;
        const rows = Math.ceil(count / cols);
        const cellWidth = width / cols;
        // Use more height if text is hidden
        const effectiveHeight = showText ? height * 0.8 : height;
        const cellHeight = effectiveHeight / rows;

        for (let i = 0; i < count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Randomização
            const offsetX = (rng() - 0.5) * (cellWidth * 0.5);
            const offsetY = (rng() - 0.5) * (cellHeight * 0.5);
            const rotation = (rng() - 0.5) * 40; // Rotação maior

            // Tamanho variável
            const scale = 0.7 + rng() * 0.5; // 0.7x a 1.2x
            const itemWidth = Math.min(cellWidth, 400) * scale;
            const itemHeight = itemWidth;

            const x = (col * cellWidth) + (cellWidth / 2) - (itemWidth / 2) + offsetX;
            const y = (row * cellHeight) + (cellHeight / 2) - (itemHeight / 2) + offsetY;

            // Imagem (com shadow direto, sem background shape)
            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: x,
                y: y,
                width: itemWidth,
                height: itemHeight,
                rotation: rotation,
                zIndex: i,
                fit: 'contain', // Importante para não cortar PNGs
                shadow: {
                    color: 'rgba(0,0,0,0.25)',
                    blur: 10,
                    offsetX: 5,
                    offsetY: 8
                }
            });
        }

        return {
            width,
            height,
            background: {
                type: 'gradient',
                gradient: {
                    type: 'radial',
                    colors: ['#FFFFFF', '#FFFFFF'], // White background as requested
                },
            },
            elements,
            etiqueta: showText ? {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - (width * 0.4),
                y: height - (height * 0.2) - 50,
                width: width * 0.8,
                height: height * 0.2,
            } : undefined,
        };
    },
};

// import { createWashiTape, createPin, createShadow, randomRange, randomChoice } from './layoutUtils'; // Moved to top

// ... existing imports ...

/**
 * Washi Tape Chaos
 * Imagens "coladas" com fita washi colorida
 */
export const washiTapeChaos: CapaTemplate = {
    id: 'washi-tape-chaos',
    name: 'Washi Tape Chaos',
    description: 'Imagens coladas com fitas washi coloridas em estilo scrapbook',
    minImages: 4,
    maxImages: 10,
    style: 'playful',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/washi.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        const elements: CanvasElement[] = [];
        const rng = options?.seed ? createRNG(options.seed) : Math.random;
        const showText = options?.showText ?? true;

        // Background: Mesa de madeira ou papel craft
        // Usando cor sólida por enquanto, mas ideal seria textura

        // Grid solto
        const cols = count <= 6 ? 2 : 3;
        const rows = Math.ceil(count / cols);
        const margin = 100;
        const availableW = width - (margin * 2);
        // Use more height if text is hidden
        const effectiveHeight = showText ? height - (margin * 2) - 150 : height - (margin * 2);
        const availableH = effectiveHeight;

        const cellW = availableW / cols;
        const cellH = availableH / rows;

        images.forEach((img, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Posição base com jitter
            const cx = margin + (col * cellW) + (cellW / 2) + randomRange(-30, 30, rng);
            const cy = margin + (row * cellH) + (cellH / 2) + randomRange(-30, 30, rng);

            const rotation = randomRange(-15, 15, rng);
            const scale = randomRange(0.9, 1.1, rng);

            // Tamanho da foto (polaroid style ou full bleed)
            // Vamos fazer estilo foto impressa com borda branca
            const photoW = Math.min(cellW, cellH) * 0.8 * scale;
            const photoH = photoW; // Quadrado

            const x = cx - photoW / 2;
            const y = cy - photoH / 2;

            // 1. Foto Base (Papel Branco)
            elements.push({
                type: 'shape',
                x: x - 15,
                y: y - 15,
                width: photoW + 30,
                height: photoH + 30,
                fill: '#FFFFFF',
                rotation: rotation,
                zIndex: i * 10,
                shadow: createShadow(10, 2, 4, 0.2)
            });

            // 2. Imagem
            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: x,
                y: y,
                width: photoW,
                height: photoH,
                rotation: rotation,
                zIndex: i * 10 + 1
            });

            // 3. Washi Tape (1 ou 2 pedaços)
            const numTapes = rng() > 0.7 ? 2 : 1;
            for (let t = 0; t < numTapes; t++) {
                // Posição relativa ao topo ou cantos
                const tapeW = 120;
                const tapeX = x + (photoW * 0.5) - (tapeW * 0.5) + randomRange(-40, 40, rng);
                // const tapeY = y - 25 + (t * (photoH + 20)); // Unused

                // Se for 1 fita, geralmente no topo
                const finalTapeY = t === 0 ? y - 15 : y + photoH - 10;

                elements.push(createWashiTape(
                    tapeX,
                    finalTapeY,
                    tapeW,
                    rotation + randomRange(-5, 5, rng)
                ));
            }
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F0EAD6', // Eggshell
            },
            elements,
            etiqueta: showText ? {
                style: 'rustic-label',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 350,
                y: height - 250,
                width: 700,
                height: 200,
            } : undefined,
        };
    }
};

/**
 * Pinboard Aesthetic
 * Fotos fixadas com percevejos em quadro de cortiça
 */
export const pinboardAesthetic: CapaTemplate = {
    id: 'pinboard-aesthetic',
    name: 'Pinboard Aesthetic',
    description: 'Mural de inspiração com fotos fixadas por alfinetes',
    minImages: 6,
    maxImages: 15,
    style: 'vintage',
    etiquetaPosition: 'center',
    preview: '/templates/previews/pinboard.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        const elements: CanvasElement[] = [];
        const rng = options?.seed ? createRNG(options.seed) : Math.random;
        const showText = options?.showText ?? true;

        // Layout Scatter Organizado
        const cols = 4;
        const rows = Math.ceil(count / cols);
        const cellW = width / cols;
        const cellH = height / rows;

        images.forEach((img, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const cx = (col * cellW) + (cellW / 2) + randomRange(-40, 40, rng);
            const cy = (row * cellH) + (cellH / 2) + randomRange(-40, 40, rng);
            const rotation = randomRange(-10, 10, rng);

            const w = Math.min(cellW, cellH) * 0.75;
            const h = w;

            const x = cx - w / 2;
            const y = cy - h / 2;

            // Foto com sombra curva (simulando papel levantado)
            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: x,
                y: y,
                width: w,
                height: h,
                rotation: rotation,
                zIndex: i * 5,
                shadow: createShadow(15, 5, 10, 0.3)
            });

            // Pin no topo central
            // Calcular posição do pin após rotação é complexo sem matrizes, 
            // mas para rotações pequenas, o centro do topo aproximado funciona.
            // Top center relative to unrotated rect: (x + w/2, y + 10)
            // Vamos simplificar e colocar o pin visualmente no topo

            elements.push(createPin(
                cx - 10 + randomRange(-5, 5, rng), // Perto do centro X
                y + 10 + randomRange(-5, 5, rng)   // Topo Y
            ));
        });

        return {
            width,
            height,
            background: {
                type: 'pattern', // Idealmente textura de cortiça
                color: '#D2B48C', // Tan/Cortiça
            },
            elements,
            etiqueta: showText ? {
                style: 'vintage-badge',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - (width * 0.35),
                y: height / 2 - (height * 0.15),
                width: width * 0.7,
                height: height * 0.3,
                colors: {
                    bg: '#FFF8DC',
                    text: '#000000',
                    border: '#000000',
                    accent: '#FF4500'
                }
            } : undefined,
        };
    }
};

/**
 * Torn Paper Collage
 * Bordas rasgadas e sobreposição
 */
export const tornPaperCollage: CapaTemplate = {
    id: 'torn-paper-collage',
    name: 'Torn Paper Collage',
    description: 'Colagem artística com efeito de papel rasgado',
    minImages: 5,
    maxImages: 12,
    style: 'modern',
    etiquetaPosition: 'floating',
    preview: '/templates/previews/torn.jpg',

    layoutFn: (images: ImageFile[], _count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        const elements: CanvasElement[] = [];
        const rng = options?.seed ? createRNG(options.seed) : Math.random;
        const showText = options?.showText ?? true;

        // Grid irregular
        // Vamos usar um Masonry simples mas com overlap
        const cols = 3;
        const colW = width / cols;
        const colHeights = [0, 0, 0];

        images.forEach((img, i) => {
            const col = i % cols;
            const x = col * colW;
            const y = colHeights[col] - 50; // Overlap vertical de 50px

            const w = colW; // Full width da coluna
            const h = w * (randomRange(0.8, 1.4, rng)); // Altura variada

            // Adicionar efeito de rasgo seria via clipPath ou máscara SVG no renderer.
            // Como ainda não temos máscara de rasgo procedural, vamos simular com shapes nas bordas ou apenas rotação/overlap.
            // Por enquanto, vamos fazer overlap agressivo e rotação.

            const rotation = randomRange(-3, 3, rng);

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: x + randomRange(-20, 20, rng), // Jitter horizontal
                y: y,
                width: w * 0.9, // Um pouco menor que a coluna para ver o fundo
                height: h,
                rotation: rotation,
                zIndex: i,
                shadow: createShadow(10, 0, 5, 0.2)
            });

            // "Fita" ou elemento de colagem conectando
            if (rng() > 0.6) {
                elements.push(createWashiTape(
                    x + w / 2 - 50,
                    y + h - 15,
                    100,
                    randomRange(-10, 10, rng)
                ));
            }

            colHeights[col] = y + h;
        });

        // Fill empty space at bottom if needed by repeating images
        const minHeight = height * 0.8;
        for (let c = 0; c < cols; c++) {
            let safety = 0;
            while (colHeights[c] < minHeight && safety < 5) {
                const img = images[Math.floor(rng() * images.length)];
                const x = c * colW;
                const y = colHeights[c] - 50;
                const w = colW;
                const h = w * (randomRange(0.8, 1.4, rng));
                const rotation = randomRange(-3, 3, rng);

                elements.push({
                    type: 'image',
                    imageUrl: img.url,
                    x: x + randomRange(-20, 20, rng),
                    y: y,
                    width: w * 0.9,
                    height: h,
                    rotation: rotation,
                    zIndex: elements.length,
                    shadow: createShadow(10, 0, 5, 0.2)
                });
                colHeights[c] = y + h;
                safety++;
            }
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#1a1a1a', // Dark background para contraste
            },
            elements,
            etiqueta: showText ? {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width - 700,
                y: height - 250,
                width: 600,
                height: 200,
                colors: {
                    bg: '#FFFFFF',
                    text: '#000000',
                    border: 'transparent',
                    accent: '#666'
                }
            } : undefined,
        };
    }
};

/**
 * Scattered Nature
 * Elementos jogados naturalmente
 */
export const scatteredNature: CapaTemplate = {
    id: 'scattered-nature',
    name: 'Scattered Nature',
    description: 'Elementos distribuídos naturalmente como folhas ao vento',
    minImages: 5,
    maxImages: 15,
    style: 'playful',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/scattered.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        const elements: CanvasElement[] = [];
        const rng = options?.seed ? createRNG(options.seed) : Math.random;
        const showText = options?.showText ?? true;

        // Simple scatter algorithm
        const cols = 3;
        const rows = Math.ceil(count / cols);
        const cellW = width / cols;
        const cellH = height / rows;

        images.forEach((img, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Random position within cell
            const x = (col * cellW) + (rng() * (cellW - 200));
            const y = (row * cellH) + (rng() * (cellH - 200));

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: x,
                y: y,
                width: 250,
                height: 250,
                rotation: (rng() * 30) - 15,
                zIndex: i,
                shadow: createShadow(10, 5, 5, 0.2)
            });
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F5F5DC' // Beige/Nature
            },
            elements,
            etiqueta: showText ? {
                style: 'rustic-label',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width - 400,
                y: height - 200,
                width: 350,
                height: 150
            } : undefined,
        };
    }
};

/**
 * Golden Spiral (Espiral Dourada)
 * Distribuição matemática baseada na sequência de Fibonacci/Logarítmica
 * Controlada pelo slider de espaçamento (abertura da espiral)
 */
export const goldenSpiral: CapaTemplate = {
    id: 'golden-spiral',
    name: 'Golden Spiral',
    description: 'Distribuição elegante em espiral áurea. Use o slider para abrir/fechar.',
    minImages: 5,
    maxImages: 20,
    style: 'elegant',
    etiquetaPosition: 'corner',
    preview: '/templates/previews/spiral.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        const elements: CanvasElement[] = [];
        const spacing = options?.spacing ?? 0.5;

        // Spiral Parameters
        const cx = width / 2;
        const cy = height / 2;

        // const b = 0.15 + (spacing * 0.2); // Unused
        // const a = 50 + (spacing * 100); // Unused

        // Sort images? Maybe largest first?
        // For spiral, usually center is small or large. Let's put newest/best at center?
        // Or just iterate.

        for (let i = 0; i < count; i++) {
            // Angle theta
            // We need to distribute them along the curve.
            // Approximation: theta increases by a "golden angle" or fixed step?
            // Golden Angle = 137.5 degrees ~ 2.4 radians
            const angleStep = 2.4;
            const theta = i * angleStep;

            // Logarithmic Spiral equation: r = a * e^(b * theta)
            // But for even distribution, we might want Archimedean or just Golden Angle placement
            // Let's use Golden Angle placement (Phyllotaxis) which is very pleasing
            // r = c * sqrt(i)

            // Modified for "Spiral" look (more linear expansion)
            // r = spacing_factor * theta

            const spread = 200 + (spacing * 300); // Spread factor
            const r = spread * Math.sqrt(i + 1) * 0.6; // Sqrt keeps density uniform-ish

            const x = cx + r * Math.cos(theta);
            const y = cy + r * Math.sin(theta);

            // Size varies with distance?
            // Maybe center items larger? Or smaller?
            // Let's make them slightly random but generally consistent
            const scale = 1 - (i * 0.02); // Slightly smaller as they go out?
            const baseSize = 300;
            const w = baseSize * Math.max(0.6, scale);
            const h = w;

            const rotation = (theta * 180 / Math.PI) + 90; // Rotate to face center? or random?

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: x - w / 2,
                y: y - h / 2,
                width: w,
                height: h,
                rotation: rotation, // Tangential rotation
                zIndex: count - i, // Center on top
                shadow: createShadow(15, 5, 5, 0.3),
                // Circular mask would be cool here, but rect is fine for now
                rx: 10,
                ry: 10
            });
        }

        return {
            width,
            height,
            background: {
                type: 'gradient',
                gradient: {
                    type: 'radial',
                    colors: ['#FFFFFF', '#F0F0F0']
                }
            },
            elements,
            etiqueta: {
                style: 'premium-gold',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width - 500,
                y: height - 200,
                width: 400,
                height: 150,
            }
        };
    }
};

/**
 * Flowing Ribbon
 * Imagens seguem uma curva sinuosa
 */
export const flowingRibbon: CapaTemplate = {
    id: 'flowing-ribbon',
    name: 'Flowing Ribbon',
    description: 'Imagens fluindo em uma curva elegante',
    minImages: 6,
    maxImages: 15,
    style: 'elegant',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/ribbon.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Curva senoidal simples
        // y = A * sin(B * x + C) + D
        const amplitude = height * 0.25;
        const frequency = (Math.PI * 1.5) / width; // 1.5 ciclos
        const phase = 0;
        const verticalShift = height / 2;

        const stepX = (width - 200) / (count - 1);
        const startX = 100;

        images.forEach((img, i) => {
            const x = startX + (i * stepX);
            const y = amplitude * Math.sin(frequency * x + phase) + verticalShift;

            // Tamanho varia com a posição (maior no centro)
            // Distância do centro normalizada (0 a 1)
            const distCenter = Math.abs((width / 2) - x) / (width / 2);
            const scale = 1.2 - (distCenter * 0.5); // 1.2 no centro, 0.7 nas bordas

            const w = 300 * scale;
            const h = 400 * scale;

            // Rotação segue a tangente da curva? Ou aleatória?
            // Tangente: derivada de sin é cos
            const tangent = amplitude * frequency * Math.cos(frequency * x + phase);
            const angle = Math.atan(tangent) * (180 / Math.PI);

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: x - w / 2,
                y: y - h / 2,
                width: w,
                height: h,
                rotation: angle + randomRange(-5, 5),
                zIndex: i,
                shadow: createShadow(15, 5, 5, 0.25)
            });
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#FAFAFA'
            },
            elements,
            etiqueta: {
                style: 'simple-banner',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 350,
                y: height - 250,
                width: 700,
                height: 180
            }
        };
    }
};

/**
 * Organic Cluster
 * Grupos de imagens "grudadas"
 */
export const organicCluster: CapaTemplate = {
    id: 'organic-cluster',
    name: 'Organic Cluster',
    description: 'Grupos de imagens organizadas organicamente',
    minImages: 8,
    maxImages: 20,
    style: 'modern',
    etiquetaPosition: 'center',
    preview: '/templates/previews/cluster.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Definir clusters (2 ou 3 grupos principais)
        const numClusters = count >= 12 ? 3 : 2;
        const imagesPerCluster = Math.ceil(count / numClusters);

        // Centros dos clusters
        const centers = numClusters === 2
            ? [{ x: width * 0.3, y: height * 0.4 }, { x: width * 0.7, y: height * 0.6 }]
            : [{ x: width * 0.25, y: height * 0.3 }, { x: width * 0.75, y: height * 0.3 }, { x: width * 0.5, y: height * 0.7 }];

        let imgIdx = 0;
        centers.forEach((center, cIdx) => {
            const clusterImages = images.slice(imgIdx, imgIdx + imagesPerCluster);
            imgIdx += imagesPerCluster;

            // Distribuir imagens ao redor do centro
            clusterImages.forEach((img, i) => {
                const angle = (i / clusterImages.length) * Math.PI * 2;
                const radius = 150 + randomRange(0, 50);

                const x = center.x + Math.cos(angle) * radius;
                const y = center.y + Math.sin(angle) * radius;

                const w = 250;
                const h = 250;

                elements.push({
                    type: 'image',
                    imageUrl: img.url,
                    x: x - w / 2,
                    y: y - h / 2,
                    width: w,
                    height: h,
                    rotation: randomRange(-10, 10),
                    zIndex: cIdx * 10 + i,
                    shadow: createShadow(10, 2, 2, 0.15)
                });
            });
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#FFFFFF'
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 300,
                y: height / 2 - 100, // No meio, possivelmente sobrepondo levemente
                width: 600,
                height: 200,
                colors: {
                    bg: 'rgba(255,255,255,0.95)',
                    text: '#000',
                    border: '#000',
                    accent: '#000'
                }
            }
        };
    }
};

/**
 * Magazine Spread
 * Layout editorial tipo Vogue/Kinfolk
 */
export const magazineSpread: CapaTemplate = {
    id: 'magazine-spread',
    name: 'Magazine Spread',
    description: 'Layout editorial sofisticado com foco em tipografia e espaço',
    minImages: 6,
    maxImages: 12,
    style: 'elegant',
    etiquetaPosition: 'corner',
    preview: '/templates/previews/magazine.jpg',

    layoutFn: (images: ImageFile[], _count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Grid assimétrico
        // 1 Imagem Hero (Esquerda ou Topo)
        // Resto em grid menor

        const margin = 80;
        const gap = 20;
        const availableW = width - (margin * 2);
        const availableH = height - (margin * 2);

        // Hero ocupa 60% da largura
        const heroW = (availableW - gap) * 0.6;
        const sideW = (availableW - gap) * 0.4;

        // Hero Image
        elements.push({
            type: 'image',
            imageUrl: images[0].url,
            x: margin,
            y: margin,
            width: heroW,
            height: availableH,
            zIndex: 1,
            shadow: createShadow(20, 0, 10, 0.1)
        });

        // Side Grid
        const remainingImages = images.slice(1);
        // const sideCols = 1; // Unused
        const sideRows = Math.min(remainingImages.length, 4);
        const itemH = (availableH - (gap * (sideRows - 1))) / sideRows;

        remainingImages.slice(0, sideRows).forEach((img, i) => {
            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: margin + heroW + gap,
                y: margin + (i * (itemH + gap)),
                width: sideW,
                height: itemH,
                zIndex: 1
            });
        });

        // Elementos tipográficos decorativos (números, linhas)
        elements.push({
            type: 'text',
            text: 'COLLECTION',
            x: margin - 40, // Fora da margem, vertical? Fabric não suporta vertical text fácil, então rotação
            y: height - margin,
            fontSize: 120,
            fontFamily: 'Playfair Display',
            color: 'rgba(0,0,0,0.05)',
            rotation: -90,
            width: 500,
            height: 150,
            zIndex: 0
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#FFFFFF'
            },
            elements,
            etiqueta: {
                style: 'elegant-frame',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: margin + 50,
                y: height - 300,
                width: heroW - 100,
                height: 200,
                colors: {
                    bg: '#FFFFFF',
                    text: '#000000',
                    border: '#000000',
                    accent: '#666'
                }
            }
        };
    }
};

/**
 * Masonry Pinterest
 * Colunas com alturas variadas
 */
export const masonryPinterest: CapaTemplate = {
    id: 'masonry-pinterest',
    name: 'Masonry Pinterest',
    description: 'Grid estilo Pinterest com colunas de alturas variadas',
    minImages: 8,
    maxImages: 20,
    style: 'modern',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/pinterest.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        const margin = 60;
        const gap = 20;
        const cols = count >= 12 ? 4 : 3;
        const colW = (width - (margin * 2) - (gap * (cols - 1))) / cols;

        const colHeights = new Array(cols).fill(margin);

        images.forEach((img) => {
            // Escolher coluna menor
            const minH = Math.min(...colHeights);
            const colIdx = colHeights.indexOf(minH);

            // Altura aleatória para simular aspect ratios variados se as imagens forem quadradas
            // Se tivermos as dimensões reais da imagem, usaríamos aqui.
            // Como img.width/height podem ser do arquivo original, vamos usar.
            const aspect = img.width / img.height;
            let h = colW / aspect;

            // Clamp para não ficar extremo
            h = Math.max(colW * 0.5, Math.min(h, colW * 1.8));

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: margin + (colIdx * (colW + gap)),
                y: colHeights[colIdx],
                width: colW,
                height: h,
                zIndex: 1,
                rx: 10, // Cantos arredondados modernos
                ry: 10
            });

            colHeights[colIdx] += h + gap;
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F5F5F5'
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 350,
                y: height - 250,
                width: 700,
                height: 180,
                colors: {
                    bg: '#FFFFFF',
                    text: '#333',
                    border: 'transparent',
                    accent: '#FF0055'
                }
            }
        };
    }
};

/**
 * Bento Box
 * Grid organizado tipo Apple/Bento
 */
export const bentoBox: CapaTemplate = {
    id: 'bento-box',
    name: 'Bento Box',
    description: 'Grid modular moderno e organizado',
    minImages: 6,
    maxImages: 16,
    style: 'modern',
    etiquetaPosition: 'center',
    preview: '/templates/previews/bento.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        const margin = 60;
        const gap = 20;
        const availableW = width - (margin * 2);
        const availableH = height - (margin * 2);

        // Grid 4x4 base
        const cols = 4;
        const rows = 4;
        const cellW = (availableW - (gap * (cols - 1))) / cols;
        const cellH = (availableH - (gap * (rows - 1))) / rows;

        // Mapa de ocupação
        const grid = Array(rows).fill(null).map(() => Array(cols).fill(false));

        let imgIdx = 0;

        // Tentar colocar blocos grandes primeiro (2x2)
        // Apenas se tivermos imagens suficientes
        const numBig = Math.min(2, Math.floor(count / 4));

        for (let i = 0; i < numBig; i++) {
            // Encontrar espaço 2x2 livre
            let placed = false;
            for (let r = 0; r < rows - 1 && !placed; r++) {
                for (let c = 0; c < cols - 1 && !placed; c++) {
                    if (!grid[r][c] && !grid[r + 1][c] && !grid[r][c + 1] && !grid[r + 1][c + 1]) {
                        // Place 2x2
                        elements.push({
                            type: 'image',
                            imageUrl: images[imgIdx].url,
                            x: margin + (c * (cellW + gap)),
                            y: margin + (r * (cellH + gap)),
                            width: cellW * 2 + gap,
                            height: cellH * 2 + gap,
                            zIndex: 1,
                            rx: 20,
                            ry: 20
                        });
                        grid[r][c] = true; grid[r + 1][c] = true; grid[r][c + 1] = true; grid[r + 1][c + 1] = true;
                        imgIdx++;
                        placed = true;
                    }
                }
            }
        }

        // Preencher resto com 1x1
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!grid[r][c] && imgIdx < count) {
                    elements.push({
                        type: 'image',
                        imageUrl: images[imgIdx].url,
                        x: margin + (c * (cellW + gap)),
                        y: margin + (r * (cellH + gap)),
                        width: cellW,
                        height: cellH,
                        zIndex: 1,
                        rx: 15,
                        ry: 15
                    });
                    grid[r][c] = true;
                    imgIdx++;
                }
            }
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#111111' // Dark mode bento
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 300,
                y: height / 2 - 100,
                width: 600,
                height: 200,
                colors: {
                    bg: 'rgba(255,255,255,0.1)', // Glassmorphism
                    text: '#FFFFFF',
                    border: 'rgba(255,255,255,0.2)',
                    accent: '#007AFF'
                }
            }
        };
    }
};

/**
 * Sticker Bomb
 * Caos organizado de stickers
 */
export const stickerBomb: CapaTemplate = {
    id: 'sticker-bomb',
    name: 'Sticker Bomb',
    description: 'Explosão de stickers sobrepostos com energia vibrante',
    minImages: 10,
    maxImages: 25,
    style: 'playful',
    etiquetaPosition: 'center',
    preview: '/templates/previews/bomb.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Preencher o fundo completamente com stickers
        // Algoritmo de preenchimento aleatório denso

        // Camadas de fundo (menores, mais escuras/desfocadas?)
        // Camadas de frente (maiores, destaque)

        const layers = 3;
        const imagesPerLayer = Math.ceil(count / layers);

        for (let l = 0; l < layers; l++) {
            for (let i = 0; i < imagesPerLayer; i++) {
                const imgIdx = (l * imagesPerLayer + i) % count;
                const img = images[imgIdx];

                const x = Math.random() * width;
                const y = Math.random() * height;

                const scaleBase = 0.5 + (l * 0.3); // Camadas superiores maiores
                const scale = randomRange(scaleBase, scaleBase + 0.3);

                const w = 300 * scale;
                const h = w;

                const rotation = randomRange(-45, 45);

                // Borda branca grossa (Sticker effect)
                elements.push({
                    type: 'shape',
                    x: x - w / 2 - 10,
                    y: y - h / 2 - 10,
                    width: w + 20,
                    height: h + 20,
                    fill: '#FFFFFF',
                    rotation: rotation,
                    zIndex: l * 100 + i * 2,
                    shadow: createShadow(10, 2, 5, 0.3)
                });

                elements.push({
                    type: 'image',
                    imageUrl: img.url,
                    x: x - w / 2,
                    y: y - h / 2,
                    width: w,
                    height: h,
                    rotation: rotation,
                    zIndex: l * 100 + i * 2 + 1
                });
            }
        }

        return {
            width,
            height,
            background: {
                type: 'gradient',
                gradient: {
                    type: 'linear',
                    colors: ['#FF00CC', '#333399'], // Cyberpunk/Vibrant
                    angle: 45
                }
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 400,
                y: height / 2 - 150,
                width: 800,
                height: 300,
                colors: {
                    bg: '#FFFFFF',
                    text: '#000000',
                    border: '#000000',
                    accent: '#FF00CC'
                }
            }
        };
    }
};

/**
 * Doodle Frame
 * Molduras desenhadas à mão
 */
export const doodleFrame: CapaTemplate = {
    id: 'doodle-frame',
    name: 'Doodle Frame',
    description: 'Molduras divertidas desenhadas à mão',
    minImages: 5,
    maxImages: 10,
    style: 'playful',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/doodle.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Grid solto
        const cols = count <= 6 ? 2 : 3;
        const rows = Math.ceil(count / cols);
        const margin = 100;
        const cellW = (width - margin * 2) / cols;
        const cellH = (height - margin * 2) / rows;

        images.forEach((img, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const cx = margin + (col * cellW) + (cellW / 2);
            const cy = margin + (row * cellH) + (cellH / 2);

            const w = Math.min(cellW, cellH) * 0.7;
            const h = w;

            const rotation = randomRange(-5, 5);

            const x = cx - w / 2;
            const y = cy - h / 2;

            // Moldura Doodle (SVG Path simulado)
            // Vamos fazer um retângulo "tremido"
            const doodlePath = `
                M ${x - 10} ${y - 10} 
                Q ${x + w / 2} ${y - 20} ${x + w + 10} ${y - 5}
                Q ${x + w + 20} ${y + h / 2} ${x + w + 5} ${y + h + 10}
                Q ${x + w / 2} ${y + h + 20} ${x - 5} ${y + h + 5}
                Q ${x - 20} ${y + h / 2} ${x - 10} ${y - 10}
            `;

            elements.push({
                type: 'decoration',
                svgContent: doodlePath,
                x: 0, y: 0, width: 1, height: 1, // Path absoluto
                fill: 'transparent',
                stroke: randomChoice(['#FF6B6B', '#4ECDC4', '#FFE66D']),
                strokeWidth: 5,
                zIndex: i * 2 + 1,
                rotation: rotation
            });

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: x,
                y: y,
                width: w,
                height: h,
                rotation: rotation,
                zIndex: i * 2
            });
        });

        return {
            width,
            height,
            background: {
                type: 'pattern', // Grid paper
                color: '#FFFFFF'
            },
            elements,
            etiqueta: {
                style: 'rustic-label',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 350,
                y: height - 250,
                width: 700,
                height: 200,
                colors: {
                    bg: '#FF6B6B',
                    text: '#FFFFFF',
                    border: '#FFFFFF',
                    accent: '#FFE66D'
                }
            }
        };
    }
};

/**
 * Scrapbook Page
 * Layout de álbum de recortes tradicional
 */
export const scrapbookPage: CapaTemplate = {
    id: 'scrapbook-page',
    name: 'Scrapbook Page',
    description: 'Página de álbum de memórias com elementos decorativos',
    minImages: 6,
    maxImages: 12,
    style: 'vintage',
    etiquetaPosition: 'corner',
    preview: '/templates/previews/scrapbook.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Fundo de papel envelhecido
        // Grid solto com rotação e "cantoneiras"

        const cols = 3;
        const rows = Math.ceil(count / cols);
        const margin = 120;
        const cellW = (width - margin * 2) / cols;
        const cellH = (height - margin * 2) / rows;

        images.forEach((img, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const cx = margin + (col * cellW) + (cellW / 2);
            const cy = margin + (row * cellH) + (cellH / 2);

            const w = Math.min(cellW, cellH) * 0.8;
            const h = w;

            const rotation = randomRange(-8, 8);

            const x = cx - w / 2;
            const y = cy - h / 2;

            // Cantoneiras de foto (Triângulos pretos nos cantos)
            // Simulado com shapes pequenos
            // const cornerSize = 40; // Unused
            // const corners = [ // Unused
            // const corners = []; // Unused

            // Imagem
            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: x,
                y: y,
                width: w,
                height: h,
                rotation: rotation,
                zIndex: i * 5,
                shadow: createShadow(5, 1, 1, 0.2)
            });

            // Cantoneiras (renderizadas APÓS a imagem, mas com mesma rotação do grupo idealmente)
            // Como não temos grupos, vamos simplificar e não rotacionar as cantoneiras junto com a imagem por enquanto,
            // ou rotacionar manualmente. Vamos pular cantoneiras complexas e usar uma moldura simples.

            elements.push({
                type: 'shape',
                x: x - 5,
                y: y - 5,
                width: w + 10,
                height: h + 10,
                fill: 'transparent',
                stroke: '#F5F5DC', // Moldura clara
                strokeWidth: 10,
                rotation: rotation,
                zIndex: i * 5 + 1
            });

        });

        return {
            width,
            height,
            background: {
                type: 'solid', // Idealmente textura de papel velho
                color: '#D2B48C'
            },
            elements,
            etiqueta: {
                style: 'vintage-badge',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width - 700,
                y: height - 250,
                width: 600,
                height: 200,
                colors: {
                    bg: '#8B4513',
                    text: '#FFFFFF',
                    border: '#D2B48C',
                    accent: '#DEB887'
                }
            }
        };
    }
};

/**
 * Film Negatives
 * Tiras de negativo fotográfico
 */
export const filmNegatives: CapaTemplate = {
    id: 'film-negatives',
    name: 'Film Negatives',
    description: 'Tiras de filme fotográfico clássico',
    minImages: 8,
    maxImages: 16,
    style: 'vintage',
    etiquetaPosition: 'center',
    preview: '/templates/previews/film.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Tiras horizontais
        const stripHeight = 350;
        const gap = 50;
        const numStrips = Math.ceil(count / 4); // 4 fotos por tira aprox

        const totalH = numStrips * stripHeight + (numStrips - 1) * gap;
        const startY = (height - totalH) / 2;

        let imgIdx = 0;

        for (let s = 0; s < numStrips; s++) {
            const stripY = startY + s * (stripHeight + gap);

            // Fundo da tira (Preto)
            elements.push({
                type: 'shape',
                x: 0,
                y: stripY,
                width: width,
                height: stripHeight,
                fill: '#000000',
                zIndex: s * 10,
                shadow: createShadow(10, 0, 5, 0.3)
            });

            // Perfurações (Brancas)
            const perfSize = 20;
            const perfGap = 30;
            const numPerfs = Math.ceil(width / (perfSize + perfGap));

            for (let p = 0; p < numPerfs; p++) {
                const px = p * (perfSize + perfGap);
                // Top perfs
                elements.push({ type: 'shape', x: px, y: stripY + 10, width: perfSize, height: perfSize, fill: '#FFFFFF', zIndex: s * 10 + 1, rx: 2, ry: 2 });
                // Bottom perfs
                elements.push({ type: 'shape', x: px, y: stripY + stripHeight - 30, width: perfSize, height: perfSize, fill: '#FFFFFF', zIndex: s * 10 + 1, rx: 2, ry: 2 });
            }

            // Fotos na tira
            const photosInStrip = 4;
            const photoMargin = 40; // Margem vertical dentro da tira
            const photoH = stripHeight - (photoMargin * 2);
            const photoW = photoH * 1.5; // 3:2 aspect ratio
            const photoGap = 40;

            const totalPhotosW = photosInStrip * photoW + (photosInStrip - 1) * photoGap;
            const startX = (width - totalPhotosW) / 2;

            for (let p = 0; p < photosInStrip; p++) {
                if (imgIdx >= count) break;

                const px = startX + p * (photoW + photoGap);

                elements.push({
                    type: 'image',
                    imageUrl: images[imgIdx].url,
                    x: px,
                    y: stripY + photoMargin,
                    width: photoW,
                    height: photoH,
                    zIndex: s * 10 + 2
                });

                imgIdx++;
            }
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#333333'
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 300,
                y: height - 150, // Bem embaixo
                width: 600,
                height: 120,
                colors: {
                    bg: '#000000',
                    text: '#FFFFFF',
                    border: '#FFFFFF',
                    accent: '#FFFFFF'
                }
            }
        };
    }
};

/**
 * Swiss Grid
 * Grid rigoroso e matemático
 */
export const swissGrid: CapaTemplate = {
    id: 'swiss-grid',
    name: 'Swiss Grid',
    description: 'Grid modernista com tipografia forte e alinhamento perfeito',
    minImages: 6,
    maxImages: 16,
    style: 'minimal',
    etiquetaPosition: 'top',
    preview: '/templates/previews/swiss.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        const margin = 100;
        const gap = 40; // Gaps maiores
        const cols = 4;
        const rows = 4;

        const cellW = (width - margin * 2 - gap * (cols - 1)) / cols;
        const cellH = (height - margin * 2 - gap * (rows - 1)) / rows;

        // Header tipográfico (Ocupa 1 ou 2 linhas do topo)
        // Vamos fazer um layout onde o texto ocupa o topo esquerdo

        // Texto
        elements.push({
            type: 'text',
            text: productInfo.name.toUpperCase(),
            x: margin,
            y: margin,
            fontSize: 80,
            fontFamily: 'Helvetica', // Ou Arial se não tiver
            color: '#000000',
            width: width - margin * 2,
            align: 'left',
            zIndex: 10,
            height: 100 // Added height
        });

        // Linha divisória
        elements.push({
            type: 'shape',
            x: margin,
            y: margin + 120,
            width: width - margin * 2,
            height: 4,
            fill: '#000000',
            zIndex: 10
        });

        // Grid de imagens começando abaixo do header
        const startRow = 1;
        let imgIdx = 0;

        for (let r = startRow; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (imgIdx >= count) break;

                const x = margin + c * (cellW + gap);
                const y = margin + r * (cellH + gap) + 50; // Offset do header

                elements.push({
                    type: 'image',
                    imageUrl: images[imgIdx].url,
                    x: x,
                    y: y,
                    width: cellW,
                    height: cellH,
                    zIndex: 1,
                    // Sem sombra, flat design
                });
                imgIdx++;
            }
        }

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F0F0F0'
            },
            elements,
            etiqueta: {
                style: 'modern-minimal', // Na verdade o texto já está no layout, mas mantemos etiqueta para consistência ou escondemos
                mainText: '', // Hack para não mostrar etiqueta padrão se quisermos só o texto do layout
                subText: '',
                x: 0, y: 0, width: 0, height: 0
            }
        };
    }
};

/**
 * Single Row Showcase
 * Uma única linha horizontal
 */
export const singleRowShowcase: CapaTemplate = {
    id: 'single-row',
    name: 'Single Row Showcase',
    description: 'Linha única horizontal elegante e minimalista',
    minImages: 3,
    maxImages: 6,
    style: 'minimal',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/single.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        const margin = 100;
        const gap = 50;
        const availableW = width - margin * 2;

        const itemW = (availableW - (gap * (count - 1))) / count;
        const itemH = itemW * 1.5; // Retrato

        const startY = (height - itemH) / 2;

        images.forEach((img, i) => {
            const x = margin + i * (itemW + gap);

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: x,
                y: startY,
                width: itemW,
                height: itemH,
                zIndex: 1,
                shadow: createShadow(20, 0, 10, 0.15)
            });
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#FFFFFF'
            },
            elements,
            etiqueta: {
                style: 'simple-banner',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 350,
                y: height - 300,
                width: 700,
                height: 150
            }
        };
    }
};

/**
 * Floating Cards
 * Cards brancos flutuando com sombra
 */
export const floatingCards: CapaTemplate = {
    id: 'floating-cards',
    name: 'Floating Cards',
    description: 'Cards brancos flutuantes com imagens inseridas',
    minImages: 6,
    maxImages: 12,
    style: 'minimal',
    etiquetaPosition: 'center',
    preview: '/templates/previews/cards.jpg',

    layoutFn: (images: ImageFile[], _count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        const cols = 3;
        // const rows = Math.ceil(count / cols); // Unused
        const margin = 100;
        const gap = 60;

        const cellW = (width - margin * 2 - gap * (cols - 1)) / cols;
        const cellH = cellW * 1.2;

        images.forEach((img, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const x = margin + col * (cellW + gap);
            const y = margin + row * (cellH + gap);

            // Card Branco
            elements.push({
                type: 'shape',
                x: x,
                y: y,
                width: cellW,
                height: cellH,
                fill: '#FFFFFF',
                rx: 20,
                ry: 20,
                zIndex: i * 2,
                shadow: createShadow(25, 0, 15, 0.1)
            });

            // Imagem (com padding)
            const pad = 20;
            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: x + pad,
                y: y + pad,
                width: cellW - pad * 2,
                height: cellH - pad * 2 - 40, // Espaço para texto embaixo se quisesse
                zIndex: i * 2 + 1,
                rx: 10,
                ry: 10
            });
        });

        return {
            width,
            height,
            background: {
                type: 'gradient',
                gradient: {
                    type: 'linear',
                    colors: ['#F5F7FA', '#C3CFE2'], // Gradient suave
                    angle: 135
                }
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 300,
                y: height - 200,
                width: 600,
                height: 150,
                colors: {
                    bg: '#FFFFFF',
                    text: '#333',
                    border: 'transparent',
                    accent: '#000'
                }
            }
        };
    }
};

/**
 * Seasonal Wreath
 * Imagens dispostas em círculo/coroa
 */
export const seasonalWreath: CapaTemplate = {
    id: 'seasonal-wreath',
    name: 'Seasonal Wreath',
    description: 'Imagens organizadas em formato de guirlanda',
    minImages: 8,
    maxImages: 16,
    style: 'elegant',
    etiquetaPosition: 'center',
    preview: '/templates/previews/wreath.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;

        const angleStep = (Math.PI * 2) / count;

        images.forEach((img, i) => {
            const angle = i * angleStep;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const w = 300;
            const h = 300;

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: x - w / 2,
                y: y - h / 2,
                width: w,
                height: h,
                rotation: (angle * 180 / Math.PI) + 90, // Apontando para fora ou dentro
                zIndex: i,
                rx: 150, // Círculo
                ry: 150,
                shadow: createShadow(10, 2, 2, 0.2)
            });
        });

        // Elemento central (Texto ou Logo)
        // Já coberto pela etiqueta centralizada

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#FFFFFF'
            },
            elements,
            etiqueta: {
                style: 'classic-ornament',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: centerX - 300,
                y: centerY - 150,
                width: 600,
                height: 300,
                colors: {
                    bg: 'rgba(255,255,255,0.9)',
                    text: '#2F4F4F',
                    border: '#2F4F4F',
                    accent: '#5F9EA0'
                }
            }
        };
    }
};

/**
 * Mood Board
 * Mix de fotos inspiração
 */
export const moodBoard: CapaTemplate = {
    id: 'mood-board',
    name: 'Mood Board',
    description: 'Composição criativa de inspiração com sobreposições',
    minImages: 10,
    maxImages: 20,
    style: 'modern',
    etiquetaPosition: 'bottom',
    preview: '/templates/previews/mood.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Grid denso com algumas imagens maiores
        // Usar algoritmo de Masonry ou Packing
        // Vamos usar um grid 4x4 base com variações de tamanho e posição

        const cols = 4;
        const rows = Math.ceil(count / cols);
        const cellW = width / cols;
        const cellH = height / rows;

        images.forEach((img, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // Variação de tamanho e posição
            const scale = randomRange(0.9, 1.5); // Alguns maiores
            const w = cellW * scale;
            const h = cellH * scale; // Manter proporção da célula ou da imagem?

            // Centralizado na célula com jitter forte
            const cx = (col * cellW) + (cellW / 2) + randomRange(-cellW * 0.3, cellW * 0.3);
            const cy = (row * cellH) + (cellH / 2) + randomRange(-cellH * 0.3, cellH * 0.3);

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: cx - w / 2,
                y: cy - h / 2,
                width: w,
                height: h,
                zIndex: i,
                rotation: randomRange(-5, 5),
                shadow: createShadow(15, 0, 5, 0.15)
            });

            // Paleta de cores (bolinhas) decorativas
            if (Math.random() > 0.8) {
                elements.push({
                    type: 'shape',
                    x: cx + w / 2 - 20,
                    y: cy + h / 2 - 20,
                    width: 40,
                    height: 40,
                    fill: randomChoice(['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD']),
                    rx: 20, ry: 20,
                    zIndex: i + 100
                });
            }
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#F9F9F9'
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: 'MOOD BOARD',
                x: width - 500,
                y: height - 200,
                width: 450,
                height: 150
            }
        };
    }
};

/**
 * Timeline Layout
 * Linha do tempo visual
 */
export const timelineLayout: CapaTemplate = {
    id: 'timeline-layout',
    name: 'Timeline / Process',
    description: 'Sequência narrativa ou passo-a-passo',
    minImages: 4,
    maxImages: 8,
    style: 'modern',
    etiquetaPosition: 'top',
    preview: '/templates/previews/timeline.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Linha central sinuosa ou reta
        // Vamos fazer reta diagonal ou zig-zag

        const margin = 150;
        const availableW = width - margin * 2;
        const availableH = height - margin * 2;

        // Pontos na linha
        const stepX = availableW / (count - 1);
        const stepY = availableH / (count - 1);

        // Linha conectora
        let pathData = `M ${margin} ${margin}`;
        for (let i = 1; i < count; i++) {
            pathData += ` L ${margin + i * stepX} ${margin + i * stepY}`;
        }

        elements.push({
            type: 'decoration',
            svgContent: pathData,
            x: 0, y: 0, width: 1, height: 1,
            stroke: '#333',
            strokeWidth: 4,
            fill: 'transparent',
            zIndex: 0
        });

        images.forEach((img, i) => {
            const cx = margin + i * stepX;
            const cy = margin + i * stepY;

            const size = 300;

            // Alternar lados
            // const offsetX = 0; // Unused // Na linha diagonal
            // const offsetY = 0; // Unused

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: cx - size / 2,
                y: cy - size / 2,
                width: size,
                height: size,
                zIndex: 1,
                rx: 150, // Círculo
                ry: 150,
                shadow: createShadow(10, 2, 2, 0.2),
                stroke: '#FFFFFF',
                strokeWidth: 10
            });

            // Número do passo
            elements.push({
                type: 'shape',
                x: cx - size / 2,
                y: cy - size / 2,
                width: 60,
                height: 60,
                fill: '#333',
                rx: 30, ry: 30,
                zIndex: 2
            });

            elements.push({
                type: 'text',
                text: `${i + 1}`,
                x: cx - size / 2 + 20,
                y: cy - size / 2 + 10,
                fontSize: 30,
                color: '#FFF',
                zIndex: 3,
                width: 100, // Added width
                height: 40  // Added height
            });
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#FFFFFF'
            },
            elements,
            etiqueta: {
                style: 'simple-banner',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width - 600,
                y: 100,
                width: 500,
                height: 150
            }
        };
    }
};

/**
 * Hexagon Tessellation
 * Hexágonos encaixados
 */
export const hexagonTessellation: CapaTemplate = {
    id: 'hexagon-tessellation',
    name: 'Hexagon Grid',
    description: 'Mosaico geométrico de hexágonos',
    minImages: 7,
    maxImages: 19,
    style: 'modern',
    etiquetaPosition: 'center',
    preview: '/templates/previews/hex.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Hexagon math
        // Width = sqrt(3) * size
        // Height = 2 * size
        // Horizontal spacing = width
        // Vertical spacing = 3/4 * height

        const cols = 3; // Aproximado
        const size = (width / cols) / Math.sqrt(3) * 0.8; // Tamanho do lado
        const hexW = Math.sqrt(3) * size;
        const hexH = 2 * size;

        // const startX = width / 2; // Unused
        // const startY = height / 2; // Unused

        // Coordenadas axiais (q, r) para espiral
        // 0,0 -> centro
        // anel 1 -> 6 vizinhos
        // anel 2 -> 12 vizinhos...

        // Simplificação: Grid retangular com offset
        const gridCols = 4;
        const gridRows = Math.ceil(count / gridCols) + 1;

        const offsetX = (width - (gridCols * hexW)) / 2 + hexW / 2;
        const offsetY = (height - (gridRows * hexH * 0.75)) / 2 + hexH / 2;

        images.forEach((img, i) => {
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);

            const xOffset = (row % 2) * (hexW / 2);

            const cx = offsetX + col * hexW + xOffset;
            const cy = offsetY + row * (hexH * 0.75);

            // Clip Path Hexagonal (Simulado com SVG path no renderer se suportado, ou máscara)
            // Como renderer usa Rect clip, não vai ficar hexágono perfeito sem máscara SVG.
            // Vamos usar um shape Hexagonal com a imagem dentro (Pattern fill) ou máscara.
            // Fabric suporta clipPath com qualquer objeto.
            // O renderer atual usa Rect para clip. Precisamos atualizar renderer para suportar clipPath customizado?
            // Sim, mas por agora vamos usar Rect e rotação ou aceitar quadrado.
            // Ou melhor: Vamos desenhar um shape Hexágono e tentar usar pattern fill se possível, mas o renderer atual não tem pattern fill fácil.
            // Vamos usar a imagem normal e adicionar uma "moldura" hexagonal grossa por cima para mascarar os cantos?
            // Hack: Imagem quadrada, Shape Hexagonal com "furo" transparente e borda grossa da cor do fundo? Não funciona com fundo complexo.

            // Vamos assumir que o renderer vai ser atualizado para suportar Polygon clip ou vamos deixar quadrado por enquanto.
            // Vou deixar quadrado rotacionado 45 graus (diamante) que é mais fácil

            const sizeDim = hexW * 0.7;

            elements.push({
                type: 'image',
                imageUrl: img.url,
                x: cx - sizeDim / 2,
                y: cy - sizeDim / 2,
                width: sizeDim,
                height: sizeDim,
                zIndex: 1,
                rotation: 0, // Hexágono seria ideal
                // Se o renderer suportasse clipPath complexo...
                // Vamos deixar quadrado arredondado
                rx: 20, ry: 20
            });
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#222'
            },
            elements,
            etiqueta: {
                style: 'geometric-tag',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 300,
                y: height - 200,
                width: 600,
                height: 150
            }
        };
    }
};

/**
 * Mosaic Layout
 * Grid denso e artístico com tamanhos variados
 */
export const mosaicLayout: CapaTemplate = {
    id: 'mosaic-layout',
    name: 'Mosaic Art',
    description: 'Mosaico artístico com encaixe perfeito de imagens',
    minImages: 8,
    maxImages: 30,
    style: 'modern',
    etiquetaPosition: 'center',
    preview: '/templates/previews/mosaic.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Spacing: 0 = 0px, 1 = 40px
        const spacingFactor = options?.spacing ?? 0.5;
        const gap = spacingFactor * 40;
        const margin = 60;

        const availableW = width - (margin * 2);
        const availableH = height - (margin * 2);

        // Recursive splitting algorithm
        interface Rect { x: number; y: number; w: number; h: number; }

        let rects: Rect[] = [{ x: margin, y: margin, w: availableW, h: availableH }];

        // Split until we have enough rects
        let safety = 0;
        while (rects.length < count && safety < 100) {
            // Find largest rect
            let maxArea = -1;
            let maxIdx = -1;

            for (let i = 0; i < rects.length; i++) {
                const area = rects[i].w * rects[i].h;
                if (area > maxArea) {
                    maxArea = area;
                    maxIdx = i;
                }
            }

            if (maxIdx === -1) break;

            const target = rects[maxIdx];
            rects.splice(maxIdx, 1);

            // Split
            // Decide split direction based on aspect ratio
            const splitVert = target.w > target.h;

            // Random split point (0.3 to 0.7)
            const splitRatio = 0.3 + (Math.random() * 0.4);

            if (splitVert) {
                const w1 = target.w * splitRatio;
                const w2 = target.w - w1;
                rects.push({ x: target.x, y: target.y, w: w1, h: target.h });
                rects.push({ x: target.x + w1, y: target.y, w: w2, h: target.h });
            } else {
                const h1 = target.h * splitRatio;
                const h2 = target.h - h1;
                rects.push({ x: target.x, y: target.y, w: target.w, h: h1 });
                rects.push({ x: target.x, y: target.y + h1, w: target.w, h: h2 });
            }

            safety++;
        }

        // Assign images
        rects.forEach((r, i) => {
            if (i >= images.length) return;

            elements.push({
                type: 'image',
                imageUrl: images[i].url,
                x: r.x + gap / 2,
                y: r.y + gap / 2,
                width: r.w - gap,
                height: r.h - gap,
                zIndex: 1,
                rx: 4,
                ry: 4
            });
        });

        return {
            width,
            height,
            background: {
                type: 'solid',
                color: '#1a1a1a'
            },
            elements,
            etiqueta: {
                style: 'modern-minimal',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 300,
                y: height / 2 - 100,
                width: 600,
                height: 200,
                colors: {
                    bg: 'rgba(0,0,0,0.7)',
                    text: '#FFF',
                    border: '#FFF',
                    accent: '#FFF'
                }
            }
        };
    }
};

/**
 * Kaleidoscope Layout
 * Padrão simétrico e hipnótico (Mandala)
 */
export const kaleidoscopeLayout: CapaTemplate = {
    id: 'kaleidoscope-layout',
    name: 'Kaleidoscope',
    description: 'Padrão simétrico e hipnótico estilo mandala',
    minImages: 8,
    maxImages: 24,
    style: 'modern', // Changed from 'creative' to valid type
    etiquetaPosition: 'center',
    preview: '/templates/previews/kaleidoscope.jpg',

    layoutFn: (images: ImageFile[], count: number, productInfo: ProductInfo, width: number, height: number, options?: any): CanvasLayout => {
        const elements: CanvasElement[] = [];

        // Spacing controls radius expansion
        const spacing = options?.spacing ?? 0.5;

        const cx = width / 2;
        const cy = height / 2;

        // Number of arms/segments
        const segments = 8;
        const layers = Math.ceil(count / segments);

        let imgIdx = 0;

        for (let l = 0; l < layers; l++) {
            // Radius for this layer
            // Spacing affects how far apart layers are
            const layerRadius = 200 + (l * (300 + (spacing * 100)));

            // Images in this layer
            // If we run out of images, loop back or stop?
            // Let's loop back to create full symmetry

            const layerImagesCount = segments;
            const angleStep = (Math.PI * 2) / layerImagesCount;

            for (let s = 0; s < layerImagesCount; s++) {
                if (imgIdx >= count) imgIdx = 0; // Recycle images for symmetry
                const img = images[imgIdx];

                const angle = s * angleStep;

                const x = cx + Math.cos(angle) * layerRadius;
                const y = cy + Math.sin(angle) * layerRadius;

                // Size decreases or increases?
                // Let's make center smaller, outer larger? Or vice versa.
                const size = 250 + (l * 50);

                // Rotation: point towards center + 90 deg
                const rotation = (angle * 180 / Math.PI) + 90;

                elements.push({
                    type: 'image',
                    imageUrl: img.url,
                    x: x - size / 2,
                    y: y - size / 2,
                    width: size,
                    height: size,
                    rotation: rotation,
                    zIndex: l * 10 + 1,
                    rx: size / 2, // Circle
                    ry: size / 2,
                    shadow: createShadow(10, 0, 10, 0.2)
                });

                // Add a "mirror" element or decoration?
                // For true kaleidoscope, we'd need triangular masking.
                // For now, circular mandala is good.

                imgIdx++;
            }
        }

        return {
            width,
            height,
            background: {
                type: 'gradient',
                gradient: {
                    type: 'radial',
                    colors: ['#220033', '#000000']
                }
            },
            elements,
            etiqueta: {
                style: 'premium-gold',
                mainText: productInfo.name,
                subText: productInfo.subtitle,
                x: width / 2 - 300,
                y: height / 2 - 100,
                width: 600,
                height: 200,
                colors: {
                    bg: 'rgba(0,0,0,0.8)',
                    text: '#FFD700',
                    border: '#FFD700',
                    accent: '#FFF'
                }
            }
        };
    }
};

export const premiumCapaTemplates: CapaTemplate[] = [
    kaleidoscopeLayout,
    mosaicLayout,
    digitalPaperStrips,
    stickerScatter,
    journalSpread,
    floatingElements,
    washiTapeChaos,
    pinboardAesthetic,
    tornPaperCollage,
    scatteredNature,
    flowingRibbon,
    organicCluster,
    magazineSpread,
    masonryPinterest,
    bentoBox,
    stickerBomb,
    doodleFrame,
    scrapbookPage,
    filmNegatives,
    swissGrid,
    singleRowShowcase,
    floatingCards,
    seasonalWreath,
    moodBoard,
    timelineLayout,
    hexagonTessellation
];

