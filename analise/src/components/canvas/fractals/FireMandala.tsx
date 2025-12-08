import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';


const FireMaterial = {
    uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#FF4444') },
        color2: { value: new THREE.Color('#FFD700') },
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

    // Simplex noise function (simplified)
    float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv - 0.5;
      float r = length(uv);
      float a = atan(uv.y, uv.x);
      
      // Spiral effect
      float spiral = sin(r * 20.0 - time * 5.0 + a * 5.0);
      
      // Heat distortion
      float heat = noise(uv * 10.0 + time) * 0.1;
      
      // Color mixing
      vec3 finalColor = mix(color1, color2, spiral * 0.5 + 0.5 + heat);
      
      // Alpha fade out at edges
      float alpha = 1.0 - smoothstep(0.3, 0.5, r);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

export const FireMandala = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Hardcoded values to replace Leva
    const speed = 1.0;
    const fireColor1 = '#FF4444';
    const fireColor2 = '#FFD700';

    useFrame((_state, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value += delta * speed;
            materialRef.current.uniforms.color1.value.set(fireColor1);
            materialRef.current.uniforms.color2.value.set(fireColor2);
        }
        if (meshRef.current) {
            meshRef.current.rotation.z -= delta * 0.2 * speed;
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[10, 10]} />
            <shaderMaterial
                ref={materialRef}
                {...FireMaterial}
                side={THREE.DoubleSide}
                transparent
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};
