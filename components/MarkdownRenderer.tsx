"use client";

import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { copyToClipboard } from "@/src/utils/clipboard";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
}

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, "");

  const handleCopyCode = async () => {
    const success = await copyToClipboard(codeString);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isInline = !match && !codeString.includes("\n");

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-slate-800/80 font-mono text-[12px] text-sky-300 border border-slate-700/50"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
        <span className="uppercase font-semibold tracking-wider text-slate-400">
          {match ? match[1] : "code"}
        </span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1 hover:text-slate-200 transition px-1.5 py-0.5 rounded hover:bg-slate-800"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-[10px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto text-slate-200 leading-relaxed">
        <pre {...props}>
          <code>{codeString}</code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Recursively parses escaped or literal <br>, <br/>, <br /> in React children
 * and replaces them with native <br /> tags so they don't leak as raw strings.
 */
function replaceBrWithTag(nodes: React.ReactNode): React.ReactNode {
  return React.Children.map(nodes, (node) => {
    if (typeof node === "string") {
      if (!/<br\s*\/?>/i.test(node)) return node;
      const segments = node.split(/<br\s*\/?>/i);
      return segments.map((seg, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {seg}
        </React.Fragment>
      ));
    }
    if (React.isValidElement(node) && (node as any).props && (node as any).props.children) {
      return React.cloneElement(node, {
        ...(node as any).props,
        children: replaceBrWithTag((node as any).props.children),
      });
    }
    return node;
  });
}

// Static markdown components to avoid re-creation on each render frame
const markdownComponents: Components = {
  code: CodeBlock,
  p({ children }) {
    return <p className="mb-2 last:mb-0 leading-relaxed">{replaceBrWithTag(children)}</p>;
  },
  h1({ children }) {
    return <h1 className="text-lg font-bold text-slate-100 my-2 pb-1 border-b border-slate-800">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-base font-bold text-slate-100 my-2 pb-1 border-b border-slate-800/60">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-sm font-semibold text-slate-200 my-1.5">{children}</h3>;
  },
  ul({ children }) {
    return <ul className="list-disc list-outside space-y-1.5 my-2 ml-5 text-slate-300">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal list-outside space-y-1.5 my-2 ml-5 text-slate-300">{children}</ol>;
  },
  li({ children }) {
    return (
      <li className="text-slate-300 leading-relaxed [&>p]:inline [&>p]:mb-0 [&>p+p]:block [&>p+p]:mt-1">
        {replaceBrWithTag(children)}
      </li>
    );
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-sky-500/80 pl-3 py-1 my-2 italic text-slate-300 bg-slate-900/40 rounded-r text-xs">
        {replaceBrWithTag(children)}
      </blockquote>
    );
  },
  table({ children }) {
    return (
      <div className="w-full max-w-full overflow-x-auto overscroll-x-contain touch-pan-x my-3 rounded-xl border border-slate-800/90 bg-slate-950/90 shadow-md scrollbar-thin">
        <table className="w-full min-w-max border-collapse text-xs text-slate-300">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-slate-900/95 text-slate-200 font-semibold border-b border-slate-800">{children}</thead>;
  },
  tbody({ children }) {
    return <tbody className="divide-y divide-slate-800/60">{children}</tbody>;
  },
  tr({ children }) {
    // Note: avoid 'transition' on rows to prevent expensive reflow during table streaming
    return <tr className="hover:bg-slate-900/50">{children}</tr>;
  },
  th({ children }) {
    return <th className="px-3.5 py-2.5 text-left font-semibold text-slate-200 tracking-wide bg-slate-900/95 text-[11px] sm:text-xs">{replaceBrWithTag(children)}</th>;
  },
  td({ children }) {
    return <td className="px-3.5 py-2.5 text-slate-300 text-xs leading-snug whitespace-normal align-top">{replaceBrWithTag(children)}</td>;
  },
  a({ href, children }) {
    const isInternal = href && (href.startsWith("/") || href.startsWith("#") || href.startsWith("?"));
    const isAccountModal = href && (href.includes("openAccount=true") || href.includes("tab=plan") || href.includes("tab=auth"));
    const isPromptLink = href && (href.startsWith("?prompt=") || href.startsWith("#prompt="));

    if (isPromptLink) {
      const promptText = decodeURIComponent(href.replace(/^(\?prompt=|#prompt=)/, ""));
      return (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault();
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("confirmroute:send-prompt", { detail: { prompt: promptText } })
              );
            }
          }}
          className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition font-medium cursor-pointer"
        >
          {children}
        </a>
      );
    }

    if (isAccountModal) {
      if (href.includes("tab=auth")) {
        return (
          <a
            href="/login?redirect=/account"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition font-medium cursor-pointer"
          >
            {children}
          </a>
        );
      }
      const tab = "plan";
      return (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault();
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("confirmroute:open-account-modal", { detail: { tab } })
              );
            }
          }}
          className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition font-medium cursor-pointer"
        >
          {children}
        </a>
      );
    }

    if (isInternal) {
      return (
        <a
          href={href}
          className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition font-medium"
        >
          {children}
        </a>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition"
      >
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    if (!src) return null;
    // Suppress raw gallery previews as TrainImageCard handles authentic train photography
    if (
      typeof src === "string" &&
      (src.includes("gallery_preview") ||
        src.includes("indiarailinfo.com") ||
        src.includes("/api/media/"))
    ) {
      return null;
    }
    return (
      <span className="block my-2.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-md">
        <img
          src={src}
          alt={alt || "Image"}
          loading="lazy"
          className="w-full max-h-72 object-contain rounded-lg"
        />
      </span>
    );
  },
  hr() {
    return <hr className="border-slate-800 my-3" />;
  },
};

