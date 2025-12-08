import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';

// Placeholder shader for testing
const PlaceholderShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
            gl_FragColor = vec4(0.5 + 0.5 * cos(uTime + vUv.xyx + vec3(0, 2, 4)), 1.0);
        }
    `
};

interface ShaderCanvasProps {
    shader?: {
        vertexShader: string;
        fragmentShader: string;
        uniforms?: Record<string, any>;
    };
}

export const ShaderCanvas = ({ shader = PlaceholderShader }: ShaderCanvasProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    // const { viewport } = useThree();

    // Store values
    const loopDuration = useStore((state) => state.loopDuration);
    const speed = useStore((state) => state.speed);
    const color = useStore((state) => state.color);
    const glow = useStore((state) => state.glow);
    const isExporting = useStore((state) => state.isExporting);
    const exportTime = useStore((state) => state.exportTime);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) }, // Safe default
        uSpeed: { value: speed },
        uColor: { value: new THREE.Color(color) },
        uGlow: { value: glow },
        uLoopDuration: { value: loopDuration },
        ...shader.uniforms
    }), [shader, speed, color, glow, loopDuration]);

    useFrame((state) => {
        if (materialRef.current) {
            // Update time
            materialRef.current.uniforms.uTime.value = isExporting ? exportTime : state.clock.getElapsedTime();

            // Update resolution
            if (state.size.width > 0 && state.size.height > 0) {
                materialRef.current.uniforms.uResolution.value.set(
                    state.size.width,
                    state.size.height
                );
            }

            // Update dynamic uniforms
            materialRef.current.uniforms.uSpeed.value = speed;
            materialRef.current.uniforms.uColor.value.set(color);
            materialRef.current.uniforms.uGlow.value = glow;
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[100, 100]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={shader.vertexShader}
                fragmentShader={shader.fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                depthTest={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};
