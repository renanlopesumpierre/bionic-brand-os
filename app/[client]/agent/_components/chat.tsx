"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Settings, Send, Loader2, X, Key } from "lucide-react";

import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
type Message = { role: Role; content: string };

type SuggestionGroup = { category: string; prompts: string[] };

type Props = {
  clientSlug: string;
  clientName: string;
  suggestions?: SuggestionGroup[];
};

const PROVIDERS = [
  {
    id: "anthropic" as const,
    label: "Anthropic",
    model: "Claude Sonnet",
    placeholder: "sk-ant-api03-...",
    storageKey: "tag-brand:anthropic-key",
  },
  {
    id: "openai" as const,
    label: "OpenAI",
    model: "GPT-4o",
    placeholder: "sk-proj-...",
    storageKey: "tag-brand:openai-key",
  },
  {
    id: "gemini" as const,
    label: "Google",
    model: "Gemini 1.5 Pro",
    placeholder: "AIzaSy...",
    storageKey: "tag-brand:gemini-key",
  },
] as const;

type ProviderId = (typeof PROVIDERS)[number]["id"];

export function BrandAgentChat({ clientSlug, clientName, suggestions = [] }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [keys, setKeys] = useState<Record<ProviderId, string>>({ anthropic: "", openai: "", gemini: "" });
  const [showSettings, setShowSettings] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setKeys({
      anthropic: localStorage.getItem("tag-brand:anthropic-key") ?? "",
      openai:    localStorage.getItem("tag-brand:openai-key")    ?? "",
      gemini:    localStorage.getItem("tag-brand:gemini-key")    ?? "",
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  const saveKey = (id: ProviderId, value: string) => {
    setKeys((prev) => ({ ...prev, [id]: value }));
    const p = PROVIDERS.find((p) => p.id === id)!;
    if (value) localStorage.setItem(p.storageKey, value);
    else localStorage.removeItem(p.storageKey);
  };

  const hasAnyKey = Object.values(keys).some(Boolean);
  const configuredCount = Object.values(keys).filter(Boolean).length;

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || pending) return;
      setError(null);

      const userMessage: Message = { role: "user", content: text };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput("");
      setPending(true);

      if (textareaRef.current) textareaRef.current.style.height = "auto";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientSlug,
            messages: nextMessages,
            anthropicKey: keys.anthropic.trim() || undefined,
            openaiKey:    keys.openai.trim()    || undefined,
            geminiKey:    keys.gemini.trim()    || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Erro desconhecido" }));
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const xProvider = res.headers.get("X-Provider") ?? "";
        const xModel    = res.headers.get("X-Model")    ?? "";
        setActiveProvider(`${xProvider} · ${xModel}`);

        if (!res.body) throw new Error("Resposta vazia");

        const reader  = res.body.getReader();
        const decoder = new TextDecoder();

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = { role: "assistant", content: last.content + chunk };
            }
            return next;
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setPending(false);
      }
    },
    [messages, pending, clientSlug, keys],
  );

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); send(input); };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex flex-col h-full">

      {/* Barra de status */}
      <div className="border-b border-[--color-border] px-6 py-3 flex items-center justify-between bg-[--color-bg] shrink-0">
        <div className="flex items-center gap-3 text-xs text-[--color-fg-muted]">
          <span className={cn("inline-block w-2 h-2 rounded-full", hasAnyKey ? "bg-green-500" : "bg-yellow-500")} />
          <span>Brand Agent · <strong className="text-[--color-fg]">{clientName}</strong></span>
          {activeProvider && <span className="hidden sm:inline opacity-60">· {activeProvider}</span>}
        </div>
        <button
          type="button"
          onClick={() => setShowSettings((s) => !s)}
          className="text-xs text-[--color-fg-muted] hover:text-[--color-fg] inline-flex items-center gap-1.5 transition-colors"
        >
          {showSettings ? <X className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
          {configuredCount > 0 ? `${configuredCount} chave${configuredCount > 1 ? "s" : ""} configurada${configuredCount > 1 ? "s" : ""}` : "Configurações"}
        </button>
      </div>

      {/* Painel de configurações */}
      {showSettings && (
        <div className="border-b border-[--color-border] px-6 py-6 bg-[--color-bg-alt] shrink-0">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-[--color-accent]" />
              <p className="text-sm font-medium">Chaves de API</p>
            </div>
            <p className="text-xs text-[--color-fg-muted] mb-6 leading-relaxed max-w-xl">
              Configure uma ou mais chaves. O agente usa na prioridade: Anthropic → OpenAI → Gemini.
              As chaves ficam salvas só neste navegador e nunca são enviadas a terceiros.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {PROVIDERS.map((p) => (
                <div key={p.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">{p.label}</p>
                    <p className="type-mono text-xs text-[--color-fg-muted]">{p.model}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="password"
                      value={keys[p.id]}
                      onChange={(e) => saveKey(p.id, e.target.value)}
                      placeholder={p.placeholder}
                      className="flex-1 min-w-0 text-xs px-3 py-2 bg-[--color-bg] border border-[--color-border] font-mono focus:outline-none focus:border-[--color-fg] transition-colors"
                    />
                    {keys[p.id] && (
                      <button
                        type="button"
                        onClick={() => saveKey(p.id, "")}
                        className="px-2 border border-[--color-border] hover:bg-[--color-bg] transition-colors text-[--color-fg-muted] hover:text-[--color-fg]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {keys[p.id] && (
                    <p className="text-xs text-green-600">Configurada</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-6 py-8">

        {/* Estado vazio */}
        {messages.length === 0 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-2">Pergunte à marca.</h2>
            <p className="text-[--color-fg-muted] mb-10 max-w-xl leading-relaxed">
              O agente conhece cada regra, frase sagrada e gabarito do sistema Betina Weber.
              Escreva o que precisa ou use um dos prompts abaixo.
            </p>

            {!hasAnyKey && (
              <div className="mb-8 border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 max-w-xl">
                Nenhuma chave configurada. Clique em <strong>Configurações</strong> acima e adicione sua chave para começar.
              </div>
            )}

            {suggestions.length > 0 && (
              <div>
                <div className="flex gap-0 border-b border-[--color-border] mb-6">
                  {suggestions.map((group, i) => (
                    <button
                      key={group.category}
                      type="button"
                      onClick={() => setActiveCategory(i)}
                      className={cn(
                        "type-mono text-xs px-4 py-2.5 transition-colors border-b-2 -mb-px",
                        activeCategory === i
                          ? "border-[--color-fg] text-[--color-fg]"
                          : "border-transparent text-[--color-fg-muted] hover:text-[--color-fg]",
                      )}
                    >
                      {group.category}
                    </button>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {suggestions[activeCategory]?.prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => send(prompt)}
                      className="text-left text-sm border border-[--color-border] px-4 py-3.5 hover:bg-[--color-bg-alt] hover:border-[--color-fg-muted] transition-colors leading-snug"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conversa */}
        <ul className="max-w-3xl mx-auto space-y-8">
          {messages.map((m, i) => (
            <li key={i} className="flex gap-5">
              <span className={cn(
                "shrink-0 w-14 pt-0.5 type-mono text-xs uppercase tracking-wider",
                m.role === "user" ? "text-[--color-fg-muted]" : "text-[--color-accent]",
              )}>
                {m.role === "user" ? "Você" : "Marca"}
              </span>
              <div className="flex-1 leading-relaxed whitespace-pre-wrap min-w-0 text-base">
                {m.content || (pending && i === messages.length - 1
                  ? <Loader2 className="w-4 h-4 animate-spin text-[--color-fg-muted] mt-1" />
                  : null)}
              </div>
            </li>
          ))}
        </ul>

        {/* Erro */}
        {error && (
          <div className="max-w-3xl mx-auto mt-6 border border-[--color-accent] bg-[--color-accent]/10 px-4 py-3 text-sm">
            <strong>Erro.</strong>{" "}
            {error.includes("Nenhuma chave") || error.includes("No API key") || error.includes("503")
              ? "Nenhuma chave configurada. Clique em Configurações e adicione sua chave."
              : error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Compositor */}
      <form onSubmit={handleSubmit} className="border-t border-[--color-border] px-6 py-4 bg-[--color-bg] shrink-0">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Pergunte à marca..."
            rows={1}
            disabled={pending}
            className="flex-1 resize-none bg-transparent border border-[--color-border] px-4 py-3 text-base leading-relaxed focus:outline-none focus:border-[--color-fg] transition-colors"
            style={{ minHeight: "48px" }}
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="shrink-0 bg-[--color-fg] text-[--color-bg] px-5 py-3 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="text-sm">Enviar</span>
          </button>
        </div>
        <p className="max-w-3xl mx-auto mt-2 text-xs text-[--color-fg-muted] opacity-60">
          Enter para enviar · Shift+Enter para quebrar linha
        </p>
      </form>
    </div>
  );
}
