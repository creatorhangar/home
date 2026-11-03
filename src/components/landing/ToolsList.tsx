"use client";

import { useEffect, useRef } from "react";
import { APPS, type CatalogApp } from "@/config/apps";
import s from "./home.module.css";
import { attachLens, LENS } from "./titleLens";
import { attachGooey, GOOEY_FILTER_ID, type Gooey } from "./gooey";

/** Tiras horizontais de cor, por faixa. */
const STRIPS = 24;

/** Fonte dos nomes (perfil da lupa). */
const NAME_FONT = "archivo" as const;

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
        const gooeys = new Map<HTMLElement, Gooey>();
        for (const row of rows) {
            const morph = row.querySelector<HTMLElement>("[data-morph]");
            if (morph) gooeys.set(row, attachGooey(morph));
        }
        let last: { x: number; y: number } | null = null;

        const sync = (row: HTMLElement) => {
            const hot = hovered.has(row) || (flashUntil.get(row) ?? 0) > performance.now();
            if (hot) row.setAttribute("data-hot", "");
            else row.removeAttribute("data-hot");
            // minúsculas → maiúsculas (gooey); teclado também conta
            gooeys.get(row)?.set(hot || row.matches(":focus-visible"));
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

        const lenses = rows.flatMap((row) => {
            const title = row.querySelector<HTMLElement>("h2");
            const desc = row.querySelector<HTMLElement>("p");
            return [
                title ? attachLens(title, LENS[title.dataset.font ?? "flex"]) : () => {},
                desc ? attachLens(desc, LENS.desc) : () => {},
            ];
        });

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
            const focus = () => sync(row);
            row.addEventListener("pointerenter", enter);
            row.addEventListener("pointerleave", leave);
            row.addEventListener("focus", focus);
            row.addEventListener("blur", focus);
            return () => {
                row.removeEventListener("pointerenter", enter);
                row.removeEventListener("pointerleave", leave);
                row.removeEventListener("focus", focus);
                row.removeEventListener("blur", focus);
            };
        });

        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onWindowLeave);
        return () => {
            cleanups.forEach((c) => c());
            lenses.forEach((c) => c());
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onWindowLeave);
            timers.forEach((t) => window.clearTimeout(t));
            gooeys.forEach((g) => g.dispose());
        };
    }, []);

    return (
        <>
        {/* Limiar de alfa do morph gooey (ver gooey.ts). */}
        <svg className={s.defs} aria-hidden="true" focusable="false">
            <filter id={GOOEY_FILTER_ID}>
                <feColorMatrix
                    in="SourceGraphic"
                    type="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12"
                />
            </filter>
        </svg>
        <ul ref={listRef} className={s.catalog} aria-label="Apps">
            {APPS.map((app, i) => (
                <li
                    key={app.id}
                    className={s.item}
                    style={{ "--i": i } as React.CSSProperties}
                >
                    <AppRow app={app} />
                </li>
            ))}
        </ul>
        </>
    );
}

function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function AppRow({ app }: { app: CatalogApp }) {
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
                    <h2 className={s.name} data-font={NAME_FONT}>
                        <span className="sr-only">{app.name}</span>
                        {/* Duas versões visuais do nome para o morph: repouso em
                            minúsculas, hover em maiúsculas. */}
                        <span className={s.morph} data-morph="" aria-hidden="true">
                            <span className={s.layerLo} data-layer="lo">
                                <Chars text={app.name.toLowerCase()} />
                            </span>
                            <span className={s.layerUp} data-layer="up">
                                <Chars text={app.name.toUpperCase()} />
                            </span>
                        </span>
                    </h2>
                    <p className={s.desc}>
                        <Letters text={app.description} />
                    </p>
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
        "data-app": app.id,
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

/** Letras separadas para a lupa variar os eixos letra a letra. */
function Chars({ text }: { text: string }) {
    return (
        <>
            {Array.from(text).map((ch, k) => (
                <span key={k} data-ch="">
                    {ch}
                </span>
            ))}
        </>
    );
}

/**
 * Texto acessível inteiro + letras separadas (ocultas de leitores de tela)
 * para a lupa variar os eixos letra a letra.
 */
function Letters({ text }: { text: string }) {
    return (
        <>
            <span className="sr-only">{text}</span>
            <span className={s.glyphs} aria-hidden="true">
                <Chars text={text} />
            </span>
        </>
    );
}

/** Camada decorativa: 24 tiras de cor que juntas preenchem a faixa. */
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
