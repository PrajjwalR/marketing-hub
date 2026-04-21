import { 
  ActiveTool, 
  Editor, 
  STROKE_DASH_ARRAY, 
  STROKE_WIDTH
} from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StrokeWidthSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const StrokeWidthSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokeWidthSidebarProps) => {
  const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH;
  const typeValue = editor?.getActiveStrokeDashArray() || STROKE_DASH_ARRAY;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChangeStrokeWidth = (value: number) => {
    editor?.changeStrokeWidth(value);
  };

  const onChangeStrokeType = (value: number[]) => {
    editor?.changeStrokeDashArray(value);
  };

  return (
    <div
      className={cn(
        "bg-background w-full h-full flex flex-col",
        activeTool === "stroke-width" ? "block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Stroke options"
        description="Modify the stroke of your element"
        onBack={() => onChangeActiveTool("select")}
      />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 border-b border-border">
          <Label className="text-sm text-muted-foreground">
            Stroke width
          </Label>
          <Slider
            value={[widthValue]}
            onValueChange={(values) => onChangeStrokeWidth(values[0])}
          />
        </div>
        <div className="p-4 space-y-4 border-b border-border">
          <Label className="text-sm text-muted-foreground">
            Stroke type
          </Label>
          <Button
            onClick={() => onChangeStrokeType([])}
            variant="secondary"
            size="lg"
            className={cn(
              "w-full h-16 justify-start text-left bg-secondary/50 hover:bg-secondary border-border",
              JSON.stringify(typeValue) === `[]` && "ring-2 ring-[var(--ci-accent-primary)]"
            )}
            style={{
              padding: "8px 16px"
            }}
          >
            <div className="w-full border-white rounded-full border-4" />
          </Button>
          <Button
            onClick={() => onChangeStrokeType([5, 5])}
            variant="secondary"
            size="lg"
            className={cn(
              "w-full h-16 justify-start text-left bg-secondary/50 hover:bg-secondary border-border",
              JSON.stringify(typeValue) === `[5,5]` && "ring-2 ring-[var(--ci-accent-primary)]"
            )}
            style={{
              padding: "8px 16px"
            }}
          >
            <div className="w-full border-white rounded-full border-4 border-dashed" />
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};




