import type { VideoTemplate } from './types';
import { CandyMeltMorph } from './three/CandyMeltMorph';
import { KaleidoscopeFlow } from './three/KaleidoscopeFlow';
import { CleanFade } from './css/CleanFade';
import { ParallaxDrift } from './css/ParallaxDrift';

export const videoTemplates: VideoTemplate[] = [
    {
        id: 'candy-melt-morph',
        name: 'Candy Melt Morph',
        description: 'Transição líquida suave com cores pastéis e efeito de derretimento.',
        category: 'three-special',
        duration: 15,
        idealImageCount: [8, 16],
        tags: ['candy', 'liquid', 'melt', 'pastel', 'tdah'],
        component: CandyMeltMorph
    },
    {
        id: 'kaleidoscope-flow',
        name: 'Kaleidoscope Flow',
        description: 'Efeito caleidoscópio hipnótico com rotação suave e simetria radial.',
        category: 'hypnotic',
        duration: 15,
        idealImageCount: [10, 20],
        tags: ['kaleidoscope', 'mandala', 'hypnotic', 'flow', 'tdah'],
        component: KaleidoscopeFlow
    },
    {
        id: 'clean-fade',
        name: 'Clean Fade',
        description: 'Transição minimalista e elegante com fade suave.',
        category: 'minimalist',
        duration: 10,
        idealImageCount: [4, 10],
        tags: ['clean', 'minimal', 'fade', 'simple'],
        component: CleanFade
    },
    {
        id: 'parallax-drift',
        name: 'Parallax Drift',
        description: 'Camadas com movimento parallax suave e profundidade.',
        category: 'static-motion',
        duration: 10,
        idealImageCount: [3, 5],
        tags: ['parallax', 'depth', 'smooth', 'layer'],
        component: ParallaxDrift
    }
];

export const getTemplateById = (id: string) => videoTemplates.find(t => t.id === id);
