"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Cada demonstração monta uma timeline gsap (a mesma biblioteca do resto da
 * home) que anima objetos de estado; `apply` escreve esse estado no SVG.
 * A timeline só corre enquanto o SVG está visível. Com movimento reduzido,
 * fica no quadro final (rótulo "hold"). Mudar `replay` recomeça a sequência.
 */
export interface Demo {
    tl: gsap.core.Timeline;
    apply: () => void;
}

export function useDemo(setup: (svg: SVGSVGElement) => Demo, replay = 0) {
    const ref = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = ref.current;
        if (!svg) return;
        const { tl, apply } = setup(svg);
        // bancada de desenvolvimento: permite posicionar a linha do tempo
        if (process.env.NODE_ENV !== "production") (svg as unknown as { __demo?: unknown }).__demo = { tl, apply };
        tl.pause(0);
        apply();

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            tl.seek("hold");
            apply();
            return () => {
                tl.kill();
            };
        }

        // Depois da atualização global do gsap: o estado já está no quadro certo.
        const tick = () => apply();
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    tl.play();
                    gsap.ticker.add(tick);
                } else {
                    tl.pause();
                    gsap.ticker.remove(tick);
                }
            },
            { threshold: 0.1 },
        );
        io.observe(svg);
        return () => {
            io.disconnect();
            gsap.ticker.remove(tick);
            tl.kill();
        };
    }, [setup, replay]);

    return ref;
}

/** Atalhos de escrita no SVG. */
export const attr = (el: Element | null | undefined, name: string, v: string | number) => el?.setAttribute(name, String(v));
export const tf = (el: Element | null | undefined, x: number, y: number, s = 1) =>
    el?.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(3)})`);
