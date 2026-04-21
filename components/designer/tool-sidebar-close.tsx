import { ChevronsLeft } from "lucide-react";

interface ToolSidebarCloseProps {
  onClick: () => void;
};

export const ToolSidebarClose = ({
  onClick,
}: ToolSidebarCloseProps) => {
  return (
    <button
      onClick={onClick}
      className="absolute -right-[1.80rem] h-[60px] bg-background top-1/2 transform -translate-y-1/2 flex items-center justify-center rounded-r-md px-1 pr-2 border-r border-y border-border group transition-colors hover:bg-secondary/50"
    >
      <ChevronsLeft className="size-4 text-foreground group-hover:opacity-75 transition" />
    </button>
  );
};




