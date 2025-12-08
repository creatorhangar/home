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

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    
    // Liquid distortion effect
    float noise = snoise(uv * 3.0 + time * 0.5);
    float dist = progress * 2.0; // Intensity
    
    vec2 distortedUv1 = uv + vec2(noise * dist * progress, noise * dist * progress);
    vec2 distortedUv2 = uv - vec2(noise * dist * (1.0 - progress), noise * dist * (1.0 - progress));

    vec4 t1 = texture2D(texture1, uv); // Keep base stable? Or distort?
    // Let's distort the transition
    
    // Melt effect: 
    // As progress goes 0->1, texture1 melts down, texture2 forms up.
    
    float melt = snoise(vec2(uv.x * 10.0, uv.y * 10.0 + time));
    
    // Simple crossfade with noise threshold for "melting" look
    float threshold = progress;
    // Soft edge
    float edge = 0.1;
    float mask = smoothstep(threshold - edge, threshold + edge, noise * 0.5 + uv.y); // Vertical melt
    
    // Candy colors overlay
    vec3 candyPink = vec3(1.0, 0.71, 0.76);
    vec3 candyBlue = vec3(0.71, 0.84, 1.0);
    
    vec4 color1 = texture2D(texture1, uv);
    vec4 color2 = texture2D(texture2, uv);
    
    // Mix based on progress
    vec4 finalColor = mix(color1, color2, progress);
    
    // Add some "candy glow"
    float glow = max(0.0, sin(time * 2.0)) * 0.1;
    finalColor.rgb += glow * candyPink;

    gl_FragColor = finalColor;
  }
`;

export const CandyMeltMorph: React.FC<VideoTemplateProps> = ({
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
    // Load textures
    let textures = await loadTextures(images);

    if (textures.length === 0) {
      console.warn("No textures loaded for CandyMeltMorph, using placeholders");
      // Create a placeholder texture
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF69B4'; // Hot pink
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

    // Create Plane
    const geometry = new THREE.PlaneGeometry(2, 2); // Full screen quad
    const material = new THREE.ShaderMaterial({
      uniforms: {
        texture1: { value: textures[0] },
        texture2: { value: textures[1] || textures[0] },
        progress: { value: 0 },
        time: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide // Ensure visibility from both sides just in case
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Fit plane to view
    const dist = camera.position.z;
    const vFov = camera.fov * Math.PI / 180;
    const height = 2 * Math.tan(vFov / 2) * dist;
    const width = height * camera.aspect;
    mesh.scale.set(width / 2, height / 2, 1);
  };

  const handleAnimate = (time: number, deltaTime: number) => {
    if (!materialRef.current || texturesRef.current.length < 2) return;

    // Use external time if provided (for seeking/timeline), otherwise use internal time
    const effectiveTime = currentTime !== undefined ? currentTime : time;

    materialRef.current.uniforms.time.value = effectiveTime;

    const stayDuration = 2.0;
    const transitionDuration = 1.5;
    const cycleDuration = stayDuration + transitionDuration;

    const totalImages = texturesRef.current.length;
    const totalCycleDuration = cycleDuration * totalImages;

    // Wrap time
    const loopedTime = effectiveTime % totalCycleDuration;

    const currentCycleIndex = Math.floor(loopedTime / cycleDuration);
    const timeInCycle = loopedTime % cycleDuration;

    const nextCycleIndex = (currentCycleIndex + 1) % totalImages;

    // Update textures
    materialRef.current.uniforms.texture1.value = texturesRef.current[currentCycleIndex];
    materialRef.current.uniforms.texture2.value = texturesRef.current[nextCycleIndex];

    // Update progress
    if (timeInCycle < stayDuration) {
      materialRef.current.uniforms.progress.value = 0;
    } else {
      const transitionTime = timeInCycle - stayDuration;
      materialRef.current.uniforms.progress.value = Math.min(1, transitionTime / transitionDuration);
    }
  };

  return (
    <div className="relative w-full h-full bg-pink-50">
      {!isLoaded && <div className="absolute inset-0 flex items-center justify-center text-pink-400">Loading Candy...</div>}
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
