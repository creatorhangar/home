/**
 * "Carga" de cor por faixa — o que dá o dominó em degraus.
 *
 * Cada faixa tem uma carga 0–1:
 *  - enquanto o mouse está nela (ou foco de teclado), sobe;
 *  - um toque rápido (faixa atravessada) dá um impulso curto, parcial;
 *  - sem estímulo, decai devagar.
 * As 24 tiras acendem conforme a carga: centro primeiro, bordas depois
 * (e na queda, bordas apagam primeiro). Numa passagem rápida, as faixas
 * tocadas antes já decaíram mais que as recentes: intensidades em degrau.
 *
 * Um único laço de rAF para todas as faixas, só enquanto há carga.
 */

const RISE_MS = 550; // 0 → 1 com o mouse parado na faixa
const DECAY_MS = 1700; // 1 → 0 sem estímulo (rastro longo)
const EDGE_LAG = 0.45; // quanto de carga as tiras das bordas esperam para começar

interface RowHeat {
    strips: HTMLElement[];
    edge: number[];
    e: number;
    want: boolean;
    kickUntil: number;
    drawn: number[];
}

const smooth = (t: number) => t * t * (3 - 2 * t);

export interface Heat {
    setWant(row: HTMLElement, want: boolean): void;
    kick(row: HTMLElement, ms: number): void;
    dispose(): void;
}

export function createHeat(rows: HTMLElement[]): Heat {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const state = new Map<HTMLElement, RowHeat>();
    for (const row of rows) {
        const strips = Array.from(row.querySelectorAll<HTMLElement>("[data-strip]"));
        const n = strips.length;
        state.set(row, {
            strips,
            edge: strips.map((_, k) => Math.abs(k - (n - 1) / 2) / ((n - 1) / 2)),
            e: 0,
            want: false,
            kickUntil: 0,
            drawn: strips.map(() => -1),
        });
    }

    let raf = 0;
    let last = 0;

    const draw = (h: RowHeat) => {
        for (let k = 0; k < h.strips.length; k++) {
            const thr = h.edge[k] * EDGE_LAG;
            const f = smooth(Math.min(1, Math.max(0, (h.e - thr) / (1 - EDGE_LAG))));
            if (Math.abs(f - h.drawn[k]) < 0.002) continue;
            h.drawn[k] = f;
            const st = h.strips[k].style;
            if (f >= 0.999) st.clipPath = "inset(-0.5px 0 -0.5px 0)"; // sem fenda entre tiras
            else {
                const ins = (50 * (1 - f)).toFixed(2);
                st.clipPath = `inset(${ins}% 0 ${ins}% 0)`;
            }
            st.opacity = (0.35 + 0.65 * f).toFixed(3);
        }
    };

    const frame = (t: number) => {
        const dt = last ? Math.min(64, t - last) : 16;
        last = t;
        let busy = false;
        for (const h of state.values()) {
            const driving = h.want || t < h.kickUntil;
            if (reduce.matches) h.e = driving ? 1 : 0;
            else if (driving) h.e = Math.min(1, h.e + dt / RISE_MS);
            else h.e = Math.max(0, h.e - dt / DECAY_MS);
            draw(h);
            if (driving || h.e > 0) busy = true;
        }
        if (busy) raf = requestAnimationFrame(frame);
        else {
            raf = 0;
            last = 0;
        }
    };

    const wake = () => {
        if (!raf) raf = requestAnimationFrame(frame);
    };

    return {
        setWant(row, want) {
            const h = state.get(row);
            if (!h || h.want === want) return;
            h.want = want;
            wake();
        },
        kick(row, ms) {
            const h = state.get(row);
            if (!h) return;
            h.kickUntil = Math.max(h.kickUntil, performance.now() + ms);
            wake();
        },
        dispose() {
            cancelAnimationFrame(raf);
        },
    };
}
