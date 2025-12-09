'use client';
import { useState } from 'react';
import { useStore } from '../../store';
import { useUsage } from '@/lib/hooks/useUsage';
import { useRouter } from 'next/navigation';

import { FreeLimitModal } from '@/components/ui/FreeLimitModal';

export const HUD = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { incrementUsage, remaining, checkLimit } = useUsage('loop-video', 1);
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
        <div className={`hud-container ${isOpen ? 'open' : 'closed'}`}>
            <div className="hud-header">
                <h3>CONTROLS</h3>
                <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? 'HIDE' : 'SHOW'}</button>
            </div>

            {isOpen && (
                <div className="hud-content">
                    <div className="control-group">
                        <label>FRACTAL STYLE</label>
                        <div className="fractal-grid">
                            {['Tunnel', 'Mandelbrot', 'Julia', 'Nebula'].map(f => (
                                <button
                                    key={f}
                                    className={`fractal-btn ${currentFractal === f ? 'active' : ''}`}
                                    onClick={() => setFractal(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="control-group">
                        <label>ASPECT RATIO</label>
                        <div className="ratio-grid">
                            {['9:16', '1:1', '16:9'].map(r => (
                                <button
                                    key={r}
                                    className={`ratio-btn ${aspectRatio === r ? 'active' : ''}`}
                                    onClick={() => setAspectRatio(r as any)}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="control-group">
                        <label>BLOOM STRENGTH: {bloomStrength.toFixed(2)}</label>
                        <input
                            type="range"
                            min="0" max="3" step="0.1"
                            value={bloomStrength}
                            onChange={(e) => setBloom({ strength: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="control-group">
                        <label>PARTICLES: {particleCount}</label>
                        <input
                            type="range"
                            min="100" max="5000" step="100"
                            value={particleCount}
                            onChange={(e) => setParticleCount(parseInt(e.target.value))}
                        />
                    </div>

                    <div className="control-group">
                        <label>DURATION (SEC): {loopDuration}</label>
                        <input
                            type="range"
                            min="5" max="30" step="1"
                            value={loopDuration}
                            onChange={(e) => setLoopDuration(parseInt(e.target.value))}
                        />
                    </div>

                    <button className="save-btn" onClick={handleSaveFrame}>
                        SAVE FRAME
                    </button>

                    <button
                        className="export-btn"
                        onClick={handleExportVideo}
                        disabled={isExporting}
                    >
                        {isExporting ? 'RENDERING...' : 'EXPORT VIDEO'}
                    </button>

                    <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                        {isExporting && "Please wait while we render your video loop..."}
                    </div>
                </div>
            )}

            <style>{`
                .hud-container {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 340px;
                    max-width: calc(100vw - 40px);
                    max-height: calc(100vh - 40px);
                    overflow-y: auto;
                    background: rgba(10, 10, 20, 0.6);
                    backdrop-filter: blur(16px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                    z-index: 100;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
                @media (max-width: 480px) {
                    .hud-container {
                        top: auto;
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        width: auto;
                        max-height: 60vh;
                    }
                    .hud-container.closed {
                        width: auto;
                        bottom: 20px;
                        right: 20px;
                        left: auto;
                    }
                }
                .hud-header {
                    display: flex;
                    justify-content: space-between;
                    padding: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 16px 16px 0 0;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    backdrop-filter: blur(16px);
                }
                .hud-header h3 {
                    margin: 0;
                    font-size: 0.8rem;
                    letter-spacing: 2px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                }
                .hud-header button {
                    background: none;
                    border: none;
                    color: #FF006E;
                    cursor: pointer;
                    font-family: inherit;
                    font-weight: bold;
                }
                .hud-content {
                    padding: 20px;
                }
                .control-group {
                    margin-bottom: 24px;
                    text-align: left;
                }
                .control-group label {
                    display: block;
                    font-size: 0.7rem;
                    margin-bottom: 10px;
                    color: rgba(255, 255, 255, 0.6);
                    letter-spacing: 1px;
                    font-weight: 500;
                }
                .fractal-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }
                .ratio-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }
                .fractal-btn, .ratio-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.7);
                    padding: 10px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.7rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border-radius: 8px;
                }
                .fractal-btn:hover, .ratio-btn:hover {
                    border-color: #00F5FF;
                    background: rgba(0, 245, 255, 0.1);
                    color: #fff;
                }
                .fractal-btn.active, .ratio-btn.active {
                    background: rgba(0, 245, 255, 0.2);
                    border-color: #00F5FF;
                    color: #00F5FF;
                    box-shadow: 0 0 15px rgba(0, 245, 255, 0.2);
                    font-weight: 600;
                }
                input[type=range] {
                    width: 100%;
                    -webkit-appearance: none;
                    background: transparent;
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: #00F5FF;
                    cursor: pointer;
                    margin-top: -6px;
                    box-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
                    border: 2px solid #fff;
                }
                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    cursor: pointer;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                }
                .save-btn {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(90deg, #FF006E, #8B00FF);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: bold;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }
                .save-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 0, 110, 0.4);
                }
                .export-btn {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(90deg, #00F5FF, #00FF88);
                    border: none;
                    border-radius: 8px;
                    color: #000;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: bold;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-shadow: 0 0 2px rgba(255,255,255,0.5);
                    margin-top: 10px;
                }
                .export-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 245, 255, 0.4);
                }
                .export-btn:disabled {
                    opacity: 0.7;
                    cursor: wait;
                    background: linear-gradient(90deg, #333, #555);
                    color: #aaa;
                }
            `}</style>
            <FreeLimitModal
                isOpen={showLimitModal}
                toolName="Loop Video"
                limit={1}
            />
        </div>
    );
};
