import { Spectral } from "next/font/google";
import type { ReactNode } from "react";

// Fontes que aparecem como AMOSTRA dentro da rota /[client]/visual.
// Carregadas só aqui (não no layout raiz do produto) pra não vazarem
// identidade de marca-cliente pro chrome do Bionic Brand OS.
//
// TODO (multi-cliente, fase 3 do refator visual): ler família de fonte do
// design-tokens.json da marca e carregar dinamicamente em vez de hardcodar
// Spectral (Betina) e TASA Orbiter (link no <head> abaixo).
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  display: "swap",
});

export default function VisualLayout({ children }: { children: ReactNode }) {
  return (
    <div className={spectral.variable}>
      {/* TASA Orbiter via Google Fonts CSS — Next move o <link> pro <head>.
          Carregamento por-rota é INTENCIONAL: a fonte só serve à amostra
          tipográfica desta página, não deve poluir o chrome do produto. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@400;500;700&display=swap"
      />
      {children}
    </div>
  );
}
