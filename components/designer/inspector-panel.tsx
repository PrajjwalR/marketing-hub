"use client";

import { ActiveTool, Editor } from "./types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { FillColorSidebar } from "./fill-color-sidebar";
import { StrokeColorSidebar } from "./stroke-color-sidebar";
import { StrokeWidthSidebar } from "./stroke-width-sidebar";
import { OpacitySidebar } from "./opacity-sidebar";
import { FontSidebar } from "./font-sidebar";
import { FilterSidebar } from "./filter-sidebar";

interface InspectorPanelProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const InspectorPanel = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: InspectorPanelProps) => {
  const selectedObject = editor?.canvas.getActiveObject();

  if (!selectedObject && activeTool !== "settings") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="size-16 rounded-full bg-accent/50 flex items-center justify-center border border-white/10">
           <span className="text-muted-foreground text-2xl">?</span>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No selection</p>
          <p className="text-xs text-muted-foreground">Select an element to view its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <ToolSidebarHeader 
        title="Inspector" 
        description="Fine-tune your selection" 
      />
      
      <ScrollArea className="flex-1">
        <div className="p-0">
          {/* We will conditionally render the sections or reuse existing sidebar components 
              but in a way that fits the inspector layout. 
              For now, we'll let the DesignerEditor handle the specific visibility of property sidebars,
              but we move them to this right area.
          */}
          <p className="p-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            {activeTool.replace("-", " ")} logic
          </p>
        </div>
      </ScrollArea>
    </div>
  );
};




