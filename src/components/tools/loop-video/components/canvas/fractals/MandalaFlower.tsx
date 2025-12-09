import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';

export const MandalaFlower = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const loopDuration = useStore((state) => state.loopDuration);

    // Hardcoded for now, could be in store
    const layers = 12;
    const petalsPerLayer = 24;
    const mandalaColor = '#FFD700';

    const count = layers * petalsPerLayer;

    useFrame((state) => {
        if (!meshRef.current) return;

        // Perfect Loop Logic
        // We use a progress value from 0 to 1 based on loopDuration
        const time = state.clock.getElapsedTime();
        const progress = (time % loopDuration) / loopDuration;
        const angleOffset = progress * Math.PI * 2;

        let i = 0;
        for (let l = 0; l < layers; l++) {
            const radius = (l + 1) * 0.5;

            // Use sin/cos of angleOffset for perfect looping
            const scale = 1 + Math.sin(angleOffset * 2 + l * 0.5) * 0.3;
            const layerRotation = l % 2 === 0 ? angleOffset : -angleOffset;

            for (let p = 0; p < petalsPerLayer; p++) {
                const angle = (p / petalsPerLayer) * Math.PI * 2 + layerRotation;

                dummy.position.set(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    Math.sin(angleOffset + l) * 0.5 // Wave effect on Z
                );

                dummy.rotation.set(0, 0, angle);
                dummy.scale.set(scale, scale, scale);

                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i++, dummy.matrix);
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true;

        // Color shift
        if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
            meshRef.current.material.color.setHSL(
                (progress) % 1.0,
                1.0,
                0.6
            );
            meshRef.current.material.emissive.setHSL(
                (progress + 0.5) % 1.0,
                1.0,
                0.5
            );
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <coneGeometry args={[0.1, 0.5, 4]} />
            {/* Liquid Glass Material */}
            <meshPhysicalMaterial
                color={mandalaColor}
                emissive={mandalaColor}
                emissiveIntensity={2}
                roughness={0.1}
                metalness={0.8}
                transmission={0.6} // Glass effect
                thickness={2.0}
                transparent
            />
        </instancedMesh>
    );
};
