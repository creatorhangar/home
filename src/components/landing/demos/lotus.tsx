import type { ReactNode } from "react";
import s from "./demos.module.css";

/**
 * A flor de todas as demonstrações: lótus vista de frente, sete pétalas
 * (três internas quase verticais, quatro externas abrindo para os lados).
 *
 * Todas as pétalas usam o MESMO caminho (`PETAL`); só mudam posição de
 * articulação, ângulo e escala. Cada pétala gira em torno de uma
 * dobradiça junto à base, então abrir é articular, nunca escalar a flor
 * inteira. A flor fechada é um botão (as mesmas pétalas, quase paralelas).
 *
 * Coordenadas: dobradiça central em (0, 0); a ponta da pétala central
 * sobe até y = -50. Use `lotusAt` para posicionar pelo centro visual.
 *
 * Contorno e preenchimento saem de tokens CSS (--fg, --ph) e cada pétala
 * é opaca, então as de trás não deixam linhas atravessarem as da frente.
 */
export const PETAL = "M0 0C-12 -8 -14 -30 0 -50C14 -30 12 -8 0 0Z";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);

interface PetalDef {
    /** deslocamento da dobradiça (x) */
    hx: number;
    open: number;
    bud: number;
    /** escala em y (comprimento) e x (largura) aberta / fechada */
    ly: number;
    lyBud: number;
    lx: number;
    lxBud: number;
    /** atraso relativo da abertura (0 = abre primeiro) */
    delay: number;
}

/** Da esquerda para a direita. */
const DEFS: PetalDef[] = [
    { hx: -6, open: -72, bud: -36, ly: 0.64, lyBud: 0.62, lx: 0.95, lxBud: 1.12, delay: 0 },
    { hx: -3.5, open: -43, bud: -21, ly: 0.8, lyBud: 0.76, lx: 1, lxBud: 1.1, delay: 0.1 },
    { hx: -1.2, open: -15, bud: -8, ly: 0.88, lyBud: 0.88, lx: 1, lxBud: 1, delay: 0.3 },
    { hx: 0, open: 0, bud: 0, ly: 0.95, lyBud: 0.95, lx: 1.04, lxBud: 1, delay: 0.38 },
    { hx: 1.2, open: 15, bud: 8, ly: 0.88, lyBud: 0.88, lx: 1, lxBud: 1, delay: 0.3 },
    { hx: 3.5, open: 43, bud: 21, ly: 0.8, lyBud: 0.76, lx: 1, lxBud: 1.1, delay: 0.1 },
    { hx: 6, open: 72, bud: 36, ly: 0.64, lyBud: 0.62, lx: 0.95, lxBud: 1.12, delay: 0 },
];

/** Ordem de pintura: as externas atrás; as internas por cima, o centro por último. */
const DRAW = [0, 6, 1, 5, 2, 4, 3];

/** Escalas padrão: a mesma flor em três tamanhos, para as demos parecerem uma família. */
export const SCALE = { hero: 1.05, mid: 0.75, small: 0.6 } as const;

export const PETALS = DEFS.length;
/** Altura/largura aproximadas da flor aberta (unidades locais). */
export const FLOWER = { w: 94, h: 52, below: 4 };

/**
 * Progresso por pétala a partir de um progresso mestre `t` (0–1): as
 * externas abrem primeiro, as internas acompanham com atraso.
 */
export function bloom(t: number): number[] {
    return DEFS.map((d) => smooth(clamp((t - d.delay * 0.8) / 0.62)));
}

/** Botão → botão crescido: `grow` 0–1 muda tamanho moderadamente. */
const growScale = (g: number) => lerp(0.85, 1, smooth(clamp(g)));

export function petalTf(i: number, open: number, grow = 1) {
    const d = DEFS[i];
    const o = clamp(open);
    const g = growScale(grow);
    const sx = lerp(d.lxBud, d.lx, o) * g;
    const sy = lerp(d.lyBud, d.ly, o) * g;
    const a = lerp(d.bud, d.open, o);
    return `translate(${(d.hx * lerp(0.5, 1, o) * g).toFixed(2)} 0) rotate(${a.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`;
}

const cache = new WeakMap<Element, Element[]>();

/** Escreve a pose da flor. `open`: progresso por pétala (use `bloom`). */
export function setLotus(root: Element | null, open: number[], grow = 1) {
    if (!root) return;
    let els = cache.get(root);
    if (!els) {
        els = Array.from(root.querySelectorAll("[data-p]"));
        cache.set(root, els);
    }
    for (const el of els) {
        const i = Number((el as HTMLElement).dataset.p);
        el.setAttribute("transform", petalTf(i, open[i], grow));
    }
}

export interface LotusProps {
    /** id do <g> raiz (para reutilizar com <use>) */
    id?: string;
    /** espessura do contorno em px de tela */
    lw?: number;
    /** flor já aberta (padrão: fechada, pronta para setLotus) */
    open?: boolean;
    /** camada extra dentro de cada pétala (coordenadas da pétala), sobre o preenchimento */
    overlay?: (i: number) => ReactNode;
    /** camada extra no espaço da flor, sobre a pétala i e sob o seu contorno */
    flat?: (i: number) => ReactNode;
}

export function Lotus({ id, lw = 1.75, open = false, overlay, flat }: LotusProps) {
    const o = open ? 1 : 0;
    const tf = (i: number) => petalTf(i, o, open ? 1 : 0);
    return (
        <g id={id} className={s.lotus} style={{ ["--lw" as string]: lw }}>
            {DRAW.map((i) => (
                <g key={i}>
                    <g data-p={i} transform={tf(i)}>
                        <path d={PETAL} className={s.petalFill} />
                        {overlay?.(i)}
                    </g>
                    {flat?.(i)}
                    <g data-p={i} transform={tf(i)}>
                        <path d={PETAL} className={s.petalLine} />
                    </g>
                </g>
            ))}
        </g>
    );
}

/** Transform que põe o centro visual da flor em (cx, cy) com escala sc. */
export const lotusAt = (cx: number, cy: number, sc = 1) =>
    `translate(${cx.toFixed(2)} ${(cy + 24 * sc).toFixed(2)}) scale(${sc.toFixed(3)})`;
