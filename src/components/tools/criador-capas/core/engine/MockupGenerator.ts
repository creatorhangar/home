import type { MockupTemplate, ImageFile, ProductInfo, GeneratedOutput, BatchProgress } from '../../types';
import { CanvasRenderer } from './CanvasRenderer';
import { ImageProcessor } from './ImageProcessor';

/**
 * Mockup Generator - Aplica designs em mockups realistas
 */
export class MockupGenerator {
    private renderer: CanvasRenderer;

    constructor() {
        this.renderer = new CanvasRenderer();
    }

    /**
     * Gera um mockup
     */
    async generateMockup(
        template: MockupTemplate,
        _image: Blob, // Imagem principal para aplicar (unused for now)
        productInfo: ProductInfo,
        options: {
            format?: 'png' | 'jpg' | 'webp';
            quality?: number;
        } = {}
    ): Promise<GeneratedOutput> {
        const { format = 'png', quality = 0.92 } = options;

        // TODO: Implementar lógica real de mockup com perspectiva/displacement
        // Por enquanto, implementação básica de sobreposição

        // 1. Carrega base do mockup
        const baseImg = await ImageProcessor.loadImage(template.baseImage);

        // 2. Configura canvas
        const width = baseImg.width;
        const height = baseImg.height;

        // 3. Renderiza base
        await this.renderer.render({
            width,
            height,
            background: {
                type: 'image',
                imageUrl: template.baseImage,
            },
            elements: [], // Elementos adicionais virão aqui
        });

        // 4. Aplica imagem nas regiões definidas (smart objects)
        // Simplificado: apenas desenha a imagem na região definida
        // Futuro: usar perspectiva (homografia)

        // TODO: Implementar aplicação correta nas regiões

        const blob = await this.renderer.toBlob(format, quality);
        const url = URL.createObjectURL(blob);

        return {
            id: `mockup-${template.id}-${Date.now()}`,
            type: 'mockup',
            name: `${productInfo.name} - ${template.name}`,
            templateId: template.id,
            blob,
            url,
            width,
            height,
            format,
        };
    }

    /**
     * Gera múltiplos mockups
     */
    async generateMultipleMockups(
        templates: MockupTemplate[],
        image: ImageFile,
        productInfo: ProductInfo,
        onProgress?: (progress: BatchProgress) => void
    ): Promise<GeneratedOutput[]> {
        const outputs: GeneratedOutput[] = [];
        const total = templates.length;

        for (let i = 0; i < templates.length; i++) {
            if (onProgress) {
                onProgress({
                    total,
                    completed: i,
                    current: `Gerando Mockup: ${templates[i].name}...`,
                    percentage: (i / total) * 100,
                });
            }

            try {
                // Convert ImageFile to Blob for generateMockup
                const response = await fetch(image.url);
                const blob = await response.blob();
                const output = await this.generateMockup(templates[i], blob, productInfo);
                outputs.push(output);
            } catch (error) {
                console.error(`Erro ao gerar mockup ${templates[i].name}:`, error);
            }
        }

        return outputs;
    }
}
