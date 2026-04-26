import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Tipografia do produto Bionic Brand OS:
//   - BDO Grotesk (display + body) — carregada via @font-face em globals.css
//   - IBM Plex Mono (labels técnicos) — abaixo
// Fontes de marcas-cliente (ex: Spectral, TASA Orbiter da Betina) NÃO entram
// aqui — são carregadas no layout da rota cliente que precisa delas.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bionic Brand OS",
    template: "%s · Bionic Brand OS",
  },
  description:
    "O sistema operacional do Bionic Branding. Cada marca como interface viva entre emoção humana e clareza de máquina.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[--color-bg] text-[--color-fg]">
        {children}
      </body>
    </html>
  );
}
