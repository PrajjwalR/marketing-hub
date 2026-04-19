import { 
  ActiveTool, 
  Editor,
  filters,
} from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const FilterSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FilterSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <div
      className={cn(
        "bg-background w-full h-full flex flex-col",
        activeTool === "filter" ? "block" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Filters"
        description="Apply a filter to selected image"
        onBack={() => onChangeActiveTool("select")}
      />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1 border-b border-border">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant="secondary"
              size="lg"
              className="w-full h-12 justify-start text-left bg-secondary/50 hover:bg-secondary border-border text-muted-foreground capitalize"
              onClick={() => editor?.changeImageFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};




