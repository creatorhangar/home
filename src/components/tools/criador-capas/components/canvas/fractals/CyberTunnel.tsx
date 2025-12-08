import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';


const TunnelMaterial = {
    uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#FF006E') }, // Neon Pink
        color2: { value: new THREE.Color('#00F5FF') }, // Electric Blue
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
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;

    void main() {
      // Stripe pattern that pulses
      float stripe = sin(vUv.y * 20.0 + time * 5.0);
      stripe = smoothstep(0.3, 0.7, stripe);
      
      // Mix colors based on UV and time
      vec3 finalColor = mix(color1, color2, vUv.y + sin(time));
      
      // Apply stripe pattern
      finalColor *= (0.5 + stripe * 0.5);
      
      // Add glow at the center (far end of tunnel)
      float glow = 1.0 / (length(vUv - 0.5) * 2.0);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export const CyberTunnel = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Hardcoded values to replace Leva
    const speed = 0.5;
    const tunnelColor1 = '#FF006E';
    const tunnelColor2 = '#00F5FF';

    useFrame((_state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.z += delta * 0.2 * speed;
        }
        if (materialRef.current) {
            materialRef.current.uniforms.time.value += delta * speed;
            materialRef.current.uniforms.color1.value.set(tunnelColor1);
            materialRef.current.uniforms.color2.value.set(tunnelColor2);
        }
    });

    return (
        <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[10, 10, 100, 8, 1, true]} />
            <shaderMaterial
                ref={materialRef}
                {...TunnelMaterial}
                side={THREE.BackSide}
                transparent
            />
        </mesh>
    );
};
