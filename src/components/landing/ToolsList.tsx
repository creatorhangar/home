"use client";

import { useRef } from "react";
import { APPS, type CatalogApp } from "@/config/apps";
import s from "./home.module.css";

/**
 * Catálogo: exatamente uma faixa por app.
 *
 * Cada faixa é independente: o estado ativo vem do próprio :hover /
 * :focus-visible (CSS), não de um índice compartilhado. Assim, ao
 * atravessar várias faixas rapidamente, as anteriores seguem recolhendo
 * enquanto as próximas abrem, e uma reentrada retoma do ponto atual.
 */
export function ToolsList() {
    return (
        <ul className={s.catalog} aria-label="Apps">
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
    );
}

function AppRow({ app }: { app: CatalogApp }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Vídeo só toca enquanto a faixa está sob hover ou foco.
    const play = () => {
        const v = videoRef.current;
        if (!v) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        v.play().catch(() => {});
    };
    const pause = () => {
        videoRef.current?.pause();
    };

    const media = {
        onPointerEnter: (e: React.PointerEvent) => {
            if (e.pointerType === "mouse") play();
        },
        onPointerLeave: pause,
        onFocus: play,
        onBlur: pause,
    };

    const body = (
        <>
            <RowContent app={app} videoRef={videoRef} />
            <div className={s.overlay} aria-hidden="true">
                <RowContent app={app} duplicate />
            </div>
        </>
    );

    if (app.href) {
        return (
            <a
                className={s.row}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                {...media}
            >
                {body}
            </a>
        );
    }

    // Destino ainda não confirmado: faixa visível, CTA desabilitado.
    return (
        <div className={s.row} {...media}>
            {body}
        </div>
    );
}

function RowContent({
    app,
    duplicate = false,
    videoRef,
}: {
    app: CatalogApp;
    duplicate?: boolean;
    videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
    const disabled = !app.href;
    const cta = (
        <>
            {app.cta}
            <span className={s.arrow} aria-hidden="true">
                ↗
            </span>
        </>
    );
    // Rótulo acessível do CTA só existe na camada base.
    const ctaA11y = duplicate
        ? {}
        : disabled
          ? { "aria-disabled": true as const, title: "Em breve" }
          : {};

    const NameTag = duplicate ? "span" : "h2";
    const newTab =
        !duplicate && app.href ? <span className="sr-only"> (abre em nova aba)</span> : null;

    return (
        <div className={s.content}>
            {duplicate ? (
                <div className={s.previewSpacer} />
            ) : (
                <Preview app={app} videoRef={videoRef} />
            )}

            <div className={s.text}>
                <NameTag className={s.name} style={{ display: "block" }}>
                    {app.name}
                </NameTag>
                <p className={s.desc}>{app.description}</p>
                <span
                    className={`${s.cta} ${s.ctaInline} ${disabled ? s.ctaDisabled : ""}`}
                    {...ctaA11y}
                >
                    {cta}
                    {newTab}
                </span>
            </div>

            <span
                className={`${s.cta} ${s.ctaEnd} ${disabled ? s.ctaDisabled : ""}`}
                {...ctaA11y}
            >
                {cta}
                {newTab}
            </span>
        </div>
    );
}

function Preview({
    app,
    videoRef,
}: {
    app: CatalogApp;
    videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
    const p = app.preview;
    return (
        <span className={s.preview} style={{ display: "block" }}>
            {p?.type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
            )}
            {p?.type === "video" && (
                <video
                    ref={videoRef}
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
