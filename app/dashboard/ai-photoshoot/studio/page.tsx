"use client";

import { useState, useCallback } from "react";
import Header from "@/components/AI_photoshoot/Header";
import ModelSelection from "@/components/AI_photoshoot/ModelSelection";
import ChatInterface from "@/components/AI_photoshoot/ChatInterface";
import StudioHowItWorks from "@/components/AI_photoshoot/StudioHowItWorks";
import type { ModelInfo } from "@/app/api/AI-photoshoot/photoshoot";

const MODELS: ModelInfo[] = [
  {
    id: "model-1",
    name: "Sophia",
    style: "Classic Elegance",
    image: "/images/AI-photoshoot-models/model1.png",
  },
  {
    id: "model-2",
    name: "Aria",
    style: "Traditional Grace",
    image: "/images/AI-photoshoot-models/model2.png",
  },
  {
    id: "model-3",
    name: "Rohan",
    style: "Modern Edge",
    image: "/images/AI-photoshoot-models/model3.png",
  },
];

export default function AiPhotoshootStudioPage() {
  const [screen, setScreen] = useState<"selection" | "chat">("selection");
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleModelSelect = useCallback((model: ModelInfo) => {
    setSelectedModel(model);
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen("chat");
      setIsTransitioning(false);
    }, 450);
  }, []);

  const handleBackToSelection = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen("selection");
      setSelectedModel(null);
      setIsTransitioning(false);
    }, 450);
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-50">
      <div className="ai-photoshoot-bg-ambient" />
      <Header showBack={screen === "chat"} onBack={handleBackToSelection} />
      <StudioHowItWorks
        phase={screen === "selection" ? "select-model" : "configure-generate"}
      />
      <main className="relative z-10">
        {screen === "selection" && (
          <div
            className={isTransitioning ? "animate-page-out" : "animate-page-in"}
          >
            <ModelSelection models={MODELS} onSelect={handleModelSelect} />
          </div>
        )}
        {screen === "chat" && selectedModel && (
          <div
            className={isTransitioning ? "animate-page-out" : "animate-page-in"}
          >
            <ChatInterface selectedModel={selectedModel} />
          </div>
        )}
      </main>
    </div>
  );
}
