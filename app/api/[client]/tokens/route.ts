import type { NextRequest } from "next/server";

import { getClient, isClientSlug } from "@/lib/content";
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

  const client = getClient(slug)!;
  return Response.json(client.tokens, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "X-RateLimit-Remaining": String(rl.remaining),
    },
  });
}
