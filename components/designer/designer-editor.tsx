"use client";

import { fabric } from "fabric";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

import { 
  ActiveTool, 
  selectionDependentTools,
  JSON_KEYS
} from "./types";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { useEditor } from "./hooks/use-editor";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";
import { ShapeSidebar } from "./shape-sidebar";
import { FillColorSidebar } from "./fill-color-sidebar";
import { StrokeColorSidebar } from "./stroke-color-sidebar";
import { StrokeWidthSidebar } from "./stroke-width-sidebar";
import { OpacitySidebar } from "./opacity-sidebar";
import { TextSidebar } from "./text-sidebar";
import { FontSidebar } from "./font-sidebar";
import { ImageSidebar } from "./image-sidebar";
import { FilterSidebar } from "./filter-sidebar";
import { DrawSidebar } from "./draw-sidebar";
import { AiSidebar } from "./ai-sidebar";
import { TemplateSidebar } from "./template-sidebar";
import { RemoveBgSidebar } from "./remove-bg-sidebar";
import { SettingsSidebar } from "./settings-sidebar";
import { LayersSidebar } from "./layers-sidebar";
import { AdjustSidebar } from "./adjust-sidebar";
import { InspectorSidebar } from "./inspector-sidebar";

interface DesignerEditorProps {
  designId?: string;
  initialData?: any;
}

export const DesignerEditor = ({ designId, initialData }: DesignerEditorProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [title, setTitle] = useState(initialData?.name || "Untitled design");

  // Tracks the real design ID even for new designs (created on first auto-save)
  const currentDesignId = useRef<string | undefined>(designId);
  // Keep the ref in sync whenever the prop changes (e.g. after navigation)
  useEffect(() => { currentDesignId.current = designId; }, [designId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(
      async (values: { 
        json: any;
        height: number;
        width: number;
      }) => {
        setIsSaving(true);
        setHasError(false);
        try {
          if (currentDesignId.current) {
            // Existing design — just PATCH the json
            await fetch(`/api/designs/${currentDesignId.current}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ json_data: values.json }),
            });
          } else {
            // New design — create it first, then update the URL silently
            const response = await fetch("/api/designs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: "Untitled design",
                json_data: values.json,
                type: "poster",
                width: values.width,
                height: values.height,
              }),
            });
            if (response.ok) {
              const data = await response.json();
              currentDesignId.current = data.id;
              // Replace URL so the user can bookmark/share without losing the design
              router.replace(`/dashboard/designer/${data.id}`);
            }
          }
        } catch {
          setHasError(true);
        } finally {
          setIsSaving(false);
        }
      },
      1500
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onSave = async () => {
    if (!editor) return;

    setIsSaving(true);
    setHasError(false);

    try {
      const workspace = editor.canvas.getObjects().find((obj) => obj.name === "clip");
      // @ts-ignore
      const dataUrl = editor.canvas.toDataURL({
        format: "png",
        quality: 1,
        left: workspace?.left || 0,
        top: workspace?.top || 0,
        width: workspace?.width || editor.canvas.width,
        height: workspace?.height || editor.canvas.height,
        multiplier: 0.5,
      });

      const json = editor.canvas.toJSON(JSON_KEYS);
      const body = {
        name: title,
        json_data: json,
        thumbnail_base64: dataUrl,
      };

      const activeId = currentDesignId.current;

      if (activeId) {
        // Update existing
        const response = await fetch(`/api/designs/${activeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Failed to save");
        toast.success("Design saved");
      } else {
        // Create new
        const response = await fetch("/api/designs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            type: "poster",
            width: workspace?.width || 1080,
            height: workspace?.height || 1080,
          }),
        });
        if (!response.ok) throw new Error("Failed to create design");
        const data = await response.json();
        currentDesignId.current = data.id;
        toast.success("Design created");
        router.replace(`/dashboard/designer/${data.id}`);
      }
    } catch (error) {
      console.error(error);
      setHasError(true);
      toast.error("Failed to save design");
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveAsTemplate = async () => {
    if (!editor) return;
    const workspace = editor.canvas.getObjects().find((obj) => obj.name === "clip");
    // @ts-ignore
    const dataUrl = editor.canvas.toDataURL({
      format: "png",
      quality: 1,
      left: workspace?.left || 0,
      top: workspace?.top || 0,
      width: workspace?.width || editor.canvas.width,
      height: workspace?.height || editor.canvas.height,
      multiplier: 0.5,
    });
    const json = editor.canvas.toJSON(JSON_KEYS);
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          json_data: json,
          thumbnail_base64: dataUrl,
          width: workspace?.width || 1080,
          height: workspace?.height || 1080,
          category: "user",
        }),
      });
      if (!response.ok) throw new Error("Failed to save template");
      toast.success("Saved as template! You can reuse it from the Templates panel.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save as template");
    }
  };

  const onSaveACopy = async () => {
    if (!editor) return;
    const workspace = editor.canvas.getObjects().find((obj) => obj.name === "clip");
    // @ts-ignore
    const dataUrl = editor.canvas.toDataURL({
      format: "png",
      quality: 1,
      left: workspace?.left || 0,
      top: workspace?.top || 0,
      width: workspace?.width || editor.canvas.width,
      height: workspace?.height || editor.canvas.height,
      multiplier: 0.5,
    });
    const json = editor.canvas.toJSON(JSON_KEYS);
    try {
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${title} (copy)`,
          json_data: json,
          thumbnail_base64: dataUrl,
          type: "poster",
          width: workspace?.width || 1080,
          height: workspace?.height || 1080,
        }),
      });
      if (!response.ok) throw new Error("Failed to save copy");
      const data = await response.json();
      toast.success("Copy saved! Opening it now...");
      router.push(`/dashboard/designer/${data.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save copy");
    }
  };


  const [activeTool, setActiveTool] = useState<ActiveTool>("select");

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: initialData?.json_data || initialData,
    defaultWidth: initialData?.width || 900,
    defaultHeight: initialData?.height || 1200,
    clearSelectionCallback: onClearSelection,
    saveCallback: debouncedSave,
  });

  const onChangeActiveTool = useCallback((tool: ActiveTool) => {
    if (tool === "draw") {
      editor?.enableDrawingMode();
    }

    if (activeTool === "draw") {
      editor?.disableDrawingMode();
    }

    if (tool === activeTool) {
      return setActiveTool("select");
    }
    
    setActiveTool(tool);
  }, [activeTool, editor]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="h-full flex flex-col bg-background text-foreground selection:bg-primary/30">
      <Navbar
        editor={editor}
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        isSaving={isSaving}
        hasError={hasError}
        title={title}
        onChangeTitle={setTitle}
        onSave={onSave}
        onSaveAsTemplate={onSaveAsTemplate}
        onSaveACopy={onSaveACopy}
      />
      <div className="flex-1 flex w-full overflow-hidden relative bg-background">
        <Sidebar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TemplateSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapeSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TextSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ImageSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <AiSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <DrawSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <LayersSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <main className="bg-muted flex-1 overflow-auto relative flex flex-col">
          {/* <Toolbar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          /> */}
          <div className="flex-1 bg-zinc-100 relative flex flex-col overflow-hidden" ref={containerRef}>
            <canvas ref={canvasRef} />
          </div>
          <Footer editor={editor} />
        </main>

        {/* Right Inspector Panel - Unified Property Editor */}
        <InspectorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
      </div>
    </div>
  );
};




