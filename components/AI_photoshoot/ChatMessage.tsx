import { type ReactNode } from "react";
import { Sparkles, Play, Download } from "lucide-react";
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

  // Video result
  if (message.type === "video-result") {
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
        {/* Video player */}
        <div className="ml-12 max-w-md">
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-black shadow-xl group">
            <video
              id="video-result-player"
              src={message.videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full aspect-[9/16] object-contain bg-black"
            />
            {/* Gradient overlay at bottom with label & download */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-white/90">
                <Play size={12} className="text-brand-gold" />
                <span>AI Video</span>
              </div>
              <a
                href={message.videoUrl}
                download={`jewelry-video-${Date.now()}.mp4`}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                title="Download video"
                aria-label="Download video"
              >
                <Download size={16} className="text-white" />
              </a>
            </div>
          </div>
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
