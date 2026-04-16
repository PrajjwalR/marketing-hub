"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { ModelInfo } from "@/app/api/AI-photoshoot/photoshoot";

export interface Message {
  id: string;
  role: "system" | "user";
  type: "welcome" | "image" | "results" | "text" | "video-result";
  model?: ModelInfo;
  text: string;
  imageUrl?: string;
  images?: (string | { url: string; label: string })[];
  videoUrl?: string;
}

export type PhotoshootScreen = "selection" | "chat";
export type GenerationMode = "photo" | "video";

interface PhotoshootContextType {
  screen: PhotoshootScreen;
  setScreen: (screen: PhotoshootScreen) => void;
  selectedModel: ModelInfo | null;
  setSelectedModel: (model: ModelInfo | null) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  jewelryType: string;
  setJewelryType: (type: string) => void;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  hasResults: boolean;
  setHasResults: (hasResults: boolean) => void;
  resetSession: () => void;
}

const PhotoshootContext = createContext<PhotoshootContextType | undefined>(undefined);

export function PhotoshootProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<PhotoshootScreen>("selection");
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [jewelryType, setJewelryType] = useState("necklace");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("photo");
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const resetSession = useCallback(() => {
    setScreen("selection");
    setSelectedModel(null);
    setMessages([]);
    setJewelryType("necklace");
    setGenerationMode("photo");
    setIsLoading(false);
    setHasResults(false);
  }, []);

  return (
    <PhotoshootContext.Provider
      value={{
        screen,
        setScreen,
        selectedModel,
        setSelectedModel,
        messages,
        setMessages,
        jewelryType,
        setJewelryType,
        generationMode,
        setGenerationMode,
        isLoading,
        setIsLoading,
        hasResults,
        setHasResults,
        resetSession,
      }}
    >
      {children}
    </PhotoshootContext.Provider>
  );
}

export function usePhotoshoot() {
  const context = useContext(PhotoshootContext);
  if (context === undefined) {
    throw new Error("usePhotoshoot must be used within a PhotoshootProvider");
  }
  return context;
}
