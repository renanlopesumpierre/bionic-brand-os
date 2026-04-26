import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { getClient } from "@/lib/content";
import { Row, SectionHeader } from "../_components/section-header";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c ? { title: `${c.manifest.name} · Ativos e API` } : {};
}

// Extrai a primeira família de uma stack CSS — "Spectral, 'Times', serif" → "Spectral".
function primaryFamily(stack: string | undefined): string {
  if (!stack) return "";
  return (stack.split(",")[0] ?? "").replace(/['"]/g, "").trim();
}

export default async function AssetsPage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();

  const fontFamilies = [
    primaryFamily(client.tokens.font?.family?.serif?.value),
    primaryFamily(client.tokens.font?.family?.sans?.value),
  ]
    .filter(Boolean)
    .join(" + ");

  const apis = [
    {
      path: `/api/${slug}/brand-system`,
      filename: `${slug}-brand-system.json`,
      label: "Brand System",
      description: "Sistema estruturado completo",
      format: "JSON",
    },
    {
      path: `/api/${slug}/tokens`,
      filename: `${slug}-design-tokens.json`,
      label: "Design Tokens",
      description: "Cores, tipografia, espaçamento",
      format: "JSON",
    },
    {
      path: `/api/${slug}/prompt`,
      filename: `${slug}-brand-prompt.md`,
      label: "Brand Prompt",
      description: "Prompt destilado para IAs",
      format: "Markdown",
    },
    {
      path: `/api/${slug}/prompt?flavor=master`,
      filename: `${slug}-brand-agent-master.md`,
      label: "Brand Agent Master",
      description: "System prompt operacional do agente",
      format: "Markdown",
    },
  ];

  const downloads: Array<{
    label: string;
    href?: string;
    filename?: string;
    format?: string;
    soon?: boolean;
  }> = [
    {
      label: "Logotipos (SVG, PNG e símbolo animado)",
      href: `/clients/${slug}/downloads/${slug}-brand-assets.zip`,
      filename: `${slug}-brand-assets.zip`,
      format: "ZIP",
    },
    {
      label: "Paleta completa (HEX, RGB, CMYK, WEB, PRINT)",
      href: `/clients/${slug}/downloads/${slug}-brand-colors.zip`,
      filename: `${slug}-brand-colors.zip`,
      format: "ZIP",
    },
    {
      label: fontFamilies ? `Tipografia (${fontFamilies})` : "Tipografia",
      href: `/clients/${slug}/downloads/${slug}-brand-fonts.zip`,
      filename: `${slug}-brand-fonts.zip`,
      format: "ZIP",
    },
    {
      label: "Templates (deck, proposta, social)",
      soon: true,
    },
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="Ativos e API"
        step="III · 09"
        title="Ativos e API."
        description="Onde humanos baixam arquivos e máquinas consultam a marca. Fonte única de verdade em formato consumível."
        tone="deep"
      />

      <Row label="Brand API">
        <div>
          <ul className="divide-y divide-[--color-border] border-y border-[--color-border]">
            {apis.map((api) => (
              <li key={api.path}>
                <a
                  href={api.path}
                  download={api.filename}
                  className="grid grid-cols-[1fr_auto_auto] items-baseline gap-6 py-5 group hover:bg-[--color-bg-alt] transition-colors -mx-5 md:-mx-8 px-5 md:px-8"
                >
                  <div>
                    <p className="text-xl tracking-tight">{api.label}</p>
                    <p className="mt-1 text-sm text-[--color-fg-muted]">
                      {api.description}
                    </p>
                    <p className="mt-2 type-mono text-[--color-fg-faint]">
                      {api.filename}
                    </p>
                  </div>
                  <span className="type-mono text-[--color-fg-muted]">
                    {api.format}
                  </span>
                  <Download className="w-5 h-5 text-[--color-fg-muted] group-hover:text-[--color-fg] transition-colors" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-[--color-fg-muted] italic">
            Endpoints públicos, com rate limit. Alimente pipelines, agentes,
            ferramentas internas, validadores de peça.
          </p>
        </div>
      </Row>

      <Row label="Downloads">
        <div className="grid md:grid-cols-2 gap-4">
          {downloads.map((item) =>
            item.soon ? (
              <div
                key={item.label}
                className="border border-[--color-border] p-5 flex items-center justify-between opacity-60"
              >
                <p>{item.label}</p>
                <span className="type-mono text-[--color-fg-muted]">
                  em breve
                </span>
              </div>
            ) : (
              <a
                key={item.label}
                href={item.href}
                download={item.filename}
                className="border border-[--color-border] p-5 flex items-center justify-between gap-4 group hover:bg-[--color-bg-alt] transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate">{item.label}</p>
                  <p className="mt-1 type-mono text-[--color-fg-faint] truncate">
                    {item.filename}
                  </p>
                </div>
                <span className="type-mono text-[--color-fg-muted] flex items-center gap-2 shrink-0">
                  {item.format}
                  <Download className="w-4 h-4" />
                </span>
              </a>
            ),
          )}
        </div>
      </Row>
    </div>
  );
}
