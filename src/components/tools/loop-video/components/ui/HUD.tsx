'use client';
import { useStore } from '../../store';
import { useUsage } from '@/lib/hooks/useUsage';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { FreeLimitModal } from '@/components/ui/FreeLimitModal';

export const HUD = () => {
    const { incrementUsage } = useUsage('loop-video', 1);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const router = useRouter();

    const {
        currentFractal, setFractal,
        bloomStrength, setBloom,
        particleCount, setParticleCount,
        aspectRatio, setAspectRatio,
        loopDuration, setLoopDuration,
        quality, setQuality,
        setIsExporting, isExporting
    } = useStore();

    const handleSaveFrame = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `hypnotic-fractal-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            link.click();
        }
    };

    const handleExportVideo = async () => {
        if (isExporting) return;
        try {
            await incrementUsage();
            setIsExporting(true);
        } catch (error: any) {
            if (error.message === 'LIMIT_REACHED') {
                setShowLimitModal(true);
            }
        }
    };

    return (
        <div className="p-4 text-white font-sans text-sm h-full flex flex-col">
            <h3 className="text-xs font-bold tracking-widest text-white/50 mb-6 uppercase border-b border-white/10 pb-2">Control Panel</h3>

            <div className="space-y-6 flex-1">
                <div className="control-group">
                    <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wide">Fractal Style</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Tunnel', 'Mandelbrot', 'Julia', 'Nebula'].map(f => (
                            <button
                                key={f}
                                className={`px-3 py-2 text-xs rounded-lg border transition-all ${currentFractal === f ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                                onClick={() => setFractal(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group">
                    <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wide">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['9:16', '1:1', '16:9'].map(r => (
                            <button
                                key={r}
                                className={`px-2 py-2 text-xs rounded-lg border transition-all ${aspectRatio === r ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                                onClick={() => setAspectRatio(r as any)}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group">
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wide">Bloom Strength</label>
                        <span className="text-xs text-white/40">{bloomStrength.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min="0" max="3" step="0.1"
                        value={bloomStrength}
                        onChange={(e) => setBloom({ strength: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-400 bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                <div className="control-group">
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wide">Particles</label>
                        <span className="text-xs text-white/40">{particleCount}</span>
                    </div>
                    <input
                        type="range"
                        min="100" max="5000" step="100"
                        value={particleCount}
                        onChange={(e) => setParticleCount(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                <div className="control-group">
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wide">Duration (Sec)</label>
                        <span className="text-xs text-white/40">{loopDuration}</span>
                    </div>
                    <input
                        type="range"
                        min="5" max="30" step="1"
                        value={loopDuration}
                        onChange={(e) => setLoopDuration(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/10 mt-6">
                <button
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 font-bold tracking-widest hover:translate-y-[-2px] transition-transform shadow-lg shadow-pink-500/20"
                    onClick={handleSaveFrame}
                >
                    SAVE FRAME
                </button>

                <button
                    className={`w-full py-3 rounded-lg font-bold tracking-widest transition-transform shadow-lg ${isExporting ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black hover:translate-y-[-2px] shadow-cyan-400/20'}`}
                    onClick={handleExportVideo}
                    disabled={isExporting}
                >
                    {isExporting ? 'RENDERING...' : 'EXPORT VIDEO'}
                </button>

                <div className="text-[10px] text-white/40 text-center h-4">
                    {isExporting && "Rendering video loop..."}
                </div>
            </div>

            <FreeLimitModal
                isOpen={showLimitModal}
                toolName="Loop Video"
                limit={1}
            />
        </div>
    );
};
