import { Rect, Text, Image as FabricImage, Shadow, Gradient, Path, StaticCanvas } from 'fabric';

import type { CanvasLayout, CanvasElement } from '../../types';
import { LABEL_SHAPES } from './labelShapes';


/**
 * Canvas Renderer - Powered by Fabric.js
 * Renderização profissional com suporte a vetores, sombras reais e manipulação avançada.
 */
export class CanvasRenderer {
    private canvas: StaticCanvas;
    private logicalWidth: number = 1080;
    private logicalHeight: number = 1080;

    constructor() {
        // Cria um canvas virtual (sem anexar ao DOM inicialmente)
        const canvasEl = document.createElement('canvas');
        this.canvas = new StaticCanvas(canvasEl);
    }

    /**
     * Renderiza um layout completo
     */
    async render(layout: CanvasLayout, scale: number = 1): Promise<HTMLCanvasElement> {
        // Store logical dimensions
        this.logicalWidth = layout.width;
        this.logicalHeight = layout.height;

        // Define dimensões com escala
        this.canvas.setDimensions({ width: layout.width * scale, height: layout.height * scale });
        this.canvas.setZoom(scale);

        // Limpa e define fundo branco base
        this.canvas.clear();
        this.canvas.backgroundColor = '#FFFFFF';

        // Renderiza background
        await this.renderBackground(layout.background);

        // Ordena elementos por zIndex
        const sortedElements = [...layout.elements].sort(
            (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
        );

        // Renderiza cada elemento
        for (const element of sortedElements) {
            await this.renderElement(element);
        }

        // Renderiza etiqueta se existir
        if (layout.etiqueta) {
            await this.renderEtiqueta(layout.etiqueta);
        }

        this.canvas.renderAll();
        return this.canvas.getElement();
    }

    /**
     * Renderiza background
     */
    private async renderBackground(bg: CanvasLayout['background']): Promise<void> {
        if (bg.type === 'solid') {
            this.canvas.backgroundColor = bg.color || '#FFFFFF';
        }
        else if (bg.type === 'gradient' && bg.gradient) {
            // Fabric Gradient
            const grad = new Gradient({
                type: bg.gradient.type === 'radial' ? 'radial' : 'linear',
                coords: { x1: 0, y1: 0, x2: 0, y2: this.canvas.height }, // Vertical por padrão
                colorStops: bg.gradient.colors.map((color, i) => ({
                    offset: i / (bg.gradient!.colors.length - 1),
                    color: color
                }))
            });

            // Ajuste de ângulo se necessário (simples rotação de coords)
            if (bg.gradient.angle) {
                // TODO: Implementar cálculo trigonométrico para coords baseado no ângulo
            }

            this.canvas.backgroundColor = grad as any; // Type casting devido a complexidade do tipo Gradient no Fabric
        }
        else if (bg.type === 'image' && bg.imageUrl) {
            try {
                const img = await FabricImage.fromURL(bg.imageUrl, {
                    crossOrigin: 'anonymous'
                });

                // Cover logic
                const scaleX = this.canvas.width / img.width!;
                const scaleY = this.canvas.height / img.height!;
                const scale = Math.max(scaleX, scaleY);

                img.set({
                    originX: 'center',
                    originY: 'center',
                    left: this.canvas.width / 2,
                    top: this.canvas.height / 2,
                    scaleX: scale,
                    scaleY: scale,
                    opacity: bg.opacity || 1
                });

                // Blur filter se suportado (Fabric tem filtros, mas vamos manter simples por enquanto)
                // if (bg.blur) { img.filters.push(new fabric.Image.filters.Blur({ blur: bg.blur })); img.applyFilters(); }

                this.canvas.add(img);
                this.canvas.sendObjectToBack(img);
            } catch (e) {
                console.error("Erro ao carregar background:", e);
            }
        }
    }

    /**
     * Renderiza um elemento
     */
    private async renderElement(element: CanvasElement): Promise<void> {
        let fabricObject: any;

        if (element.type === 'image' && element.imageUrl) {
            try {
                const img = await FabricImage.fromURL(element.imageUrl, {
                    crossOrigin: 'anonymous'
                });

                // Resize/Crop Logic
                const fit = element.fit || 'cover';
                let scaleX = 1, scaleY = 1;

                if (fit === 'contain') {
                    const sX = element.width / img.width!;
                    const sY = element.height / img.height!;
                    const scale = Math.min(sX, sY);
                    scaleX = scale;
                    scaleY = scale;
                } else if (fit === 'fill') {
                    scaleX = element.width / img.width!;
                    scaleY = element.height / img.height!;
                } else {
                    // Cover (default)
                    const sX = element.width / img.width!;
                    const sY = element.height / img.height!;
                    const scale = Math.max(sX, sY);
                    scaleX = scale;
                    scaleY = scale;
                }

                img.set({
                    left: element.x + element.width / 2,
                    top: element.y + element.height / 2,
                    originX: 'center',
                    originY: 'center',
                    scaleX: scaleX,
                    scaleY: scaleY,
                });

                // Clip Path (Máscara para cortar o excesso)
                const clipRect = new Rect({
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    absolutePositioned: true
                });
                img.clipPath = clipRect;

                fabricObject = img;
            } catch (e) {
                console.error("Erro imagem:", e);
                return;
            }
        }
        else if (element.type === 'text' && element.text) {
            fabricObject = new Text(element.text, {
                left: element.x,
                top: element.y,
                fontSize: element.fontSize || 24,
                fontFamily: element.fontFamily || 'Arial',
                fill: element.color || '#000000',
                textAlign: element.align || 'left',
                width: element.width
            });
        }
        else if (element.type === 'shape') {
            fabricObject = new Rect({
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fill: element.fill || 'transparent',
                stroke: element.stroke,
                strokeWidth: element.strokeWidth || 0,
                rx: element.rx || 0,
                ry: element.ry || 0
            });
        }
        // Support for custom SVG elements (e.g. from user input)
        else if (element.type === 'decoration' && element.svgContent) {
            // Assume it's a path data string
            fabricObject = new Path(element.svgContent, {
                left: element.x,
                top: element.y,
                fill: element.fill || '#000000',
                scaleX: element.width / 100, // Rough scaling, assumes 100x100 base
                scaleY: element.height / 100
            });
        }
        // Washi Tape Implementation
        else if (element.type === 'washi-tape') {
            // Create a jagged edge rectangle using Path
            const w = element.width;
            const h = element.height;
            const jaggedSize = 2;

            // Generate jagged path
            let path = `M 0 0`;
            // Top edge (straightish)
            path += ` L ${w} 0`;
            // Right edge (jagged)
            for (let i = 0; i < h; i += jaggedSize) {
                path += ` L ${w - (Math.random() * 2)} ${i}`;
            }
            path += ` L ${w} ${h}`;
            // Bottom edge (straightish)
            path += ` L 0 ${h}`;
            // Left edge (jagged)
            for (let i = h; i > 0; i -= jaggedSize) {
                path += ` L ${0 + (Math.random() * 2)} ${i}`;
            }
            path += ` Z`;

            fabricObject = new Path(path, {
                left: element.x,
                top: element.y,
                fill: element.fill || 'rgba(255,255,255,0.5)',
                opacity: element.opacity || 0.8,
            });
        }
        // Pin Implementation
        else if (element.type === 'pin') {
            // Simple circle with shadow/highlight to look like a pin head
            const radius = Math.min(element.width, element.height) / 2;
            fabricObject = new Rect({
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fill: element.fill || '#FF0000',
                rx: radius,
                ry: radius,
                shadow: new Shadow({ color: 'rgba(0,0,0,0.3)', blur: 2, offsetY: 2 })
            });
        }

        if (fabricObject) {
            // Propriedades comuns
            if (element.rotation) fabricObject.rotate(element.rotation);
            if (element.opacity) fabricObject.opacity = element.opacity;
            if (element.zIndex) fabricObject.zIndex = element.zIndex; // Store zIndex for sorting if needed later

            // Sombra Realista
            if (element.shadow) {
                fabricObject.shadow = new Shadow({
                    color: element.shadow.color,
                    blur: element.shadow.blur,
                    offsetX: element.shadow.offsetX,
                    offsetY: element.shadow.offsetY
                });
            }

            this.canvas.add(fabricObject);
        }
    }

    /**
     * Renderiza etiqueta Modular
     */
    /**
     * Renderiza etiqueta Modular
     */
    /**
     * Renderiza etiqueta Modular
     */
    private async renderEtiqueta(inputConfig: any): Promise<void> {
        // --- HARDCODED VISUAL RESET (User Request) ---
        // Override everything to match "My Porch Prints" reference exactly.
        // NOW SUPPORTS BOTH COVER AND SHOWCASE MODES
        await this.renderReferenceHardcoded(inputConfig);
        return;

        /* DYNAMIC LOGIC DISABLED TEMPORARILY
        let config = inputConfig;
        if (config && !config.styleId && config.style) {
            config = this.convertLegacyToModular(config);
        }

        if (!config) return;

        // ... (rest of dynamic logic)
        */
    }

    /**
     * Renders the EXACT reference look for "My Porch Prints"
     * strictly following user specs.
     */
    private async renderReferenceHardcoded(config: any) {
        const canvasWidth = this.logicalWidth;
        const canvasHeight = this.logicalHeight;
        const isShowcase = config?.variant === 'showcase';

        console.log("Rendering Hardcoded Mode:", isShowcase ? "SHOWCASE" : "COVER");

        // 1. Badge (Top Left) - Common to both but maybe smaller in showcase?
        // Keeping it same for now as per "Badge BONITO" requirement, or maybe slightly adjusted if requested.
        // User didn't explicitly say badge changes for showcase, but usually it might.
        // Let's keep the "My Porch Prints" badge for consistency unless it conflicts.
        const badgeSize = 100;
        const badgeMargin = 40;
        const badgeX = badgeMargin;
        const badgeY = badgeMargin;
        const badgeRadius = badgeSize / 2;

        const badgeCircle = new Rect({
            left: badgeX,
            top: badgeY,
            width: badgeSize,
            height: badgeSize,
            rx: badgeRadius,
            ry: badgeRadius,
            fill: '#a8c3bc', // Mint pastel
            stroke: '#ffffff',
            strokeWidth: 6,
            shadow: new Shadow({ color: 'rgba(0,0,0,0.2)', blur: 5, offsetY: 2 })
        });
        this.canvas.add(badgeCircle);

        const badgeText = new Text('L', {
            left: badgeX + badgeRadius,
            top: badgeY + badgeRadius,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Times New Roman',
            fontWeight: 'bold',
            fontSize: 50,
            fill: '#ffffff'
        });
        this.canvas.add(badgeText);

        if (isShowcase) {
            // --- SHOWCASE MODE (Info) ---
            // Specs: Height 6%, Corner Position, Small Text

            const stripHeight = canvasHeight * 0.06; // 6% height
            const stripWidth = canvasWidth * 0.4;    // Not full width, maybe 40%? Or user said "Corner"
            // User example: "Rabbit Art Set" in a box.
            // Let's put it top-right or bottom-right as suggested.
            // Let's try Top-Right for visibility.

            const margin = 40;
            const stripX = canvasWidth - stripWidth - margin;
            const stripY = margin; // Top aligned with badge roughly

            const stripRect = new Rect({
                left: stripX,
                top: stripY,
                width: stripWidth,
                height: stripHeight,
                fill: '#8b5a3c', // Terracota
                stroke: '#ffffff',
                strokeWidth: 2,
                rx: 8,
                ry: 8,
                shadow: new Shadow({ color: 'rgba(0,0,0,0.4)', blur: 10, offsetY: 3 })
            });
            this.canvas.add(stripRect);

            // Text inside Showcase Strip
            const infoText = new Text('Rabbit Art Set | 12x12', {
                left: stripX + stripWidth / 2,
                top: stripY + stripHeight / 2,
                originX: 'center',
                originY: 'center',
                fontFamily: 'Arial',
                fontWeight: 'normal',
                fontSize: 24, // Small but legible
                fill: '#f5e6d3'
            });
            this.canvas.add(infoText);

        } else {
            // --- COVER MODE (Hero) ---
            // Specs: Width 85%, Height 22%, Center, Huge Text

            const stripWidth = canvasWidth * 0.85;
            const stripHeight = canvasHeight * 0.22;
            const stripX = (canvasWidth - stripWidth) / 2;
            const stripY = (canvasHeight - stripHeight) / 2;

            const stripRect = new Rect({
                left: stripX,
                top: stripY,
                width: stripWidth,
                height: stripHeight,
                fill: '#8b5a3c', // Terracota
                stroke: '#ffffff',
                strokeWidth: 4,
                shadow: new Shadow({ color: 'rgba(0,0,0,0.4)', blur: 15, offsetY: 5 })
            });
            this.canvas.add(stripRect);

            // Main Text (Product Name)
            const titleText = new Text('CHRISTMAS', {
                left: canvasWidth / 2,
                top: stripY + stripHeight * 0.3,
                originX: 'center',
                originY: 'center',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 72,
                fill: '#f5e6d3',
                shadow: new Shadow({ color: 'rgba(0,0,0,0.3)', blur: 0, offsetX: 2, offsetY: 2 })
            });
            this.canvas.add(titleText);

            const subtitleText = new Text('GIFT LABELS', {
                left: canvasWidth / 2,
                top: stripY + stripHeight * 0.7,
                originX: 'center',
                originY: 'center',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 84,
                fill: '#f5e6d3',
                shadow: new Shadow({ color: 'rgba(0,0,0,0.3)', blur: 0, offsetX: 2, offsetY: 2 })
            });
            this.canvas.add(subtitleText);
        }

        // 4. Brand Name (Footer) - Always present
        const brandText = new Text('My Porch Prints', {
            left: canvasWidth / 2,
            top: canvasHeight - 40,
            originX: 'center',
            originY: 'center',
            fontSize: 24,
            fill: '#666666',
            fontFamily: 'Arial'
        });
        this.canvas.add(brandText);
    }

    private async renderTextStrip(strip: any, labelConfig: any) {
        const { x, y, width, height } = labelConfig;
        const stripHeight = height * 0.4; // 40% of label height

        // Calculate Y position
        let stripY = y + (height - stripHeight) / 2; // Default: Centered in allocated area

        // Override with explicit position if set (relative to Canvas)
        if (strip.position) {
            const canvasHeight = this.logicalHeight;
            const margin = 40;

            if (strip.position === 'top') {
                stripY = margin;
            } else if (strip.position === 'bottom') {
                stripY = canvasHeight - stripHeight - margin;
            } else if (strip.position === 'center') {
                stripY = (canvasHeight - stripHeight) / 2;
            }
        }

        // Background Shape
        let bgShape: any;

        // Determine opacity
        const opacity = strip.opacity !== undefined ? strip.opacity : (strip.style === 'blur' ? 0.7 : 1);

        if (strip.shape && LABEL_SHAPES[strip.shape]) {
            // Render SVG Shape
            const pathData = LABEL_SHAPES[strip.shape];
            bgShape = new Path(pathData, {
                left: x,
                top: stripY,
                fill: strip.colors.background,
                stroke: strip.colors.text,
                strokeWidth: 2,
                shadow: new Shadow({ color: 'rgba(0,0,0,0.3)', blur: 10, offsetY: 5 }),
                opacity: opacity
            });

            // Scale to fit width/height
            const bounds = bgShape.getBoundingRect();
            const scaleX = width / bounds.width;
            const scaleY = stripHeight / bounds.height;

            bgShape.set({
                scaleX: scaleX,
                scaleY: scaleY,
                originX: 'left',
                originY: 'top'
            });

        } else if (strip.style === 'ribbon') {
            // Draw Ribbon Shape
            const indent = 20;
            const path = `M ${x} ${stripY} L ${x + width} ${stripY} L ${x + width - indent} ${stripY + stripHeight / 2} L ${x + width} ${stripY + stripHeight} L ${x} ${stripY + stripHeight} L ${x + indent} ${stripY + stripHeight / 2} Z`;
            bgShape = new Path(path, {
                fill: strip.colors.background,
                stroke: strip.colors.text,
                strokeWidth: 0,
                opacity: opacity
            });
        } else {
            // Default Rect (Solid, Blur, Outline)
            bgShape = new Rect({
                left: x,
                top: stripY,
                width: width,
                height: stripHeight,
                fill: strip.style === 'outline' ? 'transparent' : strip.colors.background,
                opacity: strip.style === 'outline' ? 1 : opacity,
                stroke: strip.style === 'outline' || strip.style === 'double-border' ? strip.colors.text : undefined,
                strokeWidth: strip.style === 'outline' ? 2 : 0
            });
        }

        this.canvas.add(bgShape);

        // Double Border Effect
        if (strip.style === 'double-border') {
            const innerRect = new Rect({
                left: x + 5,
                top: stripY + 5,
                width: width - 10,
                height: stripHeight - 10,
                fill: 'transparent',
                stroke: strip.colors.text,
                strokeWidth: 1
            });
            this.canvas.add(innerRect);
        }

        // Render Texts
        const renderText = (text: string, fontSize: number, top: number, fontWeight: string = 'normal') => {
            // Check if we need high contrast (if background is transparent/missing or style is outline)
            const isTransparent = !bgShape || strip.style === 'outline' || (strip.opacity !== undefined && strip.opacity < 0.3);

            const textOptions: any = {
                left: x + width / 2,
                top: top,
                fontSize: fontSize,
                fontFamily: strip.fontFamily,
                fill: strip.colors.text,
                originX: 'center',
                originY: 'center',
                fontWeight: fontWeight,
                textAlign: 'center'
            };

            if (isTransparent) {
                // Add shadow for contrast
                textOptions.shadow = new Shadow({
                    color: 'rgba(0,0,0,0.8)',
                    blur: 8,
                    offsetX: 0,
                    offsetY: 2
                });
            }

            const textObj = new Text(text, textOptions);
            this.canvas.add(textObj);
        };

        // Safe access with optional chaining
        if (strip?.texts?.top && strip?.showLines?.top) {
            renderText(strip.texts.top, stripHeight * 0.2, stripY + stripHeight * 0.2);
        }

        if (strip?.texts?.center && strip?.showLines?.center) {
            renderText(strip.texts.center, stripHeight * 0.6, stripY + stripHeight * 0.55, 'bold');
        }

        if (strip?.texts?.bottom && strip?.showLines?.bottom) {
            renderText(strip.texts.bottom, stripHeight * 0.2, stripY + stripHeight * 0.85);
        }
    }

    private async renderBadge(badge: any, labelConfig: any) {
        if (!badge.enabled) return;

        // Position relative to CANVAS, not label area
        const canvasWidth = this.logicalWidth;
        const canvasHeight = this.logicalHeight;
        const margin = 40;
        const size = Math.min(canvasWidth, canvasHeight) * 0.15; // 15% of canvas min dimension

        let badgeX = margin;
        let badgeY = margin;

        if (badge.position === 'top-right') {
            badgeX = canvasWidth - margin - size;
        } else if (badge.position === 'bottom-left') {
            badgeY = canvasHeight - margin - size;
        } else if (badge.position === 'bottom-right') {
            badgeX = canvasWidth - margin - size;
            badgeY = canvasHeight - margin - size;
        } else if (badge.position === 'custom' && badge.customPosition) {
            badgeX = badge.customPosition.x;
            badgeY = badge.customPosition.y;
        }

        // Determine Fill/Stroke based on content
        // If 'empty', we want a decorative outline only
        const isDecorative = badge.content === 'empty';
        const fillColor = isDecorative ? 'transparent' : badge.colors.background;
        const strokeColor = badge.colors.border || '#FFFFFF';
        const strokeWidth = isDecorative ? 4 : 2; // Thicker border for decorative

        // Shape
        let shape: any;
        if (badge.shape === 'circle') {
            shape = new Rect({
                left: badgeX,
                top: badgeY,
                width: size,
                height: size,
                rx: size / 2,
                ry: size / 2,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                shadow: new Shadow({ color: 'rgba(0,0,0,0.3)', blur: 5, offsetY: 2 })
            });
        } else if (badge.shape === 'hexagon') {
            // Hexagon Path
            const w = size;
            const h = size;
            const path = `M ${w * 0.5} 0 L ${w} ${h * 0.25} L ${w} ${h * 0.75} L ${w * 0.5} ${h} L 0 ${h * 0.75} L 0 ${h * 0.25} Z`;
            shape = new Path(path, {
                left: badgeX,
                top: badgeY,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth
            });
        } else {
            // Default Square/Tag
            shape = new Rect({
                left: badgeX,
                top: badgeY,
                width: size,
                height: size,
                fill: fillColor,
                stroke: strokeColor,
                strokeWidth: strokeWidth
            });
        }

        this.canvas.add(shape);

        // Content
        if (badge.content === 'icon') {
            // Placeholder Star (Default if no specific icon logic yet)
            const starPath = "M 12 2 L 15.09 8.26 L 22 9.27 L 17 14.14 L 18.18 21.02 L 12 17.77 L 5.82 21.02 L 7 14.14 L 2 9.27 L 8.91 8.26 Z";
            const icon = new Path(starPath, {
                left: badgeX + size / 2,
                top: badgeY + size / 2,
                originX: 'center',
                originY: 'center',
                fill: badge.colors.icon || '#FFFFFF',
                scaleX: size / 30,
                scaleY: size / 30
            });
            this.canvas.add(icon);
        } else if (badge.content === 'monogram') {
            // Use initials from product name if available, else 'L'
            const textContent = badge.monogramText || (labelConfig.textStrip?.texts?.center ? labelConfig.textStrip.texts.center.charAt(0).toUpperCase() : 'A');

            const text = new Text(textContent, {
                left: badgeX + size / 2,
                top: badgeY + size / 2,
                originX: 'center',
                originY: 'center',
                fontSize: size * 0.5,
                fill: badge.colors.icon || '#FFFFFF',
                fontFamily: 'Times New Roman',
                fontWeight: 'bold'
            });
            this.canvas.add(text);
        }
    }

    private async renderProductName(config: any, labelConfig: any) {
        // Deprecated/Merged into TextStrip usually, but if used separately:
        if (!config.enabled) return;

        const { x, y, width, height } = labelConfig;
        const text = new Text(config.text, {
            left: x + width / 2,
            top: y + height - 40,
            fontSize: config.fontSize,
            fill: config.color,
            originX: 'center',
            originY: 'center'
        });
        this.canvas.add(text);
    }

    private async renderBrand(config: any, labelConfig: any) {
        if (!config.enabled) return;

        const canvasWidth = this.logicalWidth;
        const canvasHeight = this.logicalHeight;

        const text = new Text(config.text, {
            left: canvasWidth / 2,
            top: canvasHeight - 30, // Fixed at bottom of canvas
            fontSize: 14,
            fill: config.color || '#000000',
            originX: 'center',
            originY: 'center',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        });
        this.canvas.add(text);
    }

    private async renderInfoLine(config: any, labelConfig: any) {
        // Implementation for info line
    }

    /**
     * Exporta para Blob
     */
    async toBlob(format: 'png' | 'jpg' | 'webp' = 'png', quality: number = 0.92): Promise<Blob> {
        const dataUrl = this.canvas.toDataURL({
            format: format as any,
            quality: quality,
            multiplier: 1 // Exporta no tamanho original
        });

        const res = await fetch(dataUrl);
        return await res.blob();
    }

    /**
     * Exporta para Data URL
     */
    toDataURL(format: 'png' | 'jpg' | 'webp' = 'png', quality: number = 0.92): string {
        return this.canvas.toDataURL({
            format: format as any,
            quality: quality,
            multiplier: 1
        });
    }

    /**
     * Limpa canvas
     */
    clear(): void {
        this.canvas.clear();
    }

    private convertLegacyToModular(legacy: any): any {
        const styleMap: Record<string, string> = {
            'modern-minimal': 'modern',
            'vintage-badge': 'vintage',
            'elegant-frame': 'luxury',
            'playful-sticker': 'playful',
            'rustic-label': 'vintage',
            'luxury-gold': 'luxury'
        };

        const styleId = styleMap[legacy.style] || 'modern';

        return {
            styleId: styleId,
            x: legacy.x,
            y: legacy.y,
            width: legacy.width,
            height: legacy.height,
            badge: { enabled: false },
            textStrip: {
                enabled: true,
                style: 'solid',
                texts: {
                    top: '',
                    center: legacy.mainText,
                    bottom: legacy.subText || ''
                },
                showLines: { top: false, center: true, bottom: !!legacy.subText },
                position: 'center',
                colors: {
                    background: legacy.colors?.bg || '#FFFFFF',
                    text: legacy.colors?.text || '#000000'
                },
                fontFamily: legacy.fontFamily || 'Arial'
            },
            productName: { enabled: false },
            brand: { enabled: false },
            infoLine: { enabled: false },
            background: { type: 'none' }
        };
    }
}
