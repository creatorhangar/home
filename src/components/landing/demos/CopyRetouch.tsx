"use client";

import { useId } from "react";
import { gsap } from "gsap";
import s from "./demos.module.css";
import { Cursor, R, place } from "./parts";
import { attr, useDemo, type Demo } from "./useDemo";
import { lerp, Lotus, lotusAt } from "./lotus";

/**
 * CopyRetouch: um clique em "Copy" faz tudo.
 * Cursor clica em Copy (pulso de "copiado") → sozinho, o card muda de
 * proporção (2:1 → 1:1 → 4:3), o logo entra no último formato e
 * "✓ Saved" surge onde estava Copy. Tudo cabe no quadro 300×170;
 * Copy e Saved nunca aparecem juntos.
 */
const CARD = { cx: 150, cy: 66, shapes: [{ w: 150, h: 74 }, { w: 108, h: 108 }, { w: 128, h: 96 }] };
const FLOWER = [{ sc: 0.84, y: 0 }, { sc: 0.8, y: -11 }, { sc: 0.78, y: -8 }];
const CTL = { x: 150, y: 148, w: 64, h: 20 };
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

            {/* traços de dimensão: só enquanto o card muda de proporção */}
            <g data-dim="" opacity="0">
                <path data-dv="" className={s.dim} />
                <path data-dh="" className={s.dim} />
                <text data-dvt="" className={s.dimText} />
                <text data-dht="" className={s.dimText} />
            </g>
            <rect data-ring="" rx={R} className={s.dim} opacity="0" />

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
                        Saved
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
    const ring = q("[data-ring]");
    const dim = q("[data-dim]");
    const dv = q("[data-dv]");
    const dh = q("[data-dh]");
    const dvt = q("[data-dvt]");
    const dht = q("[data-dht]");
    let lastLabel = "";

    // centraliza "✓ Saved" no ponto do controle (mede com a fonte já carregada)
    const centerSaved = () => {
        const t = q<SVGTextElement>("[data-st]");
        const w = 17 + t.getComputedTextLength();
        savedIn.setAttribute("transform", `translate(${(CTL.x - w / 2).toFixed(2)} ${CTL.y})`);
    };
    centerSaved();
    document.fonts?.ready.then(centerSaved);

    const st = { cur: 0, cx: 292, cy: 170, hover: 0, press: 0, cp: 1, p: 0, lg: 0, sv: 0, rg: 0, dm: 0 };
    const tip = { x: CTL.x + 22, y: CTL.y + 5 }; // ponta na borda direita do botão, como no storyboard

    const apply = () => {
        const i = Math.min(1, Math.floor(st.p)), f = st.p - i;
        const A = CARD.shapes[i], B = CARD.shapes[i + 1] ?? A;
        const w = lerp(A.w, B.w, f);
        const h = lerp(A.h, B.h, f);
        for (const el of [bg, clip]) {
            attr(el, "x", (-w / 2).toFixed(2));
            attr(el, "y", (-h / 2).toFixed(2));
            attr(el, "width", w.toFixed(2));
            attr(el, "height", h.toFixed(2));
        }
        card.setAttribute("transform", `translate(${CARD.cx} ${CARD.cy})`);
        const FA = FLOWER[i], FB = FLOWER[i + 1] ?? FA;
        flower.setAttribute("transform", lotusAt(0, lerp(FA.y, FB.y, f), lerp(FA.sc, FB.sc, f)));
        // logo no canto inferior direito, com margem
        place(logo, w / 2 - LOGO.mx, h / 2 - LOGO.my + (1 - st.lg) * 4, 1, st.lg);
        const k = 1 - 0.06 * st.press;
        copy.setAttribute("transform", `translate(${CTL.x} ${CTL.y}) scale(${k.toFixed(3)})`);
        attr(copy, "opacity", st.cp);
        attr(hi, "opacity", st.hover);
        attr(saved, "opacity", st.sv);
        // pulso de "copiado" em volta do card original
        const W0 = CARD.shapes[0].w, H0 = CARD.shapes[0].h;
        const g = st.rg * 9;
        attr(ring, "x", (CARD.cx - W0 / 2 - g).toFixed(2));
        attr(ring, "y", (CARD.cy - H0 / 2 - g).toFixed(2));
        attr(ring, "width", (W0 + g * 2).toFixed(2));
        attr(ring, "height", (H0 + g * 2).toFixed(2));
        attr(ring, "opacity", st.rg > 0 && st.rg < 1 ? (1 - st.rg) * 0.65 : 0);
        // cotas: barra à direita e embaixo, com a proporção abrindo um vão no meio
        const gap = 10, cap = 3.5, off = 11;
        const vx = CARD.cx + w / 2 + off, y0 = CARD.cy - h / 2, y1 = CARD.cy + h / 2;
        const hy = CARD.cy + h / 2 + off, x0 = CARD.cx - w / 2, x1 = CARD.cx + w / 2;
        dv.setAttribute("d", `M${vx - cap} ${y0}H${vx + cap}M${vx} ${y0}V${CARD.cy - gap}M${vx} ${CARD.cy + gap}V${y1}M${vx - cap} ${y1}H${vx + cap}`);
        dh.setAttribute("d", `M${x0} ${hy - cap}V${hy + cap}M${x0} ${hy}H${CARD.cx - gap - 4}M${CARD.cx + gap + 4} ${hy}H${x1}M${x1} ${hy - cap}V${hy + cap}`);
        const label = st.p < 1.5 ? "1:1" : "4:3";
        if (label !== lastLabel) {
            lastLabel = label;
            dvt.textContent = label;
            dht.textContent = label;
        }
        dvt.setAttribute("x", String(vx + 13));
        dvt.setAttribute("y", String(CARD.cy));
        dht.setAttribute("x", String(CARD.cx));
        dht.setAttribute("y", String(hy));
        attr(dim, "opacity", st.dm);
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
    tl.fromTo(st, { rg: 0 }, { rg: 1, duration: 0.55, ease: "power1.out" }, 1.95);
    // 3. o cursor sai; Copy dá lugar ao espaço reservado
    tl.to(st, { cur: 0, duration: 0.3, ease: "none" }, 2.2);
    tl.to(st, { cx: tip.x + 14, cy: tip.y + 12, duration: 0.3, ease: "power1.in" }, 2.2);
    tl.to(st, { hover: 0, duration: 0.18, ease: "power1.out" }, 2.2);
    tl.to(st, { cp: 0, duration: 0.25, ease: "power1.in" }, 2.3);
    // cotas: acompanham as duas mudanças e saem antes do Saved
    tl.to(st, { dm: 1, duration: 0.25, ease: "power1.out" }, 2.5);
    tl.to(st, { dm: 0, duration: 0.25, ease: "power1.in" }, 4.7);
    // 4. sozinho: 2:1 → 1:1 → 4:3
    tl.to(st, { p: 1, duration: 0.7, ease: "power2.inOut" }, 2.6);
    tl.to(st, { p: 2, duration: 0.7, ease: "power2.inOut" }, 3.6);
    // 5. logo só no último formato
    tl.to(st, { lg: 1, duration: 0.4, ease: "power2.out" }, 4.4);
    // 6. ✓ Saved, onde estava Copy
    tl.to(st, { sv: 1, duration: 0.3, ease: "power1.out" }, 5.0);
    tl.addLabel("hold", 5.5);
    // 8. pausa; volta ao início (Saved sai antes de Copy voltar)
    tl.to(st, { sv: 0, duration: 0.25, ease: "power1.in" }, 7.1);
    tl.to(st, { lg: 0, duration: 0.35, ease: "power1.in" }, 7.2);
    tl.to(st, { p: 0, duration: 0.9, ease: "power2.inOut" }, 7.5);
    tl.to(st, { cp: 1, duration: 0.3, ease: "power1.out" }, 8.4);
    tl.set(st, { cx: 292, cy: 170 }, 8.7);
    tl.to({}, { duration: 0.01 }, 8.7);
    return { tl, apply };
}
