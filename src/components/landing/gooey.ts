/**
 * Morph "gooey" do nome: minúsculas ↔ maiúsculas.
 *
 * Técnica do tutorial "Text Gooey" de Olivier Larose: desfoque + limiar de
 * alfa (feColorMatrix) fazem as formas se fundirem. Aqui as duas versões do
 * nome se cruzam com desfoque crescente/decrescente sob o filtro de limiar.
 * O filtro só fica ligado durante o morph — em repouso o texto é nítido.
 */

export const GOOEY_FILTER_ID = "ch-gooey";
const DURATION = 650; // ms — acompanha o crescimento da lupa (~300–600 ms)

// seno: aceleração e freada suaves, sem trecho brusco no meio
const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

function layerStyle(el: HTMLElement, f: number) {
    if (f <= 0) {
        el.style.opacity = "0";
        el.style.filter = "";
        return;
    }
    if (f >= 1) {
        el.style.opacity = "1";
        el.style.filter = "";
        return;
    }
    el.style.opacity = `${Math.pow(f, 0.4)}`;
    // blur limitado: a camada que sai vira uma "gota" visível, não some de vez
    el.style.filter = `blur(${Math.min(6 / f - 6, 14).toFixed(2)}px)`;
}

export interface Gooey {
    set(hot: boolean): void;
    dispose(): void;
}

export function attachGooey(container: HTMLElement): Gooey {
    const lo = container.querySelector<HTMLElement>("[data-layer='lo']");
    const up = container.querySelector<HTMLElement>("[data-layer='up']");
    if (!lo || !up) return { set() {}, dispose() {} };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let progress = 0; // 0 = minúsculas, 1 = maiúsculas
    let target = 0;
    let raf = 0;
    let last = 0;

    const render = () => {
        const k = easeInOut(progress);
        layerStyle(up, k);
        layerStyle(lo, 1 - k);
        container.style.filter = progress > 0 && progress < 1 ? `url(#${GOOEY_FILTER_ID})` : "";
    };

    const tick = (t: number) => {
        const dt = last ? t - last : 16;
        last = t;
        const step = dt / DURATION;
        progress = target > progress ? Math.min(target, progress + step) : Math.max(target, progress - step);
        render();
        if (progress !== target) raf = requestAnimationFrame(tick);
        else {
            raf = 0;
            last = 0;
        }
    };

    render();

    return {
        set(hot) {
            target = hot ? 1 : 0;
            if (reduce.matches) {
                progress = target;
                render();
                return;
            }
            // retoma do estado atual, sem reiniciar
            if (!raf && progress !== target) raf = requestAnimationFrame(tick);
        },
        dispose() {
            cancelAnimationFrame(raf);
        },
    };
}
