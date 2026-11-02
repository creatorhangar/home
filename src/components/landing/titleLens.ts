/**
 * Lupa tipográfica nos títulos: as letras próximas do cursor ganham peso
 * e largura (eixos wght/wdth da Roboto Flex); as distantes ficam em
 * repouso. Sem React por movimento: um único laço de rAF compartilhado,
 * que só roda enquanto algum título está ativo ou voltando ao repouso.
 */

const REST = { wght: 450, wdth: 100 };
const PEAK = { wght: 750, wdth: 120 };
const RADIUS = 90; // px, nos dois eixos
const TAU = 90; // ms — amortecimento exponencial (sem quique); ~450 ms até o repouso
const EPS = 0.002;

interface Title {
    letters: HTMLElement[];
    cur: Float32Array;
    pointer: { x: number; y: number } | null;
}

const active = new Set<Title>();
let raf = 0;
let lastT = 0;

function settings(f: number) {
    const w = REST.wght + (PEAK.wght - REST.wght) * f;
    const d = REST.wdth + (PEAK.wdth - REST.wdth) * f;
    return `"wght" ${w.toFixed(1)}, "wdth" ${d.toFixed(2)}`;
}

function frame(t: number) {
    const dt = lastT ? Math.min(64, t - lastT) : 16;
    lastT = t;
    const k = 1 - Math.exp(-dt / TAU);

    for (const title of active) {
        const { letters, cur, pointer } = title;
        // leituras primeiro (um layout), escritas depois
        const targets = new Float32Array(letters.length);
        if (pointer) {
            for (let i = 0; i < letters.length; i++) {
                const r = letters[i].getBoundingClientRect();
                const dx = r.left + r.width / 2 - pointer.x;
                const dy = r.top + r.height / 2 - pointer.y;
                const s = Math.max(0, 1 - Math.hypot(dx, dy) / RADIUS);
                targets[i] = s * s * (3 - 2 * s); // smoothstep: queda suave
            }
        }
        let moving = false;
        for (let i = 0; i < letters.length; i++) {
            const next = cur[i] + (targets[i] - cur[i]) * k;
            if (Math.abs(next - cur[i]) > 1e-4) {
                cur[i] = next;
                letters[i].style.fontVariationSettings = settings(next);
            }
            if (Math.abs(targets[i] - cur[i]) > EPS) moving = true;
        }
        // Assentou: para o laço (um novo pointermove o acorda).
        if (!moving) {
            if (!pointer) {
                cur.fill(0);
                letters.forEach((l) => (l.style.fontVariationSettings = ""));
            }
            active.delete(title);
        }
    }

    if (active.size) raf = requestAnimationFrame(frame);
    else {
        raf = 0;
        lastT = 0;
    }
}

function wake(title: Title) {
    active.add(title);
    if (!raf) raf = requestAnimationFrame(frame);
}

/** Liga a lupa num título. Mouse/caneta apenas; respeita movimento reduzido. */
export function attachTitleLens(el: HTMLElement): () => void {
    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-ch]"));
    if (!letters.length) return () => {};
    const title: Title = { letters, cur: new Float32Array(letters.length), pointer: null };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    const move = (e: PointerEvent) => {
        if (e.pointerType === "touch" || reduce.matches || !fine.matches) return;
        title.pointer = { x: e.clientX, y: e.clientY };
        wake(title);
    };
    const leave = () => {
        if (!title.pointer) return;
        title.pointer = null;
        wake(title);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        active.delete(title);
        letters.forEach((l) => (l.style.fontVariationSettings = ""));
    };
}
