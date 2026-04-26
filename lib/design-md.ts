// Gera DESIGN.md (formato @google/design.md, spec alpha) a partir do
// design-tokens.json + brand-system.json de um cliente do BBO.
//
// Filosofia: preserva a estrutura nativa dos tokens da marca (não achata
// cores em primary/secondary/tertiary genéricos). Usa nomes compostos
// permitidos pelo spec (`surface-primary`, `accent-default`, etc.).
//
// Spec ref: https://github.com/google-labs-code/design.md
//           docs/spec.md (também via `npx @google/design.md spec`)

import type { BrandSystem, DesignTokens, ClientManifest } from "./content";

type Hex = `#${string}`;

type ColorToken = {
  value: string;
  framerPath?: string;
  notes?: string;
  description?: string;
};

type TypographyToken = {
  framerPath?: string;
  fontFamily: "serif" | "sans";
  fontWeight: number;
  fontSize: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  sample?: string;
};

type ButtonVariant = {
  background?: string;
  text?: string;
  notes?: string;
};

export function buildDesignMd(
  slug: string,
  manifest: ClientManifest,
  tokens: DesignTokens,
  brandSystem: BrandSystem,
): string {
  const t = tokens as unknown as Record<string, unknown>;
  const bs = brandSystem as unknown as Record<string, unknown>;

  const yaml = buildYamlFrontmatter(slug, manifest, t);
  const overview = buildOverview(manifest, bs);
  const colors = buildColorsProse(t);
  const typography = buildTypographyProse(t);
  const layout = buildLayoutProse(t);
  const shapes = buildShapesProse(t);
  const components = buildComponentsProse(t);
  const dosAndDonts = buildDosAndDonts(t);

  return [
    yaml,
    "",
    `# ${manifest.name} — Design System`,
    "",
    overview,
    colors,
    typography,
    layout,
    shapes,
    components,
    dosAndDonts,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ============================================================
// YAML FRONT MATTER
// ============================================================

function buildYamlFrontmatter(
  slug: string,
  manifest: ClientManifest,
  t: Record<string, unknown>,
): string {
  const lines: string[] = ["---", "version: alpha"];
  lines.push(`name: ${yamlString(manifest.name)}`);
  if (manifest.essence?.en) {
    lines.push(`description: ${yamlString(manifest.essence.en)}`);
  }

  // === Colors ===
  // Spec @google/design.md aceita só HEX 6-digit (sem alpha). Cores com
  // transparência ficam fora do YAML (mas aparecem na prosa com contexto
  // sobre qual fundo são aplicadas — alpha precisa de contexto que token
  // cru não captura).
  lines.push("colors:");
  const colorBlock = (t.color ?? {}) as Record<string, Record<string, ColorToken>>;
  for (const [group, members] of Object.entries(colorBlock)) {
    if (!members || typeof members !== "object") continue;
    for (const [name, def] of Object.entries(members)) {
      if (name === "_meta" || !def?.value) continue;
      const parsed = colorToHexParts(def.value);
      if (!parsed || parsed.alpha < 1) continue; // pula cores com alpha
      const tokenName = `${group}-${name}`.replace(/_/g, "-").toLowerCase();
      lines.push(`  ${tokenName}: ${yamlString(parsed.hex)}`);
    }
  }

  // === Typography ===
  const typographyBlock = (t.typography ?? {}) as Record<string, TypographyToken>;
  const fontFamilies = (t.font as { family?: { serif?: { value?: string }; sans?: { value?: string } } })?.family ?? {};
  if (Object.keys(typographyBlock).length > 0) {
    lines.push("typography:");
    for (const [name, def] of Object.entries(typographyBlock)) {
      if (!def?.fontSize) continue;
      const family = def.fontFamily === "serif"
        ? primaryFamily(fontFamilies.serif?.value)
        : primaryFamily(fontFamilies.sans?.value);
      lines.push(`  ${name}:`);
      if (family) lines.push(`    fontFamily: ${yamlString(family)}`);
      lines.push(`    fontSize: ${yamlString(def.fontSize)}`);
      if (def.fontWeight) lines.push(`    fontWeight: ${def.fontWeight}`);
      if (def.lineHeight) lines.push(`    lineHeight: ${yamlString(def.lineHeight)}`);
      if (def.letterSpacing && def.letterSpacing !== "normal" && def.letterSpacing !== "0") {
        lines.push(`    letterSpacing: ${yamlString(def.letterSpacing)}`);
      }
    }
  }

  // === Spacing ===
  const spacingBlock = (t.spacing ?? {}) as Record<string, { value?: string }>;
  if (Object.keys(spacingBlock).length > 0) {
    lines.push("spacing:");
    for (const [name, def] of Object.entries(spacingBlock)) {
      if (!def?.value) continue;
      const safeName = name.replace(/-/g, "_"); // YAML keys com hífen + número confundem alguns parsers
      lines.push(`  "${safeName}": ${yamlString(def.value)}`);
    }
  }

  // === Rounded ===
  // Spec exige Dimension (number+unit) — "0" sem unidade vira "0px".
  const radiusBlock = (t.radius ?? {}) as Record<string, { value?: string }>;
  if (Object.keys(radiusBlock).length > 0) {
    lines.push("rounded:");
    for (const [name, def] of Object.entries(radiusBlock)) {
      if (!def?.value) continue;
      const v = def.value === "0" ? "0px" : def.value;
      lines.push(`  ${name}: ${yamlString(v)}`);
    }
  }

  // === Components ===
  const buttonBlock = (t.component as { button?: { variants?: Record<string, ButtonVariant> } })?.button;
  const variants = buttonBlock?.variants;
  if (variants && Object.keys(variants).length > 0) {
    lines.push("components:");
    for (const [variant, spec] of Object.entries(variants)) {
      if (!spec?.background) continue;
      const bg = colorToHexParts(spec.background);
      const fg = spec.text ? colorToHexParts(spec.text) : null;
      if (!bg || bg.alpha < 1) continue; // pula variantes com bg transparente
      lines.push(`  button-${variant}:`);
      lines.push(`    backgroundColor: ${yamlString(bg.hex)}`);
      if (fg && fg.alpha === 1) lines.push(`    textColor: ${yamlString(fg.hex)}`);
      lines.push(`    rounded: "{rounded.button}"`);
    }
  }

  lines.push("---");
  return lines.join("\n");
}

// ============================================================
// PROSE — sections
// ============================================================

function buildOverview(manifest: ClientManifest, bs: Record<string, unknown>): string {
  const core = (bs.core ?? {}) as {
    essence?: { pt?: string; en?: string };
    positioning?: { pt?: string };
    signature?: { en?: string; pt?: string };
  };
  const essence = core.essence?.pt ?? manifest.essence?.pt ?? "";
  const positioning = core.positioning?.pt ?? manifest.positioning?.pt ?? "";

  return [
    "## Overview",
    "",
    essence,
    "",
    positioning,
    "",
    `Identidade verbal e visual de **${manifest.name}**, organizada como sistema operacional pelo Bionic Brand OS — pra humanos, agentes e máquinas operarem com a mesma coerência.`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildColorsProse(t: Record<string, unknown>): string {
  const colorBlock = (t.color ?? {}) as Record<string, Record<string, ColorToken>>;
  const lines: string[] = ["## Colors", ""];

  const groupTitles: Record<string, string> = {
    surface: "Superfícies",
    accent: "Acento",
    text: "Texto",
    border: "Bordas",
    overlay: "Overlays",
    feedback: "Feedback",
    legacyWeb: "Cores legadas (em transição)",
  };

  for (const [group, members] of Object.entries(colorBlock)) {
    if (!members || typeof members !== "object") continue;
    const colors = Object.entries(members).filter(([k, v]) => k !== "_meta" && v?.value);
    if (colors.length === 0) continue;
    lines.push(`### ${groupTitles[group] ?? group}`, "");
    for (const [name, def] of colors) {
      const parsed = colorToHexParts(def.value);
      if (!parsed) continue;
      const tokenName = `${group}-${name}`.replace(/_/g, "-").toLowerCase();
      const note = def.notes ?? def.description ?? "";
      const alphaTag = parsed.alpha < 1 ? ` · alpha ${Math.round(parsed.alpha * 100)}%` : "";
      lines.push(`- **\`${tokenName}\`** \`${parsed.hex}\`${alphaTag}${note ? ` — ${note}` : ""}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

function buildTypographyProse(t: Record<string, unknown>): string {
  const typographyBlock = (t.typography ?? {}) as Record<string, TypographyToken>;
  const fontFamilies = (t.font as { family?: { serif?: { value?: string }; sans?: { value?: string } } })?.family ?? {};
  const serifFamily = primaryFamily(fontFamilies.serif?.value) || "—";
  const sansFamily = primaryFamily(fontFamilies.sans?.value) || "—";

  const rules = (t.typographyRules ?? {}) as {
    headingsNeverColored?: boolean;
    headingsNeverUppercase?: boolean;
    labelsAlwaysUppercase?: boolean;
    letterSpacingNegativeThreshold?: string;
  };

  const lines = ["## Typography", ""];
  lines.push(
    `Duas famílias trabalham juntas: **${serifFamily}** (serif) pra hierarquia editorial e **${sansFamily}** (sans) pro funcional.`,
    "",
  );

  if (Object.keys(typographyBlock).length > 0) {
    lines.push("### Escala", "");
    for (const [name, def] of Object.entries(typographyBlock)) {
      if (!def?.fontSize) continue;
      lines.push(
        `- **\`${name}\`** — ${def.fontFamily} ${def.fontWeight ?? ""}, ${def.fontSize}${def.lineHeight ? `, line-height ${def.lineHeight}` : ""}${def.letterSpacing && def.letterSpacing !== "normal" ? `, tracking ${def.letterSpacing}` : ""}`,
      );
    }
    lines.push("");
  }

  if (Object.keys(rules).length > 0) {
    lines.push("### Regras", "");
    if (rules.headingsNeverColored) lines.push("- Headings nunca recebem cor — sempre na cor de texto canônica.");
    if (rules.headingsNeverUppercase) lines.push("- Headings nunca em uppercase.");
    if (rules.labelsAlwaysUppercase) lines.push("- Labels e eyebrows sempre uppercase.");
    if (rules.letterSpacingNegativeThreshold) lines.push(`- ${rules.letterSpacingNegativeThreshold}`);
    lines.push("");
  }

  return lines.join("\n").trim();
}

function buildLayoutProse(t: Record<string, unknown>): string {
  const spacingBlock = (t.spacing ?? {}) as Record<string, { value?: string; usage?: string }>;
  const layout = (t.layout ?? {}) as Record<string, { value?: string }>;

  const lines = ["## Layout", ""];
  if (layout.containerMaxWidth) {
    lines.push(`Largura máxima de container: **${layout.containerMaxWidth.value}**.`);
  }
  if (layout.containerPaddingDesktop) {
    lines.push(
      `Padding lateral: ${layout.containerPaddingDesktop.value} (desktop), ${layout.containerPaddingMobile?.value ?? "20px"} (mobile).`,
    );
  }
  lines.push("");

  const spacingKeys = Object.entries(spacingBlock).filter(([, v]) => v?.value);
  if (spacingKeys.length > 0) {
    lines.push("### Escala de spacing", "");
    for (const [name, def] of spacingKeys) {
      lines.push(`- **\`${name.replace(/-/g, "_")}\`** ${def.value}${def.usage ? ` — ${def.usage}` : ""}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

function buildShapesProse(t: Record<string, unknown>): string {
  const radius = (t.radius ?? {}) as Record<string, { value?: string; usage?: string }>;
  const lines = ["## Shapes", ""];

  const radiusKeys = Object.entries(radius).filter(([, v]) => v?.value);
  if (radiusKeys.length === 0) {
    lines.push("Cantos retos por padrão; sem radius decorativo.");
    return lines.join("\n").trim();
  }

  for (const [name, def] of radiusKeys) {
    lines.push(`- **\`${name}\`** ${def.value}${def.usage ? ` — ${def.usage}` : ""}`);
  }
  return lines.join("\n").trim();
}

function buildComponentsProse(t: Record<string, unknown>): string {
  const button = (t.component as { button?: { variants?: Record<string, ButtonVariant>; padding?: { value?: string }; forbidden?: Record<string, string> } })?.button;
  if (!button) return "";

  const lines = ["## Components", "", "### Button", ""];
  if (button.padding?.value) lines.push(`Padding: ${button.padding.value}.`);
  lines.push("");

  if (button.variants) {
    for (const [variant, spec] of Object.entries(button.variants)) {
      const bg = spec.background ? colorToHex(spec.background) : "—";
      const fg = spec.text ? colorToHex(spec.text) : "—";
      lines.push(`- **${variant}** — bg ${bg}, text ${fg}${spec.notes ? ` (${spec.notes})` : ""}`);
    }
    lines.push("");
  }

  if (button.forbidden) {
    lines.push("### Button — proibições", "");
    for (const rule of Object.values(button.forbidden)) {
      lines.push(`- ${rule}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

function buildDosAndDonts(t: Record<string, unknown>): string {
  const visualRules = (t.visualRules ?? {}) as { never?: string[] };
  const never = visualRules.never ?? [];
  if (never.length === 0) return "";

  const lines = ["## Do's and Don'ts", "", "### Nunca", ""];
  for (const rule of never) {
    lines.push(`- ${rule}`);
  }
  return lines.join("\n");
}

// ============================================================
// HELPERS
// ============================================================

// Aceita strings de cor "#RRGGBB", "#RRGGBBAA", "rgb(...)" ou "rgba(...)".
// Sempre devolve HEX 6-digit (sem alpha) + alpha separado.
function colorToHexParts(value: string): { hex: Hex; alpha: number } | null {
  const v = value.trim();
  const hex6 = v.match(/^#([\da-f]{6})$/i);
  if (hex6) return { hex: `#${hex6[1].toUpperCase()}` as Hex, alpha: 1 };
  const hex8 = v.match(/^#([\da-f]{6})([\da-f]{2})$/i);
  if (hex8) return {
    hex: `#${hex8[1].toUpperCase()}` as Hex,
    alpha: parseInt(hex8[2], 16) / 255,
  };

  const rgba = v.match(
    /^rgba?\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\s*\)$/i,
  );
  if (rgba) {
    const [, r, g, b, a] = rgba;
    const rr = clamp255(parseFloat(r));
    const gg = clamp255(parseFloat(g));
    const bb = clamp255(parseFloat(b));
    return {
      hex: `#${toHex(rr)}${toHex(gg)}${toHex(bb)}`.toUpperCase() as Hex,
      alpha: a === undefined ? 1 : clampUnit(parseFloat(a)),
    };
  }
  return null;
}

// Wrapper compat — retorna só o HEX 6-digit ou null.
function colorToHex(value: string): Hex | null {
  return colorToHexParts(value)?.hex ?? null;
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, "0");
}
function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function clampUnit(n: number): number {
  return Math.max(0, Math.min(1, n));
}

// Extrai a primeira família CSS de uma stack ('"Spectral", Georgia, serif' → "Spectral").
function primaryFamily(stack: string | undefined): string {
  if (!stack) return "";
  return (stack.split(",")[0] ?? "").replace(/['"]/g, "").trim();
}

// Quoting YAML sem complicar — sempre entre aspas duplas, escape básico.
function yamlString(s: string): string {
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
