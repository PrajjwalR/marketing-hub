"use client";

import Image from "next/image";
import { AlertTriangle, Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ActiveTool, Editor } from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const TemplateSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TemplateSidebarProps) => {
  const [libraryData, setLibraryData] = useState<any[]>([]);
  const [personalData, setPersonalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [libRes, personalRes] = await Promise.all([
        fetch("/api/templates"),
        fetch("/api/designs")
      ]);

      const libTemplates = libRes.ok ? await libRes.json() : [];
      const personalDesigns = personalRes.ok ? await personalRes.json() : [];

      setLibraryData(Array.isArray(libTemplates) ? libTemplates : []);
      setPersonalData(Array.isArray(personalDesigns) ? personalDesigns : []);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTool === "templates") {
      fetchData();
    }
  }, [activeTool, fetchData]);

  const onClick = (template: any) => {
    if (template.content) {
      editor?.loadTemplate(template.content);
    } else if (template.json_data) {
      editor?.loadTemplate(template.json_data);
    }
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const TemplateGrid = ({ items, emptyMessage }: { items: any[], emptyMessage: string }) => (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {items.map((template) => {
          const thumbnailUrl = template.thumbnail_url || template.preview_url;

          return (
            <button
              key={template.id}
              onClick={() => onClick(template)}
              style={{ 
                aspectRatio: `${template.width || 1080}/${template.height || 1080}`
              }}
              className="relative w-full group hover:ring-2 hover:ring-[var(--ci-accent-primary)] transition-all bg-secondary/50 rounded-md overflow-hidden border border-border"
            >
              {thumbnailUrl ? (
                <Image
                  fill
                  src={thumbnailUrl}
                  alt={template.name || "Template"}
                  className="object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-secondary">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                    {template.type || "Template"}
                  </span>
                </div>
              )}
              <div className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-foreground p-2 bg-black/70 backdrop-blur-sm text-left transition-opacity">
                {template.name}
              </div>
            </button>
          );
        })}
      </div>
      {items.length === 0 && !isLoading && !isError && (
        <p className="text-xs text-muted-foreground text-center py-8">
          {emptyMessage}
        </p>
      )}
    </div>
  );

  return (
    <aside
      className={cn(
        "bg-background relative border-r border-border z-[40] w-[370px] h-full flex flex-col transition-all",
        activeTool === "templates" ? "visible translate-x-0" : "hidden -translate-x-full",
      )}
    >
      <ToolSidebarHeader
        title="Templates"
        description="Choose a high-end starting point"
      />
      
      <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <TabsList className="w-full grid grid-cols-2 bg-secondary/50 p-1 h-10 border-border">
            <TabsTrigger value="library" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground">Library</TabsTrigger>
            <TabsTrigger value="personal" className="data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground">Personal</TabsTrigger>
          </TabsList>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center flex-1">
            <Loader className="size-4 text-muted-foreground animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
            <AlertTriangle className="size-4 text-muted-foreground" />
            <p className="text-muted-foreground text-xs">
              Failed to load design templates
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <ScrollArea className="flex-1">
            <TabsContent value="library" className="m-0">
              <TemplateGrid 
                items={libraryData} 
                emptyMessage="No public templates found." 
              />
            </TabsContent>
            <TabsContent value="personal" className="m-0">
              <TemplateGrid 
                items={personalData} 
                emptyMessage="You haven't saved any designs yet." 
              />
            </TabsContent>
          </ScrollArea>
        )}
      </Tabs>
      
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};




