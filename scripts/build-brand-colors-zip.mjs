#!/usr/bin/env node
// Builds {slug}-brand-colors.zip — comprehensive palette package for every audience:
// brand owner, print operator, designer, developer, and AI tooling.

import {
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
  statSync,
} from "fs";
import { join, basename } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";
import sharp from "sharp";

import { mdToPdf, closeBrowser } from "./lib/pdf/index.mjs";

const root = process.cwd();
const clientsDir = join(root, "public", "clients");
const contentClientsDir = join(root, "content", "clients");

// Identidade visual do produto BBO (TAG) — usada nos elementos de "embalagem"
// dos artefatos gerados (background, headers, linhas, texto auxiliar).
// As cores DA MARCA-CLIENTE aparecem só dentro dos rectangles de amostra.
// Tudo ao redor é TAG.
//
// Mantenha em sincronia com brand-interface/app/globals.css (paleta acromática
// TAG + BDO Grotesk + IBM Plex Mono).
const BBO_CHROME = {
  bg: "#F2F2F2",        // tag-canvas (off-white dominante)
  bgAlt: "#EDEDED",     // tag-card-grey
  bgWhite: "#FFFFFF",   // bg-elevated
  ink: "#111111",       // tag-black
  inkSoft: "#828282",   // tag-mid-grey
  line: "#D1D1D1",      // tag-line
  fontDisplay: "BDO Grotesk, ui-sans-serif, system-ui, sans-serif",
  fontMono: "ui-monospace, Menlo, monospace",
};

if (!existsSync(clientsDir)) {
  console.error("No public/clients directory.");
  process.exit(1);
}

const slugs = readdirSync(contentClientsDir).filter((name) => {
  const p = join(contentClientsDir, name, "design-tokens.json");
  return existsSync(p);
});

if (slugs.length === 0) {
  console.log("No clients with a design-tokens.json file.");
  process.exit(0);
}

for (const slug of slugs) await buildColorsZipForClient(slug);
await closeBrowser();

// Escreve um .md e gera .pdf paralelo no mesmo path (substituindo extensão).
// docOpts vai pra capa do PDF: { subtitle, docId, eyebrow, title }
async function writeMdAndPdf(filepath, mdContent, manifest, docOpts = {}) {
  writeFileSync(filepath, mdContent);
  const pdf = await mdToPdf(mdContent, {
    brand: manifest.name,
    ...docOpts,
  });
  writeFileSync(filepath.replace(/\.md$/, ".pdf"), pdf);
}

