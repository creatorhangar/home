"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";

// --- ASSETS & CONFIG ---
const THEME = {
    accent: "#a5b4fc", // Indigo soft
};

interface StarFieldProps {
    warpSpeed?: boolean;
}

export function StarField({ count = 2000, warpSpeed = false }: StarFieldProps & { count?: number }) {
    const mesh = useRef<THREE.Points>(null);
    const { camera, raycaster, pointer } = useThree();

    // Generate particles
    const { particles, originalPositions } = useMemo(() => {
        const temp = [];
        const orig = [];
        for (let i = 0; i < count; i++) {
            // Spherical distribution
            const r = 15 + Math.random() * 30;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            temp.push(x, y, z);
            orig.push(x, y, z);
        }
        return {
            particles: new Float32Array(temp),
            originalPositions: new Float32Array(orig)
        };
    }, [count]);

    // Handle Global Click (Black Hole Effect - Position Only)
    useEffect(() => {
        const handleClick = () => {
            if (!mesh.current) return;

            // Calculate click direction in 3D
            raycaster.setFromCamera(pointer, camera);
            const targetPoint = new THREE.Vector3();
            raycaster.ray.at(10, targetPoint); // Point 10 units away

            const positions = mesh.current.geometry.attributes.position.array as Float32Array;
            const dummyObj = { t: 0 };

            // Animate 't' from 0 to 1 and back
            gsap.to(dummyObj, {
                t: 1,
                duration: 0.3,
                ease: "power4.in",
                onUpdate: () => {
                    for (let i = 0; i < count; i++) {
                        const ix = i * 3;
                        const iy = i * 3 + 1;
                        const iz = i * 3 + 2;

                        const cx = positions[ix];
                        const cy = positions[iy];
                        const cz = positions[iz];

                        // Pull towards target
                        positions[ix] = THREE.MathUtils.lerp(cx, targetPoint.x * 2, 0.05);
                        positions[iy] = THREE.MathUtils.lerp(cy, targetPoint.y * 2, 0.05);
                        positions[iz] = THREE.MathUtils.lerp(cz, targetPoint.z * 2, 0.05);
                    }
                    mesh.current!.geometry.attributes.position.needsUpdate = true;
                },
                onComplete: () => {
                    // Release / Elastic Return
                    const returnObj = { t: 0 };
                    gsap.to(returnObj, {
                        t: 1,
                        duration: 1.5,
                        ease: "elastic.out(1, 0.3)",
                        onUpdate: () => {
                            for (let i = 0; i < count; i++) {
                                const ix = i * 3;
                                const iy = i * 3 + 1;
                                const iz = i * 3 + 2;

                                // Lerp back to original positions
                                const currentX = positions[ix];
                                const currentY = positions[iy];
                                const currentZ = positions[iz];

                                const origX = originalPositions[ix];
                                const origY = originalPositions[iy];
                                const origZ = originalPositions[iz];

                                positions[ix] = THREE.MathUtils.lerp(currentX, origX, 0.1);
                                positions[iy] = THREE.MathUtils.lerp(currentY, origY, 0.1);
                                positions[iz] = THREE.MathUtils.lerp(currentZ, origZ, 0.1);
                            }
                            mesh.current!.geometry.attributes.position.needsUpdate = true;
                        }
                    });
                }
            });
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [count, originalPositions, camera, pointer, raycaster]);

    useFrame((state) => {
        if (mesh.current) {
            // Warp Speed Logic (Stretching Z)
            if (warpSpeed) {
                mesh.current.scale.z = THREE.MathUtils.lerp(mesh.current.scale.z, 20, 0.1);
                mesh.current.rotation.z += 0.02;
            } else {
                mesh.current.scale.z = THREE.MathUtils.lerp(mesh.current.scale.z, 1, 0.1);
                // Idle Rotation
                mesh.current.rotation.y = state.clock.getElapsedTime() * 0.02;
                mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.01;
            }
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                    args={[particles, 3]}
                />
            </bufferGeometry>
            {/* Removed texture for "fine stardust" look */}
            <pointsMaterial
                size={0.02} // Small fixed size
                sizeAttenuation={true}
                transparent
                opacity={0.8}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                color={THEME.accent}
            />
        </points>
    );
}
