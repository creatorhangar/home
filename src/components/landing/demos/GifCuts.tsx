"use client";

import { useId } from "react";
import { gsap } from "gsap";
import s from "./demos.module.css";
import { Card, place } from "./parts";
import { bloom, clamp, Lotus, lotusAt, SCALE, setLotus } from "./lotus";
import { attr, useDemo, type Demo } from "./useDemo";

/**
 * GifCuts: uma animação (botão → abertura parcial → abertura completa) com
 * a faixa de tempo embaixo. Dois cortes dividem a faixa em três trechos e
 * surgem três cards, um por trecho, todos com o mesmo enquadramento. Um
 * trecho reproduz por vez (borda mais clara); os outros ficam em quadros
 * representativos. A prévia principal acompanha o trecho ativo.
 */
const STRIP_W = 150;
const THIRD = STRIP_W / 3;
const CUTS = [-STRIP_W / 2 + THIRD, -STRIP_W / 2 + THIRD * 2];
const RANGES: [number, number][] = [
    [0, 1 / 3],
    [1 / 3, 2 / 3],
    [2 / 3, 1],
];
const MAIN = { w: STRIP_W, h: 96, y: 56 };
const STRIP_Y = 124;
const GX = { a: 150, b: 83 };
const TH = { w: 120, h: 46, x: 232, ys: [31, 85, 139] };
const THUMB_SC = SCALE.small;

/** Quadro da animação em `p` (0–1): crescer, abrir parcialmente, terminar de abrir. */
function frame(p: number) {
    const grow = clamp(p * 3);
    const t = clamp((p - 1 / 3) * 1.5);
    return { open: bloom(t), grow };
}

export function GifCuts({ replay = 0 }: { replay?: number }) {
    const uid = useId().replace(/:/g, "");
    const ref = useDemo(setup, replay);
    return (
        <svg ref={ref} className={s.svg} viewBox="0 0 300 170" aria-hidden="true" focusable="false">
            <defs>
                <mask id={`${uid}m`} maskUnits="userSpaceOnUse" x={-100} y={100} width={200} height={60}>
                    <rect x={-100} y={100} width={200} height={60} fill="#fff" />
                    {CUTS.map((c, k) => (
                        <rect key={k} data-gap={k} x={c} y={100} width={0} height={60} fill="#000" />
                    ))}
                </mask>
            </defs>

            <g data-group="">
                <g transform={`translate(0 ${MAIN.y})`}>
                    <Card w={MAIN.w} h={MAIN.h} />
                </g>
                <g data-main="" transform={lotusAt(0, MAIN.y - 2, SCALE.hero)}>
                    <Lotus />
                </g>

                <g mask={`url(#${uid}m)`}>
                    <rect x={-STRIP_W / 2} y={STRIP_Y} width={STRIP_W} height={8} rx={2} className={s.track} />
                    <rect data-prog="" x={-STRIP_W / 2} y={STRIP_Y} width={0} height={8} rx={2} className={s.trackOn} />
                </g>
                {CUTS.map((c, k) => (
                    <line key={k} data-cut={k} x1={c} x2={c} y1={STRIP_Y + 4} y2={STRIP_Y + 4} className={s.cut} />
                ))}
                <g data-head="">
                    <line x1="0" x2="0" y1={STRIP_Y - 6} y2={STRIP_Y + 14} className={s.cut} />
                    <circle cx="0" cy={STRIP_Y - 6} r="3" className={s.trackOn} />
                </g>
            </g>

            {TH.ys.map((y, k) => (
                <g key={k} data-th={k}>
                    <Card w={TH.w} h={TH.h} />
                    <g data-tf={k} transform={lotusAt(0, -1, THUMB_SC)}>
                        <Lotus lw={1.4} />
                    </g>
                    <g data-ring={k} opacity="0">
                        <Card w={TH.w} h={TH.h} className={s.cardActive} />
                    </g>
                </g>
            ))}
        </svg>
    );
}

