"use client";

import React, { Suspense, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { Tesseract } from "./Tesseract";
import { Footer } from "./Footer";
import { toggleTheme, useTheme, type Theme } from "./theme";
import s from "./home.module.css";

/** Fundo do canvas por tema (= --bg da página). */
const PANEL_BG = { dark: "#080808", light: "#f4f0e8" } as const;

/**
 * Raio da esfera que envolve o cubo em qualquer pose:
 * meia-diagonal do cubo (1.25·√3 ≈ 2.17) × pulso do clique (1.15)
 * + amplitude do Float (0.2) + folga para o bloom.
 */
const CUBE_RADIUS = 2.75;

/** Presença do cubo no desktop: ~25% maior que a versão anterior. */
const PRESENCE = 1.25;

/** Aproximação/afastamento: ciclo, escala e deriva lateral (px). */
const DRIFT_PERIOD = 10;
const DRIFT = {
    wide: { min: 0.95, max: 1.08, shiftPx: 18 },
    compact: { min: 0.98, max: 1.03, shiftPx: 4 },
};

/** Largura extra do canvas de cada lado no desktop (= --overhang no CSS). */
const OVERHANG_PX = 20;

/**
 * Enquadra a câmera. No mobile a esfera inteira (com pico da aproximação)
 * cabe no menor eixo. No desktop o cubo ganha PRESENCE e o canvas tem
 * OVERHANG_PX a mais de cada lado: o cubo pode passar da borda interna do
 * painel e a máscara do canvas o dissolve sem corte duro.
 */
function FitCamera({ wide }: { wide: boolean }) {
    const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
    const { width, height } = useThree((st) => st.size);

    useLayoutEffect(() => {
        if (!width || !height) return;
        const frameW = wide ? Math.max(1, width - 2 * OVERHANG_PX) : width;
        const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
        const hHalf = Math.atan(Math.tan(vHalf) * (frameW / height));
        const half = Math.min(vHalf, hHalf);
        const radius = wide ? CUBE_RADIUS / PRESENCE : CUBE_RADIUS * DRIFT.compact.max;
        camera.position.set(0, 0, radius / Math.sin(half));
        camera.updateProjectionMatrix();
    }, [camera, width, height, wide]);

    return null;
}

/**
 * Movimento lento de aproximação e afastamento (senoide: sem quique),
 * com leve deriva lateral. A rotação do cubo segue intacta por dentro.
 */
function Drift({ wide, still, children }: { wide: boolean; still: boolean; children: React.ReactNode }) {
    const ref = useRef<THREE.Group>(null);

    useFrame(({ clock, camera, size }) => {
        const g = ref.current;
        if (!g) return;
        if (still) {
            g.scale.setScalar(1);
            g.position.x = 0;
            return;
        }
        const d = wide ? DRIFT.wide : DRIFT.compact;
        const phase = (clock.getElapsedTime() / DRIFT_PERIOD) * Math.PI * 2;
        // começa no meio da faixa de escala, subindo
        const k = (1 + Math.sin(phase)) / 2;
        g.scale.setScalar(d.min + (d.max - d.min) * k);
        // px → unidades do mundo no plano z = 0
        const cam = camera as THREE.PerspectiveCamera;
        const unitsPerPx =
            (2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))) / size.height;
        g.position.x = Math.sin(phase * 0.5) * d.shiftPx * unitsPerPx;
    });

    return <group ref={ref}>{children}</group>;
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

const WIDE_QUERY = "(min-width: 1024px)";

function subscribeWide(cb: () => void) {
    const mq = window.matchMedia(WIDE_QUERY);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
}

function useWide() {
    return useSyncExternalStore(
        subscribeWide,
        () => window.matchMedia(WIDE_QUERY).matches,
        () => true,
    );
}

/**
 * Fundo do canvas acompanha o tema na mesma duração da página (~450 ms),
 * sem flash: no primeiro quadro assume o tema atual direto.
 */
function ThemeBackground({ theme }: { theme: Theme }) {
    // Só monta no cliente (dentro do Canvas): lê o tema já aplicado no <html>.
    const [initial] = useState(() =>
        document.documentElement.dataset.theme === "light" ? PANEL_BG.light : PANEL_BG.dark,
    );
    const color = useRef<THREE.Color>(null);
    const target = useRef(new THREE.Color(initial));
    const from = useRef(new THREE.Color(initial));
    const start = useRef(-1);

    useLayoutEffect(() => {
        const c = color.current;
        const next = new THREE.Color(PANEL_BG[theme]);
        if (!c || c.equals(next)) return;
        from.current.copy(c);
        target.current.copy(next);
        start.current = performance.now();
    }, [theme]);

    useFrame(() => {
        const c = color.current;
        if (start.current < 0 || !c) return;
        const t = Math.min(1, (performance.now() - start.current) / 450);
        // mesma curva da página: cubic-bezier(0.22, 1, 0.36, 1) ≈ easeOutQuint
        const k = 1 - Math.pow(1 - t, 5);
        c.copy(from.current).lerp(target.current, k);
        if (t === 1) start.current = -1;
    });

    return <color ref={color} attach="background" args={[initial]} />;
}

/** Painel de marca: nome no alto, cubo abaixo, links discretos na base. */
export function Hero() {
    const [ready, setReady] = useState(false);
    const reduced = usePrefersReducedMotion();
    const wide = useWide();
    const theme = useTheme();
    const pulseRef = useRef<(() => void) | null>(null);

    // Teclado: mesmo efeito do clique no cubo (RGB + tema), uma vez.
    const activateFromKeyboard = () => {
        pulseRef.current?.();
        toggleTheme();
    };

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

            <div className={s.stage} data-ready={ready}>
                <Suspense fallback={null}>
                    <Canvas
                        aria-hidden="true"
                        dpr={[1, 2]}
                        gl={{
                            antialias: true,
                            toneMapping: THREE.ReinhardToneMapping,
                            toneMappingExposure: 1.5,
                        }}
                        camera={{ position: [0, 0, 8], fov: 40 }}
                        onCreated={() => setReady(true)}
                    >
                        <ThemeBackground theme={theme} />
                        <FitCamera wide={wide} />

                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} color="#a5b4fc" />
                        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#6366f1" />
                        <pointLight position={[0, 10, 0]} intensity={1} color="#ffffff" />

                        <Drift wide={wide} still={reduced}>
                            <Tesseract still={reduced} pulseRef={pulseRef} onActivate={toggleTheme} />
                        </Drift>

                        <Environment preset="city" />
                    </Canvas>
                </Suspense>
                {/* Acesso por teclado ao cubo. Não intercepta o mouse
                    (pointer-events: none): o clique vai para o próprio cubo. */}
                <button
                    type="button"
                    className={s.cubeToggle}
                    onClick={activateFromKeyboard}
                    aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                />
            </div>

            <Footer className={s.foot} />
        </aside>
    );
}
