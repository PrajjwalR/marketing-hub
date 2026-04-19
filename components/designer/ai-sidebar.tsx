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
        "bg-background relative border-r border-border z-[40] w-[370px] h-full flex flex-col transition-all",
        activeTool === "ai" ? "visible translate-x-0" : "hidden -translate-x-full",
      )}
    >
      <ToolSidebarHeader
        title="Magic Creation"
        description="Describe your vision and watch AI bring it to life"
      />
      <ScrollArea>
        <form onSubmit={onSubmit} className="p-4 space-y-6">
          <Textarea
            disabled={isLoading}
            placeholder="A cinematic aerial view of a futuristic neon city, 8k resolution, highly detailed..."
            cols={30}
            rows={10}
            required
            minLength={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[var(--ci-accent-primary)]"
          />
          <Button
            disabled={isLoading}
            type="submit"
            className="w-full bg-[var(--ci-accent-primary)] hover:bg-[var(--ci-accent-primary)]/80 text-white shadow-[0_0_15px_rgba(71,26,255,0.3)]"
          >
            {isLoading && <Loader className="size-4 mr-2 animate-spin" />}
            Generate Magic
          </Button>
        </form>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};




