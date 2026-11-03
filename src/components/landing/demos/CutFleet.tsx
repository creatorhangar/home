"use client";

import { useId } from "react";
import { gsap } from "gsap";
import s from "./demos.module.css";
import { Card, place } from "./parts";
import { lerp, Lotus, lotusAt, SCALE } from "./lotus";
import { attr, useDemo, type Demo } from "./useDemo";

/**
 * CutFleet: card de fundo verde com a flor → a varinha toca o fundo e faz
 * um movimento curto → a remoção avança pelo fundo (inclusive entre as
 * pétalas) → uma folha com três flores repete a remoção → as flores se
 * afastam em três recortes → LOTE: três imagens independentes, lado a lado,
 * e uma única ação remove os três fundos, com pequeno atraso entre eles.
 * A máscara vive dentro de cada card: nada verde sai dele.
 */
const ONE = { w: 126, h: 96, cx: 150, cy: 85 };
const SHEET = { w: 280, h: 140, cx: 150, cy: 85 };
const BATCH = { w: 86, h: 96, cy: 85, xs: [52, 150, 248] };
const SHEET_AT = [
    [150, 50],
    [82, 114],
    [218, 114],
];
const FINAL_AT = [
    [150, 50],
    [48, 118],
    [252, 118],
];
// ponto tocado (no fundo, longe das pétalas), de onde a varinha vem e raio da remoção
const TOUCH = [
    { x: 102, y: 50, from: { x: 190, y: 8 }, r: 150 },
    { x: 32, y: 32, from: { x: 120, y: 2 }, r: 300 },
    { x: BATCH.xs[0] - BATCH.w / 2 + 12, y: BATCH.cy - BATCH.h / 2 + 12, from: { x: 100, y: 4 }, r: 130 },
];
const HOLES = [0, 1, 2, 3, 4].map((i) => `h${i}`);

