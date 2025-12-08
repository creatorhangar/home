import { useState } from 'react';
import { useStore } from '../../store';

export const HUD = () => {
    const [isOpen, setIsOpen] = useState(true);

    const {
        currentFractal, setFractal,
        bloomStrength, setBloom,
        particleCount, setParticleCount,
        aspectRatio, setAspectRatio,
        loopDuration, setLoopDuration,
        quality, setQuality
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

    return (
        <div className={`hud-container ${isOpen ? 'open' : 'closed'}`}>
            <div className="hud-header">
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
            .hud - container {
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
                    margin - bottom: 24px;
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
                    border - color: #00F5FF;
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
                    -webkit - appearance: none;
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
                .text-input {
                    width: 100%;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #fff;
                padding: 8px;
                border-radius: 8px;
                font-family: 'Inter', sans-serif;
                margin-bottom: 10px;
        }
                .preset-grid {
                    display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
        }
                .preset-btn {
                    background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
                padding: 8px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.7rem;
                transition: all 0.2s;
        }
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
            .hud - container {
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
                    margin - bottom: 24px;
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
                    border - color: #00F5FF;
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
                    -webkit - appearance: none;
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
                .text-input {
                    width: 100%;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #fff;
                padding: 8px;
                border-radius: 8px;
                font-family: 'Inter', sans-serif;
                margin-bottom: 10px;
        }
                .preset-grid {
                    display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
        }
                .preset-btn {
                    background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
                padding: 8px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.7rem;
                transition: all 0.2s;
        }
                .preset-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                color: #fff;
        }
                .preset-btn.load {
                    border - color: #00F5FF;
                color: #00F5FF;
        }
                .mode-toggle {
                    display: flex;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 4px;
                gap: 4px;
                margin-bottom: 20px;
        }
                .mode-toggle button {
                    flex: 1;
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                padding: 8px;
                border-radius: 6px;
                font-family: 'Orbitron', sans-serif;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
        }
                .mode-toggle button.active {
                    background: #00F5FF;
                color: #000;
                box-shadow: 0 0 10px rgba(0, 245, 255, 0.4);
        }
      `}</style>
        </div>
    );
};
