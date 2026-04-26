// GET /api/{client}/prompt-master
//
// System prompt operacional completo do Brand Agent (Markdown). Versão
// pesada — pra alimentar agentes externos persistentes:
//   - ChatGPT Custom GPT → cole em "Instructions"
//   - Claude Project → "Project knowledge" / "Project instructions"
//   - Cursor → cole em .cursorrules
//   - API direta → use como `system` em todas as chamadas
//
// Pra contexto leve em tarefas pontuais, use /api/{client}/prompt.

import type { NextRequest } from "next/server";

import { isClientSlug, loadMarkdown, type ClientSlug } from "@/lib/content";
import { brandApiLimiter, clientIp } from "@/lib/rate-limit";

type Ctx = { params: Promise<{ client: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { client: slug } = await params;
  if (!isClientSlug(slug)) {
    return Response.json({ error: "unknown client" }, { status: 404 });
  }

  const ip = clientIp(req.headers);
  const rl = await brandApiLimiter.limit(`${slug}:${ip}`);
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", limit: rl.limit, reset: rl.reset },
      { status: 429 },
    );
  }

  const text = await loadMarkdown(slug as ClientSlug, "brand-agent-master");

  return new Response(text, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-RateLimit-Remaining": String(rl.remaining),
    },
  });
}
