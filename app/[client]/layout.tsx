import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getClient, listClients } from "@/lib/content";
import { TagLogo } from "@/components/tag";
import { ClientNav } from "./_components/client-nav";

type Props = {
  children: ReactNode;
  params: Promise<{ client: string }>;
};

export default async function ClientLayout({ children, params }: Props) {
  const { client: slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();

  const { manifest } = client;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Chrome: TAG → cliente breadcrumb. Portal sempre opera com tokens TAG.
          A identidade visual da marca aparece como conteúdo na rota /visual. */}
      <header className="border-b border-[--color-border] bg-[--color-bg]">
        <div className="container-wide flex items-center justify-between py-5">
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="hover:opacity-70 transition-opacity"
              aria-label="Bionic Brand OS"
            >
              <TagLogo variant="short" theme="black" width={52} />
            </Link>
            <span className="text-[--color-fg-faint]">/</span>
            <Link
              href={`/${slug}`}
              className="text-[1.25rem] tracking-tight hover:opacity-70 transition-opacity"
            >
              {manifest.name}
            </Link>
          </div>

          <div className="flex items-center gap-6 text-xs text-[--color-fg-muted]">
            <span className="tabular-nums hidden sm:inline font-mono">
              Brand System v{manifest.versions.brandSystem}
            </span>
            <Link
              href={`/${slug}/agent`}
              className="btn-pill btn-pill-primary !py-2 !px-4 !text-xs"
            >
              Brand Agent
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        <ClientNav slug={slug} clientName={manifest.name} />
        <main className="flex-1 min-w-0 bg-[--color-bg]">{children}</main>
      </div>

      <footer className="border-t border-[--color-border] bg-[--color-bg]">
        <div className="container-wide py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[--color-fg-muted]">
          <p>
            {manifest.name} · Operado no Bionic Brand OS
          </p>
          <p className="italic">{manifest.essence.pt}</p>
        </div>
      </footer>
    </div>
  );
}

export function generateStaticParams() {
  return listClients().map((m) => ({ client: m.slug }));
}
