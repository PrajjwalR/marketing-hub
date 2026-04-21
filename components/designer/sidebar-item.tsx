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
        "flex flex-col items-center justify-center gap-1 w-full py-3.5 transition-all shrink-0 relative group",
        isActive 
          ? "text-[var(--ci-accent-primary)] bg-accent/50" 
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--ci-accent-primary)] rounded-r-full shadow-[0_0_10px_rgba(71,26,255,0.5)]" />
      )}
      <Icon className={cn(
        "h-[22px] w-[22px] transition-transform group-hover:scale-110",
        isActive && "drop-shadow-[0_0_5px_rgba(71,26,255,0.3)]"
      )} />
      <span className="text-[10px] font-semibold tracking-wide uppercase mt-1 opacity-70 group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
};




