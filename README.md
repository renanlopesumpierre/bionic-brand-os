# Bionic Brand OS

An operational portal for Bionic Branding. Every brand hosted here becomes a living interface between human emotion and machine clarity.

> Essence, narrative, identity for humans. Structure, context, tokens, prompts and agents for machines.

Pilot client: **Betina Weber**.

---

## Stack

- Next.js 16 (App Router, Turbopack, React 19.2)
- TypeScript 5, Tailwind CSS 4
- Anthropic SDK (Claude Sonnet 4.6 with prompt caching)
- Groq SDK (Llama 3.3 70B, free-tier fallback)
- Upstash Redis for rate limiting
- Deployed on Vercel

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in Anthropic and/or Groq keys
pnpm dev
```

Open http://localhost:3000.

## Routes

### Portal (TAG chrome)

| Route | Purpose |
|---|---|
| `/` | Home institucional da TAG |
| `/manifesto` | Manifesto do Bionic Branding |
| `/clients` | Lista de brand spaces hospedados |

### Client space (theme per client)

| Route | Layer | Source |
|---|---|---|
| `/[client]` | Overview | `manifest.json`, `brand-system.json` |
| `/[client]/essence` | Layer 1 · Strategic core | `brand-system.json` → `core` |
| `/[client]/method` | Layer 1.x · Proprietary method | `brand-system.json` → `method` |
| `/[client]/architecture` | Layer 2 · Brand architecture | `brand-system.json` → `architecture` |
| `/[client]/audience` | Layer 3 · Audience | `brand-system.json` → `audience` |
| `/[client]/verbal` | Layer 4 · Verbal system | `brand-system.json` → `verbal` |
| `/[client]/visual` | Layer 5 · Visual system | `design-tokens.json` |
| `/[client]/application` | Layer 6 · Application matrix | `brand-system.json` → `applicationMatrix`, `templates`, `pieceValidation` |
| `/[client]/governance` | Layer 7 · Governance & evolution | `brand-system.json` → `governance` |
| `/[client]/assets` | Transversal · Assets & API | Static |
| `/[client]/agent` | Transversal · Conversational Brand Agent | `brand-agent-master.md` as system prompt |

### Brand API (public, rate-limited)

| Route | Format |
|---|---|
| `GET /api/[client]/brand-system` | JSON |
| `GET /api/[client]/tokens` | JSON (design tokens) |
| `GET /api/[client]/prompt` | Markdown (distilled prompt) |
| `GET /api/[client]/prompt?flavor=master` | Markdown (operational master prompt) |

Limit: 60 req/min per IP. Disabled locally when Upstash env vars are absent.

### Chat API (streaming)

`POST /api/chat` — body `{ clientSlug, messages, apiKey? }`, returns `text/plain` stream.

Provider priority: BYOK Anthropic → TAG pool Anthropic → Groq fallback.

Limit: 20 req/h per IP (when enabled).

## Content model

Canonical brand documents for each client live in `content/clients/<slug>/`:

```
content/clients/betina-weber/
├── manifest.json
├── brand-system.json
├── brand-system.md
├── design-system.md
├── design-tokens.json
├── brand-prompt.md
└── brand-agent-master.md
```

These are synced from the parent TAG Brandbook folder. See `content/README.md`.

## Design tokens and theming

- Root (`:root`): neutral TAG chrome theme.
- Per-client (e.g. `.theme-betina`): full palette and typography override.

Adding a new client:

1. Create `content/clients/<slug>/` with the six canonical files.
2. Add the slug to the registry in `lib/content.ts`.
3. Add a CSS theme block in `app/globals.css`.
4. Reference the `thematicClass` in the client's `manifest.json`.

## Deployment

```bash
vercel link
vercel --prod
```

Set env vars in the Vercel dashboard:

- `ANTHROPIC_API_KEY` (pool key for visitors who don't BYOK)
- `GROQ_API_KEY` (fallback)
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (rate limit)
- `NEXT_PUBLIC_SITE_URL`

## Roadmap

- **v1.0 (current).** Pilot with Betina Weber. Public portal. Brand Agent via chat.
- **v1.1.** Magic link auth (Resend). Private sections (full Brand API, governance-only docs).
- **v1.2.** Upload/download of assets. Version diff viewer.
- **v1.3.** Second client onboarded. Multi-tenant auth groups.
- **v2.0.** CMS migration for content editing outside git.

---

_Marcas que conversam com humanos e máquinas. Brands that speak both human and machine._
