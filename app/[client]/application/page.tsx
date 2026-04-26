import Image from "next/image";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";

import { getClient } from "@/lib/content";
import { Row, SectionHeader } from "../_components/section-header";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c ? { title: `${c.manifest.name} · Aplicação` } : {};
}

// Friendly labels for what's stored as cryptic keys in the JSON.
const channelMeta: Record<
  string,
  { name: string; when: string; gabaritoKey?: string }
> = {
  postAutoridade: {
    name: "Post de autoridade · Instagram",
    when: "Quando você quer plantar uma observação que reposiciona como o público enxerga um tema.",
    gabaritoKey: "gabaritoA_postAutoridade",
  },
  carouselInstagram: {
    name: "Carrossel · Instagram",
    when: "Conteúdo profundo em 8 telas — do problema ao CTA, fechando explicitamente com um dos pilares.",
  },
  propostaComercial: {
    name: "Proposta comercial",
    when: "Quando você vai apresentar serviço a um cliente potencial. Estrutura formal de 9 blocos.",
    gabaritoKey: "gabaritoB_proposta",
  },
  emailInstitucional: {
    name: "Email institucional",
    when: "Resposta direta com densidade alta. Quatro linhas, sem rodeios.",
  },
};

// Vetores verbais / pilares / arquétipos como glossário visual.
const VETORES_VERBAIS = [
  {
    name: "Visão",
    role: "Observação ampla, leitura de contexto, padrão que o público ainda não nomeou.",
    when: "Abre peça, plantando uma nova lente.",
  },
  {
    name: "Valor",
    role: "Consequência prática da observação. O que isso muda em decisão, estrutura ou resultado.",
    when: "Faz a ponte do conceito para a ação.",
  },
  {
    name: "Vínculo",
    role: "Conexão humana, fala em primeira pessoa, refere experiência vivida.",
    when: "Fecha peça ou abre conversa direta.",
  },
];

const PILLAR_KEYS: Array<"business" | "consciousness" | "wellness"> = [
  "business",
  "consciousness",
  "wellness",
];

// Parse "[Foo] [Bar] [Baz]" → ["Foo","Bar","Baz"]
function parseGabarito(s: string): string[] {
  const matches = s.matchAll(/\[([^\]]+)\]/g);
  return Array.from(matches, (m) => m[1].trim());
}

