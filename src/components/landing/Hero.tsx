"use client";

import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { Tesseract } from "./Tesseract";
import { StarField } from "./StarField";
import { UILayer } from "./UILayer";
import { clsx } from "clsx";

// --- ASSETS & CONFIG ---
const THEME = {
    void: "#050505",
};

// --- LOADING SCREEN ---
function Loader() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-1000">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-t-2 border-indigo-500 rounded-full animate-spin" />
                <span className="text-indigo-500 text-xs tracking-[0.5em] uppercase animate-pulse">Carregando Hangar</span>
            </div>
        </div>
    );
}

export function Hero() {
    const [ready, setReady] = useState(false);
    const [warpSpeed, setWarpSpeed] = useState(false);
    const [auroraActive, setAuroraActive] = useState(false);

    // Easter Egg 1: Warp Speed (Double Click)
    const handleDoubleClick = () => {
        setWarpSpeed(true);
        // Reset after 0.5s + transition time
        setTimeout(() => setWarpSpeed(false), 800);
    };

    return (
        <div
            className="relative w-full h-screen bg-[#050505] overflow-hidden font-sans selection:bg-indigo-500 selection:text-white"
            onDoubleClick={handleDoubleClick}
        >

            {/* 3D SCENE */}
            <div className="absolute inset-0 z-0">
                <Suspense fallback={null}>
                    <Canvas
                        dpr={[1, 2]}
                        gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
                        camera={{ position: [0, 0, 6], fov: warpSpeed ? 100 : 40 }}
                        onCreated={() => setReady(true)}
                    >
                        <color attach="background" args={[THEME.void]} />

                        {/* Iluminação Aprimorada */}
                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} color="#a5b4fc" />
                        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#6366f1" />
                        <pointLight position={[0, 10, 0]} intensity={1} color="#ffffff" />

                        {/* Elementos 3D */}
                        <StarField warpSpeed={warpSpeed} />
                        <Tesseract onAurora={setAuroraActive} />

                        {/* Reflexos no Vidro */}
                        <Environment preset="city" />
                    </Canvas>
                </Suspense>
            </div>

            {/* Aurora Burst Overlay (Easter Egg 2) */}
            <div
                className={clsx(
                    "absolute inset-0 pointer-events-none transition-opacity duration-1000 z-10",
                    auroraActive ? "opacity-30" : "opacity-0"
                )}
                style={{
                    background: "linear-gradient(45deg, #4c1d95, #2e1065, #000000)" // Deep Purple Gradient
                }}
            />

            {/* HTML UI OVERLAY */}
            {ready && <UILayer />}

            {/* LOADING STATE */}
            {!ready && <Loader />}
        </div>
    );
}