// ============================================================
// Main
// ============================================================
async function buildColorsZipForClient(slug) {
  const tokensPath = join(contentClientsDir, slug, "design-tokens.json");
  const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
  const manifestPath = join(contentClientsDir, slug, "manifest.json");
  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf-8"))
    : { name: slug };

  const palette = extractPalette(tokens);
  console.log(`[${slug}] ${palette.length} cores extraídas`);

  const downloadsDir = join(clientsDir, slug, "downloads");
  if (!existsSync(downloadsDir)) mkdirSync(downloadsDir, { recursive: true });

  const stage = join(tmpdir(), `brand-colors-${slug}-${Date.now()}`);
  mkdirSync(stage, { recursive: true });

  const brandFn = manifest.name; // ex: "Betina Weber" — usado em nomes de arquivo
  const nsKt = pascalCase(manifest.name) + "Colors"; // "BetinaWeberColors"

  // === Estrutura por audiência ===
  const F1 = join(stage, "01 — Para aprovar e decidir");
  const F2 = join(stage, "02 — Para design");
  const F2_ADOBE = join(F2, "Adobe (Illustrator, Photoshop, InDesign)");
  const F2_FIGMA = join(F2, "Figma");
  const F2_GIMP = join(F2, "GIMP, Inkscape, Krita");
  const F2_SWATCH = join(F2, "Swatches individuais");
  const F3 = join(stage, "03 — Para impressão (gráfica)");
  const F4 = join(stage, "04 — Para desenvolvimento (programação)");
  const F4_WEB = join(F4, "Web");
  const F4_IOS = join(F4, "iOS (Swift)");
  const F4_ANDROID = join(F4, "Android (Kotlin)");
  const F4_SCRIPTS = join(F4, "Scripts (JavaScript, TypeScript, Python)");
  const F5 = join(stage, "05 — Para IAs e automações");

  for (const dir of [F1, F2, F2_ADOBE, F2_FIGMA, F2_GIMP, F2_SWATCH, F3, F4, F4_WEB, F4_IOS, F4_ANDROID, F4_SCRIPTS, F5]) {
    mkdirSync(dir, { recursive: true });
  }

  const ctx = { slug, manifest, tokens, palette };
  const contrastData = buildContrastMatrix(ctx);

  // === Raiz ===
  await writeMdAndPdf(join(stage, "LEIA-ME-PRIMEIRO.md"), buildReadme(ctx), manifest, {
    title: "Cores",
    subtitle: "Mapa por papel — dono(a) da marca, designer, gráfica, dev, IA.",
    eyebrow: "Bionic Brand OS · Pacote de cores",
    docId: "00 · LEIA-ME",
  });

  // === 01 — Para aprovar e decidir ===
  const overviewSvg = buildSwatchSvg(ctx);
  writeFileSync(join(F1, "Catálogo visual da paleta.svg"), overviewSvg);
  try {
    await sharp(Buffer.from(overviewSvg), { density: 144 })
      .png()
      .toFile(join(F1, "Catálogo visual da paleta.png"));
    console.log(`  ✓ Catálogo visual da paleta.png`);
  } catch (err) {
    console.warn(`  ! PNG não gerado: ${err.message}`);
  }
  await writeMdAndPdf(join(F1, "Como aprovar uma peça.md"), buildBrandOwnerGuide(ctx), manifest, {
    subtitle: "Pra quem é dono da marca, aprova peças ou contrata fornecedor.",
    docId: "01 · Aprovação editorial",
  });
  await writeMdAndPdf(join(F1, "Regras do accent.md"), buildAccentRulesDoc(ctx), manifest, {
    subtitle: "Protocolo estrito da única cor de acento da marca.",
    docId: "01 · Accent",
  });
  await writeMdAndPdf(join(F1, "Histórico das decisões cromáticas.md"), buildRationaleDoc(ctx), manifest, {
    subtitle: "Caminhos rejeitados e o caminho adotado.",
    docId: "01 · Histórico",
  });

  // === 02 — Para design ===
  // Adobe
  writeFileSync(join(F2_ADOBE, `${brandFn}.ase`), buildAse(ctx));
  await writeMdAndPdf(join(F2_ADOBE, "Como importar no Adobe.md"), buildAdobeHowto(ctx), manifest, {
    subtitle: "Illustrator, Photoshop, InDesign, After Effects.",
    docId: "02 · Adobe",
  });
  // Figma
  writeFileSync(join(F2_FIGMA, `${slug}.tokens.json`), buildFigmaTokens(ctx));
  await writeMdAndPdf(join(F2_FIGMA, "Como importar no Figma.md"), buildFigmaHowto(ctx), manifest, {
    subtitle: "Via plugin Tokens Studio for Figma.",
    docId: "02 · Figma",
  });
  // GIMP / Inkscape / Krita
  writeFileSync(join(F2_GIMP, `${brandFn}.gpl`), buildGpl(ctx));
  await writeMdAndPdf(join(F2_GIMP, "Como importar.md"), buildGimpHowto(ctx), manifest, {
    subtitle: "GIMP, Inkscape, Krita.",
    docId: "02 · Open-source",
  });
  // Swatches individuais — numerados, com label humano
  let i = 1;
  for (const c of palette) {
    const num = String(i).padStart(2, "0");
    const safeName = c.label.replace(/[\\/:*?"<>|]/g, "");
    writeFileSync(join(F2_SWATCH, `${num} — ${safeName}.svg`), buildSwatchSingleSvg(c));
    i++;
  }

  // === 03 — Para impressão (gráfica) ===
  await writeMdAndPdf(join(F3, "LEIA PRIMEIRO — Para a gráfica.md"), buildPrintSpec(ctx), manifest, {
    subtitle: "Documento pra entregar ao operador de impressão.",
    docId: "03 · Gráfica",
  });
  const printSvg = buildPrintSheetSvg(ctx);
  writeFileSync(join(F3, "Folha de cores A4 (pronta pra imprimir).svg"), printSvg);
  try {
    await sharp(Buffer.from(printSvg), { density: 200 })
      .png()
      .toFile(join(F3, "Folha de cores A4 (pronta pra imprimir).png"));
    console.log(`  ✓ Folha de cores A4 (pronta pra imprimir).png`);
  } catch (err) {
    console.warn(`  ! print PNG não gerado: ${err.message}`);
  }
  writeFileSync(join(F3, "Cores em CMYK, LAB e Pantone.json"), buildPrintJson(ctx));

  // === 04 — Para desenvolvimento ===
  // Web
  writeFileSync(join(F4_WEB, "cores.css"), buildCss(ctx));
  writeFileSync(join(F4_WEB, "cores.scss"), buildScss(ctx));
  writeFileSync(join(F4_WEB, "cores.less"), buildLess(ctx));
  writeFileSync(join(F4_WEB, "cores-tailwind-v4.css"), buildTailwindV4(ctx));
  writeFileSync(join(F4_WEB, "cores-tailwind-v3.config.js"), buildTailwind(ctx));
  await writeMdAndPdf(join(F4_WEB, "Como usar.md"), buildWebHowto(ctx), manifest, {
    subtitle: "CSS, SCSS, LESS, Tailwind v3 e v4.",
    docId: "04 · Web",
  });
  // iOS
  writeFileSync(join(F4_IOS, `${nsKt}.swift`), buildIosSwift(ctx));
  await writeMdAndPdf(join(F4_IOS, "Como usar.md"), buildIosHowto(ctx), manifest, {
    subtitle: "SwiftUI, UIKit.",
    docId: "04 · iOS",
  });
  // Android
  writeFileSync(join(F4_ANDROID, "colors.xml"), buildAndroidXml(ctx));
  writeFileSync(join(F4_ANDROID, `${nsKt}.kt`), buildComposeKt(ctx));
  await writeMdAndPdf(join(F4_ANDROID, "Como usar.md"), buildAndroidHowto(ctx), manifest, {
    subtitle: "XML (Views) e Jetpack Compose.",
    docId: "04 · Android",
  });
  // Scripts
  writeFileSync(join(F4_SCRIPTS, "colors.ts"), buildTs(ctx));
  writeFileSync(join(F4_SCRIPTS, "colors.js"), buildJs(ctx));
  writeFileSync(join(F4_SCRIPTS, "colors.py"), buildPython(ctx));
  await writeMdAndPdf(join(F4_SCRIPTS, "Como usar.md"), buildScriptsHowto(ctx), manifest, {
    subtitle: "TypeScript, JavaScript, Python.",
    docId: "04 · Scripts",
  });
  // Acessibilidade no nível 04 (porque é onde realmente importa)
  writeFileSync(
    join(F4, "Contraste WCAG (auditoria de acessibilidade).json"),
    JSON.stringify(contrastData, null, 2),
  );
  await writeMdAndPdf(
    join(F4, "Contraste WCAG (relatório legível).md"),
    buildAccessibilityMd(ctx, contrastData),
    manifest,
    {
      subtitle: "Auditoria de acessibilidade dos pares texto × superfície.",
      docId: "04 · WCAG",
    },
  );

  // === 05 — Para IAs e automações ===
  await writeMdAndPdf(join(F5, "Cole isso no prompt da IA.md"), buildAiContext(ctx), manifest, {
    subtitle: "Bloco compacto pra colar em prompts (Claude, GPT, Cursor, Figma AI).",
    docId: "05 · IA",
  });
  writeFileSync(
    join(F5, "paleta-canônica (todos os formatos).json"),
    buildPaletteJson(ctx),
  );

  const outZip = join(downloadsDir, `${slug}-brand-colors.zip`);
  if (existsSync(outZip)) rmSync(outZip);
  execSync(`cd "${stage}" && zip -rq "${outZip}" .`, { stdio: "inherit" });
  rmSync(stage, { recursive: true, force: true });
  console.log(`[${slug}] → ${basename(outZip)}\n`);
}

// ============================================================
// Palette extraction
// ============================================================
function extractPalette(tokens) {
  const out = [];
  for (const [group, members] of Object.entries(tokens.color || {})) {
    for (const [name, def] of Object.entries(members)) {
      const parsed = parseColor(def.value);
      if (!parsed) continue;
      out.push({
        id: `${group}.${name}`,
        group,
        name,
        label: humanize(`${group} ${name}`),
        framerPath: def.framerPath || null,
        notes: def.notes || def.description || null,
        original: def.value,
        ...colorSpaces(parsed),
        hasAlpha: parsed.a < 1,
      });
    }
  }
  return out;
}

// ============================================================
// Color parsing & conversions
// ============================================================
function parseColor(value) {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  if (v.startsWith("#")) {
    const hex = v.slice(1);
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
    return null;
  }
  const rgba = v.match(
    /rgba?\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\s*\)/i,
  );
  if (rgba) {
    return {
      r: clamp255(parseFloat(rgba[1])),
      g: clamp255(parseFloat(rgba[2])),
      b: clamp255(parseFloat(rgba[3])),
      a: rgba[4] !== undefined ? clampUnit(parseFloat(rgba[4])) : 1,
    };
  }
  return null;
}

function clamp255(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function clampUnit(n) {
  return Math.max(0, Math.min(1, n));
}

function colorSpaces({ r, g, b, a }) {
  const hex = rgbToHex(r, g, b);
  const hexa = a < 1 ? rgbToHexA(r, g, b, a) : null;
  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const rgbaStr = `rgba(${r}, ${g}, ${b}, ${round(a, 2)})`;
  const hsl = rgbToHsl(r, g, b);
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const hslaStr = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${round(a, 2)})`;
  const oklch = rgbToOklch(r, g, b);
  const oklchStr = `oklch(${round(oklch.l, 3)} ${round(oklch.c, 3)} ${round(oklch.h, 1)}${a < 1 ? ` / ${round(a, 2)}` : ""})`;
  const cmyk = rgbToCmyk(r, g, b);
  const cmykStr = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
  const lab = rgbToLab(r, g, b);
  const labStr = `lab(${round(lab.l, 2)}% ${round(lab.a, 2)} ${round(lab.b, 2)})`;
  return {
    hex,
    hexa,
    rgb: { r, g, b, a, css: rgbStr, cssAlpha: rgbaStr },
    hsl: { ...hsl, a, css: hslStr, cssAlpha: hslaStr },
    oklch: { ...oklch, a, css: oklchStr },
    lab: { l: round(lab.l, 2), a: round(lab.a, 2), b: round(lab.b, 2), css: labStr },
    cmyk: { ...cmyk, css: cmykStr, _note: "Aproximação naive sRGB→CMYK; valide com ICC profile real para produção gráfica" },
    luminance: relativeLuminance(r, g, b),
  };
}

function rgbToLab(r, g, b) {
  // sRGB → linear → XYZ (D65) → Lab (CIE 1976)
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);
  const X = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  const Y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175;
  const Z = lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041;
  const Xn = 0.95047, Yn = 1.0, Zn = 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(X / Xn), fy = f(Y / Yn), fz = f(Z / Zn);
  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0").toUpperCase()).join("");
}
function rgbToHexA(r, g, b, a) {
  const aHex = Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase();
  return rgbToHex(r, g, b) + aHex;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// sRGB → linear → OKLab → OKLCH
function rgbToOklch(r, g, b) {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: H };
}
function srgbToLinear(u) {
  return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
}

// Naive sRGB → CMYK (no ICC; use as starting point only)
function rgbToCmyk(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

function relativeLuminance(r, g, b) {
  const [R, G, B] = [r, g, b].map((c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(lA, lB) {
  const [a, b] = lA > lB ? [lA, lB] : [lB, lA];
  return (a + 0.05) / (b + 0.05);
}

function wcagLevel(ratio, large = false) {
  // Large text = >=18pt regular OR >=14pt bold
  const aa = large ? 3 : 4.5;
  const aaa = large ? 4.5 : 7;
  if (ratio >= aaa) return "AAA";
  if (ratio >= aa) return "AA";
  if (ratio >= 3) return "AA Large";
  return "FAIL";
}

function round(n, places = 2) {
  const m = Math.pow(10, places);
  return Math.round(n * m) / m;
}

function humanize(s) {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase())
    .trim();
}

// ============================================================
// File builders
// ============================================================
function buildPaletteJson(ctx) {
  const { manifest, tokens, palette } = ctx;
  const data = {
    $schema: "https://tag-brand.io/schemas/palette-v2.json",
    meta: {
      brand: manifest.name,
      slug: ctx.slug,
      version: manifest.versions?.designTokens || "1.0.0",
      generatedAt: new Date().toISOString(),
      basedOn: "design-tokens.json",
      formats: ["json", "css", "scss", "tailwind.js", "figma.tokens.json", "ase", "gpl"],
      colorSpaces: ["hex", "rgb", "rgba", "hsl", "hsla", "oklch", "cmyk (approx)"],
    },
    decisionRationale: tokens.colorDecisionRationale || null,
    accentRules: tokens.component?.accent?.rules || null,
    palette: palette.map((c) => ({
      id: c.id,
      group: c.group,
      name: c.name,
      label: c.label,
      framerPath: c.framerPath,
      notes: c.notes,
      hasAlpha: c.hasAlpha,
      original: c.original,
      luminance: round(c.luminance, 4),
      hex: c.hex,
      hexa: c.hexa,
      rgb: c.rgb,
      hsl: c.hsl,
      oklch: c.oklch,
      lab: c.lab,
      cmyk: c.cmyk,
    })),
  };
  return JSON.stringify(data, null, 2);
}

function buildCss(ctx) {
  const { manifest, palette } = ctx;
  const lines = [
    "/*",
    `  ${manifest.name} — Palette`,
    `  Source of truth: palette.json`,
    `  Drop into a global stylesheet, then reference as var(--color-...)`,
    "*/",
    "",
    ":root {",
  ];
  for (const c of palette) {
    if (c.notes) lines.push(`  /* ${c.notes} */`);
    if (c.framerPath) lines.push(`  /* Framer: ${c.framerPath} */`);
    lines.push(`  --color-${cssVarName(c.id)}: ${c.hasAlpha ? c.rgb.cssAlpha : c.hex};`);
    lines.push("");
  }
  lines.push("}", "");
  lines.push("/* Modern OKLCH alternative — for browsers that support it */");
  lines.push(":root {");
  for (const c of palette) {
    lines.push(`  --color-${cssVarName(c.id)}-oklch: ${c.oklch.css};`);
  }
  lines.push("}", "");
  return lines.join("\n");
}

function buildScss(ctx) {
  const { manifest, palette } = ctx;
  const lines = [
    "//",
    `// ${manifest.name} — Palette`,
    "// Use as: color: $color-accent-default;",
    "//",
    "",
  ];
  for (const c of palette) {
    if (c.notes) lines.push(`// ${c.notes}`);
    if (c.framerPath) lines.push(`// Framer: ${c.framerPath}`);
    lines.push(`$color-${cssVarName(c.id)}: ${c.hasAlpha ? c.rgb.cssAlpha : c.hex};`);
    lines.push("");
  }
  lines.push(`// Map for iteration / theming`);
  lines.push(`$brand-colors: (`);
  for (const c of palette) {
    lines.push(`  "${cssVarName(c.id)}": $color-${cssVarName(c.id)},`);
  }
  lines.push(");", "");
  return lines.join("\n");
}

