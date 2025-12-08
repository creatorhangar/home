import React, { useState } from 'react';
import { X, Play, Pause, Download, Wand2 } from 'lucide-react';
import { videoTemplates } from '../templates/videos/registry';
// import { VideoTemplateCategory, VideoTemplateProps } from '../templates/videos/types';

interface VideoStudioProps {
    images: string[];
    onClose: () => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ images, onClose }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(videoTemplates[0].id);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(15); // Default duration
    const [isExporting, setIsExporting] = useState(false);

    const requestRef = React.useRef<number>();
    const startTimeRef = React.useRef<number>(0);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

    const selectedTemplate = videoTemplates.find(t => t.id === selectedTemplateId);

    // Update duration when template changes
    React.useEffect(() => {
        if (selectedTemplate) {
            setDuration(selectedTemplate.duration);
            setCurrentTime(0);
            startTimeRef.current = performance.now();
        }
    }, [selectedTemplateId]);

    // Animation Loop for Timeline
    const animate = (time: number) => {
        if (isPlaying) {
            // Simple loop based on real time
            // In a real app, we might sync this with the Three.js clock more tightly
            // But for UI feedback, this is okay.
            // Actually, for Three.js, we pass currentTime.
            // So we need to update currentTime state.

            // Note: Updating state every frame (60fps) might be heavy for React.
            // But for a timeline slider, it's often necessary.
            // We can optimize by using a ref for the actual time and only updating state for UI.
            // For now, let's try direct state update.

            setCurrentTime(prev => {
                const next = prev + 0.016; // Approx 60fps
                return next >= duration ? 0 : next;
            });
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    React.useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, duration]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        // If seeking, maybe pause?
        // setIsPlaying(false);
    };

    const handleExport = () => {
        if (!canvasRef.current) {
            alert("Canvas not found");
            return;
        }

        setIsExporting(true);
        setIsPlaying(true); // Ensure playing for recording
        setCurrentTime(0); // Start from beginning

        const canvas = canvasRef.current;
        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `video-${selectedTemplateId}-${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
            setIsExporting(false);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;

        // Stop after duration
        setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        }, duration * 1000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/95 backdrop-blur">
                <div className="flex items-center gap-3">
                    <Wand2 className="w-6 h-6 text-purple-400" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Video Showcase Studio
                    </h1>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Templates */}
                <div className="w-80 border-r border-gray-800 overflow-y-auto p-4 bg-gray-900">
                    <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Templates</h2>
                    <div className="space-y-3">
                        {videoTemplates.map(template => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplateId(template.id)}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedTemplateId === template.id
                                    ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50'
                                    : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800'
                                    }`}
                            >
                                <div className="font-medium text-gray-200">{template.name}</div>
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {template.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Preview Area */}
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-950 p-8 relative">

                    {/* Preview Container */}
                    <div className="relative aspect-square max-h-[70vh] w-full max-w-[70vh] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-800 mb-8">
                        {selectedTemplate && (
                            <selectedTemplate.component
                                images={images}
                                isPlaying={isPlaying}
                                currentTime={currentTime}
                                duration={duration}
                                canvasRef={(canvas) => canvasRef.current = canvas}
                                width={1080}
                                height={1080}
                            />
                        )}

                        {isExporting && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                    <p className="text-white font-medium">Rendering Video...</p>
                                    <p className="text-white/60 text-sm">Please wait</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline Controls */}
                    <div className="w-full max-w-3xl bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-700/50 p-4">
                        <div className="flex items-center gap-4 mb-2">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </button>

                            <span className="text-xs font-mono text-gray-400 w-12">
                                {formatTime(currentTime)}
                            </span>

                            <input
                                type="range"
                                min="0"
                                max={duration}
                                step="0.1"
                                value={currentTime}
                                onChange={handleSeek}
                                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />

                            <span className="text-xs font-mono text-gray-400 w-12">
                                {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex justify-end border-t border-gray-800 pt-3 mt-2">
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className={`flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-medium text-sm transition-colors ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Download className="w-4 h-4" />
                                {isExporting ? 'Exporting...' : 'Export Video'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
