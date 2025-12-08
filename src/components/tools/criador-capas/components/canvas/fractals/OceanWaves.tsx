import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';


export const OceanWaves = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Hardcoded values to replace Leva
    const waveCount = 50;
    const speed = 0.5;
    const waveColor = '#00F5FF';

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime() * speed;

        for (let i = 0; i < waveCount; i++) {
            const z = (i - waveCount / 2) * 0.5;
            const scale = 1 + Math.sin(time + i * 0.1) * 0.5;

            dummy.position.set(0, 0, z);
            dummy.rotation.set(0, 0, time * 0.1 + i * 0.05);
            dummy.scale.set(10 + Math.sin(time + i) * 2 * scale, 10 + Math.cos(time + i) * 2 * scale, 1);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, waveCount]}>
            <torusGeometry args={[1, 0.02, 16, 100]} />
            <meshStandardMaterial
                color={waveColor}
                emissive={waveColor}
                emissiveIntensity={2}
                transparent
                opacity={0.6}
                roughness={0.1}
                metalness={0.9}
            />
        </instancedMesh>
    );
};
