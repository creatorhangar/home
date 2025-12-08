import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { GeneratedOutput } from '../types';

export class ZipGenerator {
    /**
     * Gera e baixa um arquivo ZIP com todas as imagens
     */
    static async downloadZip(
        outputs: GeneratedOutput[],
        filename: string = 'capas-geradas'
    ): Promise<void> {
        const zip = new JSZip();

        // Organiza por pastas
        const folders = {
            showcase: zip.folder('Showcase Capas'),
            mockup: zip.folder('Mockups'),
            hero: zip.folder('Hero Images'),
            social: zip.folder('Social Media'),
        };

        // Adiciona arquivos
        outputs.forEach((output) => {
            const folder = folders[output.type] || zip;

            // Remove caracteres inválidos do nome do arquivo
            const safeName = output.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `${safeName}.${output.format}`;

            folder.file(fileName, output.blob);
        });

        // Gera o ZIP
        const content = await zip.generateAsync({ type: 'blob' });

        // Salva o arquivo
        saveAs(content, `${filename}.zip`);
    }
}
