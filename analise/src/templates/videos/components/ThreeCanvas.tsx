import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
    onInit: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void;
    onAnimate: (time: number, deltaTime: number) => void;
    onResize?: (width: number, height: number) => void;
    canvasRef?: (canvas: HTMLCanvasElement | null) => void;
    className?: string;
    width?: number;
    height?: number;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
    onInit,
    onAnimate,
    // onResize,
    canvasRef,
    className,
    width = 1080,
    height = 1080
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const frameIdRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        // Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Ensure canvas fits container visually while keeping internal resolution
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';

        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        if (canvasRef) {
            canvasRef(renderer.domElement);
        }

        // Init user logic
        onInit(scene, camera, renderer);

        // Animation Loop
        const animate = (time: number) => {
            const deltaTime = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            onAnimate(time / 1000, deltaTime);
            renderer.render(scene, camera);
            frameIdRef.current = requestAnimationFrame(animate);
        };
        frameIdRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameIdRef.current);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [width, height]);

    return <div ref={containerRef} className={className} />;
};
