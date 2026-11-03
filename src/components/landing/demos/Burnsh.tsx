"use client";

import { useId } from "react";
import { gsap } from "gsap";
import s from "./demos.module.css";
import { Card } from "./parts";
import { bloom, Lotus, lotusAt, PETAL, PETALS, petalTf, SCALE, setLotus } from "./lotus";
import { attr, useDemo, type Demo } from "./useDemo";

/**
 * Burnsh: a mesma flor, em contorno → abre → retícula halftone dentro das
 * pétalas → thermal (uma região de cor por grupo de pétalas) → glitch curto
 * em poucas faixas → volta ao contorno e fecha. O desenho vive em <defs> e é
 * mostrado por <use>; no glitch, algumas faixas deslocadas são outras <use>
 * do mesmo desenho.
 */
const SP = 6.4;
const ROW = 5.6;
const DOT_R = 2.35; // raio máximo da retícula (unid. da flor)

/** Quatro faixas de cor por pétala (base → ponta), mais quentes no centro. */
const TIERS: string[][] = [
    ["#f7efb5", "#f6c945", "#ef7d2d", "#c8323c"], // centro
    ["#f6c945", "#ef7d2d", "#c8323c", "#8a2a75"], // internas
    ["#ef7d2d", "#c8323c", "#8a2a75", "#4b2f8f"], // externas médias
    ["#c8323c", "#8a2a75", "#4b2f8f", "#27337a"], // externas laterais
];
const tierOf = (i: number) => [3, 2, 1, 0, 1, 2, 3][i];

const BANDS = 6;
const BAND = { y0: -57, h: 11 };
const BAND_X = 64;

export function Burnsh({ replay = 0 }: { replay?: number }) {
    const uid = useId().replace(/:/g, "");
    const ref = useDemo(setup, replay);
    const body = `${uid}b`;

    return (
        <svg ref={ref} className={s.svg} viewBox="0 0 300 170" aria-hidden="true" focusable="false">
            <defs>
                {TIERS.map((c, t) => (
                    <linearGradient key={t} id={`${uid}g${t}`} x1="0" y1="1" x2="0" y2="0">
                        {c.flatMap((col, k) => [
                            <stop key={`${k}a`} offset={k / 4} stopColor={col} />,
                            <stop key={`${k}b`} offset={(k + 1) / 4} stopColor={col} />,
                        ])}
                    </linearGradient>
                ))}
                {Array.from({ length: PETALS }, (_, i) => (
                    <clipPath key={i} id={`${uid}c${i}`}>
                        <path data-clip={i} d={PETAL} transform={petalTf(i, 0, 0)} />
                    </clipPath>
                ))}
                {Array.from({ length: BANDS }, (_, k) => (
                    <clipPath key={k} id={`${uid}k${k}`}>
                        <rect x={-BAND_X} y={BAND.y0 + k * BAND.h} width={BAND_X * 2} height={BAND.h + 0.4} />
                    </clipPath>
                ))}
                {/* retícula hexagonal em um só <pattern>: barata de desenhar nas 7 pétalas */}
                <pattern id={`${uid}d`} patternUnits="userSpaceOnUse" x="0" y="0" width={SP} height={ROW * 2}>
                    <circle data-dot="" cx={SP / 2} cy={ROW / 2} r="0" fill="currentColor" />
                    <circle data-dot="" cx="0" cy={ROW * 1.5} r="0" fill="currentColor" />
                    <circle data-dot="" cx={SP} cy={ROW * 1.5} r="0" fill="currentColor" />
                </pattern>
                <g id={body} data-body="">
                    <Lotus
                        lw={1.75}
                        overlay={(i) => (
                            <path data-th="" d={PETAL} fill={`url(#${uid}g${tierOf(i)})`} opacity="0" />
                        )}
                        flat={(i) => (
                            <g clipPath={`url(#${uid}c${i})`}>
                                <rect data-dotrect="" x="-58" y="-60" width="116" height="68" fill={`url(#${uid}d)`} display="none" />
                            </g>
                        )}
                    />
                </g>
            </defs>

            <g transform="translate(150 85)">
                <Card w={126} h={96} />
            </g>
            <g transform={lotusAt(150, 84, SCALE.hero)}>
                <use data-main="" href={`#${body}`} />
                <g data-bands="" display="none">
                    {Array.from({ length: BANDS }, (_, k) => (
                        <g key={k} clipPath={`url(#${uid}k${k})`}>
                            <use data-band={k} href={`#${body}`} />
                        </g>
                    ))}
                </g>
            </g>
        </svg>
    );
}

