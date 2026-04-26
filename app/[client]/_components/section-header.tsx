import { Eyebrow } from "@/components/tag";
import { cn } from "@/lib/utils";

type Tone = "canvas" | "elevated" | "deep";

type Props = {
  eyebrow?: string;
  step?: string;
  title: string;
  description?: string;
  tone?: Tone;
};

const surfaceFor = (tone: Tone) =>
  tone === "deep"
    ? "surface-deep"
    : tone === "elevated"
      ? "surface-elevated"
      : "surface-canvas";

/**
 * Standard header for each page inside the client space.
 * Acts as a chapter marker. Use `tone="deep"` for a full black anchor block.
 */
export function SectionHeader({
  eyebrow,
  step,
  title,
  description,
  tone = "canvas",
}: Props) {
  return (
    <header className={cn(surfaceFor(tone), "border-b border-[--color-border]")}>
      <div className="container-wide py-20 md:py-28">
        {(eyebrow || step) && (
          <div className="flex items-baseline gap-4 mb-8">
            {step && (
              <span className="type-mono tabular-nums tracking-[0.18em] text-[--color-fg-faint]">
                {step}
              </span>
            )}
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          </div>
        )}
        <h1 className="max-w-[20ch]">{title}</h1>
        {description && (
          <p className="mt-8 text-lg md:text-xl text-[--color-fg-muted] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}

/**
 * Label-left + content-right row. Matches TAG Style Guide pattern.
 * Optionally wrap rows in a tonal surface by passing `tone`.
 */
export function Row({
  label,
  children,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  tone?: Tone;
}) {
  if (tone) {
    return (
      <section className={cn(surfaceFor(tone), "border-b border-[--color-border]")}>
        <div className="row-section container-wide">
          <div className="row-section-label">{label}</div>
          <div>{children}</div>
        </div>
      </section>
    );
  }
  return (
    <div className="row-section container-wide">
      <div className="row-section-label">{label}</div>
      <div>{children}</div>
    </div>
  );
}
