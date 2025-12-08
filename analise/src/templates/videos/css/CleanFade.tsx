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
  uniform float zoom1;
  uniform float zoom2;
  varying vec2 vUv;

  vec2 zoomUv(vec2 uv, float zoom) {
    vec2 center = vec2(0.5);
    return (uv - center) / zoom + center;
  }

  void main() {
    vec2 uv1 = zoomUv(vUv, zoom1);
    vec2 uv2 = zoomUv(vUv, zoom2);

    vec4 c1 = texture2D(texture1, uv1);
    vec4 c2 = texture2D(texture2, uv2);

    gl_FragColor = mix(c1, c2, progress);
  }
`;

export const CleanFade: React.FC<VideoTemplateProps> = ({
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
  const [isLoaded, setIsLoaded] = useState(false);

  const handleInit = async (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    let textures = await loadTextures(images);

    if (textures.length === 0) {
      // Placeholder logic
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.fillStyle = '#eee'; ctx.fillRect(0, 0, 512, 512); }
      textures = [new THREE.CanvasTexture(canvas)];
    }

    texturesRef.current = textures;
    setIsLoaded(true);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        texture1: { value: textures[0] },
        texture2: { value: textures[1] || textures[0] },
        progress: { value: 0 },
        zoom1: { value: 1.0 },
        zoom2: { value: 1.0 }
      },
      vertexShader,
      fragmentShader
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  };

  const handleAnimate = (time: number, deltaTime: number) => {
    if (!materialRef.current || texturesRef.current.length === 0) return;

    const effectiveTime = currentTime !== undefined ? currentTime : time;
    const totalImages = texturesRef.current.length;

    // Timing configuration
    const slideDuration = 4.0; // Total time per slide
    const transitionDuration = 1.0; // Fade time

    const totalDuration = slideDuration * totalImages;
    const loopedTime = effectiveTime % totalDuration;

    const currentIndex = Math.floor(loopedTime / slideDuration);
    const nextIndex = (currentIndex + 1) % totalImages;

    const timeInSlide = loopedTime % slideDuration;

    // Update textures
    materialRef.current.uniforms.texture1.value = texturesRef.current[currentIndex];
    materialRef.current.uniforms.texture2.value = texturesRef.current[nextIndex];

    // Calculate progress (fade)
    // Fade starts at (slideDuration - transitionDuration)
    let progress = 0;
    if (timeInSlide > (slideDuration - transitionDuration)) {
      progress = (timeInSlide - (slideDuration - transitionDuration)) / transitionDuration;
    }
    materialRef.current.uniforms.progress.value = progress;

    // Ken Burns Effect (Zoom)
    // Zoom from 1.0 to 1.1 over the slide duration
    const zoomProgress = timeInSlide / slideDuration;
    materialRef.current.uniforms.zoom1.value = 1.0 + (zoomProgress * 0.1);
    materialRef.current.uniforms.zoom2.value = 1.0 + ((timeInSlide / slideDuration) * 0.1); // Simplified for next slide
  };

  return (
    <div className="relative w-full h-full bg-black">
      {!isLoaded && <div className="absolute inset-0 flex items-center justify-center text-white">Loading...</div>}
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