// M2: Compiled non-greedy suggestion header regex (without trailing [\s\S]*$) to eliminate catastrophic backtracking
const SUGGESTION_HEADER_REGEX = /(?:#{1,6}\s*(?:[💡✨👉]\s*)?(?:Suggested|Follow-up|Follow\s+up|Recommended)\s+(?:Next\s+|Follow-up\s+|Follow\s+up\s+)?(?:Questions|Steps|Prompts|Queries|Options|Actions)|[*_]{2}(?:[💡✨👉]\s*)?(?:Suggested|Follow-up|Follow\s+up|Recommended)\s+(?:Next\s+|Follow-up\s+|Follow\s+up\s+)?(?:Questions|Steps|Prompts|Queries|Options|Actions)[*_]{2}:?|(?:\n\s*|^)(?:[💡✨👉]\s*)?(?:Suggested|Follow-up|Follow\s+up|Recommended)\s+(?:Next\s+|Follow-up\s+|Follow\s+up\s+)?(?:Questions|Steps|Prompts|Queries|Options|Actions):?)/iu;

export const MarkdownRenderer = React.memo(function MarkdownRenderer({
  content,
  isStreaming = false,
}: MarkdownRendererProps) {
  // Throttled streaming content buffer to prevent blocking the main JS event loop
  const [streamedText, setStreamedText] = useState(content);
  const lastUpdateRef = useRef(0);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If not streaming, flush latest content immediately
    if (!isStreaming) {
      setStreamedText(content);
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      return;
    }

    // When streaming, throttle AST updates to at most once per 120ms
    const now = Date.now();
    const elapsed = now - lastUpdateRef.current;
    const THROTTLE_INTERVAL_MS = 120;

    if (elapsed >= THROTTLE_INTERVAL_MS) {
      lastUpdateRef.current = now;
      setStreamedText(content);
    } else {
      if (!throttleTimerRef.current) {
        throttleTimerRef.current = setTimeout(() => {
          lastUpdateRef.current = Date.now();
          setStreamedText(content);
          throttleTimerRef.current = null;
        }, THROTTLE_INTERVAL_MS - elapsed);
      }
    }

    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
    };
  }, [content, isStreaming]);

  // Use deferred value so React concurrent mode prioritizes user interaction over AST parsing
  const activeContent = isStreaming ? streamedText : content;
  const deferredContent = useDeferredValue(activeContent);

  // Clean up trailing raw suggestion text and pseudo-tool execution artifacts
  const cleanContent = useMemo(() => {
    let textToClean = deferredContent || "";
    if (!textToClean) return "";
    textToClean = textToClean
      .replace(/\[(?:Executed|Calling|Selected)\s+Tool(?:\s+Call)?[\s\S]*?\]/gi, "")
      .trim();
    const match = textToClean.match(SUGGESTION_HEADER_REGEX);
    if (match && typeof match.index === "number") {
      return textToClean.slice(0, match.index).trim();
    }
    return textToClean;
  }, [deferredContent]);

  return (
    <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {cleanContent || deferredContent}
      </ReactMarkdown>
    </div>
  );
});
