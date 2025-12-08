import type { CanvasElement } from '../../types';

// Simple Mulberry32 seeded random generator
export const createRNG = (seed: number) => {
    return () => {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

export const randomRange = (min: number, max: number, rng: () => number = Math.random) => rng() * (max - min) + min;

export const randomChoice = <T>(arr: T[], rng: () => number = Math.random): T => arr[Math.floor(rng() * arr.length)];

export const stringToSeed = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

export const createShadow = (blur: number = 10, offsetX: number = 5, offsetY: number = 5, opacity: number = 0.3) => ({
    color: `rgba(0,0,0,${opacity})`,
    blur,
    offsetX,
    offsetY
});

export const createPin = (x: number, y: number): CanvasElement => ({
    type: 'shape',
    x: x - 8,
    y: y - 8,
    width: 16,
    height: 16,
    fill: 'radial-gradient(circle at 30% 30%, #ff6b6b, #c0392b)', // Red pin
    zIndex: 1000,
    shadow: createShadow(2, 1, 1, 0.4),
    rx: 50, // Circle
    ry: 50
});

export const createWashiTape = (x: number, y: number, width: number, rotation: number): CanvasElement => ({
    type: 'shape',
    x,
    y,
    width,
    height: 25,
    fill: 'rgba(255, 255, 255, 0.6)', // Semi-transparent white tape
    rotation,
    zIndex: 900,
    shadow: createShadow(2, 1, 1, 0.1)
});
