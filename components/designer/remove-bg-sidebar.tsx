"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AlertTriangle, Loader } from "lucide-react";

import { ActiveTool, Editor } from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RemoveBgSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const RemoveBgSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: RemoveBgSidebarProps) => {
  const selectedObject = editor?.selectedObjects[0];

  // @ts-ignore
  const imageSrc = selectedObject?._originalElement?.currentSrc;

  const [isLoading, setIsLoading] = useState(false);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = async () => {
    if (!imageSrc) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/media/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: imageSrc,
          action: "remove-bg" 
        }),
      });
      const data = await response.json();
      
      // Based on /api/media/magic response format { url }
      if (data?.url) {
        editor?.addImage(data.url);
      }
    } catch (error) {
      console.error("Remove background failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "remove-bg" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Magic Background Removal"
        description="Remove the background from any image using AI"
      />
      {!imageSrc && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Select an image to use this feature
          </p>
        </div>
      )}
      {imageSrc && (
        <ScrollArea>
          <div className="p-4 space-y-4">
            <div className={cn(
              "relative aspect-square rounded-md overflow-hidden transition bg-muted",
              isLoading && "opacity-50",
            )}>
              <Image
                src={imageSrc}
                fill
                alt="Selected Image"
                className="object-cover"
              />
            </div>
            <Button
              disabled={isLoading}
              onClick={onClick}
              className="w-full"
            >
              {isLoading && <Loader className="size-4 mr-2 animate-spin" />}
              Remove Background
            </Button>
          </div>
        </ScrollArea>
      )}
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
