import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ShapeToolProps {
  onClick: () => void;
  icon: LucideIcon | IconType;
  iconClassName?: string;
};

export const ShapeTool = ({
  onClick,
  icon: Icon,
  iconClassName
}: ShapeToolProps) => {
  return (
    <button
      onClick={onClick}
      className="aspect-square border border-border rounded-md p-5 bg-secondary/50 hover:bg-secondary transition-all group"
    >
      <Icon className={cn("h-full w-full text-foreground group-hover:scale-110 transition-transform", iconClassName)} />
    </button>
  );
};




