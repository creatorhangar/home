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
        description: "Efeitos e texturas para suas imagens.",
        cta: "Abrir",
        href: "https://www.burnsh.com/",
        preview: null,
    },
    {
        id: "swoovi",
        name: "Swoovi",
        description: "Transforme fotos em vídeos.",
        cta: "Abrir",
        href: "https://swoovi.app/",
        preview: null,
    },
    {
        id: "copyretouch",
        name: "CopyRetouch",
        description: "Copie, edite e salve suas imagens.",
        cta: "Download",
        href: null, // pendente: URL de download não encontrada no repositório
        preview: null,
    },
    {
        id: "gifcuts",
        name: "GifCuts",
        description: "Crie e edite seus GIFs.",
        cta: "Abrir",
        href: null, // pendente: destino não encontrado no repositório
        preview: null,
    },
    {
        id: "cutfleet",
        name: "CutFleet",
        description: "Remova fundos em lote e separe elementos.",
        cta: "Abrir",
        href: null, // pendente: destino não encontrado no repositório
        preview: null,
    },
];
