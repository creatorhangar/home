"use client";

import { useId } from "react";
import { gsap } from "gsap";
import s from "./demos.module.css";
import { Cursor, R, place } from "./parts";
import { attr, useDemo, type Demo } from "./useDemo";
import { lerp, Lotus, lotusAt } from "./lotus";

/**
 * CopyRetouch: um clique em "Copy" faz tudo.
 * Um único card, com o centro fixo: cursor chega a Copy (hover, clique) →
 * o cursor sai e o próprio card muda de horizontal para quadrado, com a
 * flor se ajustando dentro dele → o logo aparece no canto inferior →
 * "✓ Saved automatically" surge no lugar onde estava Copy. Copy e Saved
 * nunca aparecem juntos; o espaço fica reservado, sem deslocar a composição.
 */
// proporções do storyboard: horizontal ~2:1 → quadrado 1:1; o controle já fica sob o card quadrado
const CARD = { cx: 150, cy: 68, wide: { w: 150, h: 74 }, sq: { w: 108, h: 108 } };
const FLOWER = { wide: { sc: 0.84, y: 0 }, sq: { sc: 0.8, y: -11 } };
const CTL = { x: 150, y: 146, w: 64, h: 20 };
const LOGO = { mx: 10, my: 11 };

export function CopyRetouch({ replay = 0 }: { replay?: number }) {
    const uid = useId().replace(/:/g, "");
    const ref = useDemo(setup, replay);

    return (
        <svg ref={ref} className={s.svg} viewBox="0 0 300 170" aria-hidden="true" focusable="false">
            <defs>
                <Lotus id={`${uid}f`} open />
                <clipPath id={`${uid}c`}>
                    <rect data-clip="" rx={R} />
                </clipPath>
            </defs>

            <g data-card="">
                <rect data-bg="" rx={R} className={s.card} />
                <g clipPath={`url(#${uid}c)`}>
                    <use data-flower="" href={`#${uid}f`} />
                    <g data-logo="">
                        <text className={s.logoText} textAnchor="end">
                            Logo
                        </text>
                    </g>
                </g>
            </g>

            {/* Copy e Saved ocupam o mesmo lugar, nunca juntos */}
            <g data-copy="">
                <rect x={-CTL.w / 2} y={-CTL.h / 2} width={CTL.w} height={CTL.h} rx={R} className={s.btnBase} />
                <rect data-hi="" x={-CTL.w / 2} y={-CTL.h / 2} width={CTL.w} height={CTL.h} rx={R} className={s.btnHi} opacity="0" />
                <text className={s.ctl}>Copy</text>
            </g>
            <g data-saved="" opacity="0">
                <g data-savedin="">
                    <path d="M0 0.5L3.5 4L10 -3.5" className={s.tick} />
                    <text className={s.ctl} x="17" y="0.5" style={{ textAnchor: "start" }} data-st="">
                        Saved automatically
                    </text>
                </g>
            </g>

            <g data-cursor="" opacity="0">
                <Cursor />
            </g>
        </svg>
    );
}

