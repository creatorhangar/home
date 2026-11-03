/**
 * Lupa tipográfica: só as letras próximas do cursor (distância 2D) mudam
 * de eixos variáveis e, opcionalmente, de espaçamento; as distantes ficam
 * em repouso. Sem React por movimento: um único laço de rAF compartilhado,
 * que só roda enquanto alguma lupa está se movendo ou voltando ao repouso.
 *
 * Os valores de repouso de cada perfil precisam coincidir com o CSS.
 */

export interface LensProfile {
    /** Eixos em repouso e no centro da influência. */
    rest: Record<string, number>;
    peak: Record<string, number>;
    /** letter-spacing (em) em repouso e no pico, se mudar. */
    track?: [number, number];
    /** Raio de influência em px. */
    radius: number;
    /** Tamanho da letra no pico (multiplicador de em); 1 = não muda. */
    size?: number;
    /** Expoente da queda: > 1 concentra o efeito no centro (mais contraste). */
    curve?: number;
    /** Empurra a cor da letra para --lens-ink no pico (compensa traço fino). */
    ink?: boolean;
}

export const LENS: Record<string, LensProfile> = {
    // Título em Roboto Flex: alarga, encorpa e cresce.
    flex: { rest: { wght: 450, wdth: 100 }, peak: { wght: 900, wdth: 151 }, radius: 130, size: 1.32, curve: 1.6 },
    // Título em Archivo pesado: alarga ao máximo e cresce a partir da linha de base.
    archivo: { rest: { wght: 800, wdth: 100 }, peak: { wght: 900, wdth: 125 }, radius: 130, size: 1.38, curve: 1.6 },
    // Descrição em Montserrat (sem eixo de largura): afina e aperta, sem perder brilho.
    desc: { rest: { wght: 500 }, peak: { wght: 300 }, track: [0, -0.05], radius: 60, ink: true },
};

const TAU = 65; // ms — amortecimento exponencial (sem quique); ~400 ms até o repouso
const EPS = 0.002;

interface Lens {
    letters: HTMLElement[];
    cur: Float32Array;
    pointer: { x: number; y: number } | null;
    profile: LensProfile;
}

const active = new Set<Lens>();
let raf = 0;
let lastT = 0;

function apply(l: HTMLElement, p: LensProfile, f: number) {
    l.style.fontVariationSettings = Object.keys(p.rest)
        .map((axis) => `"${axis}" ${(p.rest[axis] + (p.peak[axis] - p.rest[axis]) * f).toFixed(1)}`)
        .join(", ");
    if (p.track) l.style.letterSpacing = `${(p.track[0] + (p.track[1] - p.track[0]) * f).toFixed(4)}em`;
    if (p.size) l.style.fontSize = `${(1 + (p.size - 1) * f).toFixed(4)}em`;
    if (p.ink) l.style.color = `color-mix(in srgb, var(--lens-ink) ${(f * 100).toFixed(1)}%, currentColor)`;
}

function clear(l: HTMLElement) {
    l.style.fontVariationSettings = "";
    l.style.letterSpacing = "";
    l.style.fontSize = "";
    l.style.color = "";
}

function frame(t: number) {
    const dt = lastT ? Math.min(64, t - lastT) : 16;
    lastT = t;
    const k = 1 - Math.exp(-dt / TAU);

    for (const lens of active) {
        const { letters, cur, pointer, profile } = lens;
        // leituras primeiro (um layout), escritas depois
        const targets = new Float32Array(letters.length);
        if (pointer) {
            for (let i = 0; i < letters.length; i++) {
                const r = letters[i].getBoundingClientRect();
                const dx = r.left + r.width / 2 - pointer.x;
                const dy = r.top + r.height / 2 - pointer.y;
                const s = Math.max(0, 1 - Math.hypot(dx, dy) / profile.radius);
                const smooth = s * s * (3 - 2 * s); // smoothstep: queda suave
                targets[i] = profile.curve ? Math.pow(smooth, profile.curve) : smooth;
            }
        }
        let moving = false;
        for (let i = 0; i < letters.length; i++) {
            const next = cur[i] + (targets[i] - cur[i]) * k;
            if (Math.abs(next - cur[i]) > 1e-4) {
                cur[i] = next;
                apply(letters[i], profile, next);
            }
            if (Math.abs(targets[i] - cur[i]) > EPS) moving = true;
        }
        // Assentou: para o laço (um novo pointermove o acorda).
        if (!moving) {
            if (!pointer) {
                cur.fill(0);
                letters.forEach(clear);
            }
            active.delete(lens);
        }
    }

    if (active.size) raf = requestAnimationFrame(frame);
    else {
        raf = 0;
        lastT = 0;
    }
}

function wake(lens: Lens) {
    active.add(lens);
    if (!raf) raf = requestAnimationFrame(frame);
}

/**
 * Liga a lupa num elemento cujas letras estão em [data-ch].
 * Mouse/caneta apenas; desligada em touch e com movimento reduzido.
 */
export function attachLens(el: HTMLElement, profile: LensProfile): () => void {
    const letters = Array.from(el.querySelectorAll<HTMLElement>("[data-ch]"));
    if (!letters.length) return () => {};
    const lens: Lens = { letters, cur: new Float32Array(letters.length), pointer: null, profile };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    const move = (e: PointerEvent) => {
        if (e.pointerType === "touch" || reduce.matches || !fine.matches) return;
        lens.pointer = { x: e.clientX, y: e.clientY };
        wake(lens);
    };
    const leave = () => {
        if (!lens.pointer) return;
        lens.pointer = null;
        wake(lens);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        active.delete(lens);
        letters.forEach(clear);
    };
}
