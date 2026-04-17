interface ToolSidebarHeaderProps {
  title: string;
  description?: string;
};

export const ToolSidebarHeader = ({
  title,
  description
}: ToolSidebarHeaderProps) => {
  return (
    <div className="p-4 border-b space-y-1 h-[68px] flex flex-col justify-center">
      <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">
        {title}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};
