

export type VideoTemplateCategory =
    | 'static-motion'
    | 'dynamic-transition'
    | 'storytelling'
    | 'fast-dynamic'
    | 'decorative'
    | 'visual-effects'
    | 'minimalist'
    | 'three-special'
    | 'particles'
    | 'hypnotic';

export interface VideoTemplateProps {
    images: string[];
    isPlaying: boolean;
    currentTime?: number; // Current playback time in seconds
    duration?: number; // Total duration in seconds
    canvasRef?: (canvas: HTMLCanvasElement | null) => void; // Ref callback for export
    onComplete?: () => void;
    width?: number;
    height?: number;
    className?: string;
}

export interface VideoTemplate {
    id: string;
    name: string;
    description: string;
    category: VideoTemplateCategory;
    duration: number; // in seconds
    idealImageCount: [number, number]; // min, max
    tags: string[];
    thumbnail?: string;
    component: React.ComponentType<VideoTemplateProps>;
}
