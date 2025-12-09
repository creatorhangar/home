import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    // Global
    currentFractal: string;
    setFractal: (fractal: string) => void;

    // Bloom
    bloomThreshold: number;
    bloomStrength: number;
    bloomRadius: number;
    setBloom: (settings: { threshold?: number; strength?: number; radius?: number }) => void;

    // Particles
    particleCount: number;
    setParticleCount: (count: number) => void;

    // Studio Tools
    aspectRatio: '9:16' | '1:1' | '16:9';
    setAspectRatio: (ratio: '9:16' | '1:1' | '16:9') => void;
    loopDuration: number;
    setLoopDuration: (duration: number) => void;
    colorPalette: string;
    setColorPalette: (palette: string) => void;
    // Universal Controls
    speed: number;
    setSpeed: (speed: number) => void;
    color: string;
    setColor: (color: string) => void;
    glow: number;
    setGlow: (glow: number) => void;

    // Export State
    isExporting: boolean;
    setIsExporting: (isExporting: boolean) => void;
    exportProgress: number;
    watermarkText: string;
    setWatermarkText: (text: string) => void;
    showWatermark: boolean;
    setShowWatermark: (show: boolean) => void;

    savePreset: (name: string) => void;
    loadPreset: (name: string) => void;
    listPresets: () => string[];
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Global
            currentFractal: 'Tunnel',
            setFractal: (fractal) => set({ currentFractal: fractal }),

            // Bloom
            bloomThreshold: 0.15,
            bloomStrength: 1.2,
            bloomRadius: 0.8,
            setBloom: (settings) => set((state) => ({
                bloomThreshold: settings.threshold ?? state.bloomThreshold,
                bloomStrength: settings.strength ?? state.bloomStrength,
                bloomRadius: settings.radius ?? state.bloomRadius,
            })),

            // Particles
            particleCount: 2000,
            setParticleCount: (count) => set({ particleCount: count }),

            // Studio Tools
            aspectRatio: '9:16',
            setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
            loopDuration: 15,
            setLoopDuration: (duration) => set({ loopDuration: duration }),
            colorPalette: 'Neon',
            setColorPalette: (palette) => set({ colorPalette: palette }),

            // Universal Controls
            speed: 1.0,
            setSpeed: (speed) => set({ speed }),
            color: '#00F5FF',
            setColor: (color) => set({ color }),
            glow: 1.0,
            setGlow: (glow) => set({ glow }),

            savePreset: (name) => {
                const state = get();
                const preset = {
                    currentFractal: state.currentFractal,
                    bloomStrength: state.bloomStrength,
                    particleCount: state.particleCount,
                    aspectRatio: state.aspectRatio,
                    loopDuration: state.loopDuration,
                    speed: state.speed,
                    color: state.color,
                    glow: state.glow,
                    watermarkText: state.watermarkText,
                };
                localStorage.setItem(`loop_preset_${name}`, JSON.stringify(preset));
            },
            loadPreset: (name) => {
                const saved = localStorage.getItem(`loop_preset_${name}`);
                if (saved) {
                    const preset = JSON.parse(saved);
                    set(preset);
                }
            },
            listPresets: () => {
                return Object.keys(localStorage)
                    .filter(k => k.startsWith('loop_preset_'))
                    .map(k => k.replace('loop_preset_', ''));
            }
        }),
        {
            name: 'loop-storage', // unique name
            partialize: (state) => ({
                // Whitelist only what we want to persist
                loopDuration: state.loopDuration,
                aspectRatio: state.aspectRatio,
                particleCount: state.particleCount,
                bloomStrength: state.bloomStrength,
                watermarkText: state.watermarkText,
                currentFractal: state.currentFractal,
                speed: state.speed,
                color: state.color,
                glow: state.glow,
                quality: state.quality,
                appMode: state.appMode
            }),
        }
    )
);
