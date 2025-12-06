"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { gsap } from "gsap";

// --- ASSETS & CONFIG ---
const THEME = {
    primary: "#ffffff",
    accent: "#a5b4fc", // Indigo soft
    core: "#6366f1",   // Indigo strong
    void: "#050505",
    glass: "#ffffff",
    glitch: "#FFFFFF"  // White flash
};

interface TesseractProps {
    onAurora?: (active: boolean) => void;
}

export function Tesseract({ onAurora }: TesseractProps) {
    const groupRef = useRef<THREE.Group>(null);
    const outerRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    // State
    const [hovered, setHover] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [glitching, setGlitching] = useState(false);

    // Interaction: Tech Pulse
    const handleClick = (e: any) => {
        e.stopPropagation();
        const newCount = clickCount + 1;
        setClickCount(newCount);

        setGlitching(true);
        setTimeout(() => setGlitching(false), 200);

        if (groupRef.current) {
            const tl = gsap.timeline();
            tl.to(groupRef.current.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 0.1, ease: "power2.in" })
                .to(groupRef.current.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.2, ease: "power4.out" })
                .to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "elastic.out(1, 0.3)" });
        }

        if (newCount % 7 === 0) {
            if (onAurora) onAurora(true);
            setTimeout(() => { if (onAurora) onAurora(false); }, 3000);
        }
    };

    useFrame((state, delta) => {
        if (groupRef.current && outerRef.current && innerRef.current) {
            const rotationSpeed = hovered ? 0.5 : 0.2;
            groupRef.current.rotation.y += delta * rotationSpeed * 0.5;
            outerRef.current.rotation.x += delta * rotationSpeed * 0.2;
            outerRef.current.rotation.z += delta * rotationSpeed * 0.1;
            innerRef.current.rotation.x -= delta * rotationSpeed;
            innerRef.current.rotation.y -= delta * rotationSpeed;
            const breathe = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
            innerRef.current.scale.set(breathe, breathe, breathe);
        }
    });

    return (
        <group position={[0, 0, 0]}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.2, 0.2]}>
                <group ref={groupRef}>
                    {/* Outer Glass Shell */}
                    <mesh
                        ref={outerRef}
                        onClick={handleClick}
                        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
                        onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
                    >
                        <boxGeometry args={[2.5, 2.5, 2.5]} />
                        <MeshTransmissionMaterial
                            backside
                            samples={4}
                            resolution={256}
                            transmission={0.95}
                            thickness={0.2}
                            roughness={0.05}
                            ior={1.15}
                            chromaticAberration={0.05}
                            anisotropy={10}
                            distortion={0.15}
                            distortionScale={0.2}
                            temporalDistortion={0.1}
                            clearcoat={1}
                            attenuationDistance={0.8}
                            attenuationColor="#ffffff"
                            color={glitching ? THEME.glitch : "#e0e7ff"}
                            toneMapped={false}
                        />
                    </mesh>

                    {/* Inner Core - Brighter */}
                    <mesh ref={innerRef}>
                        <octahedronGeometry args={[0.9, 0]} />
                        <meshStandardMaterial
                            emissive={THEME.core}
                            emissiveIntensity={glitching ? 10 : 5}
                            color={THEME.core}
                            roughness={0}
                            toneMapped={false}
                        />
                    </mesh>

                    {/* Outer Wireframe - More Visible */}
                    <mesh scale={[1.15, 1.15, 1.15]}>
                        <boxGeometry args={[1.8, 1.8, 1.8]} />
                        <meshBasicMaterial
                            wireframe
                            color={glitching ? "#00FFFF" : THEME.accent}
                            transparent
                            opacity={0.6}
                            toneMapped={false}
                        />
                    </mesh>

                    {/* Inner Wireframe */}
                    <mesh scale={[0.6, 0.6, 0.6]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                        <boxGeometry args={[1.2, 1.2, 1.2]} />
                        <meshBasicMaterial
                            wireframe
                            color={THEME.accent}
                            transparent
                            opacity={0.8}
                            toneMapped={false}
                        />
                    </mesh>
                </group>
            </Float>

            {/* Post-Processing */}
            <EffectComposer enableNormalPass={false}>
                <Bloom
                    luminanceThreshold={0.9}
                    mipmapBlur
                    intensity={glitching ? 3.5 : 1.5}
                    radius={0.5}
                />
                <ChromaticAberration
                    offset={glitching ? new THREE.Vector2(0.05, 0.05) : new THREE.Vector2(0, 0)}
                    radialModulation={false}
                    modulationOffset={0}
                />
            </EffectComposer>
        </group>
    );
}