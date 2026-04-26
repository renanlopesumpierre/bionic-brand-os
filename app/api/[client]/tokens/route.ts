// LEGACY: /api/{client}/tokens → redirect 308 para /api/{client}/design.md
//
// Manteve o endpoint antigo (que servia design-tokens.json puro) como atalho
// pro endpoint novo no formato DESIGN.md (Google alpha spec). Quem ainda
// consome a URL antiga continua funcionando — recebe 308 Permanent Redirect.
//
// Pra acessar o JSON cru original sem redirect, use diretamente o ZIP
// {slug}-design-tokens.zip ou /content/clients/{slug}/design-tokens.json.

import type { NextRequest } from "next/server";

import { isClientSlug } from "@/lib/content";

type Ctx = { params: Promise<{ client: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { client: slug } = await params;
  if (!isClientSlug(slug)) {
    return new Response("unknown client", { status: 404 });
  }

  return Response.redirect(
    new URL(`/api/${slug}/design.md`, _req.url).toString(),
    308,
  );
}
