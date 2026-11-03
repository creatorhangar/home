"use client";

import s from "./demos.module.css";
import { Lotus, lotusAt, SCALE } from "./lotus";

/**
 * Swoovi: espaço reservado para a animação exportada pelo autor, nos
 * layouts reais do app. Enquanto ela não chega, a mesma flor das outras
 * demonstrações, estática. Para trocar: preencha `preview` em
 * src/config/apps.ts (vídeo/imagem) — o ToolsList usa o arquivo no lugar
 * deste componente.
 */
export function Swoovi() {
    return (
        <svg className={s.svg} viewBox="0 0 300 170" aria-hidden="true" focusable="false" data-slot="swoovi">
            <g transform={lotusAt(150, 85, SCALE.hero * 1.15)}>
                <Lotus open />
            </g>
        </svg>
    );
}
