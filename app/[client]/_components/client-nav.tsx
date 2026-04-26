"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = {
  index: number;
  label: string;
  href: string;
  description?: string;
};

type Group = {
  key: string;
  label: string;
  step: string;
  items: Item[];
};

export function ClientNav({
  slug,
  clientName,
}: {
  slug: string;
  clientName: string;
}) {
  const pathname = usePathname();
  const base = `/${slug}`;

  const overview: Item = {
    index: 0,
    label: "Visão geral",
    href: base,
    description: "Mapa do brand interface",
  };

  const groups: Group[] = [
    {
      key: "sistema",
      label: "Sistema",
      step: "I",
      items: [
        { index: 1, label: "Essência", href: `${base}/essence`, description: "Núcleo estratégico" },
        { index: 2, label: "Método", href: `${base}/method`, description: "Método proprietário" },
        { index: 3, label: "Arquitetura", href: `${base}/architecture`, description: "Posicionamento e ofertas" },
        { index: 4, label: "Público", href: `${base}/audience`, description: "Persona, perfis, tribos" },
      ],
    },
    {
      key: "expressao",
      label: "Expressão",
      step: "II",
      items: [
        { index: 5, label: "Verbal", href: `${base}/verbal`, description: "Tom, frases, manifesto" },
        { index: 6, label: "Visual", href: `${base}/visual`, description: "Design system" },
        { index: 7, label: "Aplicação", href: `${base}/application`, description: "Gabaritos e matriz" },
      ],
    },
    {
      key: "operacao",
      label: "Operação",
      step: "III",
      items: [
        { index: 8, label: "Governança", href: `${base}/governance`, description: "Regras de evolução" },
        { index: 9, label: "Ativos e API", href: `${base}/assets`, description: "Downloads e endpoints" },
        { index: 10, label: "Brand Agent", href: `${base}/agent`, description: "Conversa com a marca" },
      ],
    },
  ];

  const isActive = (item: Item) =>
    item.href === base
      ? pathname === base
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const overviewActive = isActive(overview);

  return (
    <aside className="lg:w-[280px] lg:shrink-0 lg:border-r lg:border-[--color-border] bg-[--color-bg]">
      <nav className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        {/* Client name */}
        <div className="px-6 pt-8 pb-6 border-b border-[--color-border]">
          <p className="type-eyebrow opacity-70">{clientName}</p>
        </div>

        {/* Overview — own block; goes dark when active */}
        <div
          className={cn(
            "px-3 py-4",
            overviewActive && "surface-deep",
          )}
        >
          <NavItem item={overview} active={overviewActive} dark={overviewActive} />
        </div>

        {/* Chapters */}
        <div className="pb-10">
          {groups.map((group) => {
            const isCurrentGroup = group.items.some(isActive);
            return (
              <div
                key={group.key}
                className={cn(
                  "px-3 pt-5 pb-4",
                  isCurrentGroup && "surface-deep",
                )}
              >
                <div className="px-3 mb-3 flex items-baseline gap-2.5">
                  <span
                    className={cn(
                      "type-mono tabular-nums tracking-[0.18em]",
                      isCurrentGroup
                        ? "text-white"
                        : "text-[--color-fg-faint]",
                    )}
                  >
                    {group.step}
                  </span>
                  <span
                    className={cn(
                      "type-eyebrow !text-[0.65rem]",
                      isCurrentGroup
                        ? "!text-white opacity-100"
                        : "opacity-55",
                    )}
                  >
                    {group.label}
                  </span>
                </div>
                <ul className="space-y-[1px]">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <NavItem
                        item={item}
                        active={isActive(item)}
                        dark={isCurrentGroup}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

function NavItem({
  item,
  active,
  dark,
}: {
  item: Item;
  active: boolean;
  dark: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "block rounded-[2px] px-3 py-2 transition-colors",
        dark
          ? active
            ? "bg-white/15 text-white"
            : "text-white/55 hover:text-white hover:bg-white/[0.06]"
          : active
            ? "bg-[--color-fg] text-[--color-bg]"
            : "text-[--color-fg] hover:bg-[rgba(17,17,17,0.06)]",
      )}
    >
      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            "type-mono tabular-nums shrink-0",
            dark
              ? active
                ? "text-white/70"
                : "text-white/45"
              : active
                ? "opacity-60"
                : "text-[--color-fg-muted]",
          )}
        >
          {String(item.index).padStart(2, "0")}
        </span>
        <span
          className={cn(
            "text-[0.9375rem] leading-snug",
            active && "font-medium",
          )}
        >
          {item.label}
        </span>
      </div>
      {active && item.description && (
        <p
          className={cn(
            "mt-1 ml-8 text-[0.75rem]",
            dark ? "opacity-60" : "opacity-70",
          )}
        >
          {item.description}
        </p>
      )}
    </Link>
  );
}
