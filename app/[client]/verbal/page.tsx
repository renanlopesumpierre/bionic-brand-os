import Image from "next/image";
import { notFound } from "next/navigation";

import { getClient } from "@/lib/content";
import { Row, SectionHeader } from "../_components/section-header";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c ? { title: `${c.manifest.name} · Verbal` } : {};
}

export default async function VerbalPage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const { verbal } = client.brandSystem;

  return (
    <div>
      <SectionHeader
        eyebrow="Sistema verbal"
        step="II · 05"
        title="Verbal."
        description="Tom de voz, léxico, frases sagradas, manifesto e gabaritos. Como a marca escreve em qualquer contexto."
        tone="deep"
      />

      <Row label="Vetores de tom">
        <ul className="divide-y divide-[--color-border] border-y border-[--color-border]">
          {verbal.toneVectors.map((v, i) => (
            <li
              key={v.name}
              className="py-5 grid md:grid-cols-[60px_220px_1fr] gap-3 md:gap-8 items-baseline"
            >
              <span className="type-mono text-[--color-fg-faint]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-xl tracking-tight">{v.name}</p>
              <p className="text-[--color-fg-muted]">{v.test}</p>
            </li>
          ))}
        </ul>
      </Row>

      <Row label="Frases sagradas">
        <div>
          <p className="text-sm text-[--color-fg-muted] italic mb-6">
            Invariantes. Aparecem literais em todos os canais.
          </p>
          <ol className="space-y-7">
            {verbal.sacredPhrases.map((p) => (
              <li key={p.id} className="flex gap-6">
                <span className="type-mono tabular-nums text-[--color-fg-faint] shrink-0 w-8 pt-2">
                  {String(p.id).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-2xl md:text-3xl tracking-tight leading-snug">
                    {p.phrase}
                  </p>
                  {p.pt && (
                    <p className="mt-2 text-lg italic text-[--color-fg-muted]">
                      {p.pt}
                    </p>
                  )}
                  <p className="mt-2 type-mono text-[--color-fg-muted]">
                    {p.role} · {p.usage}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Row>

      {verbal.impactPhrases && (
        <Row label="Pool expandido">
          <div className="space-y-12">
            <div>
              <p className="type-mono text-[--color-fg-muted] mb-5">Primárias</p>
              <ul className="space-y-4">
                {verbal.impactPhrases.primary.map((p, i) => (
                  <li
                    key={i}
                    className="border-b border-[--color-border] pb-4"
                  >
                    <p className="text-xl tracking-tight">{p.pt}</p>
                    <p className="text-sm italic text-[--color-fg-muted] mt-1">
                      {p.en}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="type-mono text-[--color-fg-muted] mb-5">
                Secundárias
              </p>
              <ul className="space-y-2">
                {verbal.impactPhrases.secondary.map((p, i) => (
                  <li
                    key={i}
                    className="text-[--color-fg-muted] leading-relaxed"
                  >
                    — {p.pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Row>
      )}

      <Row label="Assinaturas">
        <div className="space-y-8">
          <div>
            <p className="type-mono text-[--color-fg-muted] mb-2">Curta</p>
            <p className="text-xl">{verbal.signatures.shortEN}</p>
            <p className="text-lg italic text-[--color-fg-muted]">
              {verbal.signatures.shortPT}
            </p>
          </div>
          <div>
            <p className="type-mono text-[--color-fg-muted] mb-2">Completa</p>
            <p className="text-xl leading-snug">
              {verbal.signatures.fullEN}
            </p>
            <p className="text-lg italic text-[--color-fg-muted] leading-snug">
              {verbal.signatures.fullPT}
            </p>
          </div>
        </div>
      </Row>

      <Row label="Léxico proibido">
        <div>
          <p className="type-mono text-[--color-fg-muted] mb-4">Primário</p>
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {verbal.forbiddenLexicon.primary.map((w) => (
              <span
                key={w}
                className="text-sm text-[--color-fg-muted] line-through decoration-[--color-accent]"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </Row>

      {/* Manifesto section with full-bleed photo */}
      {verbal.manifesto && (
        <section className="surface-deep border-t border-[--color-border]">
          <div className="container-wide py-20 md:py-28">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 mb-16 items-end">
              <div>
                <p className="type-mono opacity-60 mb-5">Manifesto</p>
                <h2 className="max-w-[14ch]">
                  {verbal.manifesto.title}
                </h2>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={`/clients/${slug}/photos/manifesto.jpg`}
                  alt="Manifesto"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="max-w-[72ch] mx-auto space-y-6 text-lg md:text-xl leading-relaxed opacity-85 whitespace-pre-line">
              {verbal.manifesto.body}
            </div>

            <div className="mt-16 pt-10 border-t border-[--color-border-on-dark] max-w-[72ch] mx-auto">
              <p className="text-2xl md:text-3xl tracking-tight">
                {verbal.manifesto.closing.en}
              </p>
              <p className="mt-3 text-xl md:text-2xl italic opacity-60">
                {verbal.manifesto.closing.pt}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
