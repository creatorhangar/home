"use client";

import type { CatalogApp } from "@/config/apps";
import { Burnsh } from "./Burnsh";
import { CopyRetouch } from "./CopyRetouch";
import { CutFleet } from "./CutFleet";
import { GifCuts } from "./GifCuts";
import { Swoovi } from "./Swoovi";

/** Demonstração de cada app. `replay` recomeça a sequência. */
export function Demo({ id, replay = 0 }: { id: CatalogApp["id"]; replay?: number }) {
    switch (id) {
        case "burnsh":
            return <Burnsh replay={replay} />;
        case "swoovi":
            return <Swoovi />;
        case "copyretouch":
            return <CopyRetouch replay={replay} />;
        case "gifcuts":
            return <GifCuts replay={replay} />;
        case "cutfleet":
            return <CutFleet replay={replay} />;
        default:
            return null;
    }
}
