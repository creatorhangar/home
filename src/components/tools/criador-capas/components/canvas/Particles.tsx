import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import gsap from 'gsap';

export const Particles = () => {
    const meshRef = useRef<THREE.Points>(null);
    const count = useStore((state) => state.particleCount);
    const currentFractal = useStore((state) => state.currentFractal);

    // Keep these hardcoded or add to store later
    const particleSize = 0.05;
    const particleColor = '#FFFFFF';

    const particles = useMemo(() => {
        const temp = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;

            temp[i * 3] = x;
            temp[i * 3 + 1] = y;
            temp[i * 3 + 2] = z;
        }
        return temp;
    }, [count]);

    // GSAP Animation for Spaghettification
    useEffect(() => {
        if (!meshRef.current) return;

        if (currentFractal === 'Singularity') {
            // Spaghettification Effect: Stretch particles towards center
            gsap.to(meshRef.current.scale, {
                x: 0.1, // Compress width
                y: 0.1, // Compress height
                z: 5.0, // Stretch depth (towards tunnel)
                duration: 2,
                ease: "power2.inOut"
            });
        } else {
            // Reset to normal
            gsap.to(meshRef.current.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 1.5,
                ease: "elastic.out(1, 0.5)"
            });
        }
    }, [currentFractal]);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        // Basic rotation
        meshRef.current.rotation.y = time * 0.05;

        // If Singularity, add suction effect
        if (currentFractal === 'Singularity') {
            meshRef.current.rotation.z += 0.02; // Spin faster into the void
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particles, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={particleSize}
                color={particleColor}
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};