function setup(svg: SVGSVGElement): Demo {
    const q = <T extends Element>(sel: string) => svg.querySelector<T>(sel)!;
    const group = q("[data-group]");
    const main = q("[data-main] > g");
    const prog = q("[data-prog]");
    const head = q("[data-head]");
    const gaps = CUTS.map((_, k) => q(`[data-gap="${k}"]`));
    const cuts = CUTS.map((_, k) => q(`[data-cut="${k}"]`));
    const ths = RANGES.map((_, k) => q(`[data-th="${k}"]`));
    const tfs = RANGES.map((_, k) => q(`[data-tf="${k}"] > g`));
    const rings = RANGES.map((_, k) => q(`[data-ring="${k}"]`));

    const st = { intro: 1, p: 0, gx: GX.a, c: 0, hd: 1 };
    // o gsap anima chaves de objeto: um objeto por faixa de valores
    const sh: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
    const hi: Record<number, number> = { 0: 0, 1: 0, 2: 0 };

    const apply = () => {
        place(group, st.gx, 0, 1, st.intro);
        let f = frame(st.p);
        setLotus(main, f.open, f.grow);
        attr(prog, "width", Math.max(0, STRIP_W * st.p));
        place(head, -STRIP_W / 2 + STRIP_W * st.p, 0, 1, st.hd);
        CUTS.forEach((c, k) => {
            attr(gaps[k], "x", c - 1.75 * st.c);
            attr(gaps[k], "width", 3.5 * st.c);
            const h = 9 * st.c;
            attr(cuts[k], "y1", STRIP_Y + 4 - h);
            attr(cuts[k], "y2", STRIP_Y + 4 + h);
            attr(cuts[k], "opacity", st.c);
        });
        RANGES.forEach(([a, b], k) => {
            f = frame(clamp(st.p, a, b));
            setLotus(tfs[k], f.open, f.grow);
            const e = sh[k];
            place(ths[k], TH.x - (1 - e) * 14, TH.ys[k], 1, e);
            attr(rings[k], "opacity", hi[k]);
        });
    };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.25 });
    // 1. a animação inteira, com o indicador percorrendo a faixa
    tl.to(st, { p: 1, duration: 3.3, ease: "none" }, 0.35);
    // 2. dois cortes dividem a faixa em três trechos
    tl.to(st, { c: 1, duration: 0.5, ease: "power2.out" }, 3.9);
    tl.to(st, { hd: 0, duration: 0.3, ease: "none" }, 3.9);
    // 3. o conjunto abre espaço à esquerda; a prévia volta ao começo
    tl.to(st, { gx: GX.b, duration: 0.7, ease: "power2.inOut" }, 4.3);
    tl.to(st, { p: 0, duration: 0.7, ease: "power2.inOut" }, 4.3);
    // 4. três cards, um por trecho
    [0, 1, 2].forEach((k) => tl.to(sh, { [k]: 1, duration: 0.5, ease: "power2.out" }, 4.85 + k * 0.12));
    // 5. um trecho por vez
    RANGES.forEach(([a, b], k) => {
        const t0 = 5.6 + k * 1.5;
        tl.to(hi, { [k]: 1, duration: 0.2, ease: "none" }, t0);
        tl.fromTo(st, { p: a }, { p: b, duration: 1.25, ease: "none", immediateRender: false }, t0 + 0.1);
        if (k < 2) tl.to(hi, { [k]: 0, duration: 0.2, ease: "none" }, t0 + 1.4);
    });
    tl.addLabel("hold", 9.9);
    // 6. pausa no resultado e volta ao começo, rebobinando
    tl.to(hi, { 2: 0, duration: 0.3, ease: "none" }, 10.9);
    tl.to(sh, { 0: 0, 1: 0, 2: 0, duration: 0.45, ease: "power2.in" }, 10.9);
    tl.to(st, { c: 0, duration: 0.5, ease: "power2.inOut" }, 11.0);
    tl.to(st, { gx: GX.a, duration: 0.7, ease: "power2.inOut" }, 11.2);
    tl.to(st, { p: 0, duration: 0.7, ease: "power2.inOut" }, 11.2);
    tl.to(st, { hd: 1, duration: 0.3, ease: "none" }, 11.6);
    tl.to({}, { duration: 0.01 }, 12.0);
    return { tl, apply };
}
