import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectPipeline } from './EffectPipeline';
import { FractalManager } from './FractalManager';
import { Particles } from './Particles';
import { VideoExporter } from './VideoExporter';
import { WatermarkOverlay } from './WatermarkOverlay';
import { useStore } from '../../store';
import { useEffect, useState, Suspense } from 'react';

export const SceneContainer = () => {
    const aspectRatio = useStore((state) => state.aspectRatio);
    const [dimensions, setDimensions] = useState({ width: '100%', height: '100%' });

    useEffect(() => {
        const updateDimensions = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            let targetWidth, targetHeight;

            if (aspectRatio === '9:16') {
                // Mobile Portrait
                if (windowWidth / windowHeight > 9 / 16) {
                    targetHeight = windowHeight;
                    targetWidth = targetHeight * (9 / 16);
                } else {
                    targetWidth = windowWidth;
                    targetHeight = targetWidth * (16 / 9);
                }
            } else if (aspectRatio === '1:1') {
                // Square
                const size = Math.min(windowWidth, windowHeight);
                targetWidth = size;
                targetHeight = size;
            } else {
                // 16:9 Landscape
                if (windowWidth / windowHeight > 16 / 9) {
                    targetHeight = windowHeight;
                    targetWidth = targetHeight * (16 / 9);
                } else {
                    targetWidth = windowWidth;
                    targetHeight = targetWidth * (9 / 16);
                }
            }

            setDimensions({ width: `${targetWidth}px`, height: `${targetHeight}px` });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [aspectRatio]);

    // GSAP Global Timeline Sync
    useEffect(() => {
        console.log(`Global Loop Duration set to: ${useStore.getState().loopDuration}s`);
    }, [useStore.getState().loopDuration]);

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#050510'
        }}>
            <div style={{
                width: dimensions.width,
                height: dimensions.height,
                boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                transition: 'all 0.3s ease',
                position: 'relative'
            }}>
                <Canvas
                    dpr={[1, 2]}
                    gl={{ antialias: false, stencil: false, depth: false }}
                    camera={{ position: [0, 0, 5], fov: 75 }}
                >
                    <color attach="background" args={['#000000']} />
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />

                    <Suspense fallback={null}>
                        <FractalManager />
                        <Particles />
                        <EffectPipeline />
                        <WatermarkOverlay />
                        <VideoExporter />
                    </Suspense>

                    <OrbitControls enableDamping />
                </Canvas>
            </div>
        </div>
    );
};
