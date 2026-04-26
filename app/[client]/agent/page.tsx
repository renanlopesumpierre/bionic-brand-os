import Image from "next/image";
import { notFound } from "next/navigation";
import { FileText, CheckSquare, BookOpen, Zap } from "lucide-react";

import { getClient } from "@/lib/content";
import { BrandAgentChat } from "./_components/chat";

type Props = { params: Promise<{ client: string }> };

export async function generateMetadata({ params }: Props) {
  const { client: slug } = await params;
  const c = getClient(slug);
  return c ? { title: `${c.manifest.name} · Brand Agent` } : {};
}

const CAPABILITIES = [
  {
    icon: FileText,
    label: "Gerar conteúdo",
    description: "Produz peças dentro do sistema canônico com gabarito, vetor e arquétipo corretos.",
    items: [
      "Posts de autoridade (Instagram / LinkedIn)",
      "Carrosséis de 8 slides com estrutura canônica",
      "Emails institucionais e newsletters",
      "Propostas comerciais (9 blocos)",
      "Headlines, bios e taglines aprovadas",
      "CTAs dentro do repertório canônico",
    ],
  },
  {
    icon: CheckSquare,
    label: "Validar peças",
    description: "Roda os 9 critérios de validação em qualquer texto antes de publicar.",
    items: [
      "Checagem de léxico proibido",
      "Verificação dos 6 vetores de tom",
      "Análise de estrutura por gabarito",
      "Conformidade dos CTAs",
      "Uso correto do acento e credenciais",
      "Diagnóstico e reescrita cirúrgica",
    ],
  },
  {
    icon: BookOpen,
    label: "Consultar governança",
    description: "Acessa frases sagradas, regras de uso e hierarquia de decisão em tempo real.",
    items: [
      "As 8 frases sagradas invariantes",
      "Pool expandido de frases aprovadas",
      "Léxico nuclear e léxico proibido",
      "Regras do acento e tipografia",
      "Mensagens canônicas por oferta e público",
      "O que requer aprovação do(a) dono(a) da marca",
    ],
  },
  {
    icon: Zap,
    label: "Adaptar por contexto",
    description: "Calibra vetor, arquétipo e idioma conforme o canal e o momento do cliente.",
    items: [
      "Versão PT / EN / ES de qualquer peça",
      "Adaptação por público (líder, médico, luxo)",
      "Calibração por arquétipo (Sábio / Governante)",
      "Ativação correta do Intelligence Triangle",
      "Abertura por pilar dominante (B / C / W)",
      "Registro editorial vs. registro casual",
    ],
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Configure sua chave",
    body: "Clique em Configurações no chat e cole sua chave — Anthropic (sk-ant-...), OpenAI (sk-proj-...) ou Google Gemini (AIzaSy...). Pode configurar as três ao mesmo tempo. Ficam salvas só no seu navegador.",
  },
  {
    step: "02",
    title: "Descreva o que precisa",
    body: "Peça uma peça nova, cole um texto para validar, ou faça uma pergunta sobre governança. Quanto mais contexto você der, mais precisa fica a entrega.",
  },
  {
    step: "03",
    title: "Receba com nota estratégica",
    body: "O agente entrega a peça pronta e aponta quais escolhas foram feitas — pilar ativado, vetor dominante, arquétipo, critérios cumpridos.",
  },
];

