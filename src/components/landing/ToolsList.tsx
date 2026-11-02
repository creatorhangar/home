"use client";

import { useEffect, useRef } from "react";
import { APPS, type CatalogApp } from "@/config/apps";
import s from "./home.module.css";

/** Tiras horizontais do campo térmico, por faixa. */
const STRIPS = 24;

/** Quanto tempo uma faixa "pulada" numa passagem rápida fica acesa. */
const FLASH_MS = 140;

const STRIP_STYLES = Array.from({ length: STRIPS }, (_, k) => {
    // 0 no centro da faixa, 1 nas bordas: ordena entrada e saída.
    const edge = Math.abs(k - (STRIPS - 1) / 2) / ((STRIPS - 1) / 2);
    return {
        "--k": k,
        "--e": edge.toFixed(3),
    } as React.CSSProperties;
});

/**
 * Catálogo: exatamente uma faixa por app.
 *
 * Cada faixa tem estado próprio (data-hot), escrito direto no DOM, sem
 * índice compartilhado. A transição CSS parte sempre do estado visual
 * atual: reentrada retoma, saída antiga não fecha a faixa sob o mouse.
 *
 * Numa passagem rápida o navegador pode não amostrar o ponteiro dentro de
 * uma faixa; o segmento entre dois pointermove é checado e as faixas
 * atravessadas acendem por FLASH_MS, deixando o rastro.
 */
export function ToolsList() {
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;
        const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-row]"));
        const hovered = new Set<HTMLElement>();
        const flashUntil = new Map<HTMLElement, number>();
        const timers = new Map<HTMLElement, number>();
        let last: { x: number; y: number } | null = null;

        const sync = (row: HTMLElement) => {
            const hot = hovered.has(row) || (flashUntil.get(row) ?? 0) > performance.now();
            if (hot) row.setAttribute("data-hot", "");
            else row.removeAttribute("data-hot");
            const video = row.querySelector("video");
            if (video) {
                if (hovered.has(row) && !reducedMotion()) video.play().catch(() => {});
                else video.pause();
            }
        };

        const flash = (row: HTMLElement) => {
            if (hovered.has(row)) return;
            flashUntil.set(row, performance.now() + FLASH_MS);
            window.clearTimeout(timers.get(row));
            timers.set(row, window.setTimeout(() => sync(row), FLASH_MS + 4));
            sync(row);
        };

        // Faixas que o segmento from→to cruzou (só o trecho dentro da lista).
        const sweep = (from: { x: number; y: number }, to: { x: number; y: number }) => {
            const box = list.getBoundingClientRect();
            let t0 = 0;
            let t1 = 1;
            const dx = to.x - from.x;
            if (dx === 0) {
                if (from.x < box.left || from.x > box.right) return;
            } else {
                const a = (box.left - from.x) / dx;
                const b = (box.right - from.x) / dx;
                t0 = Math.max(t0, Math.min(a, b));
                t1 = Math.min(t1, Math.max(a, b));
                if (t0 > t1) return;
            }
            const yA = from.y + (to.y - from.y) * t0;
            const yB = from.y + (to.y - from.y) * t1;
            const yMin = Math.min(yA, yB);
            const yMax = Math.max(yA, yB);
            for (const row of rows) {
                const r = row.getBoundingClientRect();
                if (r.bottom > yMin && r.top < yMax) flash(row);
            }
        };

        const isMouse = (e: PointerEvent) => e.pointerType === "mouse" || e.pointerType === "pen";

        // Na janela inteira: entradas rápidas vindas de fora da lista também contam.
        const onMove = (e: PointerEvent) => {
            if (!isMouse(e)) return;
            const p = { x: e.clientX, y: e.clientY };
            if (last) sweep(last, p);
            last = p;
        };
        // Saída rápida pela borda da janela: completa o último trecho.
        const onWindowLeave = (e: PointerEvent) => {
            if (last && isMouse(e)) sweep(last, { x: e.clientX, y: e.clientY });
            last = null;
        };

        const cleanups = rows.map((row) => {
            const enter = (e: PointerEvent) => {
                if (!isMouse(e)) return;
                hovered.add(row);
                sync(row);
            };
            const leave = () => {
                if (!hovered.delete(row)) return;
                sync(row);
            };
            row.addEventListener("pointerenter", enter);
            row.addEventListener("pointerleave", leave);
            return () => {
                row.removeEventListener("pointerenter", enter);
                row.removeEventListener("pointerleave", leave);
            };
        });

        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onWindowLeave);
        return () => {
            cleanups.forEach((c) => c());
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onWindowLeave);
            timers.forEach((t) => window.clearTimeout(t));
        };
    }, []);

    return (
        <ul ref={listRef} className={s.catalog} aria-label="Apps">
            {APPS.map((app, i) => (
                <li
                    key={app.id}
                    className={s.item}
                    style={{ "--i": i } as React.CSSProperties}
                >
                    <AppRow app={app} index={i} />
                </li>
            ))}
        </ul>
    );
}

function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function AppRow({ app, index }: { app: CatalogApp; index: number }) {
    const disabled = !app.href;
    const newTab = app.href ? <span className="sr-only"> (abre em nova aba)</span> : null;
    const ctaA11y = disabled ? { "aria-disabled": true as const, title: "Em breve" } : {};
    const cta = (
        <>
            {app.cta}
            <span className={s.arrow} aria-hidden="true">
                ↗
            </span>
            {newTab}
        </>
    );

    const body = (
        <>
            <Thermal />
            <div className={s.content}>
                <Preview app={app} />
                <div className={s.text}>
                    <h2 className={s.name}>{app.name}</h2>
                    <p className={s.desc}>{app.description}</p>
                    <span
                        className={`${s.cta} ${s.ctaInline} ${disabled ? s.ctaDisabled : ""}`}
                        {...ctaA11y}
                    >
                        {cta}
                    </span>
                </div>
                <span
                    className={`${s.cta} ${s.ctaEnd} ${disabled ? s.ctaDisabled : ""}`}
                    {...ctaA11y}
                >
                    {cta}
                </span>
            </div>
        </>
    );

    const rowProps = {
        className: s.row,
        "data-row": "",
        "data-field": index % 5,
    };

    if (app.href) {
        return (
            <a {...rowProps} href={app.href} target="_blank" rel="noopener noreferrer">
                {body}
            </a>
        );
    }

    // Destino ainda não confirmado: faixa visível, CTA desabilitado.
    return <div {...rowProps}>{body}</div>;
}

/** Camada decorativa: 24 tiras que juntas formam um único campo térmico. */
function Thermal() {
    return (
        <span className={s.thermal} aria-hidden="true">
            {STRIP_STYLES.map((style, k) => (
                <span key={k} className={s.strip} style={style} />
            ))}
        </span>
    );
}

function Preview({ app }: { app: CatalogApp }) {
    const p = app.preview;
    return (
        <span className={s.preview}>
            {p?.type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
            )}
            {p?.type === "video" && (
                <video
                    src={p.src}
                    poster={p.poster}
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    aria-hidden="true"
                />
            )}
        </span>
    );
}
