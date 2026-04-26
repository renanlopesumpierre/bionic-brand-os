import { notFound } from "next/navigation";
import { Check, Lock, AlertTriangle } from "lucide-react";

import { getClient } from "@/lib/content";
import { Row, SectionHeader } from "../_components/section-header";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c ? { title: `${c.manifest.name} · Governança` } : {};
}

type GovernanceWithExtras = {
  decisionHierarchy: string[];
  requiresOwnerApproval: string[];
  autonomousByTeam: string[];
  newSacredPhraseCriteria?: string[];
  erosionAlerts: string[];
};

export default async function GovernancePage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const governance = client.brandSystem.governance as GovernanceWithExtras;
  const meta = client.brandSystem.meta as { changelog: Record<string, string[]> };

  const sacredCriteria = governance.newSacredPhraseCriteria ?? [];

  // Cor accent vem dos tokens da marca (não hardcoded). Fallback pro accent
  // do produto quando a marca-cliente não declarar accent próprio.
  const accentTokens = (client.tokens as { color?: { accent?: { default?: { value?: string } } } }).color?.accent?.default;
  const clientAccent = accentTokens?.value ?? "var(--color-accent)";

  // RGBA do accent com alpha 0.12 pra fundo do badge — derivado do hex.
  const accentSoft = clientAccent.startsWith("#")
    ? `${clientAccent}1F` // 1F hex = ~12% alpha
    : "var(--color-bg-alt)";

  const ownerName = client.manifest.name;

  const changelog = Object.entries(meta.changelog).sort((a, b) =>
    b[0].localeCompare(a[0]),
  );

  return (
    <div>
      <SectionHeader
        eyebrow="Governança"
        step="III · 08"
        title="Governança."
        description="Quem decide o quê, o que pode ser feito sem aprovação, e os sinais de que a marca está se diluindo. O que mantém o sistema coerente ao longo do tempo."
        tone="deep"
      />

      {/* ============== COMO DECIDIR ============== */}
      <Row label="Como decidir">
        <p className="text-lg md:text-xl text-[--color-fg-muted] max-w-3xl mb-12 leading-relaxed">
          Toda decisão de marca passa por uma sequência fixa de perguntas. Não
          é checklist — é hierarquia. A primeira pergunta vence as outras. A
          última só entra em cena se as anteriores não resolverem.
        </p>
        <ol className="grid md:grid-cols-2 lg:grid-cols-5 gap-[1px] bg-[--color-border]">
          {governance.decisionHierarchy.map((q, i) => {
            const isLast = i === governance.decisionHierarchy.length - 1;
            return (
              <li
                key={i}
                className={
                  isLast
                    ? "surface-deep p-7 md:p-7 flex flex-col gap-3 min-h-[220px]"
                    : "bg-[--color-bg-elevated] p-7 md:p-7 flex flex-col gap-3 min-h-[220px]"
                }
              >
                <p
                  className={
                    "type-mono " +
                    (isLast
                      ? "text-[--color-fg-on-dark-muted]"
                      : "text-[--color-fg-muted]")
                  }
                >
                  {String(i + 1).padStart(2, "0")}
                  {isLast && " · tiebreaker"}
                </p>
                <p className="text-[1.0625rem] leading-snug tracking-tight">
                  {q}
                </p>
              </li>
            );
          })}
        </ol>
      </Row>

      {/* ============== AUTONOMIA × APROVAÇÃO ============== */}
      <Row label="Quem decide o quê">
        <p className="text-base text-[--color-fg-muted] max-w-3xl mb-10">
          Duas listas, lado a lado. À esquerda, o que o time executa sem
          consulta. À direita, o que exige aprovação direta de {ownerName} antes
          de virar pública.
        </p>
        <div className="grid md:grid-cols-2 gap-[1px] bg-[--color-border]">
          {/* Autônomo */}
          <div className="bg-[--color-bg-elevated] p-7 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-[--color-bg-alt]">
                <Check className="w-4 h-4 text-[--color-fg]" />
              </span>
              <p className="type-mono text-[--color-fg-muted]">
                Autônomo · time
              </p>
            </div>
            <h3 className="text-2xl tracking-tight mb-6">
              Pode executar sem pedir.
            </h3>
            <ul className="space-y-0">
              {governance.autonomousByTeam.map((item) => (
                <li
                  key={item}
                  className="grid grid-cols-[20px_1fr] items-baseline gap-3 py-3 border-t border-[--color-border]"
                >
                  <Check className="w-3.5 h-3.5 text-[--color-fg-muted]" />
                  <span className="text-base leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Aprovação */}
          <div className="bg-[--color-bg-elevated] p-7 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="inline-flex items-center justify-center w-8 h-8"
                style={{ background: accentSoft }}
              >
                <Lock className="w-4 h-4" style={{ color: clientAccent }} />
              </span>
              <p className="type-mono text-[--color-fg-muted]">
                Aprovação · {ownerName}
              </p>
            </div>
            <h3 className="text-2xl tracking-tight mb-6">
              Precisa de luz verde antes.
            </h3>
            <ul className="space-y-0">
              {governance.requiresOwnerApproval.map((item) => (
                <li
                  key={item}
                  className="grid grid-cols-[20px_1fr] items-baseline gap-3 py-3 border-t border-[--color-border]"
                >
                  <Lock
                    className="w-3.5 h-3.5"
                    style={{ color: clientAccent }}
                  />
                  <span className="text-base leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Row>

      {/* ============== NOVA FRASE SAGRADA ============== */}
      {sacredCriteria.length > 0 && (
        <Row label="Nova frase sagrada">
          <p className="text-base text-[--color-fg-muted] max-w-3xl mb-8">
            Quando {ownerName} considera adicionar uma nova frase sagrada ao
            repertório, a candidata precisa passar nos 5 critérios abaixo. Se
            falhar em qualquer um, não entra.
          </p>
          <ol className="grid md:grid-cols-2 lg:grid-cols-5 gap-[1px] bg-[--color-border]">
            {sacredCriteria.map((c, i) => (
              <li
                key={i}
                className="bg-[--color-bg-elevated] p-6 flex flex-col gap-3 min-h-[160px]"
              >
                <p className="type-mono tabular-nums text-[--color-fg-faint]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-sm leading-snug">{c}</p>
              </li>
            ))}
          </ol>
        </Row>
      )}

      {/* ============== ALERTAS DE EROSÃO ============== */}
      <Row label="Sinais de erosão">
        <p className="text-base text-[--color-fg-muted] max-w-3xl mb-10">
          Quando algum desses sinais aparece, a marca está se diluindo. Cada
          alerta é um gatilho de revisão imediata — não esperar o próximo
          ciclo. Quanto mais cedo a correção, menor o ruído acumulado.
        </p>
        <ul className="grid md:grid-cols-2 gap-[1px] bg-[--color-border]">
          {governance.erosionAlerts.map((alert) => (
            <li
              key={alert}
              className="bg-[--color-bg-elevated] p-6 grid grid-cols-[28px_1fr] items-baseline gap-4"
            >
              <AlertTriangle
                className="w-4 h-4 mt-0.5"
                style={{ color: clientAccent }}
              />
              <p className="text-base leading-snug">{alert}</p>
            </li>
          ))}
        </ul>
      </Row>

      {/* ============== CHANGELOG ============== */}
      <Row label="Histórico de versões">
        <p className="text-base text-[--color-fg-muted] max-w-3xl mb-10">
          Toda mudança no Brand System fica registrada. Versão mais recente no
          topo. Use como referência para entender por que uma decisão atual
          existe da forma que existe.
        </p>
        <ol className="space-y-0 border-t border-[--color-border]">
          {changelog.map(([version, entries]) => (
            <li
              key={version}
              className="grid md:grid-cols-[180px_1fr] gap-6 py-8 border-b border-[--color-border]"
            >
              <div>
                <p className="type-mono text-[--color-fg]">v{version}</p>
                <p className="type-mono text-[--color-fg-faint] mt-1">
                  Brand System
                </p>
              </div>
              <ul className="space-y-2">
                {entries.map((e, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[16px_1fr] items-baseline gap-3 text-sm leading-relaxed"
                  >
                    <span className="text-[--color-fg-faint]">—</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Row>
    </div>
  );
}
