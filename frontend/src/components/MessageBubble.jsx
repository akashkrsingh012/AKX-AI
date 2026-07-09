import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiExternalLink, FiX } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

function MessageBubble({ role, content, images = [], isError = false }) {
  const isUser = role === "user";
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const markdown = (content || "")
    .replace(/```review/gi, "```")
    .replace(/```text/gi, "```")
    .replace(/```[a-zA-Z0-9_-]+\s+id="[^"]*"/g, "```");

  return (
    <div className={`flex w-full min-w-0 px-0.5 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`min-w-0
          ${isUser ? "w-fit max-w-[min(88%,20rem)] sm:max-w-[75%]" : "w-full max-w-full sm:max-w-[92%] md:max-w-[80%] lg:max-w-[720px]"}
          px-3.5 sm:px-4 py-2.5 rounded-xl
          break-words [overflow-wrap:anywhere] [word-break:break-word]
          leading-relaxed text-[13px] sm:text-[14px]
          ${
            isUser
              ? "accent-gradient text-white rounded-br-md shadow-[0_2px_12px_rgba(99,91,255,0.25)]"
              : isError
                ? "bg-[var(--bg-secondary)] text-[var(--error)] border border-[var(--error)]/30 rounded-bl-md"
                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-bl-md"
          }`}
      >
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-3">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                loading="lazy"
                onClick={() => setLightboxSrc(img)}
                onError={(e) => e.currentTarget.remove()}
                className="w-full max-w-[10rem] sm:max-w-[11rem] h-24 sm:h-28 rounded-lg object-cover border border-[var(--border)] cursor-zoom-in hover:opacity-90 transition"
              />
            ))}
          </div>
        )}

        <div className="prose prose-invert max-w-none min-w-0 w-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_code]:break-all">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-lg sm:text-xl font-bold mt-4 mb-2 text-[var(--text-primary)]">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base sm:text-lg font-semibold mt-3 mb-2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm sm:text-base font-semibold mt-3 mb-1.5">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-2.5 last:mb-0 whitespace-pre-wrap overflow-wrap-anywhere text-[var(--text-primary)]">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 my-2 overflow-wrap-anywhere">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 sm:pl-5 space-y-1 my-2 overflow-wrap-anywhere">{children}</ol>
              ),
              pre: ({ children }) => (
                <div className="my-3 max-w-full overflow-x-auto rounded-lg">{children}</div>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-3 max-w-full rounded-lg border border-[var(--border)]">
                  <table className="min-w-full text-xs sm:text-sm">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-[var(--border)] bg-[var(--bg-elevated)] px-2 sm:px-3 py-1.5 sm:py-2 text-left">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-[var(--border)] px-2 sm:px-3 py-1.5 sm:py-2">{children}</td>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[var(--accent-teal)] underline inline-flex items-center gap-1 break-all"
                >
                  {children}
                  <FiExternalLink size={11} className="shrink-0" />
                </a>
              ),
              img: ({ src, alt }) => {
                if (!src) return null;
                return (
                  <img
                    src={src}
                    alt={alt || ""}
                    loading="lazy"
                    onClick={() => setLightboxSrc(src)}
                    onError={(e) => e.currentTarget.remove()}
                    className="max-w-full h-auto rounded-lg object-cover cursor-pointer my-2"
                  />
                );
              },
              code({ inline, className, children }) {
                const value = String(children).replace(/\n$/, "");
                if (inline || !className) {
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent-teal)] break-all text-[0.9em]">
                      {value}
                    </code>
                  );
                }
                const language = className.replace("language-", "");
                return (
                  <div className="my-3 max-w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]">
                    <div className="flex items-center justify-between bg-[var(--bg-elevated)] border-b border-[var(--border)] px-3 py-2 gap-2">
                      <span className="uppercase text-[10px] text-[var(--text-muted)] truncate">{language}</span>
                      <button
                        type="button"
                        onClick={() => copyCode(value)}
                        className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0"
                      >
                        {copiedCode === value ? <><Check size={14} />Copied</> : <><Copy size={14} />Copy</>}
                      </button>
                    </div>
                    <div className="overflow-x-auto max-w-full">
                      <SyntaxHighlighter
                        language={language}
                        style={oneDark}
                        wrapLongLines
                        customStyle={{ margin: 0, padding: "12px 14px", background: "#0b0f19", fontSize: "12px" }}
                      >
                        {value}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 rounded-full p-2"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
          <img src={lightboxSrc} alt="" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
