import fs from "node:fs/promises";
import path from "node:path";

import betinaBrandSystem from "@/content/clients/betina-weber/brand-system.json";
import betinaTokens from "@/content/clients/betina-weber/design-tokens.json";
import betinaManifest from "@/content/clients/betina-weber/manifest.json";

/**
 * Registry of client spaces hosted by the portal.
 * On v2 this moves to a CMS or dynamic registry.
 * On v1 (pilot) it is a static map of typed imports.
 */
const registry = {
  "betina-weber": {
    manifest: betinaManifest,
    brandSystem: betinaBrandSystem,
    tokens: betinaTokens,
  },
} as const;

export type ClientSlug = keyof typeof registry;
export type ClientManifest = (typeof registry)[ClientSlug]["manifest"];
export type BrandSystem = (typeof registry)[ClientSlug]["brandSystem"];
export type DesignTokens = (typeof registry)[ClientSlug]["tokens"];

export function listClients(): ClientManifest[] {
  return Object.values(registry).map((entry) => entry.manifest);
}

export function getClient(slug: string) {
  if (!(slug in registry)) return null;
  const typed = slug as ClientSlug;
  return {
    slug: typed,
    ...registry[typed],
  };
}

export function isClientSlug(slug: string): slug is ClientSlug {
  return slug in registry;
}

/**
 * Narrative docs stored as Markdown files on disk.
 */
export type MarkdownDoc =
  | "brand-system"
  | "design-system"
  | "brand-prompt"
  | "brand-agent-master";

export async function loadMarkdown(
  slug: ClientSlug,
  doc: MarkdownDoc,
): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "content",
    "clients",
    slug,
    `${doc}.md`,
  );
  return fs.readFile(filePath, "utf-8");
}
