"use client";

import React, { Suspense, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { Tesseract } from "./Tesseract";
import { Footer } from "./Footer";
import s from "./home.module.css";

const PANEL_BG = "#111111";

/**
 * Raio da esfera que envolve o cubo em qualquer pose:
 * meia-diagonal do cubo (1.25·√3 ≈ 2.17) × pulso do clique (1.15)
 * + amplitude do Float (0.2) + folga para o bloom.
 */
const CUBE_RADIUS = 2.75;

/** Afasta a câmera até a esfera caber no menor eixo do canvas. */
function FitCamera() {
    const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
    const { width, height } = useThree((st) => st.size);

    useLayoutEffect(() => {
        if (!width || !height) return;
        const aspect = width / height;
        const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
        const hHalf = Math.atan(Math.tan(vHalf) * aspect);
        const half = Math.min(vHalf, hHalf);
        camera.position.set(0, 0, CUBE_RADIUS / Math.sin(half));
        camera.updateProjectionMatrix();
    }, [camera, width, height]);

    return null;
}

function subscribeReducedMotion(cb: () => void) {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
}

function usePrefersReducedMotion() {
    return useSyncExternalStore(
        subscribeReducedMotion,
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        () => false,
    );
}

/** Painel de marca: nome no alto, cubo abaixo, links discretos na base. */
export function Hero() {
    const [ready, setReady] = useState(false);
    const reduced = usePrefersReducedMotion();

    return (
        <aside className={s.panel}>
            <h1 className={s.brand}>
                <span className={s.line}>
                    <span className={s.word}>Creator</span>
                </span>
                <span className={s.line}>
                    <span className={`${s.word} ${s.italic}`}>Hangar</span>
                </span>
            </h1>

            <div className={s.stage} data-ready={ready} aria-hidden="true">
                <Suspense fallback={null}>
                    <Canvas
                        dpr={[1, 2]}
                        gl={{
                            antialias: true,
                            toneMapping: THREE.ReinhardToneMapping,
                            toneMappingExposure: 1.5,
                        }}
                        camera={{ position: [0, 0, 8], fov: 40 }}
                        onCreated={() => setReady(true)}
                    >
                        <color attach="background" args={[PANEL_BG]} />
                        <FitCamera />

                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} color="#a5b4fc" />
                        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#6366f1" />
                        <pointLight position={[0, 10, 0]} intensity={1} color="#ffffff" />

                        <Tesseract still={reduced} />

                        <Environment preset="city" />
                    </Canvas>
                </Suspense>
            </div>

            <Footer className={s.foot} />
        </aside>
    );
}
