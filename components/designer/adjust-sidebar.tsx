"use client";

import { 
  ActiveTool, 
  Editor,
} from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdjustSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const AdjustSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: AdjustSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleReset = () => {
    editor?.changeImageAdjustment("brightness", 0);
    editor?.changeImageAdjustment("contrast", 0);
    editor?.changeImageAdjustment("saturation", 0);
    editor?.changeImageAdjustment("blur", 0);
    editor?.changeImageAdjustment("hue", 0);
    editor?.changeImageAdjustment("gamma", 1);
  };

  return (
    <div
      className={cn(
        "bg-background w-full h-full flex flex-col",
        activeTool === "adjust" ? "block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Adjust"
        description="Fine-tune your image"
        onBack={() => onChangeActiveTool("select")}
      />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div className="space-y-3">
             <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Brightness</Label>
              <span className="text-[10px] text-muted-foreground">{editor?.getActiveAdjustment("brightness").toFixed(2)}</span>
            </div>
            <Slider
              value={[editor?.getActiveAdjustment("brightness") || 0]}
              onValueChange={(values) => editor?.changeImageAdjustment("brightness", values[0])}
              max={1}
              min={-1}
              step={0.01}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Contrast</Label>
              <span className="text-[10px] text-muted-foreground">{editor?.getActiveAdjustment("contrast").toFixed(2)}</span>
            </div>
            <Slider
              value={[editor?.getActiveAdjustment("contrast") || 0]}
              onValueChange={(values) => editor?.changeImageAdjustment("contrast", values[0])}
              max={1}
              min={-1}
              step={0.01}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Saturation</Label>
              <span className="text-[10px] text-muted-foreground">{editor?.getActiveAdjustment("saturation").toFixed(2)}</span>
            </div>
            <Slider
              value={[editor?.getActiveAdjustment("saturation") || 0]}
              onValueChange={(values) => editor?.changeImageAdjustment("saturation", values[0])}
              max={1}
              min={-1}
              step={0.01}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Blur</Label>
              <span className="text-[10px] text-muted-foreground">{editor?.getActiveAdjustment("blur").toFixed(2)}</span>
            </div>
            <Slider
              value={[editor?.getActiveAdjustment("blur") || 0]}
              onValueChange={(values) => editor?.changeImageAdjustment("blur", values[0])}
              max={1}
              min={0}
              step={0.01}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Hue Rotation</Label>
              <span className="text-[10px] text-muted-foreground">{editor?.getActiveAdjustment("hue").toFixed(2)}</span>
            </div>
            <Slider
              value={[editor?.getActiveAdjustment("hue") || 0]}
              onValueChange={(values) => editor?.changeImageAdjustment("hue", values[0])}
              max={1}
              min={-1}
              step={0.01}
            />
          </div>
           <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Gamma</Label>
              <span className="text-[10px] text-muted-foreground">{editor?.getActiveAdjustment("gamma").toFixed(2)}</span>
            </div>
            <Slider
              value={[editor?.getActiveAdjustment("gamma") || 1]}
              onValueChange={(values) => editor?.changeImageAdjustment("gamma", values[0])}
              max={2.2}
              min={0.2}
              step={0.01}
            />
          </div>
          <Button
            variant="outline"
            className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
            onClick={handleReset}
          >
            Reset Adjustments
          </Button>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </div>
  );
};




