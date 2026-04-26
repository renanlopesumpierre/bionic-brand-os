import Image from "next/image";
import { notFound } from "next/navigation";

import { getClient } from "@/lib/content";
import { Row, SectionHeader } from "../_components/section-header";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c
    ? { title: `${c.manifest.name} · ${c.brandSystem.method.name}` }
    : {};
}

const pillarPhotos: Record<string, { src: string; label: string }> = {
  business: {
    src: "consulting-meeting.jpg",
    label: "Ambiente executivo de decisão",
  },
  consciousness: {
    src: "introspection.jpg",
    label: "Leitura interna antes da decisão",
  },
  wellness: {
    src: "wellness-remote.jpg",
    label: "Tempo e contexto para sustentar",
  },
};

export default async function MethodPage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const { brandSystem } = client;
  const { method } = brandSystem;

  return (
    <div>
      <SectionHeader
        eyebrow="Modelo proprietário"
        step="I · 02"
        title={`${method.name}.`}
        description="Três dimensões que operam como sistema único. Cada oferta, cada peça, cada decisão é rastreável a pelo menos uma delas."
        tone="deep"
      />

      {/* Pillars grid with photos — canvas */}
      <div className="border-b border-[--color-border]">
        <div className="container-wide py-16 md:py-20">
        <div className="grid md:grid-cols-3 gap-[1px] bg-[--color-border]">
          {Object.entries(method.pillars).map(([key, pillar], i) => {
            const photo = pillarPhotos[key];
            return (
              <article
                key={key}
                className="bg-[--color-bg-alt] flex flex-col overflow-hidden"
              >
                {photo && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-[--color-bg-alt]">
                    <Image
                      src={`/clients/${slug}/photos/${photo.src}`}
                      alt={photo.label}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-8 md:p-10 flex flex-col flex-1">
                  <p className="type-mono text-[--color-fg-muted] mb-6">
                    {String(i + 1).padStart(2, "0")} · {pillar.nature}
                  </p>
                  <h2 className="text-4xl md:text-5xl mb-6">{pillar.label}</h2>
                  <p className="italic text-[--color-fg-muted] text-lg mb-6">
                    &ldquo;{pillar.frase}&rdquo;
                  </p>
                  <p className="type-mono text-[--color-fg-muted] mb-2">
                    Pergunta
                  </p>
                  <p className="text-lg mb-6">{pillar.question}</p>
                  <p className="type-mono text-[--color-fg-muted] mb-2">
                    Papel
                  </p>
                  <p className="text-sm leading-relaxed text-[--color-fg-muted]">
                    {pillar.role}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
        </div>
      </div>

      <Row label="Fórmula">
        <p className="text-2xl md:text-4xl leading-snug italic max-w-5xl">
          {method.formula}
        </p>
      </Row>

      {/* Intelligence Triangle */}
      {brandSystem.core.intelligenceTriangle && (
        <div className="border-t border-[--color-border]">
          <div className="container-wide py-20 md:py-24">
            <div className="grid md:grid-cols-[180px_1fr] gap-8 mb-14">
              <p className="type-mono text-[--color-fg-muted]">
                Camada secundária
              </p>
              <div>
                <h2 className="mb-6">Intelligence Triangle.</h2>
                <p className="text-lg text-[--color-fg-muted] max-w-2xl leading-relaxed">
                  {brandSystem.core.intelligenceTriangle.description}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {Object.entries(
                brandSystem.core.intelligenceTriangle.mapping,
              ).map(([pillar, data]) => (
                <div
                  key={pillar}
                  className="border-t-2 border-[--color-fg] pt-6"
                >
                  <p className="type-mono mb-3 capitalize">{pillar}</p>
                  <p className="text-sm text-[--color-fg-muted] mb-2">
                    {data.nature}
                  </p>
                  <h3 className="text-2xl tracking-tight mb-3">
                    {data.intelligenceEN}
                  </h3>
                  <p className="text-sm italic text-[--color-fg-muted] mb-5">
                    {data.intelligencePT}
                  </p>
                  <p className="text-sm leading-relaxed">{data.role}</p>
                </div>
              ))}
            </div>

            <p className="mt-14 text-base italic text-[--color-fg-muted] max-w-3xl">
              {brandSystem.core.intelligenceTriangle.thesis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
