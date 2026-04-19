import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolSidebarHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
};

export const ToolSidebarHeader = ({
  title,
  description,
  onBack
}: ToolSidebarHeaderProps) => {
  return (
    <div className="p-4 border-b border-border space-y-1 h-[68px] flex flex-col justify-center bg-background relative">
      <div className="flex items-center gap-x-3">
        {onBack && (
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="icon" 
            className="size-7 -ml-1 hover:bg-secondary"
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground">
          {title}
        </p>
      </div>
      {description && (
        <p className="text-[10px] text-muted-foreground font-medium">
          {description}
        </p>
      )}
    </div>
  );
};




