import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { isClientSlug, loadMarkdown, type ClientSlug } from "@/lib/content";

const BodySchema = z.object({
  clientSlug: z.string(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
  anthropicKey: z.string().optional(),
  openaiKey: z.string().optional(),
  geminiKey: z.string().optional(),
});

const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const OPENAI_MODEL = "gpt-4o";
const GEMINI_MODEL = "gemini-1.5-pro";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { clientSlug, messages, anthropicKey, openaiKey, geminiKey } = parsed.data;

  if (!isClientSlug(clientSlug)) {
    return Response.json({ error: "unknown client" }, { status: 404 });
  }

  const systemPrompt = await loadMarkdown(clientSlug as ClientSlug, "brand-agent-master");

  // Priority: Anthropic BYOK → OpenAI BYOK → Gemini BYOK → server Anthropic → Groq fallback
  const resolvedAnthropicKey = anthropicKey ?? process.env.ANTHROPIC_API_KEY;
  if (resolvedAnthropicKey) {
    return streamAnthropic(resolvedAnthropicKey, systemPrompt, messages, !!anthropicKey);
  }

  if (openaiKey) {
    return streamOpenAI(openaiKey, systemPrompt, messages);
  }

  if (geminiKey) {
    return streamGemini(geminiKey, systemPrompt, messages);
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return streamGroq(groqKey, systemPrompt, messages);
  }

  return Response.json(
    { error: "Nenhuma chave disponível. Configure sua chave nas preferências do chat." },
    { status: 503 },
  );
}

// ── Anthropic ────────────────────────────────────────────────────────────────

async function streamAnthropic(
  key: string,
  system: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  isByok: boolean,
) {
  const client = new Anthropic({ apiKey: key });

  const stream = client.messages.stream({
    model: ANTHROPIC_MODEL,
    max_tokens: 4096,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
    cancel() { stream.controller.abort(); },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Provider": "anthropic",
      "X-Model": ANTHROPIC_MODEL,
      "X-Provider-Key": isByok ? "byok" : "pool",
    },
  });
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

async function streamOpenAI(
  key: string,
  system: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
) {
  const client = new OpenAI({ apiKey: key });

  const stream = await client.chat.completions.create({
    model: OPENAI_MODEL,
    stream: true,
    max_tokens: 4096,
    messages: [{ role: "system", content: system }, ...messages],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Provider": "openai",
      "X-Model": OPENAI_MODEL,
      "X-Provider-Key": "byok",
    },
  });
}

// ── Gemini ───────────────────────────────────────────────────────────────────

async function streamGemini(
  key: string,
  system: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
) {
  const genai = new GoogleGenerativeAI(key);
  const model = genai.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: system,
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1].content;
  const chat = model.startChat({ history });

  const result = await chat.sendMessageStream(lastMessage);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Provider": "gemini",
      "X-Model": GEMINI_MODEL,
      "X-Provider-Key": "byok",
    },
  });
}

// ── Groq (fallback de servidor) ───────────────────────────────────────────────

async function streamGroq(
  key: string,
  system: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
) {
  const client = new Groq({ apiKey: key });

  const stream = await client.chat.completions.create({
    model: GROQ_MODEL,
    stream: true,
    temperature: 0.7,
    messages: [{ role: "system", content: system }, ...messages],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Provider": "groq",
      "X-Model": GROQ_MODEL,
      "X-Provider-Key": "pool-fallback",
    },
  });
}
