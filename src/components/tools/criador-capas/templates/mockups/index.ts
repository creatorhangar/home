import type { MockupTemplate } from '../../types';

export const almofadaMockup: MockupTemplate = {
    id: 'mockup-almofada-01',
    name: 'Almofada Quadrada',
    category: 'home-decor',
    baseImage: '/assets/mockups/almofada-base.png',
    preview: '/assets/mockups/almofada-preview.jpg',
    maskRegions: [
        {
            id: 'area-estampa',
            name: 'Área da Estampa',
            width: 800,
            height: 800,
            transform: {
                points: [[200, 200], [1000, 200], [1000, 1000], [200, 1000]] // Exemplo
            },
            blendMode: 'multiply',
            opacity: 0.9
        }
    ]
};

export const quadroMockup: MockupTemplate = {
    id: 'mockup-quadro-01',
    name: 'Quadro Parede Sala',
    category: 'home-decor',
    baseImage: '/assets/mockups/quadro-base.png',
    preview: '/assets/mockups/quadro-preview.jpg',
    maskRegions: [
        {
            id: 'area-arte',
            name: 'Arte do Quadro',
            width: 600,
            height: 800,
            transform: {
                points: [[300, 150], [900, 150], [900, 950], [300, 950]]
            },
            blendMode: 'multiply',
            opacity: 0.95
        }
    ]
};

export const canecaMockup: MockupTemplate = {
    id: 'mockup-caneca-01',
    name: 'Caneca Cerâmica',
    category: 'lifestyle',
    baseImage: '/assets/mockups/caneca-base.png',
    preview: '/assets/mockups/caneca-preview.jpg',
    maskRegions: [
        {
            id: 'area-impressao',
            name: 'Área de Impressão',
            width: 400,
            height: 400,
            transform: {
                points: [[100, 100], [500, 100], [500, 500], [100, 500]]
            },
            blendMode: 'multiply',
            opacity: 0.9
        }
    ]
};

export const allMockupTemplates: MockupTemplate[] = [
    almofadaMockup,
    quadroMockup,
    canecaMockup
];

export function getRandomMockups(count: number): MockupTemplate[] {
    const shuffled = [...allMockupTemplates].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
