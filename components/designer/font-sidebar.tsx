import { 
  ActiveTool, 
  Editor,
  fonts, 
} from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const FontSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) => {
  const value = editor?.getActiveFontFamily();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <div
      className={cn(
        "bg-background w-full h-full flex flex-col",
        activeTool === "font" ? "block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Font"
        description="Change the text font"
      />
      <ScrollArea>
        <div className="p-4 space-y-1 border-b border-border">
          {fonts.map((font) => (
            <Button
              key={font}
              variant="secondary"
              size="lg"
              className={cn(
                "w-full h-12 justify-start text-left bg-secondary/50 hover:bg-secondary border-border text-muted-foreground",
                value === font && "ring-2 ring-[var(--ci-accent-primary)] text-foreground",
              )}
              style={{
                fontFamily: font,
                fontSize: "14px",
                padding: "8px 16px"
              }}
              onClick={() => editor?.changeFontFamily(font)}
            >
              {font}
            </Button>
          ))}
        </div>
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Line Height</Label>
              <span className="text-[10px] text-muted-foreground">{editor?.getActiveLineHeight().toFixed(2)}</span>
            </div>
            <Slider
              value={[editor?.getActiveLineHeight() || 1.16]}
              onValueChange={(values) => editor?.changeLineHeight(values[0])}
              max={3}
              min={0.5}
              step={0.01}
              className="py-2"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Character Spacing</Label>
              <span className="text-[10px] text-muted-foreground">{Math.round(editor?.getActiveCharSpacing() || 0)}</span>
            </div>
            <Slider
              value={[editor?.getActiveCharSpacing() || 0]}
              onValueChange={(values) => editor?.changeCharSpacing(values[0])}
              max={1000}
              min={-100}
              step={1}
              className="py-2"
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};




