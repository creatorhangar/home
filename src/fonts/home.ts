/**
 * Fontes da home, servidas pela própria aplicação (next/font baixa os
 * arquivos oficiais do Google Fonts no build e os hospeda junto do app):
 * o resultado é igual em desenvolvimento e produção.
 *
 * Licenças (SIL OFL 1.1) em src/fonts/licenses/.
 */
import { Archivo, Instrument_Sans, Montserrat, Roboto_Flex } from "next/font/google";

/** Variável: mantém os eixos wght (100–1000) e wdth (25–151) para a lupa. */
export const robotoFlex = Roboto_Flex({
    subsets: ["latin"],
    axes: ["wdth"],
    variable: "--font-roboto-flex",
    display: "swap",
});

/** CTAs. */
export const instrumentSans = Instrument_Sans({
    subsets: ["latin"],
    weight: ["500"],
    variable: "--font-instrument-sans",
    display: "swap",
});

/**
 * Teste de nomes: Archivo variável (wght 100–900, wdth 62–125). A Archivo
 * Black é estática (um peso, sem eixos) e não permitiria a lupa; a Archivo
 * em peso 800–900 tem o mesmo desenho pesado.
 */
export const archivo = Archivo({
    subsets: ["latin"],
    axes: ["wdth"],
    variable: "--font-archivo",
    display: "swap",
});

/** Descrições: Montserrat variável (só eixo wght). */
export const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-montserrat",
    display: "swap",
});
