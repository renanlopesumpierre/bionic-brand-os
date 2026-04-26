#!/usr/bin/env node
// Builds {slug}-brand-assets.zip with svg/, png/, animado/ folders for each client
// that has a brand directory under public/clients/{slug}/brand/.

import { readdirSync, existsSync, mkdirSync, copyFileSync, rmSync, statSync } from "fs";
import { join, basename } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";
import sharp from "sharp";

const root = process.cwd();
const clientsDir = join(root, "public", "clients");
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

  const outZip = join(downloadsDir, `${slug}-brand-assets.zip`);
  if (existsSync(outZip)) rmSync(outZip);
  execSync(`cd "${stage}" && zip -rq "${outZip}" svg png animado`, {
    stdio: "inherit",
  });
  rmSync(stage, { recursive: true, force: true });

  console.log(`[${slug}] → ${basename(outZip)}`);
}
