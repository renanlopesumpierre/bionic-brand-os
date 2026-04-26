import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type Props = {
  children: string;
  className?: string;
};

/**
 * Typographic block for long-form markdown.
 * Keeps headings, paragraphs, and lists in the current theme's type system.
 */
export function Prose({ children, className }: Props) {
  return (
    <div
      className={cn(
        "prose-content text-[1.0625rem] leading-relaxed",
        "[&_h1]:text-4xl [&_h1]:md:text-6xl [&_h1]:tracking-tight [&_h1]:mt-0 [&_h1]:mb-10",
        "[&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:tracking-tight [&_h2]:mt-16 [&_h2]:mb-6",
        "[&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:tracking-tight [&_h3]:mt-12 [&_h3]:mb-4",
        "[&_h4]:text-xl [&_h4]:md:text-2xl [&_h4]:tracking-tight [&_h4]:mt-10 [&_h4]:mb-3",
        "[&_h5]:text-lg [&_h5]:mt-8 [&_h5]:mb-2",
        "[&_p]:my-5",
        "[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-[--color-border] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[--color-fg-muted] [&_blockquote]:my-6",
        "[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:bg-[--color-bg-alt] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded",
        "[&_pre]:bg-[--color-bg-alt] [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-6",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_table]:w-full [&_table]:my-6 [&_table]:text-sm",
        "[&_th]:text-left [&_th]:border-b [&_th]:border-[--color-border] [&_th]:py-2 [&_th]:pr-4 [&_th]:font-medium",
        "[&_td]:border-b [&_td]:border-[--color-border] [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top",
        "[&_hr]:my-12 [&_hr]:border-[--color-border]",
        "[&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[--color-border] hover:[&_a]:decoration-[--color-fg]",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
