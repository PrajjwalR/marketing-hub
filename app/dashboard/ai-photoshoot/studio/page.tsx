"use client";

import { useCallback, useState } from "react";
import Header from "@/components/AI_photoshoot/Header";
import ModelSelection from "@/components/AI_photoshoot/ModelSelection";
import ChatInterface from "@/components/AI_photoshoot/ChatInterface";
import StudioHowItWorks from "@/components/AI_photoshoot/StudioHowItWorks";
import type { ModelInfo } from "@/app/api/AI-photoshoot/photoshoot";
import { usePhotoshoot } from "@/context/photoshoot-context";

const MODELS: ModelInfo[] = [
  {
    id: "model-1",
    name: "Mahi",
    style: "Pastel Lehenga",
    image: "/images/AI-photoshoot-models/model1.png",
  },
  {
    id: "model-2",
    name: "Diya",
    style: "White Saree",
    image: "/images/AI-photoshoot-models/model2.png",
  },
  {
    id: "model-3",
    name: "Kabir",
    style: "Smart Casual",
    image: "/images/AI-photoshoot-models/model3.png",
  },
  {
    id: "model-4",
    name: "Meera",
    style: "Beige Lehenga",
    image: "/images/AI-photoshoot-models/model4.png",
  },
  {
    id: "model-5",
    name: "Deepika",
    style: "Silk Gown",
    image: "/images/AI-photoshoot-models/model5.png",
  },
  {
    id: "model-6",
    name: "Tara",
    style: "Olive Silk",
    image: "/images/AI-photoshoot-models/model6.png",
  },
  {
    id: "model-7",
    name: "Priya",
    style: "Linen Shirt",
    image: "/images/AI-photoshoot-models/model7.png",
  },
  {
    id: "model-8",
    name: "Kavit",
    style: "Black Evening Gown",
    image: "/images/AI-photoshoot-models/model8.png",
  },
  {
    id: "model-9",
    name: "Yashvi",
    style: "Classic Saree",
    image: "/images/AI-photoshoot-models/model9.png",
  },
  {
    id: "model-10",
    name: "Anjali",
    style: "Minimalist Saree",
    image: "/images/AI-photoshoot-models/model10.png",
  },
  {
    id: "model-11",
    name: "Sanya",
    style: "Gold Border Saree",
    image: "/images/AI-photoshoot-models/model11.png",
  },
  {
    id: "model-12",
    name: "Lakshmi",
    style: "Champagne Gown",
    image: "/images/AI-photoshoot-models/model12.png",
  },
  {
    id: "model-13",
    name: "Ananya",
    style: "Red Lehenga",
    image: "/images/AI-photoshoot-models/model13.png",
  },
  {
    id: "model-14",
    name: "Vidya",
    style: "Blue Gown",
    image: "/images/AI-photoshoot-models/model14.png",
  },
  {
    id: "model-15",
    name: "Maya",
    style: "Vibrant Lehenga",
    image: "/images/AI-photoshoot-models/model15.png",
  },
  {
    id: "model-16",
    name: "Shruti",
    style: "Sunset Lehenga",
    image: "/images/AI-photoshoot-models/model16.png",
  },
  {
    id: "model-17",
    name: "Neha",
    style: "Ice Blue Lehenga",
    image: "/images/AI-photoshoot-models/model17.png",
  },
];

export default function AiPhotoshootStudioPage() {
  const { 
    screen, 
    setScreen, 
    selectedModel, 
    setSelectedModel, 
    resetSession 
  } = usePhotoshoot();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleModelSelect = useCallback((model: ModelInfo) => {
    setSelectedModel(model);
    setIsTransitioning(true);
    setTimeout(() => {
      setScreen("chat");
      setIsTransitioning(false);
    }, 450);
  }, [setSelectedModel, setScreen]);

  const handleBackToSelection = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      resetSession();
      setIsTransitioning(false);
    }, 450);
  }, [resetSession]);

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
