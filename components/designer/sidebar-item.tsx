import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
};

export const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 w-full py-4 transition-colors shrink-0",
        isActive 
          ? "bg-white text-zinc-900 border-l-2 border-zinc-900" 
          : "text-zinc-500 hover:text-zinc-900"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">
        {label}
      </span>
    </button>
  );
};
