import Image from "next/image";
import { notFound } from "next/navigation";

import { getClient } from "@/lib/content";
import { Row, SectionHeader } from "../_components/section-header";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c ? { title: `${c.manifest.name} · Visual` } : {};
}

type ColorToken = {
  value: string;
  framerPath?: string;
  notes?: string;
  description?: string;
};

type WebColor = {
  name: string;
  value: string;
  notes: string;
  context: string;
};

type TypeSampleSpec = {
  key: string;
  framerName: string;
  family: "serif" | "sans";
  weight: number;
  size: string;
  letterSpacing: string;
  lineHeight: string;
  sample: string;
};

const SERIF = "var(--font-spectral), Georgia, serif";
const SANS = '"TASA Orbiter", ui-sans-serif, sans-serif';

// Type samples with real Betina copy at the canonical sizes.
const TYPE_SAMPLES: TypeSampleSpec[] = [
  {
    key: "heading1",
    framerName: "/Heading 1",
    family: "serif",
    weight: 300,
    size: "112px",
    letterSpacing: "-0.06em",
    lineHeight: "1.05",
    sample: "Crescimento exige clareza.",
  },
  {
    key: "display",
    framerName: "/Display",
    family: "serif",
    weight: 300,
    size: "78px",
    letterSpacing: "-0.05em",
    lineHeight: "1.1",
    sample: "The Growth Method.",
  },
  {
    key: "heading2",
    framerName: "/Heading 2",
    family: "serif",
    weight: 300,
    size: "68px",
    letterSpacing: "-0.06em",
    lineHeight: "1.1",
    sample: "Três pilares. Um sistema integrado.",
  },
  {
    key: "heading3",
    framerName: "/Heading 3",
    family: "serif",
    weight: 300,
    size: "56px",
    letterSpacing: "-0.04em",
    lineHeight: "1.05",
    sample: "Autoridade calma.",
  },
  {
    key: "heading4",
    framerName: "/Heading 4",
    family: "serif",
    weight: 300,
    size: "36px",
    letterSpacing: "-0.05em",
    lineHeight: "1.15",
    sample: "Profundidade aplicada, decisão precisa.",
  },
  {
    key: "bodyLarge",
    framerName: "/Body Large",
    family: "sans",
    weight: 400,
    size: "20px",
    letterSpacing: "-0.02em",
    lineHeight: "1.4",
    sample:
      "Sua presença não é ruidosa. É precisa. Sua autoridade não depende de excesso — depende de leitura, método e profundidade aplicada.",
  },
  {
    key: "body",
    framerName: "/Body",
    family: "sans",
    weight: 400,
    size: "18px",
    letterSpacing: "-0.02em",
    lineHeight: "1.45",
    sample:
      "Crescimento sustentável é o resultado de clareza estratégica, capacidade de execução e maturidade emocional operando como um sistema único.",
  },
  {
    key: "bodySmall",
    framerName: "/Body Small",
    family: "sans",
    weight: 400,
    size: "15px",
    letterSpacing: "-0.01em",
    lineHeight: "1.5",
    sample:
      "Texto secundário, legendas, apoio editorial e descrições inline.",
  },
  {
    key: "label",
    framerName: "/Label",
    family: "sans",
    weight: 500,
    size: "15px",
    letterSpacing: "0.02em",
    lineHeight: "1.2",
    sample: "STRATEGIC GROWTH ADVISORY",
  },
];

// Hex helpers ----------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.match(/^#([\da-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0));
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)] as const;
}

function readableOver(hex: string): "light" | "dark" {
  const rgb = hexToRgb(hex);
  if (!rgb) return "dark";
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.55 ? "light" : "dark";
}

