import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '../components/ThreeCanvas';
import type { VideoTemplateProps } from '../types';
import { loadTextures } from '../utils/threeHelpers';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform float progress;
  uniform float time;
  varying vec2 vUv;

  const float PI = 3.14159265359;

  void main() {
    vec2 uv = vUv - 0.5;
    
    // Kaleidoscope effect
    float segments = 6.0;
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    // Rotate entire view slowly
    angle += time * 0.1;
    
    // Segment mapping
    angle = mod(angle, 2.0 * PI / segments);
    angle = abs(angle - PI / segments);
    
    vec2 mappedUv = vec2(cos(angle), sin(angle)) * radius + 0.5;
    
    // Ensure UVs stay in bounds (mirroring/repeat)
    mappedUv = abs(mod(mappedUv - 0.5, 1.0)); // Mirror repeat?
    // Or just clamp?
    // Let's try simple mapping first.
    mappedUv = vec2(cos(angle), sin(angle)) * radius + 0.5;

    // Crossfade textures
    vec4 t1 = texture2D(texture1, mappedUv);
    vec4 t2 = texture2D(texture2, mappedUv);
    
    vec4 color = mix(t1, t2, progress);
    
    // Color boost (saturation/brightness)
    // Simple saturation boost
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 saturated = mix(vec3(gray), color.rgb, 1.2 + sin(time)*0.2);
    
    gl_FragColor = vec4(saturated, 1.0);
  }
`;

export const KaleidoscopeFlow: React.FC<VideoTemplateProps> = ({
    images,
    isPlaying,
    currentTime,
    duration,
    canvasRef,
    width = 1080,
    height = 1080
}) => {
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);
    const texturesRef = useRef<THREE.Texture[]>([]);
    const currentIndexRef = useRef(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleInit = async (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
        let textures = await loadTextures(images);

        if (textures.length === 0) {
            console.warn("No textures loaded for KaleidoscopeFlow, using placeholders");
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#9370DB'; // Medium Purple
                ctx.fillRect(0, 0, 512, 512);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '48px sans-serif';
                ctx.fillText('No Image', 150, 256);
            }
            const placeholder = new THREE.CanvasTexture(canvas);
            textures = [placeholder, placeholder];
        }

        texturesRef.current = textures;
        setIsLoaded(true);

        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                texture1: { value: textures[0] },
                texture2: { value: textures[1] || textures[0] },
                progress: { value: 0 },
                time: { value: 0 }
            },
            vertexShader,
            fragmentShader,
            side: THREE.DoubleSide
        });
        materialRef.current = material;

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Fit to screen
        const dist = camera.position.z;
        const vFov = camera.fov * Math.PI / 180;
        const h = 2 * Math.tan(vFov / 2) * dist;
        const w = h * camera.aspect;
        mesh.scale.set(w / 2, h / 2, 1);
    };

    const handleAnimate = (time: number, deltaTime: number) => {
        if (!materialRef.current || texturesRef.current.length < 2) return;

        const effectiveTime = currentTime !== undefined ? currentTime : time;
        materialRef.current.uniforms.time.value = effectiveTime;

        // Logic for crossfade based on absolute time
        const stayDuration = 3.0;
        const transitionDuration = 2.0;
        const cycleDuration = stayDuration + transitionDuration;

        const totalImages = texturesRef.current.length;
        const totalCycleDuration = cycleDuration * totalImages;

        const loopedTime = effectiveTime % totalCycleDuration;

        const currentCycleIndex = Math.floor(loopedTime / cycleDuration);
        const timeInCycle = loopedTime % cycleDuration;

        const nextCycleIndex = (currentCycleIndex + 1) % totalImages;

        materialRef.current.uniforms.texture1.value = texturesRef.current[currentCycleIndex];
        materialRef.current.uniforms.texture2.value = texturesRef.current[nextCycleIndex];

        if (timeInCycle < stayDuration) {
            materialRef.current.uniforms.progress.value = 0;
        } else {
            const transitionTime = timeInCycle - stayDuration;
            materialRef.current.uniforms.progress.value = Math.min(1, transitionTime / transitionDuration);
        }
    };

    return (
        <div className="relative w-full h-full bg-purple-50">
            {!isLoaded && <div className="absolute inset-0 flex items-center justify-center text-purple-400">Loading Kaleidoscope...</div>}
            <ThreeCanvas
                onInit={handleInit}
                onAnimate={handleAnimate}
                canvasRef={canvasRef}
                width={width}
                height={height}
                className="w-full h-full"
            />
        </div>
    );
};
