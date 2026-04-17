"use client";

import Image from "next/image";
import { AlertTriangle, Loader, Search, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { 
  ActiveTool, 
  Editor,
} from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const ImageSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ImageSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchImages = useCallback(async (query?: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const endpoint = query 
        ? `/api/stock?query=${encodeURIComponent(query)}` 
        : "/api/stock";
      const response = await fetch(endpoint);
      const images = await response.json();
      
      if (Array.isArray(images)) {
        setData(images);
      } else {
        setData([]);
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTool === "images") {
      fetchImages();
    }
  }, [activeTool, fetchImages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImages(search);
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data?.url) {
        editor?.addImage(data.url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[370px] h-full flex flex-col",
        activeTool === "images" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Images"
        description="Add images to your canvas"
      />
      <div className="p-4 border-b space-y-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stock images..." 
            className="pl-10"
          />
        </form>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          className="w-full"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4 mr-2" />
          Upload Image
        </Button>
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
            Failed to fetch images
          </p>
        </div>
      )}
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {data.map((image) => (
              <button
                key={image.id}
                onClick={() => editor?.addImage(image.url)}
                className="relative w-full aspect-square group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
              >
                <Image
                  fill
                  src={image.url}
                  alt={image.name || "Stock image"}
                  className="object-cover"
                />
                <div className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white p-1 bg-black/50 text-left">
                  {image.author}
                </div>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
