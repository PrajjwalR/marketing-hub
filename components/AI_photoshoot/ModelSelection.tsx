import { Camera } from "lucide-react";
import type { ModelInfo } from "@/app/api/AI-photoshoot/photoshoot";

interface ModelSelectionProps {
  models: ModelInfo[];
  onSelect: (model: ModelInfo) => void;
}

export default function ModelSelection({
  models,
  onSelect,
}: ModelSelectionProps) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16" id="model-selection">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-sm font-bold tracking-widest uppercase text-brand-green mb-3">
          Select Your Canvas
        </p>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 mb-6 leading-[1.1]">
          Choose a Model
        </h2>
        <p className="text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Pick the perfect canvas for your jewelry photoshoot. Our AI will
          seamlessly style your pieces on the selected model.
        </p>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {models.map((model) => (
          <button
            key={model.id}
            id={`model-card-${model.id}`}
            onClick={() => onSelect(model)}
            className="group relative cursor-pointer aspect-3/4 overflow-hidden rounded-2xl bg-zinc-100 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="absolute inset-3 overflow-hidden rounded-[22px] bg-zinc-100 ring-2 ring-white/80">
              <img
                src={model.image}
                alt={`Model ${model.name} — ${model.style}`}
                className="block h-full w-full rounded-[22px] object-contain object-center transition-transform duration-500 group-hover:scale-[1.01]"
                style={{ borderRadius: "22px" }}
                loading="lazy"
              />
            </div>
            <div className="ai-photoshoot-card-overlay" />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 translate-y-2 opacity-70 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
              <div className="flex items-center gap-2 mb-2">
                <Camera size={14} className="text-brand-gold" />
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-brand-gold">
                  {model.style}
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                {model.name}
              </h3>
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="inline-block px-4 py-2 rounded-full text-xs font-semibold tracking-wide bg-brand-gold text-zinc-900 shadow-lg shadow-brand-gold/30">
                  Select Model
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-zinc-400 mt-10">
        Click on a model to begin your AI-powered photoshoot session
      </p>
    </section>
  );
}
