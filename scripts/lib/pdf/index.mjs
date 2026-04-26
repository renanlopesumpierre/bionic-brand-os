// API pública do pipeline de PDF — entrada única pros geradores.
//
// Uso típico (em scripts/build-*.mjs):
//
//   import { mdToPdf, closeBrowser } from "./lib/pdf/index.mjs";
//
//   const pdfBuffer = await mdToPdf(markdownString, {
//     brand: "Betina Weber",
//     subtitle: "Mapa por papel.",
//     docId: "01 · LEIA-ME",
//   });
//   writeFileSync("output.pdf", pdfBuffer);
//
//   // No final do build:
//   await closeBrowser();
//
// Atalhos:
//   - title sai do primeiro `# heading` do markdown (auto-extraído).
//     Se preferir explícito, passe `title` em options.
//   - eyebrow default: "Bionic Brand OS"

import { renderToPdf, closeBrowser } from "./render.mjs";
import { mdToHtml } from "./md-to-html.mjs";
import { documentTemplate } from "./templates/document.html.mjs";

export { closeBrowser };

/**
 * Renderiza markdown em PDF usando o template `document` do BBO.
 *
 * @param {string} md
 * @param {object} options
 * @param {string} options.brand — Nome da marca cliente.
 * @param {string} [options.title] — Título do PDF. Default: primeiro `# `.
 * @param {string} [options.subtitle] — Subtítulo na capa.
 * @param {string} [options.eyebrow="Bionic Brand OS"] — Eyebrow na capa.
 * @param {string} [options.docId] — Identificador (ex: "01 · LEIA-ME").
 * @param {string} [options.date] — Data (default: hoje pt-BR).
 * @returns {Promise<Buffer>}
 */
export async function mdToPdf(md, options) {
  const { brand, subtitle, eyebrow, docId, date } = options;

  const { title, body } = extractTitle(md, options.title);
  const bodyHtml = mdToHtml(body);

  const html = documentTemplate({
    brand,
    title,
    subtitle,
    eyebrow,
    docId,
    date,
    bodyHtml,
  });

  return renderToPdf(html);
}

/**
 * Extrai o primeiro `# heading` do markdown e retorna { title, body }
 * sem essa linha — pra evitar duplicação visual (capa já mostra título).
 * Se `explicitTitle` foi passado, usa ele e NÃO remove o heading do body.
 */
function extractTitle(md, explicitTitle) {
  if (explicitTitle) return { title: explicitTitle, body: md };

  const lines = md.split("\n");
  const headingIdx = lines.findIndex((l) => /^#\s+\S/.test(l));
  if (headingIdx === -1) return { title: "Documento", body: md };

  const title = lines[headingIdx].replace(/^#\s+/, "").trim();

  // Remove o heading + linhas vazias logo após pra não deixar gap.
  let endIdx = headingIdx + 1;
  while (endIdx < lines.length && lines[endIdx].trim() === "") endIdx++;
  const body = [...lines.slice(0, headingIdx), ...lines.slice(endIdx)].join("\n");

  return { title, body };
}
