import { Minimize, ZoomIn, ZoomOut } from "lucide-react";

import { Editor } from "./types";
import { Hint } from "./hint";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface FooterProps {
  editor: Editor | undefined;
};

export const Footer = ({ editor }: FooterProps) => {
  return (
    <footer className="h-[52px] border-t border-border bg-background w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-4 shrink-0 px-4">
      <div className="flex items-center gap-x-2 min-w-[200px]">
        <Hint label="Zoom out" side="top" sideOffset={10}>
          <Button
            onClick={() => editor?.zoomOut()}
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <ZoomOut className="size-4" />
          </Button>
        </Hint>
        <Slider
          className="w-32"
          value={[editor?.zoom || 1]}
          onValueChange={(values) => {
             const zoom = values[0];
             const center = editor?.canvas.getCenter();
             if (center) {
              editor?.canvas.zoomToPoint(
                new fabric.Point(center.left, center.top),
                zoom
              );
              editor?.setZoom(zoom);
             }
          }}
          max={2}
          min={0.1}
          step={0.01}
        />
        <Hint label="Zoom in" side="top" sideOffset={10}>
          <Button
            onClick={() => editor?.zoomIn()}
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <ZoomIn className="size-4" />
          </Button>
        </Hint>
        <span className="text-xs text-muted-foreground tabular-nums w-12 text-center">
          {Math.round((editor?.zoom || 1) * 100)}%
        </span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-x-1">
        <Hint label="Reset" side="top" sideOffset={10}>
          <Button
            onClick={() => editor?.autoZoom()}
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Minimize className="size-4" />
          </Button>
        </Hint>
      </div>
    </footer>
  );
};




