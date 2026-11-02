"use client";

import { useSyncExternalStore } from "react";

/**
 * Tema da home: atributo data-theme no <html> (aplicado antes da pintura
 * por um script em layout.tsx) + escolha salva em localStorage.
 * Escuro é o padrão da primeira visita.
 */
export type Theme = "dark" | "light";

const KEY = "ch-theme";

function read(): Theme {
    return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(cb: () => void) {
    const mo = new MutationObserver(cb);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
}

export function useTheme(): Theme {
    return useSyncExternalStore(subscribe, read, () => "dark");
}

export function toggleTheme() {
    const next: Theme = read() === "light" ? "dark" : "light";
    if (next === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    try {
        localStorage.setItem(KEY, next);
    } catch {
        // armazenamento indisponível: o tema vale só para esta visita
    }
}
