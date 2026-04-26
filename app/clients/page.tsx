import { Eyebrow, PortalFooter, PortalHeader } from "@/components/tag";
import { clientsDirectory } from "@/lib/clients-directory";
import { ClientsExplorer } from "./_components/clients-explorer";

export const metadata = {
  title: "Clientes",
  description: "Marcas hospedadas no Bionic Brand OS.",
};

export default function ClientsPage() {
  return (
    <>
      <PortalHeader active="clients" />

      <section className="surface-deep border-b border-[--color-border]">
        <div className="container-wide py-20 md:py-28">
          <Eyebrow className="opacity-70">Clientes</Eyebrow>
          <h1 className="mt-8 max-w-[18ch]">
            Cada marca, uma fonte única de verdade.
          </h1>
          <p className="type-lead mt-8 max-w-2xl opacity-80">
            Espaços hospedados no Bionic Brand OS operam com o mesmo stack:
            Brand System, Design System, Design Tokens, Brand API, Brand Prompt
            e Brand Agent. Coerente para humanos, legível para máquinas.
          </p>
        </div>
      </section>

      <ClientsExplorer clients={clientsDirectory} />

      <PortalFooter />
    </>
  );
}
