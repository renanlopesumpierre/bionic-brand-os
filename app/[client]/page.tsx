import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { getClient } from "@/lib/content";
import { Eyebrow } from "@/components/tag";

type Props = {
  params: Promise<{ client: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) return {};
  return {
    title: `${client.manifest.name} · Visão geral`,
    description: client.manifest.essence.pt,
  };
}

export default async function ClientOverview({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();

  const { manifest, brandSystem } = client;

  const quickLinks: Array<{
    label: string;
    href: string;
    caption: string;
    index: string;
    group: string;
  }> = [
    {
      index: "01",
      label: "Essência",
      href: `/${slug}/essence`,
      caption: "Propósito, tese, valores, crenças",
      group: "Sistema",
    },
    {
      index: "02",
      label: brandSystem.method.name,
      href: `/${slug}/method`,
      caption: Object.values(brandSystem.method.pillars)
        .map((p) => (p as { label: string }).label)
        .join(" · "),
      group: "Sistema",
    },
    {
      index: "05",
      label: "Sistema verbal",
      href: `/${slug}/verbal`,
      caption: "Tom, frases sagradas, manifesto",
      group: "Expressão",
    },
    {
      index: "06",
      label: "Design system",
      href: `/${slug}/visual`,
      caption: "Paleta, tipografia, tokens",
      group: "Expressão",
    },
    {
      index: "10",
      label: "Brand Agent",
      href: `/${slug}/agent`,
      caption: "Conversa direta com a marca",
      group: "Operação",
    },
  ];

  return (
    <div>
      {/* Hero — photo + essence on deep */}
      <section className="border-b border-[--color-border]">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-0">
          <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[600px]">
            <Image
              src={`/clients/${slug}/photos/hero2.jpg`}
              alt={manifest.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="surface-deep flex flex-col justify-between p-10 md:p-16 lg:p-20">
            <div>
              <p className="type-eyebrow type-bullet opacity-70">
                {manifest.category}
              </p>
              <h1 className="mt-10 max-w-[14ch]">
                {manifest.essence.pt}
              </h1>
            </div>

            <div className="mt-12">
              <p className="text-lg md:text-xl opacity-80 leading-relaxed max-w-lg">
                {manifest.positioning.pt}
              </p>
              <p className="mt-8 text-sm italic opacity-50">
                {manifest.positioning.en}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick access — canvas */}
      <section className="surface-canvas border-b border-[--color-border]">
        <div className="container-wide py-20 md:py-28">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 mb-14">
            <Eyebrow>Sistema</Eyebrow>
            <h2 className="max-w-[22ch]">
              O sistema operacional completo da marca.
            </h2>
          </div>

          <ul className="divide-y divide-[--color-border] border-y border-[--color-border]">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="grid grid-cols-[60px_1fr_140px_auto] md:grid-cols-[60px_140px_1fr_auto] items-baseline gap-4 md:gap-6 py-7 group hover:bg-[--color-bg-alt] transition-colors -mx-5 md:-mx-8 px-5 md:px-8"
                >
                  <span className="type-mono tabular-nums text-[--color-fg-muted]">
                    {link.index}
                  </span>
                  <p className="type-mono text-[--color-fg-muted] hidden md:block">
                    {link.group}
                  </p>
                  <div>
                    <h3 className="text-2xl md:text-3xl tracking-tight">
                      {link.label}
                    </h3>
                    <p className="mt-1 text-[--color-fg-muted] text-sm">
                      {link.caption}
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[--color-fg-muted] group-hover:text-[--color-fg] transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Method preview — canvas (elevated for cards) */}
      <section className="surface-canvas border-b border-[--color-border]">
        <div className="container-wide py-20 md:py-28">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 mb-14">
            <Eyebrow>Método proprietário</Eyebrow>
            <h2 className="max-w-[18ch]">
              {brandSystem.method.name}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-[1px] bg-[--color-border]">
            {Object.entries(brandSystem.method.pillars).map(
              ([key, pillar], i) => (
                <article
                  key={key}
                  className="surface-elevated p-8 md:p-10 min-h-[360px] flex flex-col"
                >
                  <p className="type-mono text-[--color-fg-muted] mb-8">
                    {String(i + 1).padStart(2, "0")} · {pillar.nature}
                  </p>
                  <h3 className="text-4xl md:text-5xl mb-6">{pillar.label}</h3>
                  <p className="italic text-[--color-fg-muted] text-lg mb-6">
                    &ldquo;{pillar.frase}&rdquo;
                  </p>
                  <p className="text-sm leading-relaxed text-[--color-fg-muted] mt-auto">
                    {pillar.role}
                  </p>
                </article>
              ),
            )}
          </div>

          <p className="mt-14 text-xl md:text-2xl italic max-w-3xl leading-snug">
            {brandSystem.method.formula}
          </p>
        </div>
      </section>

      {/* Signature — deep anchor */}
      <section className="surface-deep">
        <div className="container-wide py-24 md:py-32 text-center">
          <div
            className="mx-auto mb-12"
            style={{
              width: 40,
              height: 2,
              background: "var(--accent-on-dark)",
            }}
          />
          <p className="text-3xl md:text-5xl tracking-tight leading-tight max-w-4xl mx-auto">
            {brandSystem.core.signature.en}
          </p>
          <p className="mt-6 text-lg md:text-xl opacity-70 italic max-w-3xl mx-auto">
            {brandSystem.core.signature.pt}
          </p>
        </div>
      </section>
    </div>
  );
}
