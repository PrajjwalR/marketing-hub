"use client";

import { useState, useCallback } from "react";
import Header from "@/components/AI_photoshoot/Header";
import ModelSelection from "@/components/AI_photoshoot/ModelSelection";
import ChatInterface from "@/components/AI_photoshoot/ChatInterface";
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
  {
    id: "model-4",
    name: "Priya",
    style: "Minimalist Chic",
    image: "/images/AI-photoshoot-models/model4.png",
  },
  {
    id: "model-5",
    name: "Zara",
    style: "Vintage Glamour",
    image: "/images/AI-photoshoot-models/model5.png",
  },
  {
    id: "model-6",
    name: "Mahi",
    style: "Urban Sophistication",
    image: "/images/AI-photoshoot-models/model6.png",
  },
  {
    id: "model-7",
    name: "Maya",
    style: "Bohemian Spirit",
    image: "/images/AI-photoshoot-models/model7.png",
  },
  {
    id: "model-8",
    name: "Kavit",
    style: "Avant-Garde",
    image: "/images/AI-photoshoot-models/model8.png",
  },
  {
    id: "model-9",
    name: "Kai",
    style: "Timeless Beauty",
    image: "/images/AI-photoshoot-models/model9.png",
  },
];

export default function App() {
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