export default async function AgentPage({ params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();

  const brandName = client.manifest.name;
  const SUGGESTIONS = [
    {
      category: "Copy",
      prompts: [
        "Escreva um post de autoridade para Instagram sobre clareza de liderança.",
        "Crie um carrossel de 8 slides sobre o pilar Consciousness para LinkedIn.",
        "Escreva um email de abertura de proposta para um empresário em expansão.",
        "Três opções de headline para a página de imersões, gabarito D.",
      ],
    },
    {
      category: "Validação",
      prompts: [
        "Valide esse texto contra os 9 critérios antes de publicar.",
        "Esse copy usa alguma palavra do léxico proibido? Reescreva o que falhar.",
        "Rode os 6 vetores de tom nessa peça e aponte onde ela perde sofisticação.",
      ],
    },
    {
      category: "Governança",
      prompts: [
        "Quais são as 8 frases sagradas e quando usar cada uma?",
        "Qual frase do pool aprovado serve para abrir uma proposta de hospitalidade de luxo?",
        `O que nunca pode aparecer em comunicação institucional de ${brandName}?`,
      ],
    },
    {
      category: "Adaptação",
      prompts: [
        "Reescreva esse post em inglês no registro editorial denso.",
        "Adapte essa mensagem para médicos e profissionais de saúde.",
        "Qual a diferença de abordagem para o pilar Business vs. Wellness nesse contexto?",
      ],
    },
  ];

  return (
    <div>
      {/* ===== HERO ===== */}
      <div className="surface-deep border-b border-[--color-border]">
        <div className="container-wide py-12 md:py-16">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 md:gap-12 items-center">
            <div className="relative aspect-[4/5] overflow-hidden max-w-[360px]">
              <Image
                src={`/clients/${slug}/photos/agent.jpg`}
                alt={client.manifest.name}
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <p className="type-mono opacity-70 mb-2">III · 10</p>
              <p className="type-mono opacity-50 mb-6 uppercase tracking-widest text-xs">Brand Agent</p>
              <h1 className="max-w-[14ch]">
                Converse diretamente com a marca.
              </h1>
              <p className="type-lead mt-6 max-w-xl opacity-80">
                O agente opera com o brand system completo como contexto —
                20 seções, frases sagradas, léxico canônico, gabaritos por
                peça e critérios de validação. Tudo o que a marca documentou,
                disponível em tempo real.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["Copy", "Validação", "Governança", "Adaptação"].map((tag) => (
                  <span
                    key={tag}
                    className="type-mono text-xs px-3 py-1 border border-[--color-border] text-[--color-fg-muted]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CAPACIDADES ===== */}
      <div className="border-b border-[--color-border]">
        <div className="container-wide py-14">
          <p className="type-mono text-[--color-fg-muted] mb-10 uppercase tracking-widest text-xs">
            O que o agente faz
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[--color-border]">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.label} className="bg-[--color-bg-elevated] p-8 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[--color-accent] shrink-0" />
                    <p className="font-medium text-base">{cap.label}</p>
                  </div>
                  <p className="text-sm text-[--color-fg-muted] leading-relaxed">
                    {cap.description}
                  </p>
                  <ul className="mt-auto space-y-2">
                    {cap.items.map((item) => (
                      <li key={item} className="text-xs text-[--color-fg-muted] flex gap-2">
                        <span className="text-[--color-accent] shrink-0 mt-px">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== COMO USAR ===== */}
      <div className="border-b border-[--color-border]">
        <div className="container-wide py-14">
          <p className="type-mono text-[--color-fg-muted] mb-10 uppercase tracking-widest text-xs">
            Como usar
          </p>
          <div className="grid md:grid-cols-3 gap-[1px] bg-[--color-border]">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="bg-[--color-bg-elevated] p-8">
                <p
                  className="type-mono text-4xl font-light mb-6 leading-none"
                  style={{ color: "var(--color-accent)" }}
                >
                  {step.step}
                </p>
                <p className="font-medium text-base mb-3">{step.title}</p>
                <p className="text-sm text-[--color-fg-muted] leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 border border-[--color-border] bg-[--color-bg-alt] px-6 py-4">
            <p className="text-sm text-[--color-fg-muted] leading-relaxed max-w-3xl">
              <span className="text-[--color-fg] font-medium">Prioridade de uso:</span>{" "}
              Anthropic (Claude Sonnet) → OpenAI (GPT-4o) → Google (Gemini 1.5 Pro).
              Sem nenhuma chave, o agente usa o pool da TAG* ou Groq como fallback.
            </p>
          </div>
        </div>
      </div>

      {/* ===== CHAT ===== */}
      <div className="h-[calc(100vh-8rem)] min-h-[640px] flex flex-col">
        <BrandAgentChat
          clientSlug={slug}
          clientName={client.manifest.name}
          suggestions={SUGGESTIONS}
        />
      </div>
    </div>
  );
}
