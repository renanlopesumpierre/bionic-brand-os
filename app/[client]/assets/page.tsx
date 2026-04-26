import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { getClient } from "@/lib/content";
import { Row, SectionHeader } from "../_components/section-header";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c ? { title: `${c.manifest.name} · Ativos` } : {};
}

// Extrai a primeira família de uma stack CSS — "Spectral, 'Times', serif" → "Spectral".
function primaryFamily(stack: string | undefined): string {
  if (!stack) return "";
  return (stack.split(",")[0] ?? "").replace(/['"]/g, "").trim();
}

type DownloadCard = {
  label: string;
  description: string;
  contents: string[];
  href?: string;
  filename?: string;
  size?: string;
  soon?: boolean;
};

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

  const downloads: DownloadCard[] = [
    {
      label: "Logotipos",
      description: "Logo positivo, negativo, ícone e símbolo animado.",
      contents: [
        "SVG vetorial",
        "PNG @4x",
        "GIF animado",
        "Manual de uso (PDF)",
      ],
      href: `/clients/${slug}/downloads/${slug}-brand-assets.zip`,
      filename: `${slug}-brand-assets.zip`,
      size: "1.4 MB",
    },
    {
      label: "Cores",
      description:
        "Paleta canônica em 16 formatos. Folha A4 pra gráfica + auditoria WCAG.",
      contents: [
        "CSS, SCSS, Tailwind v3 e v4",
        "Adobe ASE, Figma tokens",
        "iOS Swift, Android Compose",
        "CMYK, Pantone, LAB pra impressão",
        "14 manuais PDF (uso por audiência)",
      ],
      href: `/clients/${slug}/downloads/${slug}-brand-colors.zip`,
      filename: `${slug}-brand-colors.zip`,
      size: "2.3 MB",
    },
    {
      label: "Tipografia",
      description: fontFamilies
        ? `${fontFamilies} em TTF (instala no SO) e WOFF2 (web).`
        : "Fontes oficiais em TTF e WOFF2.",
      contents: [
        "Guia de instalação Mac, Windows, Web",
        "Pesos canônicos por família",
        "Licença OFL incluída",
        "Manual PDF",
      ],
      href: `/clients/${slug}/downloads/${slug}-brand-fonts.zip`,
      filename: `${slug}-brand-fonts.zip`,
      size: "1.3 MB",
    },
    {
      label: "Brand System",
      description:
        "Sistema completo da marca em 20 seções — estratégia, visual, verbal, governança.",
      contents: [
        "JSON estruturado (canônico)",
        "Markdown narrativo",
        "Manual PDF",
      ],
      href: `/clients/${slug}/downloads/${slug}-brand-system.zip`,
      filename: `${slug}-brand-system.zip`,
      size: "178 KB",
    },
    {
      label: "Design System",
      description:
        "Cores, tipografia, spacing como tokens W3C-friendly pra implementação técnica.",
      contents: [
        "JSON estruturado",
        "DESIGN.md (formato Google)",
        "design-system narrativo",
        "Manual PDF",
      ],
      href: `/clients/${slug}/downloads/${slug}-design-tokens.zip`,
      filename: `${slug}-design-tokens.zip`,
      size: "218 KB",
    },
    {
      label: "Brand Prompts",
      description:
        "Dois prompts prontos pra Claude, GPT, Cursor, Figma AI — escolha o certo.",
      contents: [
        "Prompt destilado (leve, ~5KB)",
        "Brand Agent Master (operacional, ~30KB)",
        "Manual PDF (qual usar quando)",
      ],
      href: `/clients/${slug}/downloads/${slug}-brand-prompts.zip`,
      filename: `${slug}-brand-prompts.zip`,
      size: "224 KB",
    },
    {
      label: "Templates",
      description: "Deck institucional, proposta comercial, post de social.",
      contents: ["Em desenvolvimento"],
      soon: true,
    },
  ];

  // Núcleo da marca — os 4 artefatos canônicos do BBO em formato cru
  // (JSON / Markdown / DESIGN.md). Mesmos dados dos ZIPs acima, sem
  // embalagem. Pra colar em IA, vibe coding, automação.
  const nucleo: Array<{
    label: string;
    description: string;
    href: string;
    filename: string;
    format: string;
    size: string;
  }> = [
    {
      label: "Brand System",
      description:
        "Sistema da marca em 20 seções: estratégia, visual, verbal, governança.",
      href: `/api/${slug}/brand-system`,
      filename: `${slug}-brand-system.json`,
      format: "JSON",
      size: "~50 KB",
    },
    {
      label: "Design System",
      description:
        "Cores, tipografia, spacing — formato DESIGN.md (padrão Google).",
      href: `/api/${slug}/design.md`,
      filename: `${slug}-design.md`,
      format: "DESIGN.md",
      size: "~10 KB",
    },
    {
      label: "Brand Prompt",
      description:
        "Pílula leve. Cole antes de uma pergunta pontual em qualquer IA.",
      href: `/api/${slug}/prompt`,
      filename: `${slug}-brand-prompt.md`,
      format: "Markdown",
      size: "~5 KB",
    },
    {
      label: "Brand Agent Master",
      description:
        "System prompt completo. Pra Custom GPT, Claude Project, Cursor rules.",
      href: `/api/${slug}/prompt-master`,
      filename: `${slug}-brand-agent-master.md`,
      format: "Markdown",
      size: "~30 KB",
    },
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="Ativos"
        step="III · 09"
        title="Tudo da marca, pronto pra baixar."
        description={`${downloads.filter((d) => !d.soon).length} pacotes oficiais. Cada um vem com manual PDF de uso, formatos prontos pra design (Adobe, Figma) e arquivos pra colar em IAs (Claude, GPT, Cursor).`}
        tone="deep"
      />

      <Row label="Pacotes completos">
        <div className="grid md:grid-cols-2 gap-4">
          {downloads.map((item) =>
            item.soon ? (
              <SoonCard key={item.label} item={item} />
            ) : (
              <DownloadBentoCard key={item.label} item={item} />
            ),
          )}
        </div>
      </Row>

      <Row label="Núcleo da marca">
        <p className="text-base text-[--color-fg-muted] leading-relaxed mb-10 max-w-2xl">
          Os 4 artefatos canônicos da marca em formato cru. Mesmos dados
          dos pacotes acima, sem embalagem nem manual — pra colar direto
          em IA, vibe coding, automação.
        </p>
        <ul className="border-y border-[--color-border] divide-y divide-[--color-border]">
          {nucleo.map((item) => (
            <li
              key={item.href}
              className="grid grid-cols-[1fr_auto] items-center gap-6 py-5"
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h3 className="text-lg tracking-tight">{item.label}</h3>
                  <span className="type-mono text-[--color-fg-faint]">
                    {item.format} · {item.size}
                  </span>
                </div>
                <p className="text-sm text-[--color-fg-muted] mt-1 leading-snug">
                  {item.description}
                </p>
              </div>
              <a
                href={item.href}
                download={item.filename}
                className="btn-pill btn-pill-primary !text-xs !py-2.5 !px-4 shrink-0 group"
              >
                <Download className="w-3.5 h-3.5 group-hover:translate-y-[1px] transition-transform" />
                Baixar {item.format === "JSON" ? "JSON" : item.format === "DESIGN.md" ? "DESIGN.md" : "MD"}
              </a>
            </li>
          ))}
        </ul>
      </Row>
    </div>
  );
}

// ============================================================
// CARDS
// ============================================================

function DownloadBentoCard({ item }: { item: DownloadCard }) {
  return (
    <a
      href={item.href}
      download={item.filename}
      className="bg-[--color-bg-elevated] border border-[--color-border] p-8 md:p-10 flex flex-col gap-5 group hover:border-[--color-border-strong] hover:bg-[--color-bg-alt] transition-colors min-h-[280px]"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-2xl tracking-tight">{item.label}</h3>
        <span className="type-mono text-[--color-fg-muted] flex items-center gap-2 shrink-0">
          ZIP
          <Download className="w-4 h-4 group-hover:translate-y-[1px] transition-transform" />
        </span>
      </div>

      <p className="text-base text-[--color-fg-muted] leading-snug">
        {item.description}
      </p>

      <ul className="space-y-1.5 text-sm text-[--color-fg-muted] mt-auto">
        {item.contents.map((c) => (
          <li
            key={c}
            className="grid grid-cols-[10px_1fr] items-baseline gap-3"
          >
            <span aria-hidden className="text-[--color-fg-faint]">
              ·
            </span>
            <span>{c}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-baseline justify-between pt-4 border-t border-[--color-border]">
        <p className="type-mono text-[--color-fg-faint] truncate">
          {item.filename}
        </p>
        {item.size && (
          <span className="type-mono text-[--color-fg-muted] shrink-0 ml-3">
            {item.size}
          </span>
        )}
      </div>
    </a>
  );
}

function SoonCard({ item }: { item: DownloadCard }) {
  return (
    <div className="bg-[--color-bg-elevated] border border-[--color-border] border-dashed p-8 md:p-10 flex flex-col gap-5 opacity-60 min-h-[280px]">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-2xl tracking-tight">{item.label}</h3>
        <span className="type-mono text-[--color-fg-muted]">em breve</span>
      </div>
      <p className="text-base text-[--color-fg-muted] leading-snug">
        {item.description}
      </p>
    </div>
  );
}
