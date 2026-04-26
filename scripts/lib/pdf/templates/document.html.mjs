// Template `document` — README, manual, "Como usar".
//
// Layout: capa simples (eyebrow + título + subtítulo + meta), break-page,
// conteúdo do markdown renderizado com a hierarquia tipográfica do theme.
//
// Cliente-agnóstico — toda identidade visual vem de theme.css. Marca
// cliente entra como string (brand name), não como cor/fonte.

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Logo TAG curto (svg) lido uma vez por processo. Inline pra não depender
// de file:// path quando Puppeteer renderiza via setContent.
const TAG_LOGO_PATH = join(__dirname, "..", "..", "..", "..", "public", "tag", "logo-short-black.svg");
const TAG_LOGO_SVG = existsSync(TAG_LOGO_PATH)
  ? readFileSync(TAG_LOGO_PATH, "utf-8")
  : "";

/**
 * Gera HTML completo de um documento BBO.
 *
 * @param {object} opts
 * @param {string} opts.brand        Nome da marca cliente (ex: "Betina Weber")
 * @param {string} opts.title        Título do documento
 * @param {string} opts.bodyHtml     HTML do conteúdo (já convertido de markdown)
 * @param {string} [opts.eyebrow]    Eyebrow acima do título da capa
 * @param {string} [opts.subtitle]   Subtítulo curto na capa
 * @param {string} [opts.docId]      Identificador curto (ex: "01 · Cores")
 * @param {string} [opts.date]       Data exibida na capa (default: hoje)
 * @returns {string} HTML pronto pra renderToPdf().
 */
export function documentTemplate(opts) {
  const {
    brand,
    title,
    bodyHtml,
    eyebrow = "Bionic Brand OS",
    subtitle = "",
    docId = "",
    date = new Date().toLocaleDateString("pt-BR"),
  } = opts;

  const safeBrand = escapeHtml(brand);
  const safeTitle = escapeHtml(title);
  const safeEyebrow = escapeHtml(eyebrow);
  const safeSubtitle = escapeHtml(subtitle);
  const safeDocId = escapeHtml(docId);
  const safeDate = escapeHtml(date);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle} — ${safeBrand}</title>
</head>
<body>
  <section class="bbo-cover">
    <div>
      <p class="bbo-cover-eyebrow">${safeEyebrow}</p>
      <h1 class="bbo-cover-title">${safeTitle}</h1>
      ${safeSubtitle ? `<p class="bbo-cover-subtitle">${safeSubtitle}</p>` : ""}
    </div>
    <div class="bbo-cover-meta">
      <div class="bbo-cover-logo">${TAG_LOGO_SVG}</div>
      <span>${safeBrand}${safeDocId ? ` · ${safeDocId}` : ""} · ${safeDate}</span>
    </div>
  </section>

  <article class="bbo-content">
    ${bodyHtml}
  </article>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
