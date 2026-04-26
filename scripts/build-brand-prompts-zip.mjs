#!/usr/bin/env node
// Builds {slug}-brand-prompts.zip — pacote dos prompts da marca pra IAs.
// Junta os 2 .md de prompt num único download humano-amigável:
//
//   - {slug}-brand-prompt.md         (prompt destilado, leve, copia-cola)
//   - {slug}-brand-agent-master.md   (system prompt operacional do agente)
//   - LEIA-ME.pdf                    (manual: qual usar quando)
//   - LEIA-ME.md
//
// Endpoints /api/{slug}/prompt e /api/{slug}/prompt?flavor=master
// continuam servindo o markdown puro pra integração programática.

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
  return existsSync(join(contentClientsDir, name, "brand-prompt.md"));
});

if (slugs.length === 0) {
  console.log("Nenhum cliente com brand-prompt.md.");
  process.exit(0);
}

for (const slug of slugs) await buildBrandPromptsZipForClient(slug);
await closeBrowser();

async function buildBrandPromptsZipForClient(slug) {
  const srcDir = join(contentClientsDir, slug);
  const manifest = JSON.parse(
    readFileSync(join(srcDir, "manifest.json"), "utf-8"),
  );

  const downloadsDir = join(clientsDir, slug, "downloads");
  if (!existsSync(downloadsDir)) mkdirSync(downloadsDir, { recursive: true });

  const stage = join(tmpdir(), `brand-prompts-${slug}-${Date.now()}`);
  mkdirSync(stage, { recursive: true });

  copyFileSync(
    join(srcDir, "brand-prompt.md"),
    join(stage, `${slug}-brand-prompt.md`),
  );
  if (existsSync(join(srcDir, "brand-agent-master.md"))) {
    copyFileSync(
      join(srcDir, "brand-agent-master.md"),
      join(stage, `${slug}-brand-agent-master.md`),
    );
  }

  // LEIA-ME (md + pdf)
  const readmeMd = buildReadme(manifest, slug);
  writeFileSync(join(stage, "LEIA-ME.md"), readmeMd);
  const readmePdf = await mdToPdf(readmeMd, {
    brand: manifest.name,
    title: "Brand Prompts",
    subtitle: "Prompts destilados pra colar em qualquer IA conversacional.",
    eyebrow: "Bionic Brand OS · Prompts",
    docId: "Brand Prompts",
  });
  writeFileSync(join(stage, "LEIA-ME.pdf"), readmePdf);

  const outZip = join(downloadsDir, `${slug}-brand-prompts.zip`);
  if (existsSync(outZip)) rmSync(outZip);
  execSync(`cd "${stage}" && zip -rq "${outZip}" .`, { stdio: "inherit" });
  rmSync(stage, { recursive: true, force: true });
  console.log(`[${slug}] → ${basename(outZip)}`);
}

function buildReadme(manifest, slug) {
  return `# Brand Prompts — ${manifest.name}

Gerado pelo Bionic Brand OS em ${new Date().toLocaleDateString("pt-BR")}.

Pacote com **dois prompts prontos** pra usar com qualquer IA conversacional (Claude, GPT, Gemini, Cursor, Figma AI, etc.). Cada um tem um propósito diferente — escolha o certo pra economizar token e melhorar qualidade.

---

## O que tem aqui

\`\`\`
${slug}-brand-prompts/
├── ${slug}-brand-prompt.md          ← prompt destilado (leve, ~2-5KB)
├── ${slug}-brand-agent-master.md    ← system prompt operacional (~20-30KB)
├── LEIA-ME.pdf                       ← este documento
└── LEIA-ME.md                        ← mesmo conteúdo em markdown
\`\`\`

---

## Qual usar quando

### \`${slug}-brand-prompt.md\` — leve, pra contexto rápido

**Quando usar:**

- Você quer dar contexto de marca pra uma IA mas sem encher o prompt
- Tarefas pontuais: "escreva um post no tom dessa marca"
- IAs com janela de contexto limitada
- Custo de tokens importa (modelos pagos por input)

**Como usar:**

1. Abra o arquivo, copie o conteúdo inteiro
2. Cole **antes** da sua pergunta na IA
3. Faça a pergunta normalmente

Exemplo:

> [conteúdo do brand-prompt.md]
>
> Agora escreva 3 opções de headline pra um post no LinkedIn sobre liderança consciente.

### \`${slug}-brand-agent-master.md\` — pesado, pra operação contínua

**Quando usar:**

- Você está montando um **agente persistente** (ChatGPT custom GPT, Claude Project, Cursor rules, etc.)
- Precisa que a IA execute **validação** rigorosa contra o sistema da marca (frases sagradas, léxico proibido, gabaritos)
- Trabalho de longo prazo onde a IA precisa "saber" tudo da marca

**Como usar:**

1. **ChatGPT Custom GPT:** cole no campo "Instructions"
2. **Claude Project:** cole em "Project knowledge" ou "Project instructions"
3. **Cursor:** cole em \`.cursorrules\` no root do projeto
4. **API direta:** use como \`system\` prompt em todas as chamadas

---

## Diferença prática

| Aspecto | brand-prompt.md | brand-agent-master.md |
|---|---|---|
| **Tamanho** | Pequeno (~2-5KB) | Grande (~20-30KB) |
| **Detalhe** | Resumo destilado | Sistema completo |
| **Uso** | Contexto pontual | System prompt operacional |
| **Custo de token** | Baixo | Alto (mas roda 1x na config) |
| **Cobertura** | Tom + posicionamento básico | Tom + léxico + gabaritos + validação + governança |

---

## Acesso programático (API)

Os mesmos prompts respondem em endpoints públicos do BBO:

- **\`/api/${slug}/prompt\`** → markdown do brand-prompt destilado
- **\`/api/${slug}/prompt?flavor=master\`** → markdown do brand-agent-master
- **Rate limit:** 60 req/min por IP

Pra um agente do BBO consumir em runtime, use a API. Pra configurar uma IA externa **uma vez**, use os arquivos deste ZIP.

---

## Atualização

Os prompts são gerados a partir do **Brand System** da marca (\`brand-system.json\`). Quando o sistema atualiza, os prompts atualizam automaticamente. Pra forçar regeneração: \`pnpm build:brand-prompts-zips\`.

---

_Gerado pelo Bionic Brand OS._
`;
}
