"use client";

import { useState } from "react";

import { ActiveTool, Editor } from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "lucide-react";

interface AiSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const AiSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: AiSidebarProps) => {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/posters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          description: value,
          type: "image"
        }),
      });
      const data = await response.json();
      
      // Based on /api/posters/generate response format
      if (data?.outputUrl) {
        editor?.addImage(data.outputUrl);
      }
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[370px] h-full flex flex-col",
        activeTool === "ai" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Magic"
        description="Describe what you want to see, and AI will create it for you"
      />
      <ScrollArea>
        <form onSubmit={onSubmit} className="p-4 space-y-6">
          <Textarea
            disabled={isLoading}
            placeholder="A futuristic city in the style of cyberpunk with neon lights and flying cars..."
            cols={30}
            rows={10}
            required
            minLength={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button
            disabled={isLoading}
            type="submit"
            className="w-full"
          >
            {isLoading && <Loader className="size-4 mr-2 animate-spin" />}
            Generate Image
          </Button>
        </form>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
