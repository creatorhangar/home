import type { ReactNode } from "react";
import s from "./demos.module.css";
import { attr } from "./useDemo";

/** Raio único de card (unidades da caixa 300 × 170). */
export const R = 4;

/** Card centrado na origem. */
export function Card({ w, h, className = s.card }: { w: number; h: number; className?: string }) {
    return <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={R} className={className} />;
}

/** Cursor único: mesma ponta em (0,0), mesmo tamanho em todas as demos. */
export function Cursor() {
    return <path d="M0 0V15.5L4.2 11.9L6.9 18.4L9.6 17.2L6.9 10.9H12.4Z" className={s.cursor} />;
}

/** Botão centrado na origem; `h` (hover) e pressão são escritos por setBtn. */
export const BTN = { w: 58, h: 22 };
export function Btn({ children }: { children: ReactNode }) {
    return (
        <g data-btn="">
            <rect x={-BTN.w / 2} y={-BTN.h / 2} width={BTN.w} height={BTN.h} rx={R} className={s.btnBase} />
            <rect data-hi="" x={-BTN.w / 2} y={-BTN.h / 2} width={BTN.w} height={BTN.h} rx={R} className={s.btnHi} opacity="0" />
            <text className={s.ctl}>{children}</text>
        </g>
    );
}

/** hover 0–1, press 0–1 (comprime ~6 %). */
export function setBtn(root: Element, x: number, y: number, hover: number, press: number, alpha = 1) {
    const k = 1 - 0.06 * press;
    root.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${k.toFixed(3)})`);
    root.setAttribute("opacity", String(alpha));
    attr(root.querySelector("[data-hi]"), "opacity", hover);
}

export const place = (el: Element | null | undefined, x: number, y: number, sc = 1, a = 1) => {
    if (!el) return;
    el.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${sc.toFixed(3)})`);
    el.setAttribute("opacity", a.toFixed(3));
};
