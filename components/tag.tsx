import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * TAG* wordmark logo. Defaults to the short variant (TAG + asterisk).
 */
export function TagLogo({
  variant = "short",
  theme = "black",
  className,
  width = 72,
  height,
}: {
  variant?: "icon" | "short" | "full";
  theme?: "black" | "white";
  className?: string;
  width?: number;
  height?: number;
}) {
  const src = `/tag/${variant === "icon" ? "icon" : `logo-${variant}`}-${theme}.svg`;
  const aspect = variant === "icon" ? 1 : variant === "short" ? 2.2 : 4.8;
  const computedHeight = height ?? Math.round(width / aspect);

  return (
    <Image
      src={src}
      alt="TAG*"
      width={width}
      height={computedHeight}
      className={className}
      priority
    />
  );
}

/**
 * The TAG asterisk as a standalone graphic element.
 * Reuses the TAG icon SVG.
 */
export function Asterisk({
  size = 16,
  theme = "black",
  className,
}: {
  size?: number;
  theme?: "black" | "white";
  className?: string;
}) {
  return (
    <Image
      src={`/tag/icon-${theme}.svg`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
    />
  );
}

/**
 * Compact eyebrow label. Mono font, uppercase, with optional bullet prefix.
 */
export function Eyebrow({
  children,
  bullet = true,
  className,
}: {
  children: ReactNode;
  bullet?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "type-eyebrow",
        bullet && "type-bullet",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Pill CTA. Variants mirror the TAG Style Guide.
 */
type PillProps = {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  className?: string;
  arrow?: boolean;
  external?: boolean;
};

export function Pill({
  href,
  children,
  variant = "primary",
  className,
  arrow = false,
  external = false,
}: PillProps) {
  const classes = cn(
    "btn-pill",
    variant === "primary" && "btn-pill-primary",
    variant === "secondary" && "btn-pill-secondary",
    variant === "ghost" && "btn-pill-ghost",
    variant === "inverse" && "btn-pill-inverse",
    className,
  );

  const content = (
    <>
      {children}
      {arrow && (
        <span className="inline-block translate-y-[1px]" aria-hidden>
          →
        </span>
      )}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}

/**
 * TAG portal chrome header. Logo left, nav right, optional theme toggle.
 */
export function PortalHeader({
  active,
}: {
  active?: "home" | "manifesto" | "clients";
}) {
  const nav: Array<{ label: string; href: string; key: string }> = [
    { label: "Manifesto", href: "/manifesto", key: "manifesto" },
    { label: "Clientes", href: "/clients", key: "clients" },
  ];

  return (
    <header className="border-b border-[--color-border] bg-[--color-bg]">
      <div className="container-wide flex items-center justify-between py-5">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
          aria-label="TAG, Thinking Animals Group"
        >
          <TagLogo variant="short" theme="black" width={60} />
        </Link>
        <nav className="flex items-center gap-7 text-sm">
          {nav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "transition-colors",
                active === item.key
                  ? "text-[--color-fg] font-medium"
                  : "text-[--color-fg-muted] hover:text-[--color-fg]",
              )}
            >
              {item.label}
            </Link>
          ))}
          <span className="h-4 w-px bg-[--color-border] mx-1" />
          <span className="type-eyebrow !text-[0.625rem]">PT</span>
        </nav>
      </div>
    </header>
  );
}

/**
 * TAG portal footer. Features the TAG* wordmark in bleed at the bottom.
 */
export function PortalFooter() {
  return (
    <footer className="bg-[--color-bg-inverse] text-[--color-fg-inverse] mt-auto">
      <div className="container-wide pt-20 pb-0">
        <div className="grid md:grid-cols-4 gap-10 pb-16">
          <div className="md:col-span-2">
            <p className="type-eyebrow text-[--color-fg-inverse] opacity-60">
              Bionic Brand OS
            </p>
            <p className="mt-4 max-w-md text-[--color-fg-inverse] opacity-80 leading-relaxed">
              O sistema operacional do Bionic Branding. Marcas que falam com humanos
              e máquinas, na mesma precisão.
            </p>
          </div>
          <div>
            <p className="type-eyebrow text-[--color-fg-inverse] opacity-60">
              Mapa do portal
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/manifesto"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Manifesto
                </Link>
              </li>
              <li>
                <Link
                  href="/clients"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Clientes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="type-eyebrow text-[--color-fg-inverse] opacity-60">
              Contato
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="opacity-80">Florianópolis, SC</li>
              <li>
                <a
                  href="mailto:hello@thinkinganimals.group"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  hello@thinkinganimals.group
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* TAG logo bleed — cropped at bottom edge */}
        <div className="border-t border-[--color-border-on-dark] overflow-hidden">
          <div className="relative pt-6" aria-hidden>
            <Image
              src="/tag/logo-short-white.svg"
              alt=""
              width={1000}
              height={324}
              className="w-full h-auto select-none block mb-[-1.2%]"
              priority={false}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Tonal section wrapper. Sets the surface (canvas/elevated/stone/recessed/deep),
 * remaps fg-muted/border tokens automatically on dark surfaces, and provides
 * consistent vertical rhythm. Children read --color-fg-muted etc. as usual.
 */
type SectionTone = "canvas" | "elevated" | "deep";

export function Section({
  tone = "canvas",
  as: Tag = "section",
  bleed = false,
  className,
  contentClassName,
  children,
  id,
}: {
  tone?: SectionTone;
  as?: "section" | "div" | "article" | "header" | "footer";
  /** When true, content fills full width with no container-wide wrapper. */
  bleed?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  id?: string;
}) {
  const surfaceClass =
    tone === "elevated"
      ? "surface-elevated"
      : tone === "deep"
        ? "surface-deep"
        : "surface-canvas";

  return (
    <Tag id={id} className={cn(surfaceClass, className)}>
      {bleed ? (
        children
      ) : (
        <div className={cn("container-wide py-20 md:py-28", contentClassName)}>
          {children}
        </div>
      )}
    </Tag>
  );
}

/**
 * A photo with an editorial caption below. Used across client pages.
 */
export function EditorialPhoto({
  src,
  alt,
  caption,
  ratio = "landscape",
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: "landscape" | "portrait" | "square";
  priority?: boolean;
  className?: string;
}) {
  const aspectClass =
    ratio === "landscape"
      ? "aspect-[16/10]"
      : ratio === "portrait"
        ? "aspect-[4/5]"
        : "aspect-square";

  return (
    <figure className={cn("w-full", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden bg-[--color-bg-alt]",
          aspectClass,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          className="object-cover"
          priority={priority}
        />
      </div>
      {caption && (
        <figcaption className="mt-3 type-mono text-[--color-fg-muted]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
