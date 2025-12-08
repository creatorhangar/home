import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SingularityMaterial = {
  uniforms: {
    time: { value: 0 },
    color1: { value: new THREE.Color('#7B2CBF') }, // Deep Purple
    color2: { value: new THREE.Color('#000000') }, // Void Black
    distortionStrength: { value: 2.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float distortionStrength;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // Gravitational Lensing / Suction Effect
      // Distort UVs towards the center (assuming center is at y=0.5 for cylinder UVs or similar)
      // For a tunnel, usually y is depth. Let's assume x is around, y is depth.
      
      // Create a "sinkhole" effect where texture moves faster as it gets "deeper" (y increases or decreases)
      float speed = 1.0 + (1.0 - uv.y) * 5.0; // Accelerate towards end
      float offset = time * speed;
      
      // Warp effect
      vec2 warpedUv = uv;
      warpedUv.y -= offset;
      
      // Grid/Event Horizon pattern
      float grid = sin(warpedUv.x * 20.0) * sin(warpedUv.y * 20.0);
      grid = smoothstep(0.4, 0.6, grid);
      
      // Color mixing
      vec3 finalColor = mix(color2, color1, grid);
      
      // Event Horizon Glow (fresnel-ish)
      float glow = 1.0 / (length(vUv.y) * 2.0 + 0.1); // Stronger glow at "entrance"
      
      // Darken towards the "singularity" (end of tunnel)
      finalColor *= smoothstep(0.0, 0.5, uv.y); 
      
      // Add glow
      finalColor += color1 * glow * 0.5;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export const SingularityTunnel = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((_state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      {/* Inverted Cylinder for Tunnel Effect */}
      <cylinderGeometry args={[5, 1, 50, 32, 1, true]} />
      <shaderMaterial
        ref={materialRef}
        {...SingularityMaterial}
        side={THREE.BackSide}
        transparent
      />
    </mesh>
  );
};
