"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ClientCategory,
  type ClientEntry,
} from "@/lib/clients-directory";

type StatusFilter = "all" | "active" | "coming-soon";

type Props = {
  clients: ClientEntry[];
};

// Remove accents for alphabetical grouping + search.
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function ClientsExplorer({ clients }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<ClientCategory | "all">("all");

  const total = clients.length;
  const activeCount = clients.filter((c) => c.status === "active").length;

  const filtered = useMemo(() => {
    const q = normalize(query);
    return clients.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (category !== "all" && c.category !== category) return false;
      if (!q) return true;
      return (
        normalize(c.name).includes(q) ||
        normalize(c.role).includes(q) ||
        normalize(c.description).includes(q)
      );
    });
  }, [clients, query, status, category]);

  // Group by first letter (alphabetical), sorted.
  const grouped = useMemo(() => {
    const sorted = [...filtered].sort((a, b) =>
      normalize(a.name).localeCompare(normalize(b.name), "pt-BR"),
    );
    const groups = new Map<string, ClientEntry[]>();
    for (const c of sorted) {
      const letter = normalize(c.name).charAt(0).toUpperCase();
      const arr = groups.get(letter) ?? [];
      arr.push(c);
      groups.set(letter, arr);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  // Count clients per category (for chip meta)
  const categoryCounts = useMemo(() => {
    const counts = new Map<ClientCategory, number>();
    for (const c of clients) {
      counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    }
    return counts;
  }, [clients]);

  const categories: Array<{
    key: ClientCategory | "all";
    label: string;
    count: number;
  }> = [
    { key: "all", label: "Todas", count: clients.length },
    ...CATEGORY_ORDER.map((k) => ({
      key: k as ClientCategory,
      label: CATEGORY_LABELS[k],
      count: categoryCounts.get(k) ?? 0,
    })).filter((c) => c.count > 0),
  ];

  return (
    <div>
      {/* Stats bar */}
      <div className="container-wide border-b border-[--color-border]">
        <div className="grid grid-cols-3 gap-4 py-6 md:py-8">
          <Stat label="Total" value={total} />
          <Stat label="Liberadas" value={activeCount} accent />
          <Stat label="Restritas" value={total - activeCount} muted />
        </div>
      </div>

      {/* Controls */}
      <div className="container-wide py-6 border-b border-[--color-border] sticky top-0 bg-[--color-bg] z-20 backdrop-blur-md bg-[--color-bg]/90">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-fg-muted]" />
            <input
              type="search"
              placeholder="Buscar por nome, função ou descrição..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-[--color-bg-alt] border border-transparent focus:border-[--color-border-strong] focus:bg-[--color-bg] focus:outline-none transition-colors text-base rounded-full"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[--color-fg-muted] hover:text-[--color-fg] transition-colors"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-mono text-[--color-fg-muted] mr-2">
              Status
            </span>
            <Chip
              active={status === "all"}
              onClick={() => setStatus("all")}
            >
              Todos
            </Chip>
            <Chip
              active={status === "active"}
              onClick={() => setStatus("active")}
            >
              Liberadas
            </Chip>
            <Chip
              active={status === "coming-soon"}
              onClick={() => setStatus("coming-soon")}
            >
              Restritas
            </Chip>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-mono text-[--color-fg-muted] mr-2">
              Categoria
            </span>
            {categories.map((c) => (
              <Chip
                key={c.key}
                active={category === c.key}
                onClick={() => setCategory(c.key)}
              >
                {c.label}
                <span className="opacity-60 ml-1.5 tabular-nums">
                  {c.count}
                </span>
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-wide py-12 md:py-16">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="type-mono text-[--color-fg-muted] mb-3">
              Sem resultados
            </p>
            <p className="text-xl">
              Nenhuma marca encontrada para &ldquo;{query}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("all");
                setCategory("all");
              }}
              className="btn-pill btn-pill-ghost mt-8"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            <p className="type-mono text-[--color-fg-muted] mb-10">
              {filtered.length}{" "}
              {filtered.length === 1 ? "resultado" : "resultados"}
            </p>
            <div className="space-y-12">
              {grouped.map(([letter, items]) => (
                <section
                  key={letter}
                  className="grid md:grid-cols-[80px_1fr] gap-4 md:gap-8"
                >
                  <div className="md:sticky md:top-48 md:self-start">
                    <p className="type-display text-[--color-fg-faint] leading-none !text-[4rem] md:!text-[5rem]">
                      {letter}
                    </p>
                  </div>
                  <ul className="divide-y divide-[--color-border] border-t border-b border-[--color-border]">
                    {items.map((client) => (
                      <ClientRow key={client.slug} client={client} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="type-mono text-[--color-fg-muted] mb-3">{label}</p>
      <p
        className={cn(
          "text-4xl md:text-5xl font-medium tabular-nums tracking-tight",
          accent && "text-[--color-fg]",
          muted && "text-[--color-fg-faint]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-xs px-3 py-1.5 rounded-full border transition-colors",
        active
          ? "bg-[--color-fg] text-[--color-bg] border-[--color-fg]"
          : "bg-transparent text-[--color-fg-muted] border-[--color-border] hover:border-[--color-border-strong] hover:text-[--color-fg]",
      )}
    >
      {children}
    </button>
  );
}

function ClientRow({ client }: { client: ClientEntry }) {
  const isActive = client.status === "active";
  const content = (
    <div className="grid grid-cols-[1fr_auto] md:grid-cols-[180px_1fr_auto_auto] items-baseline gap-4 md:gap-8 py-6">
      <p className="type-mono text-[--color-fg-muted] hidden md:block">
        {CATEGORY_LABELS[client.category]}
      </p>
      <div>
        <h3 className="text-2xl md:text-3xl tracking-tight leading-tight">
          {client.name}
        </h3>
        <p className="type-mono text-[--color-fg-muted] mt-1 md:hidden">
          {CATEGORY_LABELS[client.category]}
        </p>
        <p className="text-sm text-[--color-fg-muted] mt-2 italic">
          {client.role}
        </p>
        <p className="text-sm mt-1 text-[--color-fg] max-w-xl">
          {client.description}
        </p>
      </div>
      <StatusBadge status={client.status} />
      {isActive ? (
        <ArrowUpRight className="w-5 h-5 text-[--color-fg-muted] group-hover:text-[--color-fg] transition-colors" />
      ) : (
        <span className="w-5 h-5" aria-hidden />
      )}
    </div>
  );

  if (isActive) {
    return (
      <li>
        <Link
          href={`/${client.slug}`}
          className="group block hover:bg-[--color-bg-alt] transition-colors -mx-5 md:-mx-8 px-5 md:px-8"
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li className="opacity-60 -mx-5 md:-mx-8 px-5 md:px-8">{content}</li>
  );
}

function StatusBadge({ status }: { status: "active" | "coming-soon" }) {
  if (status === "active") {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-[--color-fg] text-[--color-bg] flex items-center gap-1.5 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[--color-bg]" />
        Liberada
      </span>
    );
  }
  return (
    <span className="text-xs px-2.5 py-1 rounded-full bg-[--color-bg-alt] text-[--color-fg-muted] whitespace-nowrap">
      Restrita
    </span>
  );
}