export default async function ApplicationPage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const {
    applicationMatrix,
    templates,
    pieceValidation,
    verbal,
    offerings,
    method,
    architecture,
  } = client.brandSystem;

  const archetypes = [
    architecture.archetypes.primary,
    architecture.archetypes.secondary,
    architecture.archetypes.behavioralSignature,
  ];

  const gabaritos = Object.entries(templates).filter(
    ([k]) => !k.startsWith("_"),
  ) as Array<[string, string]>;
  const gabaritoMap = new Map(gabaritos);

  return (
    <div>
      <SectionHeader
        eyebrow="Aplicação"
        step="II · 07"
        title="Aplicação."
        description="Onde o sistema da marca encontra a peça final. Cada canal tem estrutura, gabarito e mensagem canônica — pronto pra preencher."
        tone="deep"
      />

      {/* ============== COMO USAR ============== */}
      <Row label="Como usar">
        <p className="text-lg md:text-xl text-[--color-fg-muted] max-w-3xl mb-12 leading-relaxed">
          Toda peça pública passa por quatro etapas. Não é fluxo opcional — é o
          que mantém a marca coerente sem depender de interpretação criativa
          em cada execução.
        </p>
        <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[--color-border]">
          {[
            {
              n: "01",
              title: "Identifique o canal",
              body: "Post, carrossel, proposta, email, palestra. Cada um tem estrutura própria.",
            },
            {
              n: "02",
              title: "Siga a estrutura",
              body: "Cada canal tem uma sequência fixa de blocos. Preencha cada bloco com o conteúdo da peça.",
            },
            {
              n: "03",
              title: "Aplique o gabarito",
              body: "Modelo verbal pronto — Visão → Valor → Vínculo. Conecta com pilar B, C ou W.",
            },
            {
              n: "04",
              title: "Valide nos 9 critérios",
              body: "Checklist final. Se passou em 9 de 9, está pronta pra ir ao ar.",
            },
          ].map((step) => (
            <li
              key={step.n}
              className="bg-[--color-bg-elevated] p-7 md:p-8 flex flex-col gap-3 min-h-[200px]"
            >
              <p className="type-mono text-[--color-fg-muted]">{step.n}</p>
              <h3 className="text-xl tracking-tight">{step.title}</h3>
              <p className="text-sm text-[--color-fg-muted] leading-relaxed mt-auto">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Row>

      {/* ============== GLOSSÁRIO ============== */}
      <Row label="Glossário">
        <p className="text-base text-[--color-fg-muted] max-w-3xl mb-10">
          Antes de aplicar, três conjuntos de conceitos aparecem em toda peça.
          Eles trabalham juntos: <em>vetor verbal</em> guia o tom, <em>pilar</em>{" "}
          conecta ao Growth Method, <em>arquétipo</em> define a postura.
        </p>

        <div className="space-y-12">
          {/* Vetores verbais */}
          <div>
            <p className="type-mono text-[--color-fg] mb-4">
              Vetores verbais — guiam o tom
            </p>
            <div className="grid md:grid-cols-3 gap-[1px] bg-[--color-border]">
              {VETORES_VERBAIS.map((v) => (
                <div
                  key={v.name}
                  className="bg-[--color-bg-elevated] p-7 flex flex-col gap-3"
                >
                  <h4 className="text-2xl tracking-tight">{v.name}</h4>
                  <p className="text-sm text-[--color-fg-muted] leading-relaxed">
                    {v.role}
                  </p>
                  <p className="type-mono text-[--color-fg-faint] mt-auto pt-3">
                    {v.when}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pilares B/C/W */}
          <div>
            <p className="type-mono text-[--color-fg] mb-4">
              Pilares do Growth Method — conectam ao método
            </p>
            <div className="grid md:grid-cols-3 gap-[1px] bg-[--color-border]">
              {PILLAR_KEYS.map((key) => {
                const p = method.pillars[key];
                return (
                  <div
                    key={key}
                    className="bg-[--color-bg-elevated] p-7 flex flex-col gap-3"
                  >
                    <p className="type-mono text-[--color-fg-muted]">
                      {key === "business"
                        ? "B"
                        : key === "consciousness"
                          ? "C"
                          : "W"}{" "}
                      · {p.nature}
                    </p>
                    <h4 className="text-2xl tracking-tight">{p.label}</h4>
                    <p className="italic text-[--color-fg-muted]">
                      &ldquo;{p.frase}&rdquo;
                    </p>
                    <p className="text-sm text-[--color-fg-muted] leading-relaxed mt-auto pt-3">
                      {p.role}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arquétipos */}
          <div>
            <p className="type-mono text-[--color-fg] mb-4">
              Arquétipos — definem a postura editorial
            </p>
            <div className="grid md:grid-cols-3 gap-[1px] bg-[--color-border]">
              {archetypes.map((a) => (
                <div
                  key={a.name}
                  className="bg-[--color-bg-elevated] p-7 flex flex-col gap-3"
                >
                  <h4 className="text-2xl tracking-tight">{a.name}</h4>
                  <p className="text-sm text-[--color-fg-muted] leading-relaxed">
                    {a.expresses}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Row>

      {/* ============== ESTRUTURAS POR CANAL ============== */}
      <Row label="Estruturas por canal">
        <p className="text-base text-[--color-fg-muted] max-w-3xl mb-10">
          Cada canal tem uma sequência fixa de blocos. Siga em ordem,
          preenchendo cada bloco com conteúdo real. Se um bloco está vazio, a
          peça não está pronta.
        </p>

        <div className="space-y-12">
          {Object.entries(verbal.pieceStructures).map(([key, steps]) => {
            const meta = channelMeta[key];
            const gabarito = meta?.gabaritoKey
              ? gabaritoMap.get(meta.gabaritoKey)
              : undefined;
            const gabaritoBlocks = gabarito ? parseGabarito(gabarito) : [];

            return (
              <article
                key={key}
                className="border border-[--color-border] bg-[--color-bg-elevated]"
              >
                {/* Header */}
                <header className="p-7 md:p-8 border-b border-[--color-border]">
                  <p className="type-mono text-[--color-fg-muted] mb-3">
                    {key}
                  </p>
                  <h3 className="text-2xl md:text-3xl tracking-tight mb-3">
                    {meta?.name ?? key}
                  </h3>
                  {meta?.when && (
                    <p className="text-base text-[--color-fg-muted] max-w-3xl leading-relaxed">
                      {meta.when}
                    </p>
                  )}
                </header>

                {/* Steps */}
                <div className="p-7 md:p-8 grid md:grid-cols-[180px_1fr] gap-6">
                  <p className="type-mono text-[--color-fg-muted]">
                    Sequência fixa
                  </p>
                  <ol className="space-y-3">
                    {(steps as string[]).map((step, i) => (
                      <li
                        key={i}
                        className="grid grid-cols-[40px_1fr] items-baseline gap-3"
                      >
                        <span className="type-mono tabular-nums text-[--color-fg-faint] shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-base leading-snug">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Gabarito visual */}
                {gabaritoBlocks.length > 0 && (
                  <div className="p-7 md:p-8 grid md:grid-cols-[180px_1fr] gap-6 border-t border-[--color-border] bg-[--color-bg-alt]">
                    <p className="type-mono text-[--color-fg-muted]">
                      Gabarito verbal
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {gabaritoBlocks.map((block, i) => (
                        <span
                          key={i}
                          className="inline-flex items-baseline gap-2 px-3 py-2 bg-[--color-bg-elevated] border border-[--color-border] text-sm"
                        >
                          <span className="type-mono text-[--color-fg-faint]">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span>{block}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Outros gabaritos sem canal mapeado */}
        {gabaritos.some(([key]) =>
          !Object.values(channelMeta)
            .map((m) => m.gabaritoKey)
            .filter(Boolean)
            .includes(key),
        ) && (
          <div className="mt-12">
            <p className="type-mono text-[--color-fg-muted] mb-4">
              Gabaritos editoriais adicionais
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {gabaritos
                .filter(
                  ([key]) =>
                    !Object.values(channelMeta)
                      .map((m) => m.gabaritoKey)
                      .filter(Boolean)
                      .includes(key),
                )
                .map(([key, val]) => {
                  const blocks = parseGabarito(val);
                  return (
                    <div
                      key={key}
                      className="border border-[--color-border] bg-[--color-bg-elevated] p-6"
                    >
                      <p className="type-mono text-[--color-fg-muted] mb-4">
                        {key}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {blocks.map((b, i) => (
                          <span
                            key={i}
                            className="inline-flex items-baseline gap-2 px-3 py-2 bg-[--color-bg-alt] text-sm"
                          >
                            <span className="type-mono text-[--color-fg-faint]">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span>{b}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </Row>

      {/* ============== MENSAGENS POR OFERTA ============== */}
      <Row label="Mensagens canônicas">
        <p className="text-base text-[--color-fg-muted] max-w-3xl mb-10">
          Headline e parágrafo prontos para cada oferta. Use literalmente em
          landing, proposta, deck e email — ou expanda mantendo a tese central.
        </p>
        <div className="grid md:grid-cols-2 gap-[1px] bg-[--color-border]">
          {offerings
            .filter((o) => "canonicalMessaging" in o)
            .map((o) => {
              const msg = (
                o as unknown as {
                  canonicalMessaging: { headline: string; body: string };
                }
              ).canonicalMessaging;
              return (
                <article
                  key={o.id}
                  className="bg-[--color-bg-elevated] p-7 md:p-8 flex flex-col gap-5 min-h-[280px]"
                >
                  <p className="type-mono text-[--color-fg-muted]">{o.name}</p>
                  <p className="text-2xl md:text-3xl tracking-tight leading-tight">
                    {msg.headline}
                  </p>
                  <p className="text-base leading-relaxed text-[--color-fg-muted]">
                    {msg.body}
                  </p>
                </article>
              );
            })}
        </div>
      </Row>

      {/* ============== MAPA RÁPIDO (matriz) ============== */}
      <Row label="Mapa rápido">
        <p className="text-base text-[--color-fg-muted] max-w-3xl mb-8">
          Referência consolidada. Para cada peça, qual vetor verbal usar, qual
          arquétipo dominar e qual pilar conectar.
        </p>
        <div className="overflow-x-auto border border-[--color-border] bg-[--color-bg-elevated]">
          <table className="w-full text-sm">
            <thead className="bg-[--color-bg-alt]">
              <tr className="border-b border-[--color-border]">
                <th className="text-left p-4 font-medium">Peça</th>
                <th className="text-left p-4 font-medium">Verbal</th>
                <th className="text-left p-4 font-medium">Arquétipo</th>
                <th className="text-left p-4 font-medium">Pilar</th>
              </tr>
            </thead>
            <tbody>
              {applicationMatrix.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[--color-border] last:border-0 hover:bg-[--color-bg-alt] transition-colors"
                >
                  <td className="p-4 font-medium">{row.piece}</td>
                  <td className="p-4 text-[--color-fg-muted]">{row.verbal}</td>
                  <td className="p-4 text-[--color-fg-muted]">
                    {row.archetype}
                  </td>
                  <td className="p-4 text-[--color-fg-muted]">
                    {row.pillarBridge}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Row>

      {/* ============== CHECKLIST DE VALIDAÇÃO ============== */}
      <Row label="Checklist final">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-baseline mb-10">
          <p className="text-base text-[--color-fg-muted] max-w-2xl">
            Última etapa antes de publicar. A peça precisa passar nos 9
            critérios. Se algum falhou, volte ao gabarito.
          </p>
          <p className="type-mono text-[--color-fg]">
            Aprovação: {pieceValidation.requiredPassRate}
          </p>
        </div>
        <ol className="grid md:grid-cols-2 gap-x-10 lg:gap-x-16 border-t border-[--color-border]">
          {pieceValidation.checklist.map((q, i) => (
            <li
              key={i}
              className="grid grid-cols-[28px_1fr] items-baseline gap-4 py-5 border-b border-[--color-border]"
            >
              <span className="inline-flex items-center justify-center w-6 h-6 border border-[--color-border-strong]">
                <Check className="w-3.5 h-3.5 text-[--color-fg-muted]" />
              </span>
              <p className="text-base leading-snug">
                <span className="type-mono tabular-nums text-[--color-fg-faint] mr-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {q}
              </p>
            </li>
          ))}
        </ol>
      </Row>

      {/* ============== Closing photo ============== */}
      <div className="surface-deep border-t border-[--color-border]">
        <div className="container-wide py-16 md:py-20">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={`/clients/${slug}/photos/application.jpg`}
                alt="Aplicação operacional"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="type-mono text-[--color-fg-muted] mb-4">
                Execução como sistema
              </p>
              <p className="text-2xl md:text-3xl tracking-tight leading-tight">
                &ldquo;A execução revela a verdade da estratégia.&rdquo;
              </p>
              <p className="mt-4 text-[--color-fg-muted]">
                Cada peça é uma combinação determinística de camadas
                anteriores. A IA preenche os slots. O sistema protege a
                coerência.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
