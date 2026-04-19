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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

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
  const [stockImages, setStockImages] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchStockImages = useCallback(async (query?: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const endpoint = query 
        ? `/api/stock?query=${encodeURIComponent(query)}` 
        : "/api/stock";
      const response = await fetch(endpoint);
      const images = await response.json();
      
      if (Array.isArray(images)) {
        setStockImages(images);
      } else {
        setStockImages([]);
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUploads = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch("/api/media?all=true");
      const images = await response.json();
      
      if (Array.isArray(images)) {
        setUploads(images);
      } else {
        setUploads([]);
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTool === "images") {
      fetchStockImages();
      fetchUploads();
    }
  }, [activeTool, fetchStockImages, fetchUploads]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStockImages(search);
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
      setIsLoading(true);
      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data?.url) {
        editor?.addImage(data.url);
        fetchUploads(); // Refresh uploads list
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsLoading(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <aside
      className={cn(
        "bg-background relative border-r border-border z-[40] w-[370px] h-full flex flex-col transition-all",
        activeTool === "images" ? "visible translate-x-0" : "hidden -translate-x-full",
      )}
    >
      <ToolSidebarHeader
        title="Images"
        description="Add images to your canvas"
      />
      
      <Tabs defaultValue="stock" className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-background">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger value="stock" className="text-xs">Stock</TabsTrigger>
            <TabsTrigger value="uploads" className="text-xs">Uploads</TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 border-b border-border space-y-4 bg-background">
          <TabsContent value="stock" className="m-0 focus-visible:outline-none">
            <form onSubmit={handleSearch} className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stock images..." 
                className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </form>
          </TabsContent>
          
          <TabsContent value="uploads" className="m-0 focus-visible:outline-none">
             <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              className="w-full bg-secondary/50 hover:bg-secondary border-border text-foreground"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="size-4 mr-2" />
              Upload Image
            </Button>
          </TabsContent>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center flex-1 bg-background">
            <Loader className="size-4 text-muted-foreground animate-spin" />
          </div>
        )}
        
        {isError && (
          <div className="flex flex-col gap-y-4 items-center justify-center flex-1 bg-background">
            <AlertTriangle className="size-4 text-muted-foreground" />
            <p className="text-muted-foreground text-xs">
              Failed to fetch images
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-background">
          <TabsContent value="stock" className="m-0 p-4 focus-visible:outline-none">
            <div className="grid grid-cols-3 gap-4">
              {stockImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => editor?.addImage(image.url)}
                  className="relative w-full aspect-square group hover:ring-2 hover:ring-[var(--ci-accent-primary)] transition-all bg-secondary/50 rounded-md overflow-hidden border border-border"
                >
                  <Image
                    fill
                    src={image.url}
                    alt={image.name || "Stock image"}
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-foreground p-2 bg-black/70 backdrop-blur-sm text-left transition-opacity">
                    {image.author}
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="uploads" className="m-0 p-4 focus-visible:outline-none">
            {uploads.length === 0 && !isLoading && (
                <div className="text-center py-10">
                    <p className="text-xs text-muted-foreground">No uploads yet</p>
                </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              {uploads.map((image) => (
                <button
                  key={image.id}
                  onClick={() => editor?.addImage(image.url)}
                  className="relative w-full aspect-square group hover:ring-2 hover:ring-[var(--ci-accent-primary)] transition-all bg-secondary/50 rounded-md overflow-hidden border border-border"
                >
                  <Image
                    fill
                    src={image.url}
                    alt={image.name || "Uploaded image"}
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                </button>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};




