"use client";

import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash, 
  ArrowUp, 
  ArrowDown,
  Box,
  Type,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ActiveTool, Editor } from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayersSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const LayersSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: LayersSidebarProps) => {
  const [objects, setObjects] = useState<any[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateObjects = () => {
      setObjects([...editor.getObjects()].reverse());
    };

    updateObjects();
    editor.canvas.on("object:added", updateObjects);
    editor.canvas.on("object:removed", updateObjects);
    editor.canvas.on("object:modified", updateObjects);

    return () => {
      editor.canvas.off("object:added", updateObjects);
      editor.canvas.off("object:removed", updateObjects);
      editor.canvas.off("object:modified", updateObjects);
    };
  }, [editor]);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const getIcon = (type: string) => {
    if (type.includes("text")) return Type;
    if (type === "image") return ImageIcon;
    return Box;
  };

  return (
    <aside
      className={cn(
        "bg-background relative border-r border-border z-[40] w-[370px] h-full flex flex-col transition-all",
        activeTool === "layers" ? "visible translate-x-0" : "hidden -translate-x-full",
      )}
    >
      <ToolSidebarHeader
        title="Layers"
        description="Manage your canvas elements"
      />
      <ScrollArea>
        <div className="p-4 space-y-2">
          {objects.map((obj, index) => {
            const Icon = getIcon(obj.type);
            const isSelected = editor?.selectedObjects.includes(obj);

            return (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-x-2 p-2 rounded-md border border-[#ffffff05] bg-secondary/50 hover:bg-secondary transition-colors group",
                  isSelected && "border-[var(--ci-accent-primary)] bg-[var(--ci-accent-primary)]/5"
                )}
                onClick={() => {
                  editor?.canvas.setActiveObject(obj);
                  editor?.canvas.renderAll();
                }}
              >
                <div className="p-2 bg-background rounded-md">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-foreground truncate font-medium">
                    {obj.name || `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}`}
                  </p>
                </div>
                <div className="flex items-center gap-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      obj.set("visible", !obj.visible);
                      editor?.canvas.renderAll();
                      setObjects([...objects]); // trigger re-render
                    }}
                  >
                    {obj.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      const isLocked = !obj.selectable;
                      obj.set({
                        selectable: isLocked,
                        hasControls: isLocked,
                        lockMovementX: !isLocked,
                        lockMovementY: !isLocked,
                      });
                      editor?.canvas.renderAll();
                      setObjects([...objects]); // trigger re-render
                    }}
                  >
                    {obj.selectable ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-rose-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      editor?.canvas.remove(obj);
                    }}
                  >
                    <Trash className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};




