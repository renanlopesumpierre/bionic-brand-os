import type { NextRequest } from "next/server";

import { isClientSlug, loadMarkdown, type ClientSlug } from "@/lib/content";
import { brandApiLimiter, clientIp } from "@/lib/rate-limit";

type Ctx = { params: Promise<{ client: string }> };

/**
 * Returns the distilled brand prompt (Markdown).
 * Suitable for pasting into Claude Projects, Cursor, GPT custom instructions, etc.
 *
 * Query `?flavor=master` returns the operational brand-agent-master prompt instead.
 */
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

  const flavor = req.nextUrl.searchParams.get("flavor");
  const doc = flavor === "master" ? "brand-agent-master" : "brand-prompt";
  const text = await loadMarkdown(slug as ClientSlug, doc);

  return new Response(text, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-RateLimit-Remaining": String(rl.remaining),
    },
  });
}
