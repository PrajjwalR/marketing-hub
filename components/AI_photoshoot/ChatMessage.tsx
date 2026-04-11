import { type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import ResultGrid from "./ResultGrid";
import type { Message } from "./ChatInterface";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isSystem = message.role === "system";

  // Welcome message with model thumbnail
  if (message.type === "welcome") {
    return (
      <div className="animate-message-in flex gap-3 items-start">
        <div className="shrink-0 w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center shadow-lg shadow-brand-gold/20">
          <Sparkles size={16} className="text-zinc-900" />
        </div>
        <div className="bg-zinc-100 border border-zinc-200 rounded-2xl rounded-tl-md px-5 py-4 max-w-lg text-sm leading-relaxed text-zinc-600">
          {message.model && (
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-zinc-200">
              <img
                src={message.model.image}
                alt={message.model.name}
                className="w-14 h-14 rounded-xl object-cover shadow-md"
              />
              <div>
                <p className="font-display text-sm font-semibold text-zinc-900">
                  {message.model.name}
                </p>
                <p className="text-xs text-brand-green font-medium">
                  {message.model.style}
                </p>
              </div>
            </div>
          )}
          <p>{renderText(message.text)}</p>
        </div>
      </div>
    );
  }

  // User uploaded image
  if (message.type === "image" && message.role === "user") {
    return (
      <div className="animate-message-in flex justify-end">
        <div className="max-w-xs">
          <div className="ai-photoshoot-user-image-gradient rounded-2xl rounded-tr-md overflow-hidden border border-brand-gold/20 p-2">
            <img
              src={message.imageUrl}
              alt="Uploaded jewelry"
              className="rounded-xl w-full max-h-72 object-contain"
            />
          </div>
          <p className="text-xs text-zinc-400 text-right mt-2 mr-1">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  // Results with image grid
  if (message.type === "results") {
    return (
      <div className="animate-message-in">
        <div className="flex gap-3 items-start mb-4">
          <div className="shrink-0 w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center shadow-lg shadow-brand-gold/20">
            <Sparkles size={16} className="text-zinc-900" />
          </div>
          <div className="bg-zinc-100 border border-zinc-200 rounded-2xl rounded-tl-md px-5 py-4 max-w-lg text-sm leading-relaxed text-zinc-600">
            <p>{renderText(message.text)}</p>
          </div>
        </div>
        <ResultGrid images={message.images ?? []} />
      </div>
    );
  }

  // Generic text message
  return (
    <div
      className={`animate-message-in flex gap-3 ${isSystem ? "items-start" : "justify-end"}`}
    >
      {isSystem && (
        <div className="shrink-0 w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center shadow-lg shadow-brand-gold/20">
          <Sparkles size={16} className="text-zinc-900" />
        </div>
      )}
      <div
        className={`rounded-2xl px-5 py-4 max-w-lg text-sm leading-relaxed ${
          isSystem
            ? "bg-zinc-100 border border-zinc-200 rounded-tl-md text-zinc-600"
            : "bg-brand-gold/10 border border-brand-gold/20 rounded-tr-md text-zinc-800"
        }`}
      >
        {renderText(message.text)}
      </div>
    </div>
  );
}

/** Simple bold/italic markdown renderer */
function renderText(text: string): ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-brand-green">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
