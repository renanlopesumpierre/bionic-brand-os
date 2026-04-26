#!/usr/bin/env node
// Builds {slug}-design-tokens.zip — pacote dos design tokens estruturados
// pra download humano. Contém:
//   - {slug}-design-tokens.json    (fonte canônica W3C-friendly)
//   - {slug}-design-system.md      (sistema de design narrativo, se houver)
//   - LEIA-ME.pdf                  (manual de uso institucional BBO)
//   - LEIA-ME.md                   (mesmo conteúdo em markdown)
//
// Endpoint /api/{slug}/tokens continua servindo JSON puro pra agentes.
// Pacote dedicado de paleta com 16 formatos visuais fica no
// {slug}-brand-colors.zip (separado, focado em cor).

import {
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
  copyFileSync,
} from "fs";
import { join, basename } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";

import { mdToPdf, closeBrowser } from "./lib/pdf/index.mjs";

const root = process.cwd();
const clientsDir = join(root, "public", "clients");
const contentClientsDir = join(root, "content", "clients");

const slugs = readdirSync(contentClientsDir).filter((name) => {
  const p = join(contentClientsDir, name, "design-tokens.json");
  return existsSync(p);
});

if (slugs.length === 0) {
  console.log("Nenhum cliente com design-tokens.json.");
  process.exit(0);
}

for (const slug of slugs) await buildDesignTokensZipForClient(slug);
await closeBrowser();

async function buildDesignTokensZipForClient(slug) {
  const srcDir = join(contentClientsDir, slug);
  const manifest = JSON.parse(
    readFileSync(join(srcDir, "manifest.json"), "utf-8"),
  );

  const downloadsDir = join(clientsDir, slug, "downloads");
  if (!existsSync(downloadsDir)) mkdirSync(downloadsDir, { recursive: true });

  const stage = join(tmpdir(), `design-tokens-${slug}-${Date.now()}`);
  mkdirSync(stage, { recursive: true });

  // Fontes canônicas
  copyFileSync(
    join(srcDir, "design-tokens.json"),
    join(stage, `${slug}-design-tokens.json`),
  );
  if (existsSync(join(srcDir, "design-system.md"))) {
    copyFileSync(
      join(srcDir, "design-system.md"),
      join(stage, `${slug}-design-system.md`),
    );
  }

  // LEIA-ME (md + pdf)
  const readmeMd = buildReadme(manifest, slug);
  writeFileSync(join(stage, "LEIA-ME.md"), readmeMd);
  const readmePdf = await mdToPdf(readmeMd, {
    brand: manifest.name,
    title: "Design Tokens",
    subtitle: "Cores, tipografia, espaçamento — sistema de design completo.",
    eyebrow: "Bionic Brand OS · Design Tokens",
    docId: "Design Tokens",
  });
  writeFileSync(join(stage, "LEIA-ME.pdf"), readmePdf);

  const outZip = join(downloadsDir, `${slug}-design-tokens.zip`);
  if (existsSync(outZip)) rmSync(outZip);
  execSync(`cd "${stage}" && zip -rq "${outZip}" .`, { stdio: "inherit" });
  rmSync(stage, { recursive: true, force: true });
  console.log(`[${slug}] → ${basename(outZip)}`);
}

function buildReadme(manifest, slug) {
  const version = manifest.versions?.designTokens ?? "—";
  return `# Design Tokens — ${manifest.name}

Versão ${version} · gerado pelo Bionic Brand OS em ${new Date().toLocaleDateString("pt-BR")}.

Este pacote contém o **sistema de design** de ${manifest.name} como tokens estruturados (JSON) e narrativa (Markdown).

---

## O que tem aqui

\`\`\`
${slug}-design-tokens/
├── ${slug}-design-tokens.json   ← tokens canônicos estruturados
├── ${slug}-design-system.md     ← sistema de design narrativo
├── LEIA-ME.pdf                   ← este documento
└── LEIA-ME.md                    ← mesmo conteúdo em markdown
\`\`\`

---

## O que são design tokens

Tokens de design são **decisões cromáticas, tipográficas e espaciais codificadas como dados**. Em vez de "use o azul daquele PDF da branding", você tem \`color.surface.primary = "#FFFFFF"\` — uma fonte de verdade que vira CSS, Figma styles, Swift, Android XML, e qualquer outro formato programático.

Este JSON segue uma estrutura próxima ao **W3C Design Tokens Format Module** (ainda em fase comunitária, mas adotado por Tokens Studio, Style Dictionary e outras ferramentas).

---

## Estrutura do JSON (resumo)

| Seção | O que contém |
|---|---|
| \`color.surface\` | Superfícies (light, dark, canvas, cream) |
| \`color.accent\` | Cor(es) de acento e suas variantes |
| \`color.text\` | Cores de texto por contexto (sobre claro, sobre escuro) |
| \`color.border\`, \`color.overlay\`, \`color.feedback\` | Variações funcionais |
| \`color.legacyWeb\` (opcional) | Cores legadas em uso na web atual |
| \`font.family\` | Stacks CSS de serif e sans |
| \`font.weight\` | Pesos canônicos |
| \`typography\` | Escala completa (heading1-6, display, body, label) com font/size/lineHeight/letterSpacing/sample |
| \`spacing\` | Escala de espaçamento (0, 0-5, 1, 2, 2-5, ...) |
| \`radius\`, \`border\`, \`shadow\`, \`breakpoint\` | Outros tokens |
| \`component\` | Specs de componentes (button, card, etc.) |
| \`visual\`, \`visualRules\` | Regras de aplicação visual |

---

## Quando usar cada arquivo

### \`${slug}-design-tokens.json\` — pra implementação

- Importar no Figma via plugin **Tokens Studio**
- Consumir em código (web, iOS, Android, scripts) — ver pacote dedicado **${slug}-brand-colors.zip** que tem 16 formatos prontos (CSS, SCSS, LESS, Tailwind v3/v4, Figma, Android XML, iOS Swift, Compose Kotlin, TS/JS/Python, GIMP .gpl, Adobe .ase)
- Pipelines de validação visual (cor de peça vs paleta)
- Geração automática de variações (dark mode, theming multi-marca)

### \`${slug}-design-system.md\` — pra entendimento

Versão narrativa explicando **por que** cada decisão foi tomada, regras de aplicação, exemplos de uso. Leitura recomendada antes de implementar.

---

## Acesso programático (API)

- **URL:** \`/api/${slug}/tokens\`
- **Formato:** JSON (mesma fonte canônica)
- **Rate limit:** 60 req/min por IP

---

## Pacotes relacionados

- **\`${slug}-brand-colors.zip\`** — paleta em 16 formatos visuais, organizada por audiência (designer, gráfica, dev, IA), com folha A4 imprimível e auditoria WCAG
- **\`${slug}-brand-fonts.zip\`** — arquivos de fonte (TTF + WOFF2) e metadata
- **\`${slug}-brand-system.zip\`** — sistema de marca completo (estratégia + visual + verbal + governança)

---

_Gerado pelo Bionic Brand OS._
`;
}
