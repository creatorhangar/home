/**
 * Catálogo de apps exibido na home.
 *
 * `href: null` = destino ainda não confirmado → CTA desabilitado.
 * `preview: null` = sem material real → placeholder neutro no quadrado.
 *
 * Quando os assets chegarem, coloque-os em /public/apps/ e preencha `preview`, ex.:
 *   preview: { type: "video", src: "/apps/swoovi.mp4", poster: "/apps/swoovi.jpg" }
 *   preview: { type: "image", src: "/apps/gifcuts.gif" }
 */

export type AppPreview =
    | { type: "image"; src: string; alt: string }
    | { type: "video"; src: string; poster?: string };

export interface CatalogApp {
    id: string;
    name: string;
    description: string;
    cta: string;
    href: string | null;
    preview: AppPreview | null;
}

export const APPS: CatalogApp[] = [
    {
        id: "burnsh",
        name: "Burnsh",
        description: "Effects and textures for your images.",
        cta: "Open",
        href: "https://www.burnsh.com/",
        preview: null,
    },
    {
        id: "swoovi",
        name: "Swoovi",
        description: "Turn photos into videos.",
        cta: "Open",
        href: "https://swoovi.app/",
        preview: null,
    },
    {
        id: "copyretouch",
        name: "CopyRetouch",
        description: "Copy, edit and save your images.",
        cta: "Download",
        href: null, // pendente: URL de download não encontrada no repositório
        preview: null,
    },
    {
        id: "gifcuts",
        name: "GifCuts",
        description: "Create and edit your GIFs.",
        cta: "Open",
        href: null, // pendente: destino não encontrado no repositório
        preview: null,
    },
    {
        id: "cutfleet",
        name: "CutFleet",
        description: "Batch-remove backgrounds and split elements.",
        cta: "Open",
        href: null, // pendente: destino não encontrado no repositório
        preview: null,
    },
];
