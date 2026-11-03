"use client";

import { useEffect, useRef } from "react";
import { Footer } from "./Footer";
import { toggleTheme, useTheme } from "./theme";
import { attachLens, LENS } from "./titleLens";
import s from "./home.module.css";

const WORDS = ["Creator", "Hangar"] as const;

/**
 * Painel de marca: só o nome, uma palavra por linha. No desktop fica na
 * vertical (lê de baixo para cima) ocupando a lateral; a lupa aumenta as
 * letras sob o cursor e clicar troca o tema.
 */
export function Hero() {
    const theme = useTheme();
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const lines = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-line]") ?? []);
        const off = lines.map((el) => attachLens(el, LENS.side));
        return () => off.forEach((f) => f());
    }, []);

    return (
        <aside className={s.panel}>
            <h1 className="sr-only">Creator Hangar</h1>
            <button
                type="button"
                className={s.side}
                onClick={toggleTheme}
                aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            >
                <span ref={ref} className={s.sideText} aria-hidden="true">
                    {WORDS.map((w) => (
                        <span key={w} className={s.sideLine} data-line="">
                            {Array.from(w.toUpperCase()).map((ch, k) => (
                                <span key={k} data-ch="">
                                    {ch}
                                </span>
                            ))}
                        </span>
                    ))}
                </span>
            </button>
            <Footer className={s.foot} />
        </aside>
    );
}