// Tons da web atual — extracted directly from betinaweber.com (curl).
const WEB_PALETTE: WebColor[] = [
  {
    name: "Amarelo CTA",
    value: "#CA8A04",
    notes:
      "Acento original do rascunho pessoal. Usado em CTAs primários e destaques editoriais (\"Method\" no hero).",
    context: "Botão principal, eyebrows, links em destaque",
  },
  {
    name: "Amarelo highlight",
    value: "#F0C040",
    notes:
      "Variante mais clara, função decorativa pontual em hovers e ornamentos.",
    context: "Hover states, ornamentos editoriais",
  },
  {
    name: "Warm grey",
    value: "#A8998C",
    notes:
      "Cinza pedra warm derivado do canvas. Usado como texto suave e divisores em fundo cream.",
    context: "Texto secundário sobre cream, dividers",
  },
  {
    name: "Cream over dark",
    value: "#F5F0EA",
    notes: "Texto e detalhes sobre Dark — substitui white puro.",
    context: "Footer, áreas inversas",
  },
];

export default async function VisualPage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const { tokens } = client;

  const surfaces = tokens.color.surface as Record<string, ColorToken>;
  const accent = tokens.color.accent as Record<string, ColorToken>;

  const brandPath = `/clients/${slug}/brand`;

  return (
    <div>
      <SectionHeader
        eyebrow="Sistema visual"
        step="II · 06"
        title="Visual."
        description="Logotipo, ícone, paleta, tipografia e aplicação. Onde a estratégia se torna percepção."
        tone="deep"
      />

      {/* ============== LOGOTIPO ============== */}
      <Row label="Logotipo">
        <div className="grid md:grid-cols-2 gap-[1px] bg-[--color-border]">
          <div className="bg-[--color-bg-elevated] aspect-[16/9] flex items-center justify-center p-10">
            <Image
              src={`${brandPath}/logo-black.svg`}
              alt={`${client.manifest.name} — logo positivo`}
              width={3908}
              height={354}
              className="w-full max-w-md h-auto"
            />
          </div>
          <div className="bg-[#1c1917] aspect-[16/9] flex items-center justify-center p-10">
            <Image
              src={`${brandPath}/logo-white.svg`}
              alt={`${client.manifest.name} — logo negativo`}
              width={3908}
              height={354}
              className="w-full max-w-md h-auto"
            />
          </div>
        </div>
        <p className="mt-6 text-sm text-[--color-fg-muted] max-w-3xl">
          Versão positiva sobre fundos claros, negativa sobre fundos escuros.
          Manter o espaço de proteção ao redor do wordmark equivalente à altura
          da letra-base.
        </p>
      </Row>

      {/* ============== ÍCONE ============== */}
      <Row label="Ícone">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[--color-border]">
          <div className="bg-[--color-bg-elevated] aspect-square flex items-center justify-center p-8">
            <Image
              src={`${brandPath}/icon-black.svg`}
              alt="Ícone positivo"
              width={1800}
              height={1538}
              className="w-1/2 h-auto"
            />
          </div>
          <div className="bg-[#1c1917] aspect-square flex items-center justify-center p-8">
            <Image
              src={`${brandPath}/icon-white.svg`}
              alt="Ícone negativo"
              width={1800}
              height={1538}
              className="w-1/2 h-auto"
            />
          </div>
          <div
            className="aspect-square flex items-center justify-center p-8"
            style={{ background: "#E5E4DE" }}
          >
            <Image
              src={`${brandPath}/icon-black.svg`}
              alt="Ícone sobre canvas"
              width={1800}
              height={1538}
              className="w-1/2 h-auto"
            />
          </div>
          <div
            className="aspect-square flex items-center justify-center p-8"
            style={{ background: "#A6783E" }}
          >
            <Image
              src={`${brandPath}/icon-white.svg`}
              alt="Ícone sobre accent"
              width={1800}
              height={1538}
              className="w-1/2 h-auto"
            />
          </div>
        </div>
        <p className="mt-6 text-sm text-[--color-fg-muted] max-w-3xl">
          Forma reduzida da assinatura. Usar em favicon, app icons, avatar e
          peças onde o wordmark completo perde legibilidade.
        </p>
      </Row>

      {/* ============== SÍMBOLO ANIMADO ============== */}
      <Row label="Símbolo animado">
        <div className="bg-[#1c1917] flex items-center justify-center py-20 px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${brandPath}/symbol-animated.gif`}
            alt={`${client.manifest.name} — símbolo animado`}
            className="w-64 h-auto"
          />
        </div>
        <p className="mt-6 text-sm text-[--color-fg-muted] max-w-3xl">
          O símbolo em movimento representa os três pilares do método em
          rotação contínua — não como ciclo fechado, mas como sistema vivo.
          A impermanência é o mecanismo, não o problema: é do movimento
          ininterrupto entre Clareza, Execução e Maturidade que emerge o
          equilíbrio. A animação não tem início nem fim porque o crescimento
          sustentável tampouco tem.
        </p>
      </Row>

      {/* ============== PALETA CANÔNICA ============== */}
      <Row label="Paleta canônica">
        <div className="space-y-12">
          {/* Surfaces */}
          <div>
            <p className="type-mono text-[--color-fg-muted] mb-5">Superfícies</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[--color-border]">
              {Object.entries(surfaces).map(([name, token]) => (
                <ColorCard
                  key={name}
                  name={name}
                  value={token.value}
                  notes={token.notes ?? token.description}
                  framerPath={token.framerPath}
                />
              ))}
            </div>
          </div>

          {/* Accent canônico */}
          <div>
            <p className="type-mono text-[--color-fg-muted] mb-5">
              Accent (bronze calibrado · v1.1)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[--color-border]">
              {Object.entries(accent).map(([name, token]) => (
                <ColorCard
                  key={name}
                  name={name}
                  value={token.value}
                  notes={token.notes}
                  framerPath={token.framerPath}
                />
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-[--color-fg-muted] max-w-3xl">
              Bronze maduro a ~60% saturação. Funciona como assinatura
              editorial — nunca em CTA primário, heading ou body. Máximo 2
              aparições por viewport.
            </p>
          </div>
        </div>
      </Row>

      {/* ============== TONS DA WEB ATUAL ============== */}
      <Row label="Tons da web atual">
        <p className="text-sm text-[--color-fg-muted] max-w-3xl mb-8">
          Cores ainda em uso no betinaweber.com hoje. O accent canônico (bronze
          v1.1) ainda não foi aplicado na produção — o site usa o amarelo
          mostarda saturado original. Usar essas cores apenas até a migração
          ser concluída.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[--color-border]">
          {WEB_PALETTE.map((c) => (
            <ColorCard
              key={c.name}
              name={c.name}
              value={c.value}
              notes={c.notes}
              context={c.context}
            />
          ))}
        </div>
      </Row>

      {/* ============== TIPOGRAFIA ============== */}
      <Row label="Famílias">
        <div className="space-y-10">
          <div className="bg-[--color-bg-alt] p-10 md:p-14">
            <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
              <p className="type-mono text-[--color-fg-muted]">
                Display · serif
              </p>
              <p className="type-mono text-[--color-fg-muted]">
                {tokens.font.family.serif.value}
              </p>
            </div>
            <p
              className="text-7xl md:text-9xl leading-[0.95]"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                letterSpacing: "-0.06em",
              }}
            >
              Spectral
            </p>
            <p className="mt-6 text-sm text-[--color-fg-muted] max-w-2xl">
              Pesos canônicos: 200 (Extra Light) · 300 (Light). Toda hierarquia
              de heading. Letter-spacing negativo agressivo em tamanhos ≥ 36px.
            </p>
          </div>

          <div className="bg-[--color-bg-alt] p-10 md:p-14">
            <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
              <p className="type-mono text-[--color-fg-muted]">Body · sans</p>
              <p className="type-mono text-[--color-fg-muted]">
                {tokens.font.family.sans.value}
              </p>
            </div>
            <p
              className="text-5xl md:text-7xl tracking-tight leading-tight"
              style={{ fontFamily: SANS, fontWeight: 400 }}
            >
              TASA Orbiter
            </p>
            <p className="mt-6 text-sm text-[--color-fg-muted] max-w-2xl">
              Pesos canônicos: 400 (Regular) · 500 (Medium). Body, UI, navegação,
              labels. Humanismo executivo sem competir com a serif.
            </p>
          </div>
        </div>
      </Row>

      {/* ============== ESCALA TIPOGRÁFICA (samples reais) ============== */}
      <Row label="Escala aplicada">
        <div className="space-y-10">
          {TYPE_SAMPLES.map((s) => (
            <article
              key={s.key}
              className="border-t border-[--color-border] pt-8"
            >
              <div className="grid md:grid-cols-[200px_1fr] gap-6 mb-6">
                <div>
                  <p className="type-mono text-[--color-fg]">{s.framerName}</p>
                  <p className="type-mono text-[--color-fg-muted] mt-1">
                    {s.family} · {s.weight}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 type-mono text-[--color-fg-muted]">
                  <span>Size {s.size}</span>
                  <span>Tracking {s.letterSpacing}</span>
                  <span>Leading {s.lineHeight}</span>
                </div>
              </div>
              <p
                style={{
                  fontFamily: s.family === "serif" ? SERIF : SANS,
                  fontWeight: s.weight,
                  fontSize: `min(${s.size}, 12vw)`,
                  letterSpacing: s.letterSpacing,
                  lineHeight: s.lineHeight,
                  textTransform: s.key === "label" ? "uppercase" : "none",
                }}
                className="break-words"
              >
                {s.sample}
              </p>
            </article>
          ))}
        </div>
      </Row>

      {/* ============== APLICAÇÃO ============== */}
      <Row label="Aplicação">
        <div className="grid md:grid-cols-3 gap-[1px] bg-[--color-border]">
          <div className="bg-[--color-bg-elevated] p-8 flex flex-col gap-4">
            <p className="type-mono text-[--color-fg-muted]">Favicon</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-8 h-8 bg-[#1c1917] flex items-center justify-center">
                <Image
                  src={`${brandPath}/icon-white.svg`}
                  alt=""
                  width={1800}
                  height={1538}
                  className="w-1/2 h-auto"
                />
              </span>
              <span className="text-[--color-fg-muted]">betinaweber.com</span>
            </div>
            <p className="text-xs text-[--color-fg-muted] mt-auto">
              Ícone branco sobre warm black. 32×32, 64×64, 192×192.
            </p>
          </div>

          <div className="bg-[--color-bg-elevated] p-8 flex flex-col gap-4">
            <p className="type-mono text-[--color-fg-muted]">App icon</p>
            <div
              className="w-20 h-20 rounded-[18px] flex items-center justify-center"
              style={{ background: "#1c1917" }}
            >
              <Image
                src={`${brandPath}/icon-white.svg`}
                alt=""
                width={1800}
                height={1538}
                className="w-1/2 h-auto"
              />
            </div>
            <p className="text-xs text-[--color-fg-muted] mt-auto">
              iOS / Android. Margem interna de 22% conforme HIG.
            </p>
          </div>

          <div className="bg-[--color-bg-elevated] p-8 flex flex-col gap-4">
            <p className="type-mono text-[--color-fg-muted]">Avatar</p>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "#A6783E" }}
            >
              <Image
                src={`${brandPath}/icon-white.svg`}
                alt=""
                width={1800}
                height={1538}
                className="w-1/2 h-auto"
              />
            </div>
            <p className="text-xs text-[--color-fg-muted] mt-auto">
              Sociais e perfis. Variante accent quando precisar de presença.
            </p>
          </div>
        </div>
      </Row>

      {/* ============== NUNCA — lista em grade com X ============== */}
      <Row label="Nunca">
        <ul className="grid md:grid-cols-2 gap-x-10 lg:gap-x-16 border-t border-[--color-border]">
          {[
            "Gradientes em qualquer elemento",
            "Accent em CTA primário",
            "Accent em heading ou body",
            "Shadows em qualquer surface",
            "Radius além de 6px (exclusivo de botões)",
            "Playfair Display ou Inter",
            "Emojis em material institucional",
            "Estética mística ou wellness superficial",
            "Excesso de dourado ou metálico",
            "Stock Unsplash genérico",
            "Tom motivacional ou afetado",
            "Fundo branco puro #FFF (usar canvas warm)",
          ].map((rule) => (
            <li
              key={rule}
              className="grid grid-cols-[24px_1fr] items-baseline gap-4 py-4 border-b border-[--color-border]"
            >
              <span
                aria-hidden
                className="text-base leading-none"
                style={{ color: "#A6783E" }}
              >
                ✕
              </span>
              <p className="text-base md:text-[1.0625rem] leading-snug">
                {rule}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-[--color-fg-muted] max-w-3xl italic">
          Exemplos visuais de cada proibição serão adicionados em uma versão
          futura — prompts de geração já documentados no Brand Agent.
        </p>
      </Row>
    </div>
  );
}

// Color card component -------------------------------------------------------

function ColorCard({
  name,
  value,
  notes,
  framerPath,
  context,
}: {
  name: string;
  value: string;
  notes?: string;
  framerPath?: string;
  context?: string;
}) {
  const rgbTuple = hexToRgb(value);
  const rgb = rgbTuple ? `${rgbTuple[0]} · ${rgbTuple[1]} · ${rgbTuple[2]}` : null;
  const hsl = rgbTuple
    ? (() => {
        const [h, s, l] = rgbToHsl(rgbTuple[0], rgbTuple[1], rgbTuple[2]);
        return `${h}° · ${s}% · ${l}%`;
      })()
    : null;
  const overTone = readableOver(value);

  return (
    <div className="bg-[--color-bg-elevated] flex flex-col">
      <div
        className="aspect-[5/3] flex items-end justify-between p-4"
        style={{ background: value }}
      >
        <p
          className="type-mono"
          style={{ color: overTone === "light" ? "rgba(255,255,255,0.7)" : "rgba(28,25,23,0.7)" }}
        >
          {value.toUpperCase()}
        </p>
      </div>
      <div className="p-5 space-y-2">
        <p className="text-base font-medium capitalize">{name}</p>
        <dl className="text-xs text-[--color-fg-muted] space-y-0.5">
          <div className="flex gap-2">
            <dt className="type-mono w-12 shrink-0">HEX</dt>
            <dd className="font-mono">{value.toUpperCase()}</dd>
          </div>
          {rgb && (
            <div className="flex gap-2">
              <dt className="type-mono w-12 shrink-0">RGB</dt>
              <dd className="font-mono">{rgb}</dd>
            </div>
          )}
          {hsl && (
            <div className="flex gap-2">
              <dt className="type-mono w-12 shrink-0">HSL</dt>
              <dd className="font-mono">{hsl}</dd>
            </div>
          )}
          {framerPath && (
            <div className="flex gap-2">
              <dt className="type-mono w-12 shrink-0">Path</dt>
              <dd className="font-mono">{framerPath}</dd>
            </div>
          )}
        </dl>
        {context && (
          <p className="text-xs text-[--color-fg] pt-2 border-t border-[--color-border]">
            <span className="type-mono text-[--color-fg-muted] mr-2">USO</span>
            {context}
          </p>
        )}
        {notes && (
          <p className="text-xs text-[--color-fg-muted] leading-relaxed">
            {notes}
          </p>
        )}
      </div>
    </div>
  );
}
