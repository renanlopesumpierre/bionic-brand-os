import type { Metadata } from "next";
import { IBM_Plex_Mono, Spectral } from "next/font/google";
import "./globals.css";

// TAG technical label / meta font.
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

// Betina display serif.
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["200", "300", "400"],
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
      className={`${ibmPlexMono.variable} ${spectral.variable} h-full antialiased`}
    >
      <head>
        {/* BDO Grotesk loaded locally via @font-face in globals.css.
            TASA Orbiter (used only as a sample inside /[client]/visual). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@400;500;700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[--color-bg] text-[--color-fg]">
        {children}
      </body>
    </html>
  );
}
