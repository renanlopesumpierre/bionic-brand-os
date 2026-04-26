// Núcleo do pipeline de PDF do Bionic Brand OS.
//
// Recebe um HTML completo (gerado por algum template em ./templates/),
// abre num Chromium headless e produz um PDF Buffer.
//
// Estratégia: o `theme.css` é injetado aqui (com BDO Grotesk embutida em
// base64 pra o PDF ser auto-contido) — assim qualquer template só precisa
// se preocupar com layout, não com fonte/cor base.

import puppeteer from "puppeteer";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// === Carrega BDO Grotesk variable como data URI uma vez por processo ===
const BDO_GROTESK_PATH = resolveProjectPath("public/fonts/BDOGrotesk-VF.ttf");
const BDO_GROTESK_DATA_URI = existsSync(BDO_GROTESK_PATH)
  ? `data:font/ttf;base64,${readFileSync(BDO_GROTESK_PATH).toString("base64")}`
  : null;

if (!BDO_GROTESK_DATA_URI) {
  console.warn(
    "[pdf/render] aviso: BDO Grotesk não encontrada em public/fonts — PDFs vão usar fallback sans-serif do sistema.",
  );
}

// === Lê o theme.css uma vez por processo, substituindo a variável da fonte ===
const THEME_CSS = readFileSync(join(__dirname, "theme.css"), "utf-8").replaceAll(
  "__BDO_GROTESK_DATA_URI__",
  BDO_GROTESK_DATA_URI ?? "",
);

// === Browser singleton — reusado entre chamadas durante o build ===
let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
}

/**
 * Fecha o browser singleton. Chamar no fim do build pra processo terminar.
 */
export async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}

/**
 * Renderiza HTML em PDF.
 *
 * @param {string} html — HTML completo (com <html><head><body>). Não precisa
 *   incluir o theme.css; ele é injetado automaticamente em <head>.
 * @param {object} [options]
 * @param {string} [options.format="A4"]
 * @param {{top?:string,right?:string,bottom?:string,left?:string}} [options.margin]
 *   Margens da página. Default 22mm em todos os lados.
 * @param {string} [options.headerTemplate] — HTML repetido em todas as páginas.
 *   Use classes especiais do Puppeteer: `pageNumber`, `totalPages`, `title`.
 * @param {string} [options.footerTemplate]
 * @param {boolean} [options.displayHeaderFooter=true]
 * @param {boolean} [options.printBackground=true]
 * @returns {Promise<Buffer>}
 */
export async function renderToPdf(html, options = {}) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const finalHtml = injectTheme(html);
    await page.setContent(finalHtml, { waitUntil: "networkidle0", timeout: 30000 });
    // Esperar fontes carregarem completamente antes de renderizar.
    await page.evaluate(() => document.fonts.ready);

    const pdf = await page.pdf({
      format: options.format ?? "A4",
      margin: {
        // Top reservado integralmente pra faixa preta do header (sem respiro
        // branco entre faixa e topo; o padding interno do header empurra o
        // texto pra baixo). Conteúdo do PDF ganha respiro extra via theme.css.
        top: options.margin?.top ?? "22mm",
        right: options.margin?.right ?? "22mm",
        bottom: options.margin?.bottom ?? "22mm",
        left: options.margin?.left ?? "22mm",
      },
      printBackground: options.printBackground ?? true,
      displayHeaderFooter: options.displayHeaderFooter ?? true,
      headerTemplate: options.headerTemplate ?? defaultHeader(),
      footerTemplate: options.footerTemplate ?? defaultFooter(),
      preferCSSPageSize: true,
    });

    return pdf;
  } finally {
    await page.close();
  }
}

/**
 * Header default — faixa preta institucional do BBO no topo de toda página.
 * "TAG*" à esquerda, "Bionic Brand OS" à direita, sobre fundo tag-black.
 *
 * Nota Puppeteer: o headerTemplate roda num iframe isolado que não herda
 * o CSS do documento. Por isso a fonte BDO Grotesk é re-injetada aqui via
 * @font-face (mesmo data URI usado no theme.css).
 */
function defaultHeader() {
  const fontFace = BDO_GROTESK_DATA_URI
    ? `@font-face {
         font-family: "BDO Grotesk";
         src: url("${BDO_GROTESK_DATA_URI}") format("truetype-variations"),
              url("${BDO_GROTESK_DATA_URI}") format("truetype");
         font-weight: 100 900;
         font-display: block;
       }`
    : "";
  return `
    <style>
      ${fontFace}
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100%;
      }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
    </style>
    <div style="
      width: 100%;
      height: 22mm;
      margin-top: -10mm;
      background: #111111;
      color: #F2F2F2;
      font-family: 'BDO Grotesk', -apple-system, 'Segoe UI', sans-serif;
      font-size: 13pt;
      font-weight: 400;
      letter-spacing: -0.01em;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 22mm 4mm;
    ">
      <span>TAG*</span>
      <span>Bionic Brand OS</span>
    </div>`;
}

/**
 * Footer default — paginação e marca BBO. Puppeteer substitui as classes
 * `pageNumber` e `totalPages` automaticamente.
 */
function defaultFooter() {
  return `
    <style>
      html, body { margin: 0 !important; padding: 0 !important; width: 100%; }
    </style>
    <div style="
      width: 100%;
      padding: 0 22mm;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 7pt;
      letter-spacing: 0.04em;
      color: #828282;
      text-align: right;
    ">
      <span class="pageNumber"></span> / <span class="totalPages"></span>
    </div>`;
}

/**
 * Injeta theme.css dentro de <head> do HTML recebido. Se o HTML não tem
 * <head>, prepende um.
 */
function injectTheme(html) {
  const styleTag = `<style>${THEME_CSS}</style>`;
  if (html.includes("</head>")) {
    return html.replace("</head>", `${styleTag}</head>`);
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${styleTag}</head><body>${html}</body></html>`;
}

/**
 * Resolve um path a partir da raiz do projeto (`bionic-brand-os/`),
 * independente de onde o script foi chamado.
 */
function resolveProjectPath(relativePath) {
  // __dirname aqui é .../bionic-brand-os/scripts/lib/pdf
  return join(__dirname, "..", "..", "..", relativePath);
}

/**
 * Helper: renderiza markdown direto em PDF (atalho pros geradores).
 * @param {string} md
 * @param {Parameters<typeof renderToPdf>[1] & { html?: (body: string) => string }} [options]
 *   Se passar `html`, ele recebe o HTML do markdown e devolve o HTML completo
 *   (use os templates em ./templates/). Senão usa um wrap mínimo.
 */
export async function renderMarkdownToPdf(md, options = {}) {
  const { mdToHtml } = await import("./md-to-html.mjs");
  const body = mdToHtml(md);
  const html = options.html
    ? options.html(body)
    : `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${body}</body></html>`;
  const { html: _ignored, ...pdfOpts } = options;
  return renderToPdf(html, pdfOpts);
}
