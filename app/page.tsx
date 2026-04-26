import Link from "next/link";

import { Eyebrow, Pill, PortalFooter, PortalHeader } from "@/components/tag";
import { clientsDirectory } from "@/lib/clients-directory";

export default function Home() {
  const activeClients = clientsDirectory.filter((c) => c.status === "active");
  const comingSoonCount = clientsDirectory.length - activeClients.length;

  return (
    <>
      <PortalHeader active="home" />

      {/* Hero — canvas */}
      <section className="surface-canvas">
        <div className="container-wide py-24 md:py-36 lg:py-44">
          <h1 className="max-w-[22ch]">
            Bionic Brand OS.<br />
            Marcas que conversam com humanos e&nbsp;máquinas.
          </h1>
          <p className="type-lead mt-10 max-w-2xl">
            O sistema operacional que estrutura sua marca para percepção humana
            e interpretação computacional. Identidade, narrativa e experiência
            de um lado. Contexto, tokens, prompts e agentes do outro. Uma única
            base, dois sistemas de decisão.
          </p>
          <div className="mt-12 flex flex-wrap gap-3">
            <Pill href="/manifesto" variant="ghost" arrow>
              Ler o manifesto
            </Pill>
            <Pill href="/clients" variant="primary" arrow>
              Explorar marcas
            </Pill>
          </div>
        </div>
      </section>

      {/* Manifesto block — deep / black anchor */}
      <section className="surface-deep">
        <div className="container-wide py-24 md:py-36">
          <div className="grid md:grid-cols-[180px_1fr] gap-8">
            <Eyebrow className="opacity-70">Tese</Eyebrow>
            <div>
              <p className="text-3xl md:text-5xl tracking-tight leading-[1.05] max-w-[26ch]">
                Humanos decidem por emoção. Máquinas decidem por clareza. Marcas
                fortes falam os dois idiomas, com a mesma coerência.
              </p>
              <Link
                href="/manifesto"
                className="mt-12 inline-flex items-center gap-2 type-mono opacity-70 hover:opacity-100 transition-opacity"
              >
                Ler o manifesto completo
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Method — canvas */}
      <section className="surface-canvas border-t border-[--color-border]">
        <div className="container-wide py-20 md:py-28">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 mb-16">
            <Eyebrow>Método</Eyebrow>
            <h2 className="max-w-[20ch]">
              O que entrega um Bionic Brand OS.
            </h2>
          </div>

          <ol className="grid md:grid-cols-3 gap-[1px] bg-[--color-border]">
            {[
              {
                n: "01",
                title: "Brand System",
                body: "Essência, posicionamento, arquétipos, vocabulário, governança. O documento que responde às perguntas centrais da marca.",
              },
              {
                n: "02",
                title: "Design System",
                body: "Cores, tipografia, hierarquia, componentes, tokens. A identidade visual deixa de depender de interpretação.",
              },
              {
                n: "03",
                title: "Brand API",
                body: "A inteligência da marca em formato estruturado. Consultável por sistemas, ferramentas, agentes.",
              },
              {
                n: "04",
                title: "Brand Prompt",
                body: "Prompt-mestre destilado. Claude, GPT, Cursor e qualquer IA trabalham com contexto real de marca.",
              },
              {
                n: "05",
                title: "Brand Agent",
                body: "Marca disponível em formato conversacional. Perguntas ao invés de documentos longos.",
              },
              {
                n: "06",
                title: "Portal",
                body: "Tudo acima em uma interface viva, navegável, versionada. Fonte única de verdade.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="bg-[--color-bg-alt] p-8 md:p-10 flex flex-col gap-4 min-h-[280px]"
              >
                <p className="type-mono text-[--color-fg-muted]">{step.n}</p>
                <h3 className="type-h3">{step.title}</h3>
                <p className="text-[--color-fg-muted] leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Clients portfólio — deep (black) */}
      <section className="surface-deep">
        <div className="container-wide py-20 md:py-28">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 mb-14">
            <Eyebrow>Portfólio</Eyebrow>
            <div>
              <h2 className="max-w-[20ch]">
                {clientsDirectory.length} marcas no portal.
              </h2>
              <p className="mt-4 type-mono opacity-70">
                {activeClients.length} liberada · {comingSoonCount} restritas
              </p>
            </div>
          </div>

          {activeClients.length > 0 && (
            <>
              <p className="type-mono opacity-70 mb-4">Liberada agora</p>
              <ul className="divide-y divide-[--color-border-on-dark] border-y border-[--color-border-on-dark] mb-12">
                {activeClients.map((client) => (
                  <li key={client.slug}>
                    <Link
                      href={`/${client.slug}`}
                      className="grid grid-cols-[60px_1fr_auto] items-baseline gap-6 py-8 group hover:bg-[rgba(255,255,255,0.04)] transition-colors -mx-5 md:-mx-8 px-5 md:px-8"
                    >
                      <span className="type-mono opacity-60">01</span>
                      <div>
                        <h3 className="type-h2">{client.name}</h3>
                        <p className="mt-2 opacity-70">
                          {client.role} ·{" "}
                          <span className="italic">{client.description}</span>
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[--color-bg-elevated] text-[--color-bg-inverse] flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[--color-bg-inverse]" />
                        Liberada
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="flex items-center justify-between">
            <p className="type-mono opacity-70 max-w-xl">
              Explorar o diretório completo com busca e filtros.
            </p>
            <Pill href="/clients" variant="inverse" arrow>
              Ver {clientsDirectory.length} marcas
            </Pill>
          </div>
        </div>
      </section>

      <PortalFooter />
    </>
  );
}
