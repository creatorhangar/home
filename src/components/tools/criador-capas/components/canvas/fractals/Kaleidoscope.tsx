import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';


const KaleidoscopeMaterial = {
  uniforms: {
    time: { value: 0 },
    symmetry: { value: 8 },
    color1: { value: new THREE.Color('#00FF88') },
    color2: { value: new THREE.Color('#0080FF') },
    color3: { value: new THREE.Color('#CC00FF') },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float symmetry;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    varying vec2 vUv;

    #define PI 3.14159265359

    void main() {
      vec2 uv = vUv - 0.5;
      float angle = atan(uv.y, uv.x);
      float radius = length(uv);
      
      // Radial symmetry
      angle = mod(angle, PI * 2.0 / symmetry);
      angle = abs(angle - PI / symmetry);
      
      vec2 symUV = vec2(cos(angle), sin(angle)) * radius;
      
      // Dynamic pattern
      float pattern = sin(symUV.x * 20.0 + time) * sin(symUV.y * 20.0 - time);
      pattern += sin(radius * 20.0 - time * 2.0);
      
      // Color mixing
      vec3 finalColor = mix(color1, color2, pattern * 0.5 + 0.5);
      finalColor = mix(finalColor, color3, sin(radius * 10.0 + time) * 0.5 + 0.5);
      
      // Glow
      finalColor *= (1.0 + smoothstep(0.0, 0.1, radius) * 2.0);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export const Kaleidoscope = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Hardcoded values to replace Leva
  const symmetry = 8;
  const kColor1 = '#00FF88';
  const kColor2 = '#0080FF';
  const kColor3 = '#CC00FF';
  const speed = 0.5;

  useFrame((_state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta * speed;
      materialRef.current.uniforms.symmetry.value = symmetry;
      materialRef.current.uniforms.color1.value.set(kColor1);
      materialRef.current.uniforms.color2.value.set(kColor2);
      materialRef.current.uniforms.color3.value.set(kColor3);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        ref={materialRef}
        {...KaleidoscopeMaterial}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  );
};
