import fs from "node:fs/promises";
import path from "node:path";

import { Prose } from "@/components/prose";
import { Eyebrow, PortalFooter, PortalHeader } from "@/components/tag";

export const metadata = {
  title: "Bionic Branding",
  description:
    "O método da TAG para criar marcas que falam com humanos e máquinas.",
};

async function loadManifesto() {
  const filePath = path.join(process.cwd(), "content", "manifesto.md");
  return fs.readFile(filePath, "utf-8");
}

export default async function ManifestoPage() {
  const markdown = await loadManifesto();

  return (
    <>
      <PortalHeader active="manifesto" />

      <article>
        {/* Title block — deep anchor */}
        <header className="surface-deep border-b border-[--color-border]">
          <div className="container-wide py-20 md:py-32">
            <Eyebrow className="opacity-70">Manifesto</Eyebrow>
            <h1 className="mt-8 max-w-[18ch]">Bionic Branding.</h1>
            <p className="type-lead mt-8 max-w-2xl opacity-80">
              O método da TAG para criar marcas que falam com humanos e máquinas.
              Humanos decidem por emoção. Máquinas decidem por clareza. Marcas
              fortes precisam falar os dois idiomas.
            </p>
          </div>
        </header>

        {/* Body — elevated (white) for reading comfort */}
        <section className="surface-elevated">
          <div className="container-wide py-16 md:py-24">
            <div className="grid md:grid-cols-[180px_1fr] gap-8 md:gap-16">
              <aside className="md:sticky md:top-24 md:self-start space-y-4">
                <Eyebrow>Leitura</Eyebrow>
                <p className="text-sm text-[--color-fg-muted] leading-relaxed">
                  Este é o texto institucional que define o método do portal.
                  Aplica-se a qualquer cliente hospedado na TAG.
                </p>
              </aside>
              <div className="max-w-[68ch]">
                <Prose>{markdown}</Prose>
              </div>
            </div>
          </div>
        </section>
      </article>

      <PortalFooter />
    </>
  );
}