export function CutFleet({ replay = 0 }: { replay?: number }) {
    const uid = useId().replace(/:/g, "");
    const ref = useDemo(setup, replay);
    const boxes = [
        { cx: ONE.cx, cy: ONE.cy, w: ONE.w, h: ONE.h },
        { cx: SHEET.cx, cy: SHEET.cy, w: SHEET.w, h: SHEET.h },
        ...BATCH.xs.map((cx) => ({ cx, cy: BATCH.cy, w: BATCH.w, h: BATCH.h })),
    ];

    return (
        <svg ref={ref} className={s.svg} viewBox="0 0 300 170" aria-hidden="true" focusable="false">
            <defs>
                <Lotus id={`${uid}f`} open />
                {boxes.map((c, i) => (
                    <g key={i}>
                        <clipPath id={`${uid}k${i}`}>
                            <rect x={c.cx - c.w / 2} y={c.cy - c.h / 2} width={c.w} height={c.h} rx="4" />
                        </clipPath>
                        <mask id={`${uid}m${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="170">
                            <rect width="300" height="170" fill="#fff" />
                            <circle
                                data-hole={i}
                                cx={i < 2 ? TOUCH[i].x : BATCH.xs[i - 2] - BATCH.w / 2 + 12}
                                cy={i < 2 ? TOUCH[i].y : BATCH.cy - BATCH.h / 2 + 12}
                                r="0"
                                fill="#000"
                            />
                        </mask>
                    </g>
                ))}
            </defs>

            {/* 1 · uma flor */}
            <g data-one="">
                <g transform={`translate(${ONE.cx} ${ONE.cy})`}>
                    <Card w={ONE.w} h={ONE.h} />
                </g>
                <g clipPath={`url(#${uid}k0)`}>
                    <rect x={ONE.cx - ONE.w / 2} y={ONE.cy - ONE.h / 2} width={ONE.w} height={ONE.h} className={s.green} mask={`url(#${uid}m0)`} />
                </g>
                <use href={`#${uid}f`} transform={lotusAt(ONE.cx, ONE.cy - 1, SCALE.hero)} />
            </g>

            {/* 2 · folha com três flores */}
            <g data-sheet="">
                <g transform={`translate(${SHEET.cx} ${SHEET.cy})`} data-sheetcard="">
                    <Card w={SHEET.w} h={SHEET.h} />
                </g>
                <g clipPath={`url(#${uid}k1)`} data-sheetgreen="">
                    <rect x={SHEET.cx - SHEET.w / 2} y={SHEET.cy - SHEET.h / 2} width={SHEET.w} height={SHEET.h} className={s.green} mask={`url(#${uid}m1)`} />
                </g>
            </g>
            <g data-flowers="">
                {SHEET_AT.map((_, i) => (
                    <use key={i} data-fl={i} href={`#${uid}f`} style={{ ["--lw" as string]: 1.6 }} />
                ))}
            </g>

            {/* 3 · lote: três imagens independentes */}
            <g data-batch="">
                {BATCH.xs.map((cx, i) => (
                    <g key={i}>
                        <g transform={`translate(${cx} ${BATCH.cy})`} data-bcard="">
                            <Card w={BATCH.w} h={BATCH.h} />
                        </g>
                        <g clipPath={`url(#${uid}k${i + 2})`} data-bgreen="">
                            <rect x={cx - BATCH.w / 2} y={BATCH.cy - BATCH.h / 2} width={BATCH.w} height={BATCH.h} className={s.green} mask={`url(#${uid}m${i + 2})`} />
                        </g>
                    </g>
                ))}
                <g data-bflowers="">
                    {BATCH.xs.map((cx, i) => (
                        <use key={i} href={`#${uid}f`} transform={lotusAt(cx, BATCH.cy - 1, SCALE.mid)} style={{ ["--lw" as string]: 1.6 }} />
                    ))}
                </g>
            </g>

            <g data-wand="" opacity="0">
                <path d="M0 0L15 -15" className={s.wand} />
                <circle r="2.4" className={s.wandTip} />
            </g>
        </svg>
    );
}

function setup(svg: SVGSVGElement): Demo {
    const q = <T extends Element>(sel: string) => svg.querySelector<T>(sel)!;
    const qa = (sel: string) => Array.from(svg.querySelectorAll(sel));
    const one = q("[data-one]");
    const sheetCard = q("[data-sheetcard]");
    const sheetGreen = q("[data-sheetgreen]");
    const flowers = q("[data-flowers]");
    const wand = q("[data-wand]");
    const holes = [0, 1, 2, 3, 4].map((i) => q(`[data-hole='${i}']`));
    const fls = SHEET_AT.map((_, i) => q(`[data-fl="${i}"]`));
    const bcards = qa("[data-bcard]");
    const bgreens = qa("[data-bgreen]");
    const bflowers = q("[data-bflowers]");

    const st = {
        one: 1, h0: 0, h1: 0, h2: 0, h3: 0, h4: 0, sheet: 0, card: 0, fl: 0, spread: 0,
        bc: 0, bg: 0, bf: 0, wa: 0, wx: 0, wy: 0, press: 0,
    };

    const apply = () => {
        attr(one, "opacity", st.one);
        HOLES.forEach((k, i) => attr(holes[i], "r", st[k as keyof typeof st]));
        attr(sheetGreen, "opacity", st.sheet);
        attr(sheetCard, "opacity", st.card);
        attr(flowers, "opacity", st.fl);
        fls.forEach((f, i) => {
            const x = lerp(SHEET_AT[i][0], FINAL_AT[i][0], st.spread);
            const y = lerp(SHEET_AT[i][1], FINAL_AT[i][1], st.spread);
            attr(f, "transform", lotusAt(x, y, SCALE.mid));
        });
        bcards.forEach((c) => attr(c, "opacity", st.bc));
        bgreens.forEach((g) => attr(g, "opacity", st.bg));
        attr(bflowers, "opacity", st.bf);
        place(wand, st.wx, st.wy, 1 - 0.1 * st.press, st.wa);
    };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.25 });
    /** A varinha entra, toca o fundo, faz um movimento curto; a remoção parte daí. */
    const wandPass = (t: number, n: 0 | 1 | 2, rem: { key: string; delay: number; dur: number }[]) => {
        const T = TOUCH[n];
        tl.set(st, { wx: T.from.x, wy: T.from.y }, t);
        tl.to(st, { wa: 1, duration: 0.2, ease: "none" }, t);
        tl.to(st, { wx: T.x, wy: T.y, duration: 0.6, ease: "power2.out" }, t);
        tl.to(st, { press: 1, duration: 0.12, ease: "power1.in" }, t + 0.62);
        tl.to(st, { press: 0, duration: 0.16, ease: "power1.out" }, t + 0.74);
        tl.to(st, { wx: T.x + 11, wy: T.y + 8, duration: 0.3, ease: "power2.inOut" }, t + 0.78);
        rem.forEach((r) => tl.to(st, { [r.key]: T.r, duration: r.dur, ease: "power2.inOut" }, t + 0.7 + r.delay));
        tl.to(st, { wa: 0, wx: T.x + 24, wy: T.y - 6, duration: 0.35, ease: "power1.in" }, t + 1.15);
    };

    // 1. card verde com a flor
    wandPass(0.55, 0, [{ key: "h0", delay: 0, dur: 1.4 }]);
    // 2. a folha com três flores substitui o card
    tl.to(st, { one: 0, duration: 0.5, ease: "power1.inOut" }, 3.2);
    tl.to(st, { sheet: 1, card: 1, fl: 1, duration: 0.5, ease: "power1.inOut" }, 3.2);
    wandPass(4.0, 1, [{ key: "h1", delay: 0, dur: 1.7 }]);
    // 3. as flores se afastam; a folha se dissolve sobre o fundo da página
    tl.to(st, { card: 0, duration: 0.55, ease: "power1.inOut" }, 6.35);
    tl.to(st, { spread: 1, duration: 0.8, ease: "power2.inOut" }, 6.4);
    tl.addLabel("hold", 7.3);
    // 4. lote: três imagens lado a lado, uma única ação, remoções em sequência curta
    tl.to(st, { fl: 0, duration: 0.35, ease: "power1.inOut" }, 8.3);
    tl.to(st, { bc: 1, bg: 1, bf: 1, duration: 0.45, ease: "power1.inOut" }, 8.5);
    wandPass(9.3, 2, [
        { key: "h2", delay: 0, dur: 1.0 },
        { key: "h3", delay: 0.22, dur: 1.0 },
        { key: "h4", delay: 0.44, dur: 1.0 },
    ]);
    // 5. pausa no resultado e volta ao card inicial
    tl.to(st, { bf: 0, bc: 0, bg: 0, duration: 0.35, ease: "power1.inOut" }, 12.5);
    tl.set(st, { h0: 0, h1: 0, h2: 0, h3: 0, h4: 0, spread: 0, sheet: 0 }, 12.45);
    tl.to(st, { one: 1, duration: 0.45, ease: "power1.inOut" }, 12.5);
    tl.to({}, { duration: 0.01 }, 12.95);
    return { tl, apply };
}
