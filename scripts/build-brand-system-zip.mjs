#!/usr/bin/env node
// Builds {slug}-brand-system.zip — pacote do Brand System estruturado
// pra download humano. Contém:
//   - {slug}-brand-system.json  (fonte canônica, idêntica à API route)
//   - {slug}-brand-system.md    (versão narrativa)
//   - LEIA-ME.pdf               (manual de uso institucional BBO)
//   - LEIA-ME.md                (mesmo conteúdo em markdown)
//
// O endpoint /api/{slug}/brand-system continua servindo JSON puro pra
// consumo programático (agentes, IAs, pipelines). Este ZIP é só pra
// download humano via página /assets.

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
  const p = join(contentClientsDir, name, "brand-system.json");
  return existsSync(p);
});

if (slugs.length === 0) {
  console.log("Nenhum cliente com brand-system.json.");
  process.exit(0);
}

for (const slug of slugs) await buildBrandSystemZipForClient(slug);
await closeBrowser();

async function buildBrandSystemZipForClient(slug) {
  const srcDir = join(contentClientsDir, slug);
  const manifest = JSON.parse(
    readFileSync(join(srcDir, "manifest.json"), "utf-8"),
  );

  const downloadsDir = join(clientsDir, slug, "downloads");
  if (!existsSync(downloadsDir)) mkdirSync(downloadsDir, { recursive: true });

  const stage = join(tmpdir(), `brand-system-${slug}-${Date.now()}`);
  mkdirSync(stage, { recursive: true });

  // Fontes canônicas — copia direto do conteúdo do cliente.
  copyFileSync(
    join(srcDir, "brand-system.json"),
    join(stage, `${slug}-brand-system.json`),
  );
  if (existsSync(join(srcDir, "brand-system.md"))) {
    copyFileSync(
      join(srcDir, "brand-system.md"),
      join(stage, `${slug}-brand-system.md`),
    );
  }

  // LEIA-ME (md + pdf)
  const readmeMd = buildReadme(manifest, slug);
  writeFileSync(join(stage, "LEIA-ME.md"), readmeMd);
  const readmePdf = await mdToPdf(readmeMd, {
    brand: manifest.name,
    title: "Brand System",
    subtitle: "Sistema de marca estruturado em JSON + narrativa em Markdown.",
    eyebrow: "Bionic Brand OS · Brand System",
    docId: "Brand System",
  });
  writeFileSync(join(stage, "LEIA-ME.pdf"), readmePdf);

  const outZip = join(downloadsDir, `${slug}-brand-system.zip`);
  if (existsSync(outZip)) rmSync(outZip);
  execSync(`cd "${stage}" && zip -rq "${outZip}" .`, { stdio: "inherit" });
  rmSync(stage, { recursive: true, force: true });
  console.log(`[${slug}] → ${basename(outZip)}`);
}

function buildReadme(manifest, slug) {
  const version = manifest.versions?.brandSystem ?? "—";
  return `# Brand System — ${manifest.name}

Versão ${version} · gerado pelo Bionic Brand OS em ${new Date().toLocaleDateString("pt-BR")}.

Este pacote contém o **sistema de marca estruturado** de ${manifest.name} em duas camadas: dados (JSON) pra máquinas e narrativa (Markdown) pra pessoas.

---

## O que tem aqui

\`\`\`
${slug}-brand-system/
├── ${slug}-brand-system.json   ← fonte canônica estruturada (máquinas)
├── ${slug}-brand-system.md     ← versão narrativa (pessoas)
├── LEIA-ME.pdf                  ← este documento
└── LEIA-ME.md                   ← mesmo conteúdo em markdown
\`\`\`

---

## Quando usar cada um

### \`${slug}-brand-system.json\` — pra máquinas

Schema estruturado com **20 seções**: essência, método, arquitetura de marca, audiência, sistema verbal, sistema visual, governança, gabaritos por peça, critérios de validação, frases sagradas, léxico canônico vs proibido, e mais.

**Quando importar:**

- Um agente conversacional (ex: Brand Agent do BBO) que precisa de contexto completo da marca
- Pipeline de validação automática (\`peça → checa contra os 9 critérios\`)
- Geração programática de copy seguindo gabaritos
- Auditorias automatizadas de coerência

### \`${slug}-brand-system.md\` — pra pessoas

Mesmo conteúdo do JSON em formato narrativo, formatado pra leitura direta. **Quando ler:**

- Onboarding de novo colaborador na marca
- Reunião de alinhamento estratégico
- Quando precisa explicar a marca pra alguém de fora
- Como referência rápida sem abrir editor JSON

---

## Acesso programático (API)

Esta marca também responde no endpoint público:

- **URL:** \`/api/${slug}/brand-system\`
- **Formato:** JSON (mesma fonte canônica deste ZIP)
- **Rate limit:** 60 req/min por IP
- **Quando usar:** integrações em tempo real (não precisa baixar e descompactar)

---

## Atualização

O Brand System é regenerado automaticamente sempre que a fonte canônica em \`/Brandbook\` é atualizada. Para forçar regeneração: \`pnpm build:brand-system-zips\`.

Não edite arquivos dentro deste ZIP — mudanças somem no próximo build. A fonte de verdade é o repositório do Brandbook da marca.

---

_Gerado pelo Bionic Brand OS — sistema operacional de marcas que conversam com humanos e máquinas._
`;
}
