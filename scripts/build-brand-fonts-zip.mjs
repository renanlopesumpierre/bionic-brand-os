#!/usr/bin/env node
// Builds {slug}-brand-fonts.zip with one folder per font family containing
// both formats:
//   ttf/   — one .ttf per weight (full glyph set, ideal for design tools and OS install)
//   woff2/ — subsetted .woff2 files (modern web)
//   fontface.css — Google Fonts CSS for direct embed
//
// Reads font definitions from public/clients/{slug}/downloads/{slug}-fonts.json.
// Honors `availableWeights` (preferred) or falls back to `weights` / `brandWeights`.

import {
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
  statSync,
  copyFileSync,
} from "fs";
import { join, basename } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";

import { mdToPdf, closeBrowser } from "./lib/pdf/index.mjs";

const root = process.cwd();
const clientsDir = join(root, "public", "clients");

// css2 with no/legacy UA returns full TTF (one file per weight).
const UA_TTF = "Mozilla/4.0";
// css2 with modern Chrome UA returns subsetted WOFF2.
const UA_WOFF2 =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

if (!existsSync(clientsDir)) {
  console.error("No public/clients directory.");
  process.exit(1);
}

const slugs = readdirSync(clientsDir).filter((name) => {
  const dir = join(clientsDir, name);
  return (
    statSync(dir).isDirectory() &&
    existsSync(join(dir, "downloads", `${name}-fonts.json`))
  );
});

if (slugs.length === 0) {
  console.log("No clients with a {slug}-fonts.json metadata file.");
  process.exit(0);
}

for (const slug of slugs) await buildFontsZipForClient(slug);
await closeBrowser();

async function buildFontsZipForClient(slug) {
  const downloadsDir = join(clientsDir, slug, "downloads");
  const metaPath = join(downloadsDir, `${slug}-fonts.json`);
  const meta = JSON.parse(readFileSync(metaPath, "utf-8"));

  const stage = join(tmpdir(), `brand-fonts-${slug}-${Date.now()}`);
  mkdirSync(stage, { recursive: true });
  copyFileSync(metaPath, join(stage, "fonts-metadata.json"));

  const readme = [
    `# Tipografia — ${meta.client}`,
    "",
    `Versão ${meta.version ?? "—"} · gerado pelo Bionic Brand OS em ${new Date().toLocaleDateString("pt-BR")}.`,
    "",
    `Este pacote contém as fontes oficiais da marca **${meta.client}** em dois formatos: \`.ttf\` (instalável no SO, abre em qualquer ferramenta) e \`.woff2\` (otimizado pra web).`,
    "",
    "---",
    "",
    "## Estrutura",
    "",
    "Cada família tem sua própria pasta com:",
    "",
    "- **`ttf/`** — um arquivo por peso, com todos os glyphs. Use no Figma, Adobe, ou **instale no sistema operacional** (Mac: clique 2x no arquivo → Instalar; Windows: clique direito → Instalar).",
    "- **`woff2/`** — versões subsetted otimizadas pra web. Carregue via `fontface.css`.",
    "- **`fontface.css`** — declarações `@font-face` prontas pra colar no projeto web.",
    "",
    "## Como usar",
    "",
    "### No Figma / Adobe / Sketch",
    "1. Instale os `.ttf` no SO (Mac: Font Book; Windows: Painel de Controle → Fontes).",
    "2. Reinicie a ferramenta de design.",
    "3. As famílias aparecem no seletor de fontes.",
    "",
    "### No Microsoft Office (Word, PowerPoint)",
    "1. Mesma instalação no SO.",
    "2. **Atenção:** ao compartilhar o arquivo, embuta a fonte (Word: Arquivo → Opções → Salvar → Incorporar fontes) ou o destinatário verá fallback genérico.",
    "",
    "### No web (HTML/CSS)",
    "1. Copie a pasta `woff2/` da família que quer pro projeto.",
    "2. Cole o conteúdo do `fontface.css` no seu CSS principal (ou importe o arquivo).",
    "3. Use no CSS: `font-family: \"NomeDaFonte\", -apple-system, sans-serif;`",
    "",
    "---",
    "",
    "## Famílias incluídas",
    "",
  ];

  for (const font of meta.fonts) {
    const folderName = slugify(font.family);
    const folder = join(stage, folderName);
    const ttfDir = join(folder, "ttf");
    const woff2Dir = join(folder, "woff2");
    mkdirSync(ttfDir, { recursive: true });
    mkdirSync(woff2Dir, { recursive: true });

    const weights =
      font.availableWeights || font.weights || font.brandWeights || [400];
    console.log(
      `[${slug}] ${font.family} — pesos: ${weights.join(", ")}`,
    );

    const cssBase = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      font.family,
    ).replace(/%20/g, "+")}:wght@${weights.join(";")}&display=swap`;

    // 1) TTF — one per weight
    const ttfFaces = await fetchAndParse(cssBase, UA_TTF, folderName);
    const ttfFiles = await downloadFaces(ttfFaces, ttfDir, "ttf");
    console.log(`  ttf:   ${ttfFiles.length} arquivos`);

    // 2) WOFF2 — subsetted, save as fontface.css too
    const cssRes = await fetch(cssBase, {
      headers: { "User-Agent": UA_WOFF2 },
    });
    const css = await cssRes.text();
    writeFileSync(join(folder, "fontface.css"), css);
    const w2Faces = parseFontFaces(css, folderName, "woff2");
    const w2Files = await downloadFaces(w2Faces, woff2Dir, "woff2");
    console.log(`  woff2: ${w2Files.length} arquivos`);

    readme.push(
      `## ${font.family}`,
      `- Papel: ${font.role}`,
      `- Pesos disponíveis: ${weights.join(", ")}`,
      `- Pesos do brand system: ${(font.brandWeights || font.weights || []).join(", ") || "—"}`,
      `- Fonte: ${font.source} — ${font.url}`,
      `- Stack CSS: \`${font.fontFamily}\``,
      `- Uso: ${font.usage}`,
      "",
    );
  }

  readme.push(
    "---",
    "",
    "## Licença",
    "",
    "Arquivos servidos diretamente do Google Fonts (ou outra fonte indicada acima). Confira a licença de cada família no site de origem antes de redistribuir comercialmente. A maioria é Open Font License (OFL), que permite uso comercial e embed em produtos.",
    "",
    "---",
    "",
    "## Pacotes relacionados",
    "",
    `- **\`${slug}-brand-colors.zip\`** — paleta oficial em 16 formatos`,
    `- **\`${slug}-brand-assets.zip\`** — logotipos (SVG, PNG, GIF)`,
    `- **\`${slug}-brand-system.zip\`** — sistema de marca completo`,
    "",
    "---",
    "",
    "_Gerado pelo Bionic Brand OS._",
  );
  const readmeMd = readme.join("\n");
  writeFileSync(join(stage, "LEIA-ME.md"), readmeMd);

  // PDF institucional do BBO.
  const readmePdf = await mdToPdf(readmeMd, {
    brand: meta.client,
    title: "Tipografia",
    subtitle: "Fontes oficiais da marca em TTF e WOFF2.",
    eyebrow: "Bionic Brand OS · Tipografia",
    docId: "Fontes",
  });
  writeFileSync(join(stage, "LEIA-ME.pdf"), readmePdf);

  const outZip = join(downloadsDir, `${slug}-brand-fonts.zip`);
  if (existsSync(outZip)) rmSync(outZip);
  execSync(`cd "${stage}" && zip -rq "${outZip}" .`, { stdio: "inherit" });
  rmSync(stage, { recursive: true, force: true });

  console.log(`[${slug}] → ${basename(outZip)}\n`);
}

