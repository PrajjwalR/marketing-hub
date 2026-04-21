"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AlertTriangle, Loader, Wand2, CheckCircle2, XCircle, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { ActiveTool, Editor } from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { removeBgFromBlob } from "./remove-bg-utils";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RemoveBgSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

type Status = "idle" | "loading" | "success" | "error";

export const RemoveBgSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: RemoveBgSidebarProps) => {
  const selectedObject = editor?.selectedObjects[0];
  const isImage = selectedObject?.type === "image";

  // Get the preview src from the underlying <img> element
  // @ts-ignore
  const previewSrc =
    (selectedObject as any)?._originalElement?.currentSrc ||
    (selectedObject as any)?._originalElement?.src ||
    null;

  const [status, setStatus] = useState<Status>("idle");
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Initializing…");

  // Reset whenever the selection changes
  useEffect(() => {
    setStatus("idle");
    setProcessedUrl(null);
    setProgress(0);
    setProgressLabel("Initializing…");
  }, [selectedObject]);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = async () => {
    if (!isImage) return;

    // Get the canvas-rendered image as a blob
    const imageSrc = editor?.getActiveImageSrc();
    if (!imageSrc) {
      toast.error("Could not read image data from canvas");
      return;
    }

    setStatus("loading");
    setProgress(0);
    setProgressLabel("Loading AI model…");

    try {
      // Convert data URL → Blob
      setProgress(20);
      setProgressLabel("Preparing image…");
      const base64Response = await fetch(imageSrc);
      const blob = await base64Response.blob();

      setProgress(40);
      setProgressLabel("Loading AI model…");

      // Run the on-device AI model (loads ONNX runtime at runtime, not build time)
      const resultBlob = await removeBgFromBlob(blob, (key, current, total) => {
        if (total > 0) {
          const pct = 40 + Math.round((current / total) * 55);
          setProgress(pct);
          if (key.includes("fetch")) setProgressLabel("Downloading model (~10 MB)…");
          else if (key.includes("inference") || key.includes("run")) setProgressLabel("Removing background…");
        }
      });

      setProgress(95);
      setProgressLabel("Finalising…");

      // Create an object URL for preview
      const url = URL.createObjectURL(resultBlob);
      setProcessedUrl(url);
      setProgress(100);
      setStatus("success");
      toast.success("Background removed! Click Apply to update the canvas.");
    } catch (error: any) {
      console.error("[REMOVE_BG]", error);
      setStatus("error");
      toast.error("Background removal failed. Please try again.");
    }
  };

  const onApply = () => {
    if (!processedUrl) return;
    editor?.replaceActiveImage(processedUrl);
    toast.success("Image updated on canvas ✨");
    // Cleanup object URL
    URL.revokeObjectURL(processedUrl);
    setStatus("idle");
    setProcessedUrl(null);
    onClose();
  };

  const onRetry = () => {
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setStatus("idle");
    setProcessedUrl(null);
    setProgress(0);
    setProgressLabel("Initializing…");
  };

  return (
    <div
      className={cn(
        "bg-background w-full h-full flex flex-col",
        activeTool === "remove-bg" ? "flex" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Magic Background Removal"
        description="100% on-device AI — fast, private, no API"
      />

      {/* No image selected */}
      {!isImage && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1 p-6">
          <div className="size-16 rounded-full bg-secondary/50 flex items-center justify-center">
            <AlertTriangle className="size-7 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">No image selected</p>
            <p className="text-muted-foreground text-xs">
              Select an image on the canvas first, then come back here.
            </p>
          </div>
        </div>
      )}

      {/* Image selected */}
      {isImage && (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">

            {/* Magic badge */}
            <div className="flex items-center gap-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <Sparkles className="size-4 text-purple-400 shrink-0" />
              <p className="text-xs text-purple-400 font-medium">
                On-device AI · Replaces image in-place · No upload
              </p>
            </div>

            {/* Preview area */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {status === "success" ? "Result Preview" : "Selected Image"}
              </p>
              <div
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden border border-border transition-all duration-300",
                  status === "loading" && "opacity-70",
                  status === "success"
                    ? "bg-[repeating-conic-gradient(#808080_0%_25%,#ffffff_0%_50%)_0_0/20px_20px]"
                    : "bg-secondary/50"
                )}
              >
                {/* Original image preview */}
                {previewSrc && status !== "success" && (
                  <Image
                    src={previewSrc}
                    fill
                    alt="Selected image"
                    className="object-contain"
                    unoptimized
                  />
                )}
                {/* Result preview */}
                {processedUrl && status === "success" && (
                  <Image
                    src={processedUrl}
                    fill
                    alt="Background removed"
                    className="object-contain"
                    unoptimized
                  />
                )}

                {/* Loading overlay */}
                {status === "loading" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-3 bg-background/70 backdrop-blur-sm">
                    <div className="relative size-14">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                      <div className="absolute inset-2 rounded-full border-4 border-pink-500/20 border-b-pink-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                    </div>
                    <p className="text-[11px] font-medium text-center">{progressLabel}</p>
                  </div>
                )}

                {/* Success badge */}
                {status === "success" && (
                  <div className="absolute top-2 right-2 flex items-center gap-x-1 px-2 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow">
                    <CheckCircle2 className="size-3" />
                    Done
                  </div>
                )}

                {/* Error overlay */}
                {status === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                    <div className="text-center space-y-2">
                      <XCircle className="size-8 text-rose-500 mx-auto" />
                      <p className="text-xs text-rose-400 font-medium">Processing failed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {status === "loading" && (
              <div className="space-y-1">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-right">{Math.round(progress)}%</p>
              </div>
            )}

            {/* === Action Buttons === */}
            {status === "idle" && (
              <Button
                onClick={onClick}
                className="w-full h-11 font-semibold gap-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25"
              >
                <Wand2 className="size-4" />
                Remove Background
              </Button>
            )}

            {status === "loading" && (
              <Button disabled className="w-full h-11 font-semibold gap-x-2 opacity-80 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                <Loader className="size-4 animate-spin" />
                Processing…
              </Button>
            )}

            {status === "success" && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={onRetry}
                  className="h-11 gap-x-2 border-border text-xs"
                >
                  <RotateCcw className="size-4" />
                  Redo
                </Button>
                <Button
                  onClick={onApply}
                  className="h-11 font-semibold gap-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="size-4" />
                  Apply to Canvas
                </Button>
              </div>
            )}

            {status === "error" && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="w-full h-11 gap-x-2 text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
              >
                <RotateCcw className="size-4" />
                Try Again
              </Button>
            )}

            {/* How it works — shown only on idle */}
            {status === "idle" && (
              <div className="rounded-lg bg-secondary/30 border border-border p-3 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">How it works</p>
                <ol className="space-y-1.5">
                  {[
                    "AI model runs directly in your browser",
                    "Background is precisely removed",
                    "Image is replaced in-place on canvas",
                    "Position, size & filters are preserved",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-x-2 text-[11px] text-muted-foreground">
                      <span className="shrink-0 size-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[9px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <p className="text-[10px] text-muted-foreground opacity-60 pt-1">
                  ⚡ First run downloads the model (~10 MB), subsequent runs are instant.
                </p>
              </div>
            )}

          </div>
        </ScrollArea>
      )}
    </div>
  );
};