function setup(svg: SVGSVGElement): Demo {
    const q = <T extends Element>(sel: string) => svg.querySelector<T>(sel)!;
    const card = q("[data-card]");
    const bg = q("[data-bg]");
    const clip = q("[data-clip]");
    const flower = q("[data-flower]");
    const logo = q("[data-logo]");
    const copy = q("[data-copy]");
    const hi = q("[data-hi]");
    const saved = q("[data-saved]");
    const savedIn = q("[data-savedin]");
    const cursor = q("[data-cursor]");

    // centraliza "✓ Saved automatically" no ponto do controle (mede com a fonte já carregada)
    const centerSaved = () => {
        const t = q<SVGTextElement>("[data-st]");
        const w = 17 + t.getComputedTextLength();
        savedIn.setAttribute("transform", `translate(${(CTL.x - w / 2).toFixed(2)} ${CTL.y})`);
    };
    centerSaved();
    document.fonts?.ready.then(centerSaved);

    const st = { cur: 0, cx: 292, cy: 170, hover: 0, press: 0, cp: 1, m: 0, lg: 0, sv: 0 };
    const tip = { x: CTL.x + 22, y: CTL.y + 5 }; // ponta na borda direita do botão, como no storyboard

    const apply = () => {
        const m = st.m;
        const w = lerp(CARD.wide.w, CARD.sq.w, m);
        const h = lerp(CARD.wide.h, CARD.sq.h, m);
        for (const el of [bg, clip]) {
            attr(el, "x", (-w / 2).toFixed(2));
            attr(el, "y", (-h / 2).toFixed(2));
            attr(el, "width", w.toFixed(2));
            attr(el, "height", h.toFixed(2));
        }
        card.setAttribute("transform", `translate(${CARD.cx} ${CARD.cy})`);
        const fs = lerp(FLOWER.wide.sc, FLOWER.sq.sc, m);
        flower.setAttribute("transform", lotusAt(0, lerp(FLOWER.wide.y, FLOWER.sq.y, m), fs));
        // logo no canto inferior direito, com margem
        place(logo, w / 2 - LOGO.mx, h / 2 - LOGO.my + (1 - st.lg) * 4, 1, st.lg);
        const k = 1 - 0.06 * st.press;
        copy.setAttribute("transform", `translate(${CTL.x} ${CTL.y}) scale(${k.toFixed(3)})`);
        attr(copy, "opacity", st.cp);
        attr(hi, "opacity", st.hover);
        attr(saved, "opacity", st.sv);
        place(cursor, st.cx, st.cy, 1, st.cur);
    };

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.25 });
    // 1. imagem horizontal, flor inteira, Copy centralizado embaixo; cursor chega
    tl.to(st, { cur: 1, duration: 0.25, ease: "none" }, 0.4);
    tl.fromTo(st, { cx: 292, cy: 170 }, { cx: tip.x, cy: tip.y, duration: 1.0, ease: "power2.inOut" }, 0.4);
    tl.to(st, { hover: 1, duration: 0.16, ease: "power1.out" }, 1.4);
    // 2. um clique
    tl.to(st, { press: 1, duration: 0.13, ease: "power1.in" }, 1.85);
    tl.to(st, { press: 0, duration: 0.17, ease: "power1.out" }, 1.98);
    // 3. o cursor sai; Copy dá lugar ao espaço reservado
    tl.to(st, { cur: 0, duration: 0.3, ease: "none" }, 2.2);
    tl.to(st, { cx: tip.x + 14, cy: tip.y + 12, duration: 0.3, ease: "power1.in" }, 2.2);
    tl.to(st, { hover: 0, duration: 0.18, ease: "power1.out" }, 2.2);
    tl.to(st, { cp: 0, duration: 0.25, ease: "power1.in" }, 2.3);
    // 4. o próprio card muda de proporção (centro fixo), a flor se ajusta
    tl.to(st, { m: 1, duration: 0.75, ease: "power2.inOut" }, 2.55);
    // 5. logo aplicado automaticamente
    tl.to(st, { lg: 1, duration: 0.45, ease: "power2.out" }, 3.4);
    // 6. ✓ Saved automatically, onde estava Copy
    tl.to(st, { sv: 1, duration: 0.3, ease: "power1.out" }, 4.0);
    tl.addLabel("hold", 4.4);
    // 7. pausa de ~1 s; volta ao início (Saved sai antes de Copy voltar)
    tl.to(st, { sv: 0, duration: 0.25, ease: "power1.in" }, 5.3);
    tl.to(st, { lg: 0, duration: 0.4, ease: "power1.in" }, 5.4);
    tl.to(st, { m: 0, duration: 0.7, ease: "power2.inOut" }, 5.7);
    tl.to(st, { cp: 1, duration: 0.3, ease: "power1.out" }, 6.4);
    tl.set(st, { cx: 292, cy: 170 }, 6.7);
    tl.to({}, { duration: 0.01 }, 6.7);
    return { tl, apply };
}