async function fetchAndParse(url, ua, familySlug) {
  const res = await fetch(url, { headers: { "User-Agent": ua } });
  if (!res.ok) {
    console.warn(`  ! ${res.status} fetching ${url}`);
    return [];
  }
  const css = await res.text();
  return parseFontFaces(css, familySlug);
}

function parseFontFaces(css, familySlug) {
  const faces = [];
  const subsetCounter = new Map();
  const re = /(?:\/\*\s*([^*]+?)\s*\*\/\s*)?@font-face\s*\{([\s\S]*?)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const subsetRaw = (m[1] || "").trim();
    const body = m[2];
    const urlMatch = body.match(/url\((https:[^)]+\.(woff2|ttf|woff))\)/);
    if (!urlMatch) continue;
    const url = urlMatch[1];
    const ext = urlMatch[2];
    const weight = body.match(/font-weight:\s*(\d+)/)?.[1] || "400";
    const style = body.match(/font-style:\s*(\w+)/)?.[1] || "normal";
    const subset = slugify(subsetRaw) || "default";
    const key = `${weight}-${style}-${subset}-${ext}`;
    const n = (subsetCounter.get(key) || 0) + 1;
    subsetCounter.set(key, n);
    const styleSuffix = style === "italic" ? "-italic" : "";
    const subsetSuffix =
      subset === "default" || ext === "ttf" ? "" : `-${subset}`;
    const dupSuffix = n > 1 ? `-${n}` : "";
    const filename = `${familySlug}-${weight}${styleSuffix}${subsetSuffix}${dupSuffix}.${ext}`;
    faces.push({ url, filename, weight, style, subset, ext });
  }
  return faces;
}

async function downloadFaces(faces, targetDir, expectExt) {
  const out = [];
  const seen = new Set();
  for (const face of faces) {
    if (expectExt && face.ext !== expectExt) continue;
    if (seen.has(face.url)) continue;
    seen.add(face.url);
    const res = await fetch(face.url, { headers: { "User-Agent": UA_WOFF2 } });
    if (!res.ok) {
      console.warn(`    ! ${res.status} ${face.url}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(targetDir, face.filename), buf);
    out.push(face.filename);
  }
  return out;
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
