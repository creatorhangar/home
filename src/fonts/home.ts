/**
 * Fontes da home, servidas pela própria aplicação (next/font baixa os
 * arquivos oficiais do Google Fonts no build e os hospeda junto do app):
 * o resultado é igual em desenvolvimento e produção.
 *
 * Licenças (SIL OFL 1.1) em src/fonts/licenses/.
 */
import { Instrument_Sans, Roboto_Flex } from "next/font/google";

/** Variável: mantém os eixos wght (100–1000) e wdth (25–151) para a lupa. */
export const robotoFlex = Roboto_Flex({
    subsets: ["latin"],
    axes: ["wdth"],
    variable: "--font-roboto-flex",
    display: "swap",
});

export const instrumentSans = Instrument_Sans({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-instrument-sans",
    display: "swap",
});
