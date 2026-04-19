import { ActiveTool, Editor, STROKE_COLOR } from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ColorPicker } from "./color-picker";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StrokeColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const StrokeColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokeColorSidebarProps) => {
  const value = editor?.getActiveStrokeColor() || STROKE_COLOR;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChange = (value: string) => {
    editor?.changeStrokeColor(value);
  };

  return (
    <div
      className={cn(
        "bg-background w-full h-full flex flex-col",
        activeTool === "stroke-color" ? "block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Stroke color"
        description="Add stroke color to your element"
        onBack={() => onChangeActiveTool("select")}
      />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <ColorPicker
            value={value}
            onChange={onChange}
          />
        </div>
      </ScrollArea>
    </div>
  );
};




