import Image from "next/image";
import { notFound } from "next/navigation";

import { getClient } from "@/lib/content";
import { Row, SectionHeader } from "../_components/section-header";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c ? { title: `${c.manifest.name} · Público` } : {};
}

export default async function AudiencePage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const { audience } = client.brandSystem;
  const messaging = audience.canonicalMessaging;

  return (
    <div>
      <SectionHeader
        eyebrow="Público"
        step="I · 04"
        title="Público."
        description="Persona primária, perfis secundários e tribos. Quem compra, quem se reconhece, como cada um deve ser abordado."
        tone="deep"
      />

      {/* Atmospheric photo + primary persona */}
      <div className="container-wide py-16 md:py-20">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
          <div className="relative aspect-[4/5] overflow-hidden bg-[--color-bg-alt]">
            <Image
              src={`/clients/${slug}/photos/audience.jpg`}
              alt="Público premium"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="type-mono text-[--color-fg-muted] mb-4">
              Persona primária
            </p>
            <h2 className="mb-4">{audience.primaryPersona.name}</h2>
            <p className="type-mono text-[--color-fg-muted] italic mb-8">
              {audience.primaryPersona.nameEN}
            </p>
            <ul className="space-y-3">
              {audience.primaryPersona.traits.map((t) => (
                <li
                  key={t}
                  className="text-base leading-relaxed pb-3 border-b border-[--color-border] last:border-0"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Row label="Perfis secundários">
        <div className="grid md:grid-cols-2 gap-[1px] bg-[--color-border]">
          {audience.secondaryProfiles.map((p) => (
            <article key={p.id} className="bg-[--color-bg-alt] p-8">
              <h3 className="text-2xl mb-3">{p.name}</h3>
              <p className="text-sm text-[--color-fg-muted] italic mb-5">
                {p.angle}
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {p.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="type-mono text-[--color-fg-muted] border border-[--color-border] px-2.5 py-1 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
              <p className="type-mono text-[--color-accent]">
                {p.pillarBridge}
              </p>
            </article>
          ))}
        </div>
      </Row>

      <Row label="Tribos">
        <ul className="space-y-0">
          {audience.tribes.map((tribe, i) => (
            <li
              key={tribe}
              className="flex items-baseline gap-6 py-4 border-b border-[--color-border] last:border-0"
            >
              <span className="type-mono text-[--color-fg-faint] shrink-0 w-8">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-xl tracking-tight">{tribe}</p>
            </li>
          ))}
        </ul>
      </Row>

      {messaging && (
        <Row label="Mensagens canônicas">
          <div className="space-y-12">
            {Object.entries(messaging)
              .filter(([k]) => !k.startsWith("_"))
              .map(([key, m]) => {
                const msg = m as {
                  audience: string;
                  headline: string;
                  body: string;
                };
                return (
                  <article
                    key={key}
                    className="border-t border-[--color-border] pt-6"
                  >
                    <p className="type-mono text-[--color-fg-muted] mb-3">
                      {msg.audience}
                    </p>
                    <p className="text-2xl md:text-3xl tracking-tight leading-tight mb-4">
                      {msg.headline}
                    </p>
                    <p className="text-base leading-relaxed text-[--color-fg-muted] whitespace-pre-line max-w-3xl">
                      {msg.body}
                    </p>
                  </article>
                );
              })}
          </div>
        </Row>
      )}
    </div>
  );
}