const GLITCH: number[][] = [
    [0, 7, 0, -6, 0, 0],
    [0, -5, 0, 8, 0, 4],
    [0, 4, 0, -9, 0, -3],
];

function setup(svg: SVGSVGElement): Demo {
    const qa = (sel: string) => Array.from(svg.querySelectorAll(sel));
    const lotus = svg.querySelector("defs [data-body] > g")!;
    const clips = qa("[data-clip]");
    const thermal = qa("[data-th]");
    const dots = qa("[data-dot]");
    const dotRects = qa("[data-dotrect]");
    const main = svg.querySelector("[data-main]")!;
    const bandsG = svg.querySelector("[data-bands]")!;
    const bands = qa("[data-band]");

    // objetos (não arrays): o gsap anima cada chave separadamente
    const st = { grow: 0, bloom: 0, dot: 0, dotA: 1, th: 0, gl: 0 };
    const off: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const shift = (v: number[]) => Object.fromEntries(v.map((x, k) => [k, x]));

    const apply = () => {
        const open = bloom(st.bloom);
        setLotus(lotus, open, st.grow);
        open.forEach((o, i) => attr(clips[i], "transform", petalTf(i, o, st.grow)));
        const showDots = st.dot > 0 && st.dotA > 0;
        dotRects.forEach((r) => {
            attr(r, "display", showDots ? "inline" : "none");
            attr(r, "opacity", st.dotA);
        });
        dots.forEach((c) => attr(c, "r", (DOT_R * st.dot).toFixed(2)));
        thermal.forEach((t) => attr(t, "opacity", st.th));
        attr(main, "display", st.gl ? "none" : "inline");
        attr(bandsG, "display", st.gl ? "inline" : "none");
        bands.forEach((b, k) => attr(b, "transform", `translate(${off[k].toFixed(2)} 0)`));
    };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
    // 1. o botão cresce e desabrocha: externas primeiro, internas depois
    tl.to(st, { grow: 1, duration: 0.5, ease: "power2.out" }, 0);
    tl.to(st, { bloom: 1, duration: 1.0, ease: "sine.inOut" }, 0.25);
    // 2. retícula halftone assim que as pétalas se abrem (sobrepõe o fim da abertura)
    tl.to(st, { dot: 1, duration: 0.65, ease: "sine.inOut" }, 1.0);
    // 3. thermal entra sob os pontos, que se dissolvem
    tl.to(st, { th: 1, duration: 0.7, ease: "sine.inOut" }, 1.75);
    tl.to(st, { dotA: 0, duration: 0.55, ease: "sine.inOut" }, 1.9);
    tl.addLabel("hold", 2.6);
    // 4. glitch curto: poucas faixas deslocadas em passos, depois recompõem
    tl.set(st, { gl: 1 }, 2.85);
    tl.set(off, shift(GLITCH[0]), 2.85);
    tl.set(off, shift(GLITCH[1]), 2.93);
    tl.set(off, shift(GLITCH[2]), 3.01);
    tl.to(off, { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, duration: 0.14, ease: "power2.out" }, 3.09);
    tl.set(st, { gl: 0 }, 3.25);
    // 5. de volta ao contorno, sem corte
    tl.to(st, { th: 0, duration: 0.8, ease: "sine.inOut" }, 3.7);
    tl.set(st, { dot: 0, dotA: 1 }, 4.6);
    // 6. pausa curta e fecha de volta ao botão (mesmo ponto de partida)
    tl.to(st, { bloom: 0, duration: 0.9, ease: "sine.inOut" }, 5.0);
    tl.to(st, { grow: 0, duration: 0.6, ease: "power2.inOut" }, 5.3);
    tl.to({}, { duration: 0.01 }, 5.9);
    return { tl, apply };
}
