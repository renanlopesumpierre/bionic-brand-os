import Image from "next/image";
import { notFound } from "next/navigation";

import { getClient } from "@/lib/content";
import { Row, SectionHeader } from "../_components/section-header";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c ? { title: `${c.manifest.name} · Arquitetura` } : {};
}

const offeringPhotos: Record<string, string> = {
  consultoria: "consulting-meeting.jpg",
  treinamentos: "speaking.jpg",
  imersoes: "immersions.jpg",
  thecode: "introspection.jpg",
};

export default async function ArchitecturePage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const { brandSystem } = client;
  const { architecture, offerings, authorityAssets } = brandSystem;

  return (
    <div>
      <SectionHeader
        eyebrow="Arquitetura de marca"
        step="I · 03"
        title="Arquitetura."
        description="Posicionamento competitivo, arquétipos e estrutura comercial. Onde a marca compete e como se diferencia."
        tone="deep"
      />

      <Row label="Categoria">
        <div>
          <p className="text-2xl md:text-3xl tracking-tight mb-3">
            {architecture.category}
          </p>
          <p className="type-mono text-[--color-fg-muted]">
            {architecture.categoryEN}
          </p>
        </div>
      </Row>

      <Row label="Território">
        <div>
          <p className="text-lg leading-relaxed mb-8 max-w-3xl">
            {architecture.territory}
          </p>
          <p className="type-mono text-[--color-fg-muted] mb-3">
            Não compete com
          </p>
          <ul className="space-y-2">
            {architecture.notCompeteWith.map((x) => (
              <li key={x} className="text-[--color-fg-muted]">
                — {x}
              </li>
            ))}
          </ul>
        </div>
      </Row>

      <Row label="Posicionamento público">
        <div>
          <p className="text-3xl md:text-4xl tracking-tight mb-3">
            {architecture.publicPositioningStatement.en}
          </p>
          <p className="text-xl italic text-[--color-fg-muted]">
            {architecture.publicPositioningStatement.pt}
          </p>
        </div>
      </Row>

      <Row label="Arquétipos">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <p className="type-mono text-[--color-fg-muted] mb-3">Principal</p>
            <h3 className="text-2xl mb-3">
              {architecture.archetypes.primary.name}
            </h3>
            <p className="text-sm text-[--color-fg-muted] leading-relaxed">
              {architecture.archetypes.primary.expresses}
            </p>
          </div>
          <div>
            <p className="type-mono text-[--color-fg-muted] mb-3">
              Secundário
            </p>
            <h3 className="text-2xl mb-3">
              {architecture.archetypes.secondary.name}
            </h3>
            <p className="text-sm text-[--color-fg-muted] leading-relaxed">
              {architecture.archetypes.secondary.expresses}
            </p>
          </div>
          <div>
            <p className="type-mono text-[--color-fg-muted] mb-3">
              Assinatura
            </p>
            <h3 className="text-2xl mb-3">
              {architecture.archetypes.behavioralSignature.name}
            </h3>
            <p className="text-sm text-[--color-fg-muted] leading-relaxed">
              {architecture.archetypes.behavioralSignature.expresses}
            </p>
          </div>
        </div>
      </Row>

      {/* Offerings with photos */}
      <div className="border-t border-[--color-border]">
        <div className="container-wide py-16 md:py-24">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 mb-14">
            <p className="type-mono text-[--color-fg-muted]">Ofertas</p>
            <h2 className="max-w-[18ch]">Quatro frentes comerciais.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-[1px] bg-[--color-border]">
            {offerings.map((o, i) => {
              const photoName = offeringPhotos[o.id];
              return (
                <article
                  key={o.id}
                  className="bg-[--color-bg-alt] overflow-hidden flex flex-col"
                >
                  {photoName && (
                    <div className="relative aspect-[16/9] overflow-hidden bg-[--color-bg-alt]">
                      <Image
                        src={`/clients/${slug}/photos/${photoName}`}
                        alt={o.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8 md:p-10 flex-1 flex flex-col">
                    <p className="type-mono text-[--color-fg-muted] mb-4">
                      {String(i + 1).padStart(2, "0")} · {o.dominantPillar}
                    </p>
                    <h3 className="text-3xl md:text-4xl mb-3">{o.name}</h3>
                    <p className="italic text-[--color-fg-muted] mb-4">
                      {o.supportLine}
                    </p>
                    <p className="text-sm text-[--color-fg-muted] mt-auto">
                      Momento do cliente: {o.moment}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <Row label="Ativos de autoridade">
        <div>
          <ul className="divide-y divide-[--color-border] border-y border-[--color-border]">
            {authorityAssets.map((asset, i) => (
              <li key={asset} className="py-4 flex gap-6">
                <span className="type-mono text-[--color-fg-faint] shrink-0 w-8 pt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-base leading-relaxed">{asset}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-[--color-fg-muted] italic">
            Máximo 3 credenciais por peça. Selecionar por proximidade contextual.
          </p>
        </div>
      </Row>
    </div>
  );
}