function buildTailwind(ctx) {
  const { manifest, palette } = ctx;
  const grouped = {};
  for (const c of palette) {
    if (!grouped[c.group]) grouped[c.group] = {};
    grouped[c.group][c.name] = c.hasAlpha ? c.rgb.cssAlpha : c.hex;
  }
  const body = JSON.stringify(grouped, null, 2);
  return [
    `// ${manifest.name} — Tailwind theme.colors block`,
    `// Merge into tailwind.config.js > theme.extend.colors`,
    `// Usage example: <div class="bg-surface-canvas text-text-on-canvas">`,
    "",
    "module.exports = {",
    "  theme: {",
    "    extend: {",
    `      colors: ${body.replace(/\n/g, "\n      ")},`,
    "    },",
    "  },",
    "};",
    "",
  ].join("\n");
}

function buildFigmaTokens(ctx) {
  // W3C Design Tokens spec — compatible with Tokens Studio for Figma
  const { palette } = ctx;
  const grouped = {};
  for (const c of palette) {
    if (!grouped[c.group]) grouped[c.group] = {};
    grouped[c.group][c.name] = {
      $type: "color",
      $value: c.hasAlpha ? c.rgb.cssAlpha : c.hex,
      $description: [c.notes, c.framerPath ? `Framer: ${c.framerPath}` : null]
        .filter(Boolean)
        .join(" · ") || undefined,
    };
  }
  return JSON.stringify({ color: grouped }, null, 2);
}

// Adobe Swatch Exchange (ASE) binary writer — color blocks only.
function buildAse(ctx) {
  const { palette } = ctx;
  // Skip alpha colors (ASE doesn't carry alpha in stable way)
  const solids = palette.filter((c) => !c.hasAlpha);

  const blocks = [];
  for (const c of solids) {
    const name = c.label;
    const utf16 = Buffer.alloc((name.length + 1) * 2);
    for (let i = 0; i < name.length; i++) utf16.writeUInt16BE(name.charCodeAt(i), i * 2);
    utf16.writeUInt16BE(0, name.length * 2); // null terminator

    const colorSpace = Buffer.from("RGB ", "ascii");
    const colorVals = Buffer.alloc(12);
    colorVals.writeFloatBE(c.rgb.r / 255, 0);
    colorVals.writeFloatBE(c.rgb.g / 255, 4);
    colorVals.writeFloatBE(c.rgb.b / 255, 8);
    const colorType = Buffer.alloc(2);
    colorType.writeUInt16BE(2, 0); // 2 = normal/global

    const nameLen = Buffer.alloc(2);
    nameLen.writeUInt16BE(name.length + 1, 0);

    const body = Buffer.concat([nameLen, utf16, colorSpace, colorVals, colorType]);

    const blockHeader = Buffer.alloc(6);
    blockHeader.writeUInt16BE(0x0001, 0); // color block
    blockHeader.writeUInt32BE(body.length, 2);

    blocks.push(Buffer.concat([blockHeader, body]));
  }

  const header = Buffer.from("ASEF", "ascii");
  const version = Buffer.alloc(4);
  version.writeUInt16BE(1, 0); // major
  version.writeUInt16BE(0, 2); // minor
  const blockCount = Buffer.alloc(4);
  blockCount.writeUInt32BE(blocks.length, 0);

  return Buffer.concat([header, version, blockCount, ...blocks]);
}

function buildGpl(ctx) {
  const { manifest, palette } = ctx;
  const lines = [
    "GIMP Palette",
    `Name: ${manifest.name}`,
    "Columns: 4",
    "#",
  ];
  for (const c of palette) {
    if (c.hasAlpha) continue;
    const r = String(c.rgb.r).padStart(3);
    const g = String(c.rgb.g).padStart(3);
    const b = String(c.rgb.b).padStart(3);
    lines.push(`${r} ${g} ${b}\t${c.label} (${c.hex})`);
  }
  return lines.join("\n") + "\n";
}

