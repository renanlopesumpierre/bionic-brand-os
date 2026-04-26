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

// Estruturas dos campos opcionais que esta página lê de design-tokens.json.
// Toda marca pode preencher/omitir o que quiser — a página esconde seções
// que ficarem vazias. NADA aqui é hardcoded por marca.
type ColorToken = {
  value: string;
  framerPath?: string;
  notes?: string;
  description?: string;
};
type AccentMeta = { label?: string; description?: string };
type LegacyColor = { value: string; name: string; context?: string; notes?: string };
type LegacyMeta = { label?: string; description?: string };
type TypographySpec = {
  framerPath?: string;
  fontFamily: "serif" | "sans";
  fontWeight: number;
  fontSize: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  sample?: string;
};
type VisualBlock = {
  symbol?: { description?: string };
  applicationNotes?: Record<string, string>;
  siteUrl?: string;
};

// Fallbacks neutros usados quando a marca não preenche um campo.
const FALLBACK_TYPE_SAMPLE = "The quick brown fox jumps over the lazy dog.";
const FALLBACK_SYMBOL_DESC =
  "Símbolo em movimento — representação viva da marca.";
const FALLBACK_NEVER: string[] = []; // se a marca não declarar, esconde a seção

export default async function VisualPage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const { tokens, manifest } = client;

  const surfaces = tokens.color.surface as unknown as Record<string, ColorToken>;
  const accent = tokens.color.accent as unknown as Record<string, ColorToken> & {
    _meta?: AccentMeta;
  };
  const colorBlock = tokens.color as unknown as {
    legacyWeb?: Record<string, LegacyColor> & { _meta?: LegacyMeta };
  };
  const visual = (tokens as { visual?: VisualBlock }).visual ?? {};
  const visualRules = (tokens as { visualRules?: { never?: string[] } }).visualRules;

  // Famílias de fonte vêm dos tokens — sem hardcode da fonte da marca.
  const SERIF = (tokens.font.family.serif as { value: string }).value;
  const SANS = (tokens.font.family.sans as { value: string }).value;

  // Cor accent da marca (usado em backgrounds de demonstração e no X da lista NUNCA).
  const accentDefault = accent.default?.value ?? "var(--color-accent)";

  // Cor de superfície escura (usado nos paineis de logo negativo, símbolo, etc.).
  // Cai pra cor declarada de inverse, com fallback pra TAG-black do produto.
  const surfaceInverse = surfaces.inverse?.value ?? surfaces.inverseAlt?.value ?? "#111111";
  const surfaceCanvas = surfaces.canvas?.value ?? surfaces.cream?.value ?? "var(--color-bg)";

  // Label dos rótulos derivados — nunca hardcoded (não dizemos "warm black").
  const inverseLabel = surfaces.inverse?.framerPath?.replace(/^\//, "") ?? "fundo escuro";
  const accentLabel = accent.default?.framerPath?.replace(/^\//, "") ?? "Accent";

  // Famílias de fonte primárias (extrai primeiro nome de cada stack CSS).
  const serifPrimary = primaryFamily(SERIF);
  const sansPrimary = primaryFamily(SANS);

  // Escala tipográfica derivada dos tokens (com sample opcional).
  const typeSamples = Object.entries(tokens.typography as Record<string, TypographySpec>)
    .filter(([, spec]) => spec.sample) // só renderiza tokens com sample preenchido
    .map(([key, spec]) => ({
      key,
      framerName: spec.framerPath ?? `/${key}`,
      family: spec.fontFamily,
      weight: spec.fontWeight,
      size: spec.fontSize,
      letterSpacing: spec.letterSpacing ?? "normal",
      lineHeight: spec.lineHeight ?? "1.2",
      textTransform: spec.textTransform,
      sample: spec.sample ?? FALLBACK_TYPE_SAMPLE,
    }));

  const accentMeta: AccentMeta = accent._meta ?? {};
  const legacyMeta: LegacyMeta = colorBlock.legacyWeb?._meta ?? {};

  const legacyColors: Array<{ key: string; data: LegacyColor }> = colorBlock.legacyWeb
    ? Object.entries(colorBlock.legacyWeb)
        .filter(([k]) => k !== "_meta")
        .map(([key, data]) => ({ key, data: data as LegacyColor }))
    : [];

  const neverList = visualRules?.never ?? FALLBACK_NEVER;

  const brandPath = `/clients/${slug}/brand`;
  const symbolDescription = visual.symbol?.description ?? FALLBACK_SYMBOL_DESC;
  const appNotes = visual.applicationNotes ?? {};
  const siteUrl = visual.siteUrl ?? null;

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
              alt={`${manifest.name} — logo positivo`}
              width={3908}
              height={354}
              className="w-full max-w-md h-auto"
            />
          </div>
          <div
            className="aspect-[16/9] flex items-center justify-center p-10"
            style={{ background: surfaceInverse }}
          >
            <Image
              src={`${brandPath}/logo-white.svg`}
              alt={`${manifest.name} — logo negativo`}
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
          <div
            className="aspect-square flex items-center justify-center p-8"
            style={{ background: surfaceInverse }}
          >
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
            style={{ background: surfaceCanvas }}
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
            style={{ background: accentDefault }}
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
        <div
          className="flex items-center justify-center py-20 px-8"
          style={{ background: surfaceInverse }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${brandPath}/symbol-animated.gif`}
            alt={`${manifest.name} — símbolo animado`}
            className="w-64 h-auto"
          />
        </div>
        <p className="mt-6 text-sm text-[--color-fg-muted] max-w-3xl">
          {symbolDescription}
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
              {accentMeta.label ?? "Accent"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[--color-border]">
              {(Object.entries(accent).filter(([name]) => name !== "_meta") as Array<[string, ColorToken]>).map(([name, token]) => (
                <ColorCard
                  key={name}
                  name={name}
                  value={token.value}
                  notes={token.notes}
                  framerPath={token.framerPath}
                />
              ))}
            </div>
            {accentMeta.description && (
              <p className="mt-6 text-sm leading-relaxed text-[--color-fg-muted] max-w-3xl">
                {accentMeta.description}
              </p>
            )}
          </div>
        </div>
      </Row>

      {/* ============== TONS LEGADOS (opcional) ============== */}
      {legacyColors.length > 0 && (
        <Row label={legacyMeta.label ?? "Tons legados"}>
          {legacyMeta.description && (
            <p className="text-sm text-[--color-fg-muted] max-w-3xl mb-8">
              {legacyMeta.description}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[--color-border]">
            {legacyColors.map(({ key, data }) => (
              <ColorCard
                key={key}
                name={data.name}
                value={data.value}
                notes={data.notes}
                context={data.context}
              />
            ))}
          </div>
        </Row>
      )}

      {/* ============== TIPOGRAFIA — FAMÍLIAS ============== */}
      <Row label="Famílias">
        <div className="space-y-10">
          <div className="bg-[--color-bg-alt] p-10 md:p-14">
            <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
              <p className="type-mono text-[--color-fg-muted]">
                Display · serif
              </p>
              <p className="type-mono text-[--color-fg-muted]">{SERIF}</p>
            </div>
            <p
              className="text-7xl md:text-9xl leading-[0.95]"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                letterSpacing: "-0.06em",
              }}
            >
              {serifPrimary}
            </p>
          </div>

          <div className="bg-[--color-bg-alt] p-10 md:p-14">
            <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
              <p className="type-mono text-[--color-fg-muted]">Body · sans</p>
              <p className="type-mono text-[--color-fg-muted]">{SANS}</p>
            </div>
            <p
              className="text-5xl md:text-7xl tracking-tight leading-tight"
              style={{ fontFamily: SANS, fontWeight: 400 }}
            >
              {sansPrimary}
            </p>
          </div>
        </div>
      </Row>

      {/* ============== ESCALA TIPOGRÁFICA (samples reais dos tokens) ============== */}
      {typeSamples.length > 0 && (
        <Row label="Escala aplicada">
          <div className="space-y-10">
            {typeSamples.map((s) => (
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
                    textTransform: (s.textTransform ?? "none") as React.CSSProperties["textTransform"],
                  }}
                  className="break-words"
                >
                  {s.sample}
                </p>
              </article>
            ))}
          </div>
        </Row>
      )}

      {/* ============== APLICAÇÃO ============== */}
      <Row label="Aplicação">
        <div className="grid md:grid-cols-3 gap-[1px] bg-[--color-border]">
          <div className="bg-[--color-bg-elevated] p-8 flex flex-col gap-4">
            <p className="type-mono text-[--color-fg-muted]">Favicon</p>
            <div className="flex items-center gap-3 text-sm">
              <span
                className="w-8 h-8 flex items-center justify-center"
                style={{ background: surfaceInverse }}
              >
                <Image
                  src={`${brandPath}/icon-white.svg`}
                  alt=""
                  width={1800}
                  height={1538}
                  className="w-1/2 h-auto"
                />
              </span>
              {siteUrl && (
                <span className="text-[--color-fg-muted]">{siteUrl}</span>
              )}
            </div>
            <p className="text-xs text-[--color-fg-muted] mt-auto">
              {appNotes.favicon ?? `Ícone branco sobre ${inverseLabel}.`}
            </p>
          </div>

          <div className="bg-[--color-bg-elevated] p-8 flex flex-col gap-4">
            <p className="type-mono text-[--color-fg-muted]">App icon</p>
            <div
              className="w-20 h-20 rounded-[18px] flex items-center justify-center"
              style={{ background: surfaceInverse }}
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
              {appNotes.appIcon ?? "iOS / Android."}
            </p>
          </div>

          <div className="bg-[--color-bg-elevated] p-8 flex flex-col gap-4">
            <p className="type-mono text-[--color-fg-muted]">Avatar</p>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: accentDefault }}
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
              {appNotes.avatar ?? `Sociais e perfis. Variante ${accentLabel.toLowerCase()} quando precisar de presença.`}
            </p>
          </div>
        </div>
      </Row>

      {/* ============== NUNCA — só renderiza se a marca declarar ============== */}
      {neverList.length > 0 && (
        <Row label="Nunca">
          <ul className="grid md:grid-cols-2 gap-x-10 lg:gap-x-16 border-t border-[--color-border]">
            {neverList.map((rule) => (
              <li
                key={rule}
                className="grid grid-cols-[24px_1fr] items-baseline gap-4 py-4 border-b border-[--color-border]"
              >
                <span
                  aria-hidden
                  className="text-base leading-none"
                  style={{ color: accentDefault }}
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
      )}
    </div>
  );
}

// Helpers ----------------------------------------------------------------------

function primaryFamily(stack: string): string {
  return (stack.split(",")[0] ?? "").replace(/['"]/g, "").trim();
}

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
