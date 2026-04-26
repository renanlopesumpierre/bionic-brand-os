#!/usr/bin/env node
// Builds {slug}-brand-assets.zip with svg/, png/, animado/ folders for each client
// that has a brand directory under public/clients/{slug}/brand/.

import {
  readdirSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  rmSync,
  readFileSync,
  writeFileSync,
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
const PNG_SCALE = 4;

if (!existsSync(clientsDir)) {
  console.error("No public/clients directory found.");
  process.exit(1);
}

const slugs = readdirSync(clientsDir).filter((name) => {
  const brandDir = join(clientsDir, name, "brand");
  return statSync(join(clientsDir, name)).isDirectory() && existsSync(brandDir);
});

if (slugs.length === 0) {
  console.log("No clients with a brand/ folder.");
  process.exit(0);
}

for (const slug of slugs) {
  await buildZipForClient(slug);
}
await closeBrowser();

async function buildZipForClient(slug) {
  const brandDir = join(clientsDir, slug, "brand");
  const downloadsDir = join(clientsDir, slug, "downloads");
  if (!existsSync(downloadsDir)) mkdirSync(downloadsDir, { recursive: true });

  const files = readdirSync(brandDir);
  const svgs = files.filter((f) => f.toLowerCase().endsWith(".svg"));
  const gifs = files.filter((f) => f.toLowerCase().endsWith(".gif"));

  if (svgs.length === 0 && gifs.length === 0) {
    console.log(`[${slug}] no brand assets, skipping.`);
    return;
  }

  const stage = join(tmpdir(), `brand-zip-${slug}-${Date.now()}`);
  const stageSvg = join(stage, "svg");
  const stagePng = join(stage, "png");
  const stageGif = join(stage, "animado");
  mkdirSync(stageSvg, { recursive: true });
  mkdirSync(stagePng, { recursive: true });
  mkdirSync(stageGif, { recursive: true });

  for (const svg of svgs) {
    copyFileSync(join(brandDir, svg), join(stageSvg, svg));
    const pngName = svg.replace(/\.svg$/i, ".png");
    await sharp(join(brandDir, svg), { density: 72 * PNG_SCALE })
      .png()
      .toFile(join(stagePng, pngName));
    console.log(`[${slug}] png  ${pngName}`);
  }

  for (const gif of gifs) {
    copyFileSync(join(brandDir, gif), join(stageGif, gif));
    console.log(`[${slug}] gif  ${gif}`);
  }

  // LEIA-ME (md + pdf) com instruções de uso institucional dos logos.
  const manifestPath = join(contentClientsDir, slug, "manifest.json");
  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, "utf-8"))
    : { name: slug };

  const readmeMd = buildLogosReadme(manifest, slug, { svgs, gifs });
  writeFileSync(join(stage, "LEIA-ME.md"), readmeMd);
  const readmePdf = await mdToPdf(readmeMd, {
    brand: manifest.name,
    title: "Logotipos",
    subtitle: "Versões oficiais, regras de uso e bandeiras vermelhas.",
    eyebrow: "Bionic Brand OS · Logotipos",
    docId: "Logos",
  });
  writeFileSync(join(stage, "LEIA-ME.pdf"), readmePdf);

  const outZip = join(downloadsDir, `${slug}-brand-assets.zip`);
  if (existsSync(outZip)) rmSync(outZip);
  execSync(`cd "${stage}" && zip -rq "${outZip}" .`, {
    stdio: "inherit",
  });
  rmSync(stage, { recursive: true, force: true });

  console.log(`[${slug}] → ${basename(outZip)}`);
}

function buildLogosReadme(manifest, slug, files) {
  return `# Logotipos — ${manifest.name}

Gerado pelo Bionic Brand OS em ${new Date().toLocaleDateString("pt-BR")}.

Este pacote contém os arquivos oficiais do logotipo de ${manifest.name}, em vetor (SVG), bitmap de alta resolução (PNG @4x) e símbolo animado (GIF), quando aplicável.

---

## O que tem aqui

\`\`\`
${slug}-brand-assets/
├── svg/        ← vetor, escalável sem perda. Use sempre que possível.
├── png/        ← rasterizado @4x (ideal pra PowerPoint, Word, redes sociais)
├── animado/    ← GIF (uso digital, intros, loaders)
├── LEIA-ME.pdf  ← este documento
└── LEIA-ME.md
\`\`\`

**Variantes incluídas:** ${files.svgs.length} versão${files.svgs.length === 1 ? "" : "s"} em SVG/PNG${files.gifs.length > 0 ? ` + ${files.gifs.length} animação${files.gifs.length === 1 ? "" : "es"} GIF` : ""}.

---

## Quando usar cada formato

| Formato | Quando usar | Quando NÃO usar |
|---|---|---|
| **SVG** | Web, sistemas internos, design (Figma, Adobe), impressão vetorial | Microsoft Office (suporte limitado) |
| **PNG @4x** | Slides, documentos Word, redes sociais, e-mails | Impressão grande (use SVG) |
| **GIF animado** | Intro de vídeo, loader, post de redes sociais | Materiais institucionais (use estático) |

---

## Variantes — quando usar qual

A maioria das marcas tem 2 variantes principais:

- **Logo positivo (preto)** — usar sobre fundos claros (branco, canvas, qualquer superfície clara)
- **Logo negativo (branco)** — usar sobre fundos escuros (preto, escuro institucional, fotos com pouca luz)

Ícone (versão reduzida) — usar quando o wordmark completo perde legibilidade: favicon, app icon, avatar de perfil, badge.

---

## Regras universais (independem da marca)

- **Espaço de proteção:** mantenha ao redor do logo um espaço livre equivalente à altura da letra-base. Nada pode invadir essa área.
- **Tamanho mínimo:**
  - Wordmark: 80px de largura mínima na tela; 25mm na impressão.
  - Ícone: 24px na tela; 10mm na impressão.
- **Não distorça:** nunca esticar, achatar ou rotacionar o logo. Use o arquivo nativo no tamanho certo.
- **Não recolore:** use só as variantes oficiais (positivo/negativo). Não aplicar gradientes, sombras, contornos, brilhos.
- **Não componha:** o logo é um sistema fechado. Não adicione tagline embaixo, não combine com outro logo sem espaço de proteção dobrado.

---

## Bandeiras vermelhas — refuse se vir

- Logo esticado horizontal/vertical
- Logo com sombra, glow, gradiente ou contorno
- Logo aplicado direto sobre foto sem garantir contraste
- Logo em cor não oficial
- Logo invadido por elemento gráfico
- Versão antiga junto com nova no mesmo material

---

## Pacotes relacionados

- **\`${slug}-brand-colors.zip\`** — paleta oficial em 16 formatos (web, design, gráfica, mobile)
- **\`${slug}-brand-fonts.zip\`** — fontes da marca
- **\`${slug}-brand-system.zip\`** — sistema de marca completo (estratégia + visual + verbal + governança)

---

_Gerado pelo Bionic Brand OS._
`;
}