function buildSwatchSvg(ctx) {
  const { manifest, palette } = ctx;
  const cardW = 320, cardH = 200, gap = 20, cols = 3;
  const padding = 60, headerH = 130, footerH = 80;
  const rows = Math.ceil(palette.length / cols);
  const w = padding * 2 + cols * cardW + (cols - 1) * gap;
  const h = headerH + padding + rows * cardH + (rows - 1) * gap + footerH;

  const cards = palette.map((c, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = padding + col * (cardW + gap);
    const y = headerH + padding + row * (cardH + gap);
    const swatchH = 120;
    const fillRect = c.hasAlpha
      ? `<rect x="${x}" y="${y}" width="${cardW}" height="${swatchH}" fill="url(#checker)"/>
         <rect x="${x}" y="${y}" width="${cardW}" height="${swatchH}" fill="${c.rgb.cssAlpha}"/>`
      : `<rect x="${x}" y="${y}" width="${cardW}" height="${swatchH}" fill="${c.hex}"/>`;
    // Texto sobre swatch: escolhe entre ink TAG ou cor clara dependendo da
    // luminance do swatch. Ambas opções são neutras (TAG), nunca da marca.
    const labelColor = c.hasAlpha || c.luminance > 0.4 ? BBO_CHROME.ink : BBO_CHROME.bg;
    return `
      <g>
        ${fillRect}
        <rect x="${x}" y="${y}" width="${cardW}" height="${swatchH}" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
        <text x="${x + 16}" y="${y + swatchH - 18}" font-family="${BBO_CHROME.fontMono}" font-size="13" fill="${labelColor}">${c.hasAlpha ? c.rgb.cssAlpha : c.hex}</text>
        <text x="${x + 12}" y="${y + swatchH + 26}" font-family="${BBO_CHROME.fontDisplay}" font-size="18" font-weight="500" fill="${BBO_CHROME.ink}">${escapeXml(c.label)}</text>
        <text x="${x + 12}" y="${y + swatchH + 48}" font-family="${BBO_CHROME.fontMono}" font-size="11" fill="${BBO_CHROME.inkSoft}">${c.id}${c.framerPath ? ` · ${escapeXml(c.framerPath)}` : ""}</text>
        <text x="${x + 12}" y="${y + swatchH + 68}" font-family="${BBO_CHROME.fontMono}" font-size="10" fill="${BBO_CHROME.inkSoft}">${c.rgb.css} · ${c.hsl.css}</text>
      </g>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <pattern id="checker" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="${BBO_CHROME.bgWhite}"/>
      <rect width="10" height="10" fill="${BBO_CHROME.line}"/>
      <rect x="10" y="10" width="10" height="10" fill="${BBO_CHROME.line}"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="${BBO_CHROME.bg}"/>
  <text x="${padding}" y="${padding + 10}" font-family="${BBO_CHROME.fontDisplay}" font-size="42" font-weight="300" fill="${BBO_CHROME.ink}">${escapeXml(manifest.name)}</text>
  <text x="${padding}" y="${padding + 50}" font-family="${BBO_CHROME.fontMono}" font-size="14" fill="${BBO_CHROME.inkSoft}">Palette · ${palette.length} cores · gerado ${new Date().toISOString().slice(0, 10)}</text>
  ${cards}
  <text x="${padding}" y="${h - padding / 2}" font-family="${BBO_CHROME.fontMono}" font-size="11" fill="${BBO_CHROME.inkSoft}">Padrão xadrez = transparência. Folha gerada pelo Bionic Brand OS.</text>
</svg>`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildContrastMatrix(ctx) {
  const { palette } = ctx;
  // Background candidates: surface group + opaque text colors as bg fallback (rare)
  // Foreground candidates: text group + accent colors
  const opaque = palette.filter((c) => !c.hasAlpha);
  const backgrounds = opaque.filter((c) => c.group === "surface");
  const foregrounds = opaque.filter((c) =>
    ["text", "accent"].includes(c.group),
  );

  const pairs = [];
  for (const bg of backgrounds) {
    for (const fg of foregrounds) {
      if (fg.id === bg.id) continue;
      const ratio = round(contrastRatio(fg.luminance, bg.luminance), 2);
      pairs.push({
        foreground: { id: fg.id, label: fg.label, hex: fg.hex },
        background: { id: bg.id, label: bg.label, hex: bg.hex },
        ratio,
        wcag: {
          normalText: wcagLevel(ratio, false),
          largeText: wcagLevel(ratio, true),
        },
      });
    }
  }
  pairs.sort((a, b) => b.ratio - a.ratio);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      method: "WCAG 2.2 contrast ratio (relative luminance)",
      pairsTested: pairs.length,
      onlyOpaqueColors: true,
    },
    pairs,
  };
}

function buildAccessibilityMd(ctx, contrast) {
  const { manifest } = ctx;
  const top = contrast.pairs.filter((p) => p.wcag.normalText !== "FAIL");
  const fails = contrast.pairs.filter((p) => p.wcag.normalText === "FAIL");

  const fmt = (p) =>
    `- **${p.foreground.label}** sobre **${p.background.label}** — ${p.ratio}:1 → ${p.wcag.normalText} (texto normal) · ${p.wcag.largeText} (texto grande)`;

  return [
    `# Acessibilidade — ${manifest.name}`,
    "",
    "Matriz de contraste WCAG 2.2 entre todas as cores opacas de texto/accent sobre superfícies da paleta.",
    "",
    "## Pares aprovados",
    "",
    top.map(fmt).join("\n") || "_Nenhum par aprovado._",
    "",
    "## Pares reprovados (não usar pra texto)",
    "",
    fails.map(fmt).join("\n") || "_Nenhum par reprovado._",
    "",
    "## Critérios",
    "",
    "- **AAA**: ratio ≥ 7 (texto normal) / ≥ 4.5 (texto grande)",
    "- **AA**: ratio ≥ 4.5 / ≥ 3",
    "- **AA Large**: ratio ≥ 3 (apenas texto grande, ≥18pt regular ou ≥14pt bold)",
    "- **FAIL**: abaixo de 3",
    "",
    "Alpha colors não foram testados — calcule contra o fundo final composto.",
    "",
  ].join("\n");
}

function buildPrintSpec(ctx) {
  const { manifest, palette } = ctx;
  const opaque = palette.filter((c) => !c.hasAlpha);
  const accentColors = palette.filter((c) => c.group === "accent" && !c.hasAlpha);
  const accentLabel = accentColors[0]?.label ?? "accent";
  const darkSurfaces = opaque.filter(
    (c) => c.group === "surface" && c.luminance < 0.2,
  );

  const lines = [
    `# Especificação para gráfica — ${manifest.name}`,
    "",
    "Documento para o operador de impressão. Cores convertidas de sRGB para CMYK via fórmula naive — **valide sempre com prova impressa antes de tirar do prelo**.",
    "",
    "## Recomendações gerais",
    "",
    "- Imprimir sobre papel offset 120 g/m² ou superior. Substratos não-revestidos absorvem melhor cores acromáticas e quentes.",
    "- Usar perfil ICC **FOGRA39** ou **GRACoL 2013** para impressão comercial. Coated/Uncoated conforme substrato.",
    accentColors.length
      ? `- Acentos cromáticos saturados (ex: ${accentLabel}) podem deslocar matiz em CMYK barato. Considere **spot color Pantone** correspondente em peças críticas (ver sugestão por cor abaixo).`
      : null,
    darkSurfaces.length
      ? `- Para pretos profundos (ex: ${darkSurfaces[0].label}, \`${darkSurfaces[0].hex}\`), evite K100 puro — use **rich black** \`C30 M30 Y30 K100\` para densidade visual sem virar fosco.`
      : null,
    "",
    "## Cores e equivalências",
    "",
    opaque
      .map((c) => {
        const pantoneSuggestion = suggestPantone(c.rgb);
        return [
          `### ${c.label} \`${c.id}\``,
          c.notes ? `> ${c.notes}` : "",
          "",
          `| Espaço | Valor |`,
          `| --- | --- |`,
          `| HEX | \`${c.hex}\` |`,
          `| RGB | \`${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}\` |`,
          `| CMYK (aprox) | \`C ${c.cmyk.c}  M ${c.cmyk.m}  Y ${c.cmyk.y}  K ${c.cmyk.k}\` |`,
          `| LAB (CIE) | \`L ${c.lab.l}  a ${c.lab.a}  b ${c.lab.b}\` (mais confiável que CMYK em prensa com espectrofotômetro) |`,
          `| HSL | \`${c.hsl.h}°, ${c.hsl.s}%, ${c.hsl.l}%\` |`,
          pantoneSuggestion ? `| Pantone (sugestão) | ${pantoneSuggestion} |` : "",
          "",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n"),
    "",
    "## Checklist do operador",
    "",
    accentColors.length
      ? `- [ ] Provar ${accentLabel} em prova impressa (não confiar no monitor).`
      : null,
    accentColors.length
      ? `- [ ] Verificar registro entre tintas onde o ${accentLabel.toLowerCase()} aparecer — pode marcar fora de eixo.`
      : null,
    darkSurfaces.length
      ? "- [ ] Para fundos extensos escuros, usar rich black em vez de K100 puro."
      : null,
    "- [ ] Cores warm sutis precisam de balance correto de amarelo — checar dot gain.",
    "- [ ] Para grandes áreas chapadas, considerar varnish ou laminação fosca para preservar elegância.",
    "",
  ].filter(Boolean);
  return lines.join("\n");
}

function suggestPantone(rgb) {
  // Tabela hand-curated de equivalências aproximadas para HEX comuns que
  // tendem a aparecer em paletas BBO. Não é matching algorítmico Lab×Lab —
  // só uma sugestão pra economizar consulta no fan deck. Sempre validar
  // com Pantone Solid Coated/Uncoated físico antes de fechar tiragem.
  const known = {
    "#FFFFFF": "Branco do papel (não imprimir)",
    "#000000": "Pantone Black C",
    "#1C1917": "Pantone Black 6 C — neutro quente",
    "#080A09": "Pantone Black C ou Black 6 C",
    "#F5F0EA": "Pantone 9143 C ou Warm Gray 1 C",
    "#E5E4DE": "Pantone Warm Gray 2 C",
    "#A6783E": "Pantone 7568 C ou 873 C (acabamento metalizado)",
    "#CA8A04": "Pantone 124 C ou 7555 C",
  };
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  return known[hex] || null;
}

function buildBrandOwnerGuide(ctx) {
  const { manifest, palette } = ctx;
  const surfaceColors = palette.filter((c) => c.group === "surface" && !c.hasAlpha);
  const accentColors = palette.filter((c) => c.group === "accent" && !c.hasAlpha);
  const accentLabel = accentColors[0]?.label ?? "accent";

  // Frase de resumo derivada da estrutura real da paleta — sem nomes fantasia
  // específicos de uma marca ("bege pedra", "warm black"), só hex + label.
  const summarySentence = (() => {
    const surfaceList = surfaceColors
      .slice(0, 4)
      .map((c) => `**${c.label}** \`${c.hex}\``)
      .join(", ");
    const accentList = accentColors.length
      ? accentColors.map((c) => `**${c.label}** \`${c.hex}\``).join(" + ")
      : null;
    const surfacePart = surfaceList ? `Superfícies: ${surfaceList}.` : "";
    const accentPart = accentList ? ` Acento: ${accentList}.` : "";
    return `${surfacePart}${accentPart} Qualquer cor fora dessas em peça oficial: recusar.`.trim();
  })();

  const accentRules = accentColors.length
    ? [
        `- ${accentLabel} como fundo de botão primário (descaracteriza a hierarquia)`,
        `- ${accentLabel} em texto corrido (prejudica leitura)`,
        `- Mais de 2 usos do ${accentLabel.toLowerCase()} por tela/peça`,
      ]
    : [];

  return [
    `# Como aprovar uma peça — ${manifest.name}`,
    "",
    "Pra quem é dono da marca, aprova peças, ou contrata fornecedor. **Não precisa entender técnica** — só precisa saber o que cobrar e o que recusar.",
    "",
    "## A paleta em uma frase",
    "",
    summarySentence,
    "",
    "## Cores que devem aparecer",
    "",
    ...palette
      .filter((c) => !c.hasAlpha)
      .map((c) => {
        const lines = [`### ${c.label} — \`${c.hex}\``];
        if (c.notes) lines.push(`> ${c.notes}`);
        if (c.framerPath) lines.push(`Nome interno (Framer): \`${c.framerPath}\``);
        return lines.join("\n");
      }),
    "",
    "## Bandeiras vermelhas — recuse se vir",
    "",
    "Antes de aprovar uma peça, passe os olhos por essa lista. Qualquer um destes itens é motivo pra pedir refazer:",
    "",
    "- Cor que não está na lista acima",
    "- Gradiente de qualquer tipo",
    ...accentRules,
    "- Sombras (a marca não usa)",
    "- Curvas decorativas além do raio padrão de botões",
    "",
    "## Quer entender mais a fundo?",
    "",
    "- **Por que essas cores e não outras** → leia `Histórico das decisões cromáticas.md` (mesma pasta).",
    accentColors.length
      ? "- **Por que o accent tem regras tão estritas** → leia `Regras do accent.md` (mesma pasta)."
      : null,
    "- **Visão geral pra mostrar a alguém** → abra `Catálogo visual da paleta.png` (mesma pasta).",
    "",
  ].filter(Boolean).join("\n");
}

function buildAiContext(ctx) {
  const { manifest, palette, tokens } = ctx;
  const opaque = palette.filter((c) => !c.hasAlpha);
  return [
    `# Contexto cromático — ${manifest.name}`,
    "",
    "Bloco para colar em prompt de IA (Claude, GPT, Cursor, Figma AI). Compacto e literal.",
    "",
    "```",
    `Marca: ${manifest.name}`,
    `Slug: ${ctx.slug}`,
    `Versão da paleta: ${manifest.versions?.designTokens || "1.0.0"}`,
    "",
    "Cores opacas (use estas para superfícies, texto, accent):",
    ...opaque.map(
      (c) =>
        `- ${c.id} = ${c.hex}  ${c.framerPath ? `(framer ${c.framerPath})` : ""}  ${c.notes ? `// ${c.notes}` : ""}`,
    ),
    "",
    "Cores com alpha (overlays, borders, estados):",
    ...palette
      .filter((c) => c.hasAlpha)
      .map(
        (c) =>
          `- ${c.id} = ${c.rgb.cssAlpha}  ${c.framerPath ? `(framer ${c.framerPath})` : ""}  ${c.notes ? `// ${c.notes}` : ""}`,
      ),
    "",
    "Regras invioláveis:",
    "- Sem gradientes",
    "- Sem sombras",
    "- Accent nunca em background de botão primário",
    "- Accent nunca em headings",
    "- Accent máximo 2 usos por viewport",
    "- Tipografia: Spectral (serif, headings) + TASA Orbiter (sans, body)",
    "- Radius máximo 6px, exclusivo de botões",
    "```",
    "",
    "## Para uso com Tokens Studio (Figma)",
    "",
    "Importe `palette.figma.tokens.json` direto no plugin Tokens Studio.",
    "",
    "## Para uso programático",
    "",
    "- Web: `palette.css` (CSS vars) ou `palette.scss`",
    "- Tailwind: `palette.tailwind.js`",
    "- Sistema: `palette.json` (fonte canônica)",
    "",
  ].join("\n");
}

function buildRationaleDoc(ctx) {
  const { manifest, tokens } = ctx;
  const r = tokens.colorDecisionRationale;
  const changelog = tokens.meta?.changelog ?? {};
  const lines = [`# ${manifest.name} — Histórico de decisões cromáticas`, ""];
  if (r?.adoptedPath) {
    lines.push(`## Caminho adotado: ${r.adoptedPath.name}`, "");
    lines.push(r.adoptedPath.description, "");
    if (r.adoptedPath.achieves) lines.push(`**Resultado:** ${r.adoptedPath.achieves}`, "");
  }
  if (Array.isArray(r?.rejectedPaths) && r.rejectedPaths.length) {
    lines.push("## Caminhos rejeitados", "");
    for (const p of r.rejectedPaths) lines.push(`### ${p.path}`, "", p.reason, "");
  }
  if (Object.keys(changelog).length) {
    lines.push("## Changelog", "");
    for (const [v, items] of Object.entries(changelog)) {
      lines.push(`### ${v}`, "");
      for (const item of items) lines.push(`- ${item}`);
      lines.push("");
    }
  }
  lines.push(
    "---",
    "",
    "Por que documentar isto: as decisões cromáticas que **não** foram tomadas são tão importantes quanto as que foram. Quando alguém propuser usar uma cor de forma que já foi rejeitada antes, a resposta está aqui.",
    "",
  );
  return lines.join("\n");
}

function buildAccentRulesDoc(ctx) {
  const { manifest, tokens } = ctx;
  const accent = tokens.component?.accent;
  if (!accent) return `# ${manifest.name} — Regras do Accent\n\nSem regras documentadas no token.\n`;
  const r = accent.rules ?? {};
  const lines = [
    `# ${manifest.name} — Regras do Accent (${accent.color})`,
    "",
    "O accent é a única cor não-monocromática do sistema. É **assinatura editorial**, não cor funcional. Existe para pontuar momentos no scroll — não para construir hierarquia ou chamar atenção genérica.",
    "",
    "## Onde **PODE** ser usado",
    "",
    ...(r.allowedUses ?? []).map((u) => `- ✅ ${u}`),
    "",
    "## Onde **NUNCA** deve ser usado",
    "",
    ...(r.forbiddenUses ?? []).map((u) => `- ❌ ${u}`),
  ];
  if (r.structural) {
    lines.push("", "## Regras estruturais", "");
    if (r.structural.maxUsesPerViewport)
      lines.push(`- **Máximo por viewport:** ${r.structural.maxUsesPerViewport} aparições.`);
    if (r.structural.removalTest)
      lines.push(`- **Teste de remoção:** ${r.structural.removalTest}`);
    if (r.structural.noAccentOnAccent)
      lines.push(`- **Accent sobre accent:** ${r.structural.noAccentOnAccent}`);
    if (r.structural.fallbackInDoubt)
      lines.push(`- **Em dúvida:** ${r.structural.fallbackInDoubt}`);
  }
  lines.push(
    "",
    "---",
    "",
    "Lembrete: o accent foi calibrado a partir de #CA8A04 (96% saturação) **dessaturado para ~60%** justamente para preservar autoridade calma. Saturar de novo destrói a decisão.",
    "",
  );
  return lines.join("\n");
}

function buildReadme(ctx) {
  const { manifest, slug, palette } = ctx;
  const opaqueCount = palette.filter((c) => !c.hasAlpha).length;
  const alphaCount = palette.length - opaqueCount;
  const groups = {};
  for (const c of palette) {
    if (!groups[c.group]) groups[c.group] = 0;
    groups[c.group]++;
  }
  return [
    `# ${manifest.name} — Cores`,
    "",
    `Versão ${manifest.versions?.designTokens ?? "—"} · ${palette.length} cores no total (${opaqueCount} sólidas + ${alphaCount} com transparência).`,
    "",
    "Este pacote tem **uma pasta pra cada papel** — abra a sua e ignore o resto.",
    "",
    "---",
    "",
    "## Onde abrir, dependendo de quem você é",
    "",
    "### Sou o(a) **dono(a) da marca** — quero aprovar peças",
    "→ Abra **`01 — Para aprovar e decidir/`**",
    "Comece pelo `Catálogo visual da paleta.png`. Depois leia `Como aprovar uma peça.md` e `Regras do accent.md`.",
    "",
    "### Sou **designer** (Figma, Adobe, Inkscape, etc.)",
    "→ Abra **`02 — Para design/`**",
    "Tem uma subpasta por ferramenta, com o arquivo nativo + um `Como importar` curtinho. Use a sua e ignore o resto.",
    "",
    "### Vou enviar pra **gráfica** ou trabalho com **impressão**",
    "→ Abra **`03 — Para impressão (gráfica)/`**",
    "Comece por `LEIA PRIMEIRO — Para a gráfica.md`. A folha A4 já está pronta pra imprimir.",
    "",
    "### Sou **programador(a)** — vou usar no código",
    "→ Abra **`04 — Para desenvolvimento (programação)/`**",
    "Subpastas por plataforma (Web, iOS, Android, Scripts). Cada uma tem `Como usar.md`. Auditoria WCAG de contraste também está aqui.",
    "",
    "### Sou uma **IA**, ou estou montando uma automação",
    "→ Abra **`05 — Para IAs e automações/`**",
    "Bloco compacto pra colar em prompt + JSON canônico com todos os formatos.",
    "",
    "---",
    "",
    "## Por que tem tanta pasta?",
    "",
    "Porque um arquivo de cor que serve pro Figma **não serve** pro Adobe, e o que serve pro Adobe **não serve** pra gráfica. Em vez de te entregar um zip com 30 arquivos misturados, separei por papel. Você só precisa da sua pasta.",
    "",
    "Se for só baixar pra arquivar — o `Catálogo visual da paleta.png` em `01 — Para aprovar e decidir/` é a foto-resumo de tudo.",
    "",
    "---",
    "",
    `## Estrutura do pacote`,
    "",
    "```",
    `${manifest.name} — Cores/`,
    "│",
    "├── LEIA-ME-PRIMEIRO.md                    ← você está aqui",
    "│",
    "├── 01 — Para aprovar e decidir/",
    "│   ├── Catálogo visual da paleta.png",
    "│   ├── Catálogo visual da paleta.svg",
    "│   ├── Como aprovar uma peça.md",
    "│   ├── Regras do accent.md",
    "│   └── Histórico das decisões cromáticas.md",
    "│",
    "├── 02 — Para design/",
    "│   ├── Adobe (Illustrator, Photoshop, InDesign)/",
    `│   │   ├── ${manifest.name}.ase`,
    "│   │   └── Como importar no Adobe.md",
    "│   ├── Figma/",
    `│   │   ├── ${slug}.tokens.json`,
    "│   │   └── Como importar no Figma.md",
    "│   ├── GIMP, Inkscape, Krita/",
    `│   │   ├── ${manifest.name}.gpl`,
    "│   │   └── Como importar.md",
    "│   └── Swatches individuais/",
    "│       ├── 01 — Surface Primary.svg",
    "│       └── ... (um SVG por cor, drag & drop)",
    "│",
    "├── 03 — Para impressão (gráfica)/",
    "│   ├── LEIA PRIMEIRO — Para a gráfica.md",
    "│   ├── Folha de cores A4 (pronta pra imprimir).png",
    "│   ├── Folha de cores A4 (pronta pra imprimir).svg",
    "│   └── Cores em CMYK, LAB e Pantone.json",
    "│",
    "├── 04 — Para desenvolvimento (programação)/",
    "│   ├── Web/  (CSS, SCSS, LESS, Tailwind v4 e v3)",
    "│   ├── iOS (Swift)/",
    "│   ├── Android (Kotlin)/",
    "│   ├── Scripts (JavaScript, TypeScript, Python)/",
    "│   ├── Contraste WCAG (auditoria de acessibilidade).json",
    "│   └── Contraste WCAG (relatório legível).md",
    "│",
    "└── 05 — Para IAs e automações/",
    "    ├── Cole isso no prompt da IA.md",
    "    └── paleta-canônica (todos os formatos).json",
    "```",
    "",
    "---",
    "",
    `## Resumo do sistema`,
    "",
    `${palette.length} cores divididas em ${Object.keys(groups).length} grupos: ${Object.entries(groups).map(([g, n]) => `${humanize(g)} (${n})`).join(", ")}.`,
    "",
    "**Cores canônicas sólidas:**",
    "",
    ...palette.filter((c) => !c.hasAlpha).map((c) =>
      `- \`${c.hex}\` **${c.label}**${c.framerPath ? ` · framer \`${c.framerPath}\`` : ""}${c.notes ? ` — ${c.notes}` : ""}`,
    ),
    "",
    "---",
    "",
    "## Atualização",
    "",
    `Este pacote é gerado automaticamente. Se você editar arquivos aqui dentro, suas mudanças somem na próxima geração. A fonte de verdade é o \`design-tokens.json\` da marca.`,
    "",
    `Gerado em ${new Date().toISOString().slice(0, 10)}.`,
    "",
  ].join("\n");
}

function cssVarName(id) {
  return id.replace(/\./g, "-").replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()).replace(/^-/, "");
}

// ============================================================
// "Como usar/importar" builders — um por ferramenta/plataforma
// ============================================================

function buildAdobeHowto(ctx) {
  const { manifest } = ctx;
  return [
    `# Como importar no Adobe (Illustrator, Photoshop, InDesign, After Effects)`,
    "",
    `O arquivo \`${manifest.name}.ase\` é um **Adobe Swatch Exchange** binário — formato nativo de todas as ferramentas Adobe.`,
    "",
    "## O caminho mais rápido",
    "",
    `1. **Dê duplo-clique** no arquivo \`${manifest.name}.ase\`.`,
    `2. O Adobe vai abrir o painel **Swatches** (Janela → Amostras) com o grupo \`${manifest.name}\` já adicionado.`,
    `3. Pronto. Use as cores como qualquer outra amostra.`,
    "",
    "## Se o duplo-clique não funcionar",
    "",
    "### Illustrator",
    "1. **Janela → Amostras** (\`Window → Swatches\`).",
    "2. No menu hambúrguer do painel: **Abrir biblioteca de amostras → Outra biblioteca…**",
    `3. Selecione \`${manifest.name}.ase\`.`,
    "",
    "### Photoshop",
    "1. **Janela → Amostras** (\`Window → Swatches\`).",
    "2. Menu hambúrguer → **Importar amostras…**",
    `3. Mude o filtro pra \`Swatch Exchange (*.ASE)\` e abra o arquivo.`,
    "",
    "### InDesign",
    "1. **Janela → Cores → Amostras**.",
    "2. Menu do painel → **Carregar amostras…**",
    `3. Selecione o \`.ase\`.`,
    "",
    "## O que está no arquivo",
    "",
    "Apenas as cores **sólidas** da marca (10 amostras). Cores com transparência (overlays, borders, accent subtle/faint) **não vão** porque o ASE não carrega alpha de forma confiável entre versões. Se precisar dessas, use os SVGs em `../Swatches individuais/`.",
    "",
    "## Aviso pra impressão",
    "",
    "Os valores no ASE estão em **RGB**. Pra impressão, converta pra CMYK ou (melhor) consulte `03 — Para impressão (gráfica)/Cores em CMYK, LAB e Pantone.json` antes de mandar pro prelo.",
    "",
  ].join("\n");
}

function buildFigmaHowto(ctx) {
  const { slug } = ctx;
  return [
    `# Como importar no Figma`,
    "",
    `O arquivo \`${slug}.tokens.json\` segue o **W3C Design Tokens Format Module** — padrão suportado pelo plugin **Tokens Studio for Figma** (gratuito, mantido pela comunidade).`,
    "",
    "## Passo a passo (5 minutos)",
    "",
    "1. Abra o Figma no arquivo onde quer usar a paleta.",
    "2. Menu **Plugins → Procurar mais plugins**.",
    "3. Procure por **Tokens Studio for Figma** (autor: Jan Six).",
    "4. Instale e abra o plugin.",
    "5. Na tela inicial do plugin: **Tools → Load from JSON file**.",
    `6. Selecione o arquivo \`${slug}.tokens.json\`.`,
    "7. O plugin vai listar todas as cores agrupadas (surface, accent, text, etc.).",
    "8. Clique em **Apply to document**.",
    "",
    "Pronto — as cores aparecem como **estilos de cor** do Figma e ficam disponíveis no painel Design.",
    "",
    "## Se você não pode/não quer usar o plugin",
    "",
    "Você pode criar os estilos manualmente. Abra o arquivo `paleta-canônica (todos os formatos).json` em `05 — Para IAs e automações/` — cada cor tem o HEX pronto. Crie um estilo de cor no Figma pra cada uma seguindo o nome do grupo.",
    "",
    "## Atualizando depois",
    "",
    `Se a paleta mudar (nova versão), basta repetir o **Tools → Load from JSON file** com a nova versão do \`${slug}.tokens.json\`. O plugin substitui os tokens existentes.`,
    "",
  ].join("\n");
}

function buildGimpHowto(ctx) {
  const { manifest } = ctx;
  return [
    `# Como importar no GIMP, Inkscape ou Krita`,
    "",
    `O arquivo \`${manifest.name}.gpl\` é o formato de **paleta GIMP** — universal entre essas ferramentas open-source.`,
    "",
    "## GIMP",
    "",
    "1. Abra o GIMP.",
    "2. **Janelas → Diálogos encaixáveis → Paletas**.",
    `3. No painel de paletas, clique no menu hambúrguer → **Importar paleta…** (ou copie o \`.gpl\` pra \`~/.config/GIMP/2.10/palettes/\` e reinicie).`,
    `4. Aponte pro arquivo \`${manifest.name}.gpl\`.`,
    `5. A paleta \`${manifest.name}\` aparece na lista.`,
    "",
    "## Inkscape",
    "",
    `1. Copie \`${manifest.name}.gpl\` pra:`,
    "   - **macOS**: `~/Library/Application Support/Inkscape/palettes/`",
    "   - **Windows**: `%APPDATA%\\inkscape\\palettes\\`",
    "   - **Linux**: `~/.config/inkscape/palettes/`",
    "2. Reinicie o Inkscape.",
    `3. Na barra de cores embaixo, clique na seta → escolha \`${manifest.name}\`.`,
    "",
    "## Krita",
    "",
    "1. **Configurações → Recursos → Gerenciar recursos**.",
    "2. **Importar recurso** → escolha o `.gpl`.",
    "3. A paleta aparece em **Janelas → Encaixáveis → Paletas**.",
    "",
    "## O que está no arquivo",
    "",
    "Apenas as cores sólidas da marca (10 amostras), em RGB. Sem transparências.",
    "",
  ].join("\n");
}

function buildWebHowto(ctx) {
  const { manifest } = ctx;
  return [
    `# Como usar as cores no front-end web`,
    "",
    `5 arquivos, 5 estilos diferentes. Use **um** que combina com seu projeto.`,
    "",
    "## Tailwind CSS v4 (recomendado se já usa Tailwind)",
    "",
    "1. Copie `cores-tailwind-v4.css` pro seu projeto.",
    "2. No seu CSS principal:",
    "   ```css",
    "   @import \"tailwindcss\";",
    "   @import \"./cores-tailwind-v4.css\";",
    "   ```",
    "3. Use direto: `<div class=\"bg-surface-canvas text-text-on-canvas\">`",
    "",
    "## Tailwind CSS v3",
    "",
    "1. Copie `cores-tailwind-v3.config.js` pro seu projeto.",
    "2. No `tailwind.config.js`:",
    "   ```js",
    "   const brandColors = require('./cores-tailwind-v3.config.js');",
    "   module.exports = {",
    "     theme: { extend: brandColors.theme.extend },",
    "   };",
    "   ```",
    "",
    "## CSS puro (sem framework)",
    "",
    `1. Copie \`cores.css\` e importe no \`<head>\` do HTML ou no CSS principal.`,
    "2. Use as variáveis:",
    "   ```css",
    "   .botao-primario {",
    "     background: var(--color-surface-inverse);",
    "     color: var(--color-text-on-dark);",
    "   }",
    "   ```",
    "",
    "## SCSS",
    "",
    "1. `@import \"./cores.scss\";`",
    "2. Use: `background: $color-accent-default;`",
    "",
    "## LESS",
    "",
    "1. `@import \"./cores.less\";`",
    "2. Use: `background: @color-accent-default;`",
    "",
    "## Antes de usar — leia",
    "",
    "- O **accent** tem regras estritas. Veja `01 — Para aprovar e decidir/Regras do accent.md`.",
    "- A auditoria de contraste WCAG está no mesmo nível desta pasta — `Contraste WCAG (relatório legível).md`.",
    "",
  ].join("\n");
}

function buildIosHowto(ctx) {
  const { manifest } = ctx;
  const ns = pascalCase(manifest.name) + "Colors";
  return [
    `# Como usar as cores no iOS (Swift / SwiftUI / UIKit)`,
    "",
    `O arquivo \`${ns}.swift\` define um \`enum\` com **Color** (SwiftUI) e **UIColor** (UIKit) — escolha o que combina com seu projeto.`,
    "",
    "## Setup",
    "",
    `1. Arraste \`${ns}.swift\` pro seu projeto Xcode (target principal).`,
    `2. Pronto — \`${ns}\` está disponível em qualquer arquivo Swift.`,
    "",
    "## Uso em SwiftUI",
    "",
    "```swift",
    `import SwiftUI`,
    "",
    "struct ContentView: View {",
    "  var body: some View {",
    "    Text(\"Olá\")",
    `      .foregroundColor(${ns}.textOnDark)`,
    `      .background(${ns}.surfaceInverse)`,
    "  }",
    "}",
    "```",
    "",
    "## Uso em UIKit",
    "",
    "```swift",
    `import UIKit`,
    "",
    "let label = UILabel()",
    `label.textColor = ${ns}.textOnDarkUI`,
    `label.backgroundColor = ${ns}.surfaceInverseUI`,
    "```",
    "",
    "Note o sufixo `UI` nas versões UIKit.",
    "",
    "## Recomendação extra",
    "",
    "Pra Dynamic Color (light/dark mode automático), considere criar **Color Sets** no `.xcassets` usando os HEX deste arquivo. Esta exposição direta é o caminho mais rápido — Color Sets são o caminho mais idiomático.",
    "",
  ].join("\n");
}

function buildAndroidHowto(ctx) {
  const { manifest } = ctx;
  const ns = pascalCase(manifest.name) + "Colors";
  return [
    `# Como usar as cores no Android`,
    "",
    "Dois arquivos, dois mundos: XML (Views clássicas) e Kotlin (Jetpack Compose). Use o que combina com seu projeto.",
    "",
    "## Android Views (XML)",
    "",
    "1. Copie o conteúdo de `colors.xml` pro seu `app/src/main/res/values/colors.xml`",
    "   (ou substitua o arquivo se ainda não tiver cores customizadas).",
    "2. Use no XML de layout:",
    "   ```xml",
    "   <View",
    "     android:background=\"@color/color_surface_inverse\"",
    "     android:textColor=\"@color/color_text_on_dark\" />",
    "   ```",
    "3. Em Kotlin: `ContextCompat.getColor(context, R.color.color_surface_inverse)`",
    "",
    "## Jetpack Compose",
    "",
    `1. Adicione \`${ns}.kt\` em \`app/src/main/java/.../ui/theme/\`.`,
    "2. Use direto:",
    "   ```kotlin",
    `   import com.suaempresa.ui.theme.${ns}`,
    "",
    "   Surface(",
    `     color = ${ns}.SurfaceInverse,`,
    "   ) {",
    `     Text("Olá", color = ${ns}.TextOnDark)`,
    "   }",
    "   ```",
    "",
    "## Recomendação extra",
    "",
    `Pra suporte completo a Material 3 + Dark Theme automático, considere mapear as cores deste arquivo dentro do seu \`MaterialTheme\` customizado. Esta exposição é o atalho — mapear via theme é o caminho idiomático.`,
    "",
  ].join("\n");
}

function buildScriptsHowto(ctx) {
  return [
    `# Como usar as cores em scripts (JavaScript, TypeScript, Python)`,
    "",
    "Três módulos com a mesma API: dicionário de cores indexado por nome.",
    "",
    "## TypeScript",
    "",
    "```ts",
    `import { brandColors } from \"./colors\";`,
    "",
    "const accent = brandColors.accentDefault.hex;       // \"#A6783E\"",
    "const dark = brandColors.surfaceInverse.rgb;        // [28, 25, 23]",
    "```",
    "",
    "Tipos exportados: `BrandColor`, `BrandColorKey`.",
    "",
    "## JavaScript (CommonJS ou ESM)",
    "",
    "```js",
    `const { brandColors } = require(\"./colors\");`,
    "// ou: import { brandColors } from \"./colors.js\";",
    "",
    "console.log(brandColors.accentDefault.hex);",
    "```",
    "",
    "## Python",
    "",
    "```python",
    "from colors import BRAND_COLORS",
    "",
    "accent = BRAND_COLORS[\"accent_default\"][\"hex\"]      # \"#A6783E\"",
    "dark = BRAND_COLORS[\"surface_inverse\"][\"rgb\"]       # (28, 25, 23)",
    "```",
    "",
    "## Casos de uso típicos",
    "",
    "- Geração de imagens (Pillow, sharp, canvas) com cores oficiais",
    "- Validadores de peças (CI que reprova SVG com cor fora da paleta)",
    "- Pipelines de exportação multi-formato",
    "- Bots Slack/Discord com identidade visual consistente",
    "",
  ].join("\n");
}

// Slim "print only" JSON com só o que a gráfica precisa
function buildPrintJson(ctx) {
  const { manifest, palette } = ctx;
  const opaque = palette.filter((c) => !c.hasAlpha);
  return JSON.stringify(
    {
      brand: manifest.name,
      generatedAt: new Date().toISOString(),
      disclaimer:
        "CMYK derivado matematicamente de sRGB sem perfil ICC. Pantone é aproximação visual manual. Sempre validar com prova de cor antes de tiragem.",
      colors: opaque.map((c) => {
        const pms = suggestPantone(c.rgb);
        return {
          id: c.id,
          name: c.label,
          hex: c.hex,
          rgb: { r: c.rgb.r, g: c.rgb.g, b: c.rgb.b },
          cmyk: { c: c.cmyk.c, m: c.cmyk.m, y: c.cmyk.y, k: c.cmyk.k },
          lab: { l: c.lab.l, a: c.lab.a, b: c.lab.b },
          pantoneSuggestion: pms,
          notes: c.notes,
          printingNote: printingNoteFor(c.id),
        };
      }),
    },
    null,
    2,
  );
}

// Notas de impressão por papel da cor no sistema, sem assumir matiz específico
// (bronze, warm black, etc.) — escala pra qualquer marca que siga o schema.
function printingNoteFor(id) {
  if (id.startsWith("accent."))
    return "Acentos saturados podem deslocar matiz em CMYK barato. Pra peças críticas, considere spot color Pantone correspondente ou acabamento metalizado/hot stamping.";
  if (id === "surface.inverse" || id === "surface.inverseAlt")
    return "Para fundos extensos: usar rich black (ex: C30 M30 Y30 K100) em vez de K100 puro pra densidade visual sem virar fosco.";
  if (id === "surface.cream" || id === "surface.canvas")
    return "Cor de superfície sutil — em papel offset comum tende a esmaecer; preferir couché fosco com balance correto de amarelo.";
  return null;
}

function tokenizeIdent(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[-._\s]+/)
    .filter(Boolean);
}
function camelCase(s) {
  return tokenizeIdent(s).map((w, i) =>
    i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
  ).join("");
}
function pascalCase(s) {
  return tokenizeIdent(s).map((w) =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
  ).join("");
}
function snakeCase(s) {
  return tokenizeIdent(s).join("_").toLowerCase();
}

// ============================================================
// Additional format builders (LESS, Tailwind v4, native, scripting)
// ============================================================

function buildLess(ctx) {
  const { manifest, palette } = ctx;
  const lines = [
    `// ${manifest.name} — Palette (LESS)`,
    "// Use as: color: @color-accent-default;",
    "",
  ];
  for (const c of palette) {
    if (c.notes) lines.push(`// ${c.notes}`);
    if (c.framerPath) lines.push(`// Framer: ${c.framerPath}`);
    lines.push(`@color-${cssVarName(c.id)}: ${c.hasAlpha ? c.rgb.cssAlpha : c.hex};`);
    lines.push("");
  }
  return lines.join("\n");
}

function buildTailwindV4(ctx) {
  const { manifest, palette } = ctx;
  const lines = [
    "/*",
    `  ${manifest.name} — Tailwind v4 @theme block`,
    `  Importe no seu CSS principal:`,
    `    @import "./palette.tailwind.css";`,
    `  Use como utilitário Tailwind: bg-surface-canvas, text-text-on-canvas, etc.`,
    "*/",
    "",
    "@theme {",
  ];
  for (const c of palette) {
    if (c.notes) lines.push(`  /* ${c.notes} */`);
    lines.push(`  --color-${cssVarName(c.id)}: ${c.hasAlpha ? c.rgb.cssAlpha : c.hex};`);
  }
  lines.push("}", "");
  return lines.join("\n");
}

function buildAndroidXml(ctx) {
  const { manifest, palette } = ctx;
  const lines = [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<!-- ${manifest.name} — Android colors.xml — copie para res/values/colors.xml -->`,
    `<resources>`,
  ];
  for (const c of palette) {
    const name = snakeCase(`color_${c.id.replace(/\./g, "_")}`);
    const value = c.hasAlpha
      ? `#${Math.round(c.rgb.a * 255).toString(16).padStart(2, "0").toUpperCase()}${c.hex.slice(1)}`
      : `#FF${c.hex.slice(1)}`;
    const comment = c.notes ? ` <!-- ${escapeXml(c.notes)} -->` : "";
    lines.push(`  <color name="${name}">${value}</color>${comment}`);
  }
  lines.push(`</resources>`, "");
  return lines.join("\n");
}

function buildIosSwift(ctx) {
  const { manifest, palette } = ctx;
  const ns = pascalCase(manifest.name) + "Colors";
  const lines = [
    `// ${manifest.name} — Swift / SwiftUI / UIKit — gerado automaticamente.`,
    "",
    "import SwiftUI",
    "#if canImport(UIKit)",
    "import UIKit",
    "#endif",
    "",
    `enum ${ns} {`,
  ];
  for (const c of palette) {
    const prop = camelCase(c.id.replace(/\./g, "-"));
    const r = (c.rgb.r / 255).toFixed(4);
    const g = (c.rgb.g / 255).toFixed(4);
    const b = (c.rgb.b / 255).toFixed(4);
    if (c.notes) lines.push(`  /// ${c.notes}`);
    lines.push(`  static let ${prop} = Color(red: ${r}, green: ${g}, blue: ${b}, opacity: ${c.rgb.a})`);
  }
  lines.push("}", "");
  lines.push("#if canImport(UIKit)");
  lines.push(`extension ${ns} {`);
  for (const c of palette) {
    const prop = camelCase(c.id.replace(/\./g, "-")) + "UI";
    const r = (c.rgb.r / 255).toFixed(4);
    const g = (c.rgb.g / 255).toFixed(4);
    const b = (c.rgb.b / 255).toFixed(4);
    lines.push(`  static let ${prop} = UIColor(red: ${r}, green: ${g}, blue: ${b}, alpha: ${c.rgb.a})`);
  }
  lines.push("}");
  lines.push("#endif", "");
  return lines.join("\n");
}

function buildComposeKt(ctx) {
  const { manifest, palette } = ctx;
  const ns = pascalCase(manifest.name) + "Colors";
  const lines = [
    `// ${manifest.name} — Jetpack Compose — gerado automaticamente.`,
    "",
    "import androidx.compose.ui.graphics.Color",
    "",
    `object ${ns} {`,
  ];
  for (const c of palette) {
    const name = pascalCase(c.id.replace(/\./g, "-"));
    const r = (c.rgb.r / 255).toFixed(4);
    const g = (c.rgb.g / 255).toFixed(4);
    const b = (c.rgb.b / 255).toFixed(4);
    const a = c.rgb.a.toFixed(4);
    if (c.notes) lines.push(`  /** ${c.notes} */`);
    lines.push(`  val ${name} = Color(red = ${r}f, green = ${g}f, blue = ${b}f, alpha = ${a}f)`);
  }
  lines.push("}", "");
  return lines.join("\n");
}

function buildTs(ctx) {
  const { palette } = ctx;
  const lines = [
    `// ${ctx.manifest.name} — TypeScript module — gerado automaticamente.`,
    "",
    "export type BrandColor = Readonly<{",
    "  id: string;",
    "  group: string;",
    "  name: string;",
    "  label: string;",
    "  hex: string;",
    "  rgb: readonly [number, number, number];",
    "  alpha: number;",
    "  css: string;",
    "  framerPath: string | null;",
    "  notes: string | null;",
    "}>;",
    "",
    "export const brandColors = {",
  ];
  for (const c of palette) {
    const key = camelCase(c.id.replace(/\./g, "-"));
    lines.push(`  ${key}: {`);
    lines.push(`    id: ${JSON.stringify(c.id)},`);
    lines.push(`    group: ${JSON.stringify(c.group)},`);
    lines.push(`    name: ${JSON.stringify(c.name)},`);
    lines.push(`    label: ${JSON.stringify(c.label)},`);
    lines.push(`    hex: ${JSON.stringify(c.hex)},`);
    lines.push(`    rgb: [${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}] as const,`);
    lines.push(`    alpha: ${c.rgb.a},`);
    lines.push(`    css: ${JSON.stringify(c.hasAlpha ? c.rgb.cssAlpha : c.hex)},`);
    lines.push(`    framerPath: ${c.framerPath ? JSON.stringify(c.framerPath) : "null"},`);
    lines.push(`    notes: ${c.notes ? JSON.stringify(c.notes) : "null"},`);
    lines.push(`  },`);
  }
  lines.push("} as const satisfies Record<string, BrandColor>;");
  lines.push("");
  lines.push("export type BrandColorKey = keyof typeof brandColors;");
  lines.push("");
  return lines.join("\n");
}

function buildJs(ctx) {
  const { palette } = ctx;
  const lines = [
    `// ${ctx.manifest.name} — JavaScript module (CommonJS + ESM) — gerado automaticamente.`,
    "",
    "const brandColors = {",
  ];
  for (const c of palette) {
    const key = camelCase(c.id.replace(/\./g, "-"));
    lines.push(`  ${key}: {`);
    lines.push(`    id: ${JSON.stringify(c.id)},`);
    lines.push(`    group: ${JSON.stringify(c.group)},`);
    lines.push(`    name: ${JSON.stringify(c.name)},`);
    lines.push(`    label: ${JSON.stringify(c.label)},`);
    lines.push(`    hex: ${JSON.stringify(c.hex)},`);
    lines.push(`    rgb: [${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}],`);
    lines.push(`    alpha: ${c.rgb.a},`);
    lines.push(`    css: ${JSON.stringify(c.hasAlpha ? c.rgb.cssAlpha : c.hex)},`);
    lines.push(`    framerPath: ${c.framerPath ? JSON.stringify(c.framerPath) : "null"},`);
    lines.push(`    notes: ${c.notes ? JSON.stringify(c.notes) : "null"},`);
    lines.push(`  },`);
  }
  lines.push("};");
  lines.push("");
  lines.push("module.exports = { brandColors };");
  lines.push("module.exports.default = brandColors;");
  lines.push("");
  return lines.join("\n");
}

function buildPython(ctx) {
  const { palette } = ctx;
  const lines = [
    `"""${ctx.manifest.name} — Python module — gerado automaticamente."""`,
    "",
    "from typing import TypedDict, Tuple, Optional",
    "",
    "class BrandColor(TypedDict):",
    "    id: str",
    "    group: str",
    "    name: str",
    "    label: str",
    "    hex: str",
    "    rgb: Tuple[int, int, int]",
    "    alpha: float",
    "    css: str",
    "    framer_path: Optional[str]",
    "    notes: Optional[str]",
    "",
    "BRAND_COLORS: dict[str, BrandColor] = {",
  ];
  for (const c of palette) {
    const key = snakeCase(c.id.replace(/\./g, "_"));
    lines.push(`    "${key}": {`);
    lines.push(`        "id": ${JSON.stringify(c.id)},`);
    lines.push(`        "group": ${JSON.stringify(c.group)},`);
    lines.push(`        "name": ${JSON.stringify(c.name)},`);
    lines.push(`        "label": ${JSON.stringify(c.label)},`);
    lines.push(`        "hex": ${JSON.stringify(c.hex)},`);
    lines.push(`        "rgb": (${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}),`);
    lines.push(`        "alpha": ${c.rgb.a},`);
    lines.push(`        "css": ${JSON.stringify(c.hasAlpha ? c.rgb.cssAlpha : c.hex)},`);
    lines.push(`        "framer_path": ${c.framerPath ? JSON.stringify(c.framerPath) : "None"},`);
    lines.push(`        "notes": ${c.notes ? JSON.stringify(c.notes) : "None"},`);
    lines.push("    },");
  }
  lines.push("}", "");
  return lines.join("\n");
}

// Per-color individual swatch SVG — drag & drop into Illustrator/Figma
function buildSwatchSingleSvg(c) {
  const fill = c.hasAlpha ? c.rgb.cssAlpha : c.hex;
  const labelColor = (!c.hasAlpha && c.luminance < 0.4) ? BBO_CHROME.bg : BBO_CHROME.ink;
  const overlay = c.hasAlpha
    ? `<rect width="400" height="400" fill="url(#checker)"/><rect width="400" height="400" fill="${fill}"/>`
    : `<rect width="400" height="400" fill="${fill}"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <pattern id="checker" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="${BBO_CHROME.bgWhite}"/>
      <rect width="10" height="10" fill="${BBO_CHROME.line}"/>
      <rect x="10" y="10" width="10" height="10" fill="${BBO_CHROME.line}"/>
    </pattern>
  </defs>
  ${overlay}
  <text x="20" y="40" font-family="${BBO_CHROME.fontDisplay}" font-size="22" fill="${labelColor}" opacity="0.95">${escapeXml(c.label)}</text>
  <text x="20" y="62" font-family="${BBO_CHROME.fontMono}" font-size="11" fill="${labelColor}" opacity="0.7">${escapeXml(c.id)}${c.framerPath ? "  ·  " + escapeXml(c.framerPath) : ""}</text>
  <text x="20" y="380" font-family="${BBO_CHROME.fontMono}" font-size="14" fill="${labelColor}" opacity="0.85">${c.hasAlpha ? escapeXml(c.rgb.cssAlpha) : c.hex}</text>
</svg>
`;
}

// A4 print-ready sheet (210x297mm @ 72dpi ≈ 595x842pt)
function buildPrintSheetSvg(ctx) {
  const { manifest, palette } = ctx;
  const opaque = palette.filter((c) => !c.hasAlpha);
  const W = 595, H = 842;
  const margin = 36;
  const cols = 3;
  const colGap = 10;
  const cardW = (W - margin * 2 - colGap * (cols - 1)) / cols;
  const cardH = 200;
  const rowGap = 18;

  const parts = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<rect width="100%" height="100%" fill="${BBO_CHROME.bgWhite}"/>`,
    `<text x="${margin}" y="${margin + 4}" font-family="${BBO_CHROME.fontDisplay}" font-size="22" fill="${BBO_CHROME.ink}">${escapeXml(manifest.name)}</text>`,
    `<text x="${margin}" y="${margin + 22}" font-family="${BBO_CHROME.fontDisplay}" font-size="10" fill="${BBO_CHROME.ink}" opacity="0.6">Cores institucionais — folha de impressão (A4)</text>`,
    `<text x="${margin}" y="${margin + 36}" font-family="${BBO_CHROME.fontDisplay}" font-size="9" fill="${BBO_CHROME.inkSoft}">CMYK aproximado · sempre validar com prova de cor antes da tiragem</text>`,
    `<line x1="${margin}" y1="${margin + 46}" x2="${W - margin}" y2="${margin + 46}" stroke="${BBO_CHROME.ink}" stroke-opacity="0.2"/>`,
  ];

  const startY = margin + 60;
  for (let i = 0; i < opaque.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = margin + col * (cardW + colGap);
    const y = startY + row * (cardH + rowGap);
    const c = opaque[i];
    const overTone = c.luminance < 0.4 ? BBO_CHROME.bgWhite : BBO_CHROME.ink;
    const pms = suggestPantone(c.rgb);

    parts.push(`<g transform="translate(${x}, ${y})">`);
    parts.push(`<rect width="${cardW}" height="90" fill="${c.hex}"/>`);
    parts.push(`<text x="10" y="22" font-family="${BBO_CHROME.fontDisplay}" font-size="11" fill="${overTone}">${escapeXml(c.label)}</text>`);
    parts.push(`<text x="${cardW - 10}" y="${90 - 10}" text-anchor="end" font-family="${BBO_CHROME.fontMono}" font-size="10" fill="${overTone}" opacity="0.85">${c.hex}</text>`);
    parts.push(`<rect y="90" width="${cardW}" height="${cardH - 90}" fill="${BBO_CHROME.bgWhite}" stroke="${BBO_CHROME.ink}" stroke-opacity="0.15"/>`);
    let ty = 108;
    parts.push(`<text x="10" y="${ty}" font-family="${BBO_CHROME.fontMono}" font-size="8.5" fill="${BBO_CHROME.ink}">RGB ${c.rgb.r} · ${c.rgb.g} · ${c.rgb.b}</text>`);
    ty += 14;
    parts.push(`<text x="10" y="${ty}" font-family="${BBO_CHROME.fontMono}" font-size="8.5" fill="${BBO_CHROME.ink}">CMYK ${c.cmyk.c} · ${c.cmyk.m} · ${c.cmyk.y} · ${c.cmyk.k}</text>`);
    ty += 14;
    parts.push(`<text x="10" y="${ty}" font-family="${BBO_CHROME.fontMono}" font-size="8.5" fill="${BBO_CHROME.ink}">LAB ${c.lab.l} · ${c.lab.a} · ${c.lab.b}</text>`);
    ty += 14;
    parts.push(`<text x="10" y="${ty}" font-family="${BBO_CHROME.fontMono}" font-size="8.5" fill="${BBO_CHROME.ink}">HSL ${c.hsl.h}° · ${c.hsl.s}% · ${c.hsl.l}%</text>`);
    if (pms) {
      ty += 18;
      parts.push(`<text x="10" y="${ty}" font-family="${BBO_CHROME.fontMono}" font-size="8" fill="${BBO_CHROME.inkSoft}">PMS ~ ${escapeXml(pms.split("(")[0].trim())}</text>`);
    }
    parts.push("</g>");
  }
  parts.push(`<text x="${margin}" y="${H - 18}" font-family="${BBO_CHROME.fontDisplay}" font-size="8" fill="${BBO_CHROME.ink}" opacity="0.55">Pantone, CMYK e LAB são aproximações sem ICC. Para impressão crítica, usar Pantone Solid Coated ou prova de cor calibrada (FOGRA39/GRACoL).</text>`);
  parts.push("</svg>");
  return parts.join("\n");
}
