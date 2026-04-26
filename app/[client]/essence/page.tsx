import Image from "next/image";
import { notFound } from "next/navigation";

import { getClient } from "@/lib/content";
import { Row, SectionHeader } from "../_components/section-header";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c ? { title: `${c.manifest.name} · Essência` } : {};
}

export default async function EssencePage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const { brandSystem } = client;

  return (
    <div>
      <SectionHeader
        eyebrow="Núcleo estratégico"
        step="I · 01"
        title="Essência."
        description="A camada mais permanente da marca. O que ela defende, o que promete e o que a sustenta antes de qualquer aplicação."
        tone="deep"
      />

      <Row label="Frase irredutível">
        <p className="text-3xl md:text-5xl tracking-tight leading-[1.05]">
          {brandSystem.core.essence.pt}
        </p>
        <p className="mt-4 text-xl italic text-[--color-fg-muted]">
          {brandSystem.core.essence.en}
        </p>
      </Row>

      <Row label="Tese central">
        <p className="text-lg md:text-xl leading-relaxed max-w-3xl">
          {brandSystem.core.thesis}
        </p>
      </Row>

      {/* Portrait photo between blocks */}
      <div className="container-wide py-8 md:py-12">
        <div className="grid md:grid-cols-[1fr_1fr] gap-8 md:gap-12 items-end">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={`/clients/${slug}/photos/essence.jpg`}
              alt={client.manifest.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="type-mono text-[--color-fg-muted] mb-3">
              Autoridade calma
            </p>
            <p className="italic text-lg md:text-xl leading-relaxed">
              &ldquo;Sua presença não é ruidosa. É precisa. Sua autoridade não
              depende de excesso. Depende de leitura, método e profundidade
              aplicada.&rdquo;
            </p>
          </div>
        </div>
      </div>

      <Row label="Propósito atemporal">
        <p className="text-lg md:text-xl leading-relaxed max-w-3xl">
          {brandSystem.core.purpose.timeless}
        </p>
      </Row>

      <Row label="Missão">
        <p className="text-lg leading-relaxed max-w-3xl">
          {brandSystem.core.mission}
        </p>
      </Row>

      <Row label="Visão">
        <p className="text-lg leading-relaxed max-w-3xl">
          {brandSystem.core.vision}
        </p>
      </Row>

      <Row label="Assinatura">
        <div>
          <p className="text-2xl md:text-3xl tracking-tight leading-snug">
            {brandSystem.core.signature.en}
          </p>
          <p className="mt-3 text-xl italic text-[--color-fg-muted]">
            {brandSystem.core.signature.pt}
          </p>
        </div>
      </Row>

      <Row label="Crenças operacionais">
        <ul className="space-y-0">
          {brandSystem.beliefs.map((belief, i) => (
            <li
              key={belief}
              className="flex gap-6 py-4 border-b border-[--color-border] last:border-0"
            >
              <span className="type-mono text-[--color-fg-faint] shrink-0 w-8 pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-lg leading-relaxed">{belief}</p>
            </li>
          ))}
        </ul>
      </Row>

      <Row label="Valores como critérios">
        <ul className="divide-y divide-[--color-border] border-y border-[--color-border]">
          {brandSystem.values.map((v) => (
            <li
              key={v.name}
              className="py-5 grid md:grid-cols-[200px_1fr] gap-3 md:gap-8"
            >
              <p className="text-xl tracking-tight">{v.name}</p>
              <p className="text-[--color-fg-muted] leading-relaxed">
                {v.criterion}
              </p>
            </li>
          ))}
        </ul>
      </Row>
    </div>
  );
}
