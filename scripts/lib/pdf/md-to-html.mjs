// Markdown → HTML para os PDFs do Bionic Brand OS.
//
// Wrapper fino sobre `marked` (zero deps nativas, ~40KB). GFM ligado
// (tabelas, task lists, autolinks). Headings recebem id automático
// pra eventual TOC. Parágrafos com texto puro são preservados.

import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false, // não converter \n em <br> automaticamente
});

// Slugify simples pra ids de heading.
function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Renderer customizado: adicionar id em headings.
const renderer = new marked.Renderer();
renderer.heading = (token) => {
  const text = token.text || token.raw || "";
  const id = slugify(text);
  const level = token.depth || 1;
  // marked v18 pode não usar mais este renderer; quando não usa,
  // o fallback abaixo cobre via parser default.
  return `<h${level} id="${id}">${marked.parseInline(text)}</h${level}>\n`;
};

/**
 * Converte markdown em HTML.
 * @param {string} md
 * @returns {string} HTML pronto pra colar dentro do <body> de um template.
 */
export function mdToHtml(md) {
  return marked.parse(md, { renderer });
}
