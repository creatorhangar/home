import type { CapaTemplate, ImageFile, ProductInfo, GeneratedOutput, BatchProgress } from '../../types';
import { CanvasRenderer } from './CanvasRenderer';

/**
 * Capa Generator - Gera showcase grids
 */
export class CapaGenerator {
    private renderer: CanvasRenderer;

    constructor() {
        this.renderer = new CanvasRenderer();
    }

    /**
     * Helper to get dimensions from aspect ratio
     */
    private getDimensions(ratio: string): { width: number, height: number } {
        const base = 2500; // Base size for high quality
        switch (ratio) {
            case '1:1': return { width: base, height: base };
            case '4:5': return { width: 2000, height: 2500 };
            case '3:4': return { width: 1875, height: 2500 };
            case '9:16': return { width: 1406, height: 2500 };
            case 'landscape': return { width: 2500, height: 1406 }; // 16:9
            default: return { width: base, height: base };
        }
    }

    /**
     * Gera uma capa usando um template
     */
    async generateCapa(
        template: CapaTemplate,
        images: ImageFile[],
        productInfo: ProductInfo,
        options: {
            format?: 'png' | 'jpg' | 'webp';
            quality?: number;
            aspectRatio?: string;
        } = {}
    ): Promise<GeneratedOutput> {
        const { format = 'png', quality = 0.92, aspectRatio = '1:1' } = options;

        // Calculate dimensions based on aspect ratio
        const { width, height } = this.getDimensions(aspectRatio);

        // Gera layout usando a função do template com dimensões dinâmicas
        const layout = template.layoutFn(images, images.length, productInfo, width, height);

        // Renderiza
        await this.renderer.render(layout);

        // Converte para blob
        const blob = await this.renderer.toBlob(format, quality);
        const url = URL.createObjectURL(blob);

        return {
            id: `capa-${template.id}-${Date.now()}`,
            type: 'showcase',
            name: `${productInfo.name} - ${template.name}`,
            templateId: template.id,
            blob,
            url,
            width: layout.width,
            height: layout.height,
            format,
        };
    }

    /**
     * Gera múltiplas capas em lote
     */
    async generateMultipleCapas(
        templates: CapaTemplate[],
        images: ImageFile[],
        productInfo: ProductInfo,
        onProgress?: (progress: BatchProgress) => void,
        options: {
            format?: 'png' | 'jpg' | 'webp';
            quality?: number;
            aspectRatio?: string;
        } = {}
    ): Promise<GeneratedOutput[]> {
        const outputs: GeneratedOutput[] = [];
        const total = templates.length;

        for (let i = 0; i < templates.length; i++) {
            const template = templates[i];

            // Update progress
            if (onProgress) {
                onProgress({
                    total,
                    completed: i,
                    current: `Gerando ${template.name}...`,
                    percentage: (i / total) * 100,
                });
            }

            try {
                const output = await this.generateCapa(template, images, productInfo, options);
                outputs.push(output);
            } catch (error) {
                console.error(`Erro ao gerar capa ${template.name}:`, error);
            }
        }

        // Final progress update
        if (onProgress) {
            onProgress({
                total,
                completed: total,
                current: 'Concluído!',
                percentage: 100,
            });
        }

        return outputs;
    }

    /**
     * Preview rápido de um template (versão menor e rápida)
     */
    async generatePreview(
        template: CapaTemplate,
        images: ImageFile[],
        productInfo: ProductInfo,
        maxSize: number = 400
    ): Promise<string> {
        // Preview uses 1:1 by default or we could pass it. 
        // For the selector, 1:1 or 4:5 is usually best. Let's stick to 4:5 for preview consistency if not specified.
        // Actually, let's use a standard 4:5 for the preview grid as it looks better.
        const { width, height } = this.getDimensions('4:5');

        // Gera layout normal
        const layout = template.layoutFn(images, images.length, productInfo, width, height);

        // Calcula escala
        const scale = maxSize / Math.max(layout.width, layout.height);

        // Redimensiona layout
        const scaledLayout = {
            ...layout,
            width: Math.round(layout.width * scale),
            height: Math.round(layout.height * scale),
            elements: layout.elements.map(el => ({
                ...el,
                x: Math.round(el.x * scale),
                y: Math.round(el.y * scale),
                width: Math.round(el.width * scale),
                height: Math.round(el.height * scale),
                fontSize: el.fontSize ? Math.round(el.fontSize * scale) : undefined,
            })),
            etiqueta: layout.etiqueta ? {
                ...layout.etiqueta,
                x: Math.round(layout.etiqueta.x * scale),
                y: Math.round(layout.etiqueta.y * scale),
                width: Math.round(layout.etiqueta.width * scale),
                height: Math.round(layout.etiqueta.height * scale),
            } : undefined,
        };

        // Renderiza versão pequena
        await this.renderer.render(scaledLayout);

        // Retorna data URL
        return this.renderer.toDataURL('webp', 0.7);
    }
}
