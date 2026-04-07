import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
} from "react";
import {
  Paperclip,
  Send,
  Sparkles,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import ChatMessage from "./ChatMessage.tsx";
import SkeletonLoader from "./SkeletonLoader.tsx";
import {
  generatePhotoshoot,
  type ModelInfo,
} from "@/app/api/AI-photoshoot/photoshoot";

interface JewelryType {
  id: string;
  label: string;
  icon: string;
}

interface Message {
  id: string;
  role: "system" | "user";
  type: "welcome" | "image" | "results" | "text";
  model?: ModelInfo;
  text: string;
  imageUrl?: string;
  images?: (string | { url: string; label: string })[];
}

const JEWELRY_TYPES: JewelryType[] = [
  { id: "necklace", label: "Necklace", icon: "📿" },
  { id: "ring", label: "Ring", icon: "💍" },
  { id: "earring", label: "Earring", icon: "✨" },
  { id: "bracelet", label: "Bracelet", icon: "⌚" },
  { id: "anklet", label: "Anklet", icon: "🦶" },
];

interface ChatInterfaceProps {
  selectedModel: ModelInfo;
}

export type { Message };

export default function ChatInterface({ selectedModel }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [jewelryType, setJewelryType] = useState("necklace");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Send initial system message
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          id: "system-welcome",
          role: "system",
          type: "welcome",
          model: selectedModel,
          text: `Great choice! You selected **${selectedModel.name}** — *${selectedModel.style}*. Please select your jewelry type and upload a clear, well-lit image of your jewelry piece to begin the photoshoot.`,
        },
      ]);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedModel]);

  useEffect(() => scrollToBottom(), [messages, isLoading, scrollToBottom]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSelectJewelryType = (type: string) => {
    setJewelryType(type);
    setIsDropdownOpen(false);
  };

  const selectedType = JEWELRY_TYPES.find((t) => t.id === jewelryType)!;

  const handleGenerate = async () => {
    if (!uploadedFile) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      type: "image",
      imageUrl: uploadedPreview ?? undefined,
      text: `Here is my ${selectedType.label.toLowerCase()} image. Generate the photoshoot!`,
    };

    setMessages((prev) => [...prev, userMsg]);
    const fileToSend = uploadedFile;
    const typeToSend = jewelryType;
    setUploadedFile(null);
    setUploadedPreview(null);
    setIsLoading(true);

    try {
      const result = await generatePhotoshoot(
        selectedModel,
        fileToSend,
        typeToSend,
      );

      const resultMsg: Message = {
        id: `system-result-${Date.now()}`,
        role: "system",
        type: "results",
        images: result.images || [],
        text: `Your AI ${selectedType.label.toLowerCase()} photoshoot is ready! Here are 9 stunning variations:`,
      };

      setMessages((prev) => [...prev, resultMsg]);
      setHasResults(true);
    } catch (err: unknown) {
      console.error("[Photoshoot Error]", err);
      const axiosErr = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      const detail =
        axiosErr?.response?.data?.detail ||
        axiosErr?.message ||
        "Unknown error";
      const errorMsg: Message = {
        id: `system-error-${Date.now()}`,
        role: "system",
        type: "text",
        text: `Something went wrong: ${detail}. Check the browser console and backend terminal for details.`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-3xl mx-auto py-8 flex flex-col gap-6">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="animate-message-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="shrink-0 w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center shadow-lg shadow-brand-gold/20">
                  <Sparkles size={14} className="text-zinc-900" />
                </div>
                <div className="bg-zinc-100 border border-zinc-200 rounded-2xl px-5 py-3 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-brand-gold animate-typing-bounce typing-dot-1" />
                    <span className="inline-block w-2 h-2 rounded-full bg-brand-gold animate-typing-bounce typing-dot-2" />
                    <span className="inline-block w-2 h-2 rounded-full bg-brand-gold animate-typing-bounce typing-dot-3" />
                  </div>
                  <span className="text-sm text-zinc-500">
                    AI Stylist is orchestrating the{" "}
                    {selectedType.label.toLowerCase()} photoshoot…
                  </span>
                </div>
              </div>
              <SkeletonLoader />
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      {!hasResults && (
        <div className="bg-white/80 backdrop-blur-xl border-t border-zinc-200 p-4">
          <div className="max-w-3xl mx-auto">
            {/* Upload Preview */}
            {uploadedPreview && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200 mb-3">
                <img
                  src={uploadedPreview}
                  alt="Uploaded jewelry preview"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">
                    {uploadedFile?.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {selectedType.icon} {selectedType.label} — Ready to generate
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadedPreview(null);
                  }}
                  className="text-zinc-400 hover:text-zinc-600 text-xl leading-none p-1 transition-colors"
                  aria-label="Remove uploaded file"
                >
                  ×
                </button>
              </div>
            )}

            {/* Input Row */}
            <div className="flex items-center gap-3">
              {/* Jewelry Type Selector */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  id="btn-jewelry-type"
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all duration-300 whitespace-nowrap ${
                    isDropdownOpen
                      ? "bg-zinc-100 border-brand-gold shadow-[0_0_0_2px_rgba(242,212,18,0.15)]"
                      : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300"
                  }`}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  title="Select jewelry type"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="text-base leading-none">
                    {selectedType.icon}
                  </span>
                  <span className="text-[13px] font-semibold text-zinc-800 tracking-wide">
                    {selectedType.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-brand-gold" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute bottom-[calc(100%+0.5rem)] left-0 min-w-[11rem] bg-white border border-zinc-200 rounded-xl shadow-xl p-1.5 z-[100] animate-dropdown-in"
                    role="listbox"
                    aria-label="Jewelry type"
                  >
                    {JEWELRY_TYPES.map((type) => (
                      <button
                        key={type.id}
                        role="option"
                        aria-selected={type.id === jewelryType}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                          type.id === jewelryType
                            ? "bg-brand-gold/10"
                            : "hover:bg-zinc-50"
                        }`}
                        onClick={() => handleSelectJewelryType(type.id)}
                      >
                        <span className="text-base leading-none">
                          {type.icon}
                        </span>
                        <span
                          className={`flex-1 text-[13px] font-medium ${
                            type.id === jewelryType
                              ? "text-zinc-900 font-semibold"
                              : "text-zinc-700"
                          }`}
                        >
                          {type.label}
                        </span>
                        {type.id === jewelryType && (
                          <span className="text-xs font-bold text-brand-green">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                id="jewelry-upload"
              />
              <button
                id="btn-upload"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center justify-center w-12 h-12 rounded-xl border transition-all duration-300 shrink-0 ${
                  uploadedPreview
                    ? "bg-brand-gold/10 border-brand-gold/30"
                    : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:scale-105 hover:border-zinc-300"
                }`}
                title="Upload jewelry image"
              >
                {uploadedPreview ? (
                  <ImageIcon size={20} className="text-brand-gold" />
                ) : (
                  <Paperclip
                    size={20}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors"
                  />
                )}
              </button>

              <div className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-400">
                {uploadedPreview
                  ? `${selectedType.icon} ${selectedType.label} uploaded — click Generate!`
                  : `Upload a ${selectedType.label.toLowerCase()} image to get started…`}
              </div>

              <button
                id="btn-generate"
                onClick={handleGenerate}
                disabled={!uploadedFile || isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 shrink-0 ${
                  !uploadedFile || isLoading
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed opacity-50"
                    : "bg-brand-gold text-zinc-900 shadow-lg shadow-brand-gold/30 hover:bg-brand-gold-hover hover:shadow-xl hover:scale-105 hover:-translate-y-0.5"
                }`}
              >
                <Send size={16} />
                <span className="hidden sm:inline">Generate Photoshoot</span>
                <span className="sm:hidden">Generate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
