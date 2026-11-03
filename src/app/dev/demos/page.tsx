"use client";

import { notFound } from "next/navigation";
import { useState } from "react";
import { APPS } from "@/config/apps";
import { Demo } from "@/components/landing/demos";
import { toggleTheme } from "@/components/landing/theme";
import s from "@/components/landing/home.module.css";

/**
 * Bancada das demonstrações (só em desenvolvimento): tamanho real, controle
 * para repetir cada sequência, alternância de tema e uma visão ampliada.
 */
export default function DemosPage() {
    if (process.env.NODE_ENV === "production") notFound();
    const [ticks, setTicks] = useState<Record<string, number>>({});
    const [zoom, setZoom] = useState(false);
    const size = zoom ? 600 : 300;

    return (
        <main className={s.page} style={{ minHeight: "100vh", padding: "32px 40px", background: "var(--bg)", color: "var(--fg)" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 32, font: "500 13px var(--text)" }}>
                <button onClick={toggleTheme}>tema</button>
                <button onClick={() => setZoom((z) => !z)}>{zoom ? "tamanho real" : "ampliar 2×"}</button>
                <button onClick={() => setTicks((t) => Object.fromEntries(APPS.map((a) => [a.id, (t[a.id] ?? 0) + 1])))}>
                    repetir todas
                </button>
            </div>
            {APPS.map((app) => (
                <div key={app.id} style={{ display: "flex", alignItems: "center", gap: 30, padding: "20px 0", borderTop: "1px solid var(--rule)" }}>
                    <span style={{ width: size, height: (size * 170) / 300, background: "var(--ph)", outline: "1px solid var(--rule)", outlineOffset: -1, flex: "none" }}>
                        <Demo id={app.id} replay={ticks[app.id] ?? 0} />
                    </span>
                    <div style={{ font: "800 30px var(--display-alt)", minWidth: 220 }}>{app.name.toLowerCase()}</div>
                    <button
                        style={{ font: "500 13px var(--text)" }}
                        onClick={() => setTicks((t) => ({ ...t, [app.id]: (t[app.id] ?? 0) + 1 }))}
                    >
                        repetir
                    </button>
                </div>
            ))}
        </main>
    );
}
