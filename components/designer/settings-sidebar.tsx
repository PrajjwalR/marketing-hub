import { useEffect, useMemo, useState } from "react";

import { ActiveTool, Editor } from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ColorPicker } from "./color-picker";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const SettingsSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: SettingsSidebarProps) => {
  const workspace = editor?.getWorkspace();

  const initialWidth = useMemo(() => `${workspace?.width ?? 0}`, [workspace]);
  const initialHeight = useMemo(() => `${workspace?.height ?? 0}`, [workspace]);
  const initialBackground = useMemo(() => workspace?.fill ?? "#ffffff", [workspace]);

  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [background, setBackground] = useState(initialBackground);

  useEffect(() => {
    setWidth(initialWidth);
    setHeight(initialHeight);
    setBackground(initialBackground);
  }, 
  [
    initialWidth,
    initialHeight,
    initialBackground
  ]);

  const changeWidth = (value: string) => setWidth(value);
  const changeHeight = (value: string) => setHeight(value);
  const changeBackground = (value: string) => {
    setBackground(value);
    editor?.changeBackground(value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    editor?.changeSize({
      width: parseInt(width, 10),
      height: parseInt(height, 10),
    });
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <div
      className={cn(
        "bg-background w-full h-full flex flex-col",
        activeTool === "settings" ? "block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Settings"
        description="Change the look of your workspace"
        onBack={() => onChangeActiveTool("select")}
      />
      <ScrollArea className="flex-1">
        <form className="space-y-4 p-4 border-b border-border" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Height
            </Label>
            <Input
              placeholder="Height"
              value={height}
              type="number"
              onChange={(e) => changeHeight(e.target.value)}
              className="bg-secondary/50 border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Width
            </Label>
            <Input
              placeholder="Width"
              value={width}
              type="number"
              onChange={(e) => changeWidth(e.target.value)}
              className="bg-secondary/50 border-border text-foreground"
            />
          </div>
          <Button type="submit" className="w-full bg-[var(--ci-accent-primary)] hover:bg-[var(--ci-accent-primary)]/80 text-white">
            Resize
          </Button>
        </form>
        <div className="p-4 space-y-2 border-b border-border">
          <Label className="text-muted-foreground">Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-secondary/50 hover:bg-secondary border-border text-muted-foreground text-[10px]"
              onClick={() => editor?.changeSize({ width: 1080, height: 1080 })}
            >
              Instagram Post
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-secondary/50 hover:bg-secondary border-border text-muted-foreground text-[10px]"
              onClick={() => editor?.changeSize({ width: 1080, height: 1920 })}
            >
              Instagram Story
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-secondary/50 hover:bg-secondary border-border text-muted-foreground text-[10px]"
              onClick={() => editor?.changeSize({ width: 1280, height: 720 })}
            >
              YouTube Thumbnail
            </Button>
             <Button
              variant="secondary"
              size="sm"
              className="bg-secondary/50 hover:bg-secondary border-border text-muted-foreground text-[10px]"
              onClick={() => editor?.changeSize({ width: 1200, height: 630 })}
            >
              Facebook Post
            </Button>
          </div>
        </div>
        <div className="p-4">
          <Label className="text-muted-foreground mb-4 block">Background Color</Label>
          <ColorPicker
            value={background as string}
            onChange={changeBackground}
          />
        </div>
      </ScrollArea>
    </div>
  );
};




