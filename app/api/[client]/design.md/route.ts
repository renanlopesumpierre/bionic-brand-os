// GET /api/{client}/design.md
//
// Retorna o design system da marca no formato DESIGN.md (alpha) do Google
// — YAML frontmatter com tokens machine-readable + Markdown body com
// rationale human-readable.
//
// Spec: https://github.com/google-labs-code/design.md
// Mapper: lib/design-md.ts (gera dinâmico do design-tokens.json + brand-system.json)

import type { NextRequest } from "next/server";

import { getClient, isClientSlug } from "@/lib/content";
import { brandApiLimiter, clientIp } from "@/lib/rate-limit";
import { buildDesignMd } from "@/lib/design-md";

type Ctx = { params: Promise<{ client: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { client: slug } = await params;
  if (!isClientSlug(slug)) {
    return new Response("unknown client", { status: 404 });
  }

  const ip = clientIp(req.headers);
  const rl = await brandApiLimiter.limit(`${slug}:${ip}`);
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", limit: rl.limit, reset: rl.reset },
      { status: 429 },
    );
  }

  const client = getClient(slug)!;
  const md = buildDesignMd(slug, client.manifest, client.tokens, client.brandSystem);

  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-RateLimit-Remaining": String(rl.remaining),
    },
  });
}
