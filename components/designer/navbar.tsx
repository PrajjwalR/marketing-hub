"use client";

import { CiFileOn } from "react-icons/ci";
import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { 
  ChevronDown, 
  ChevronLeft,
  Download, 
  Loader, 
  MousePointerClick, 
  Redo2, 
  Undo2,
  Cloud,
  Sparkles,
  LayoutTemplate,
  Copy,
  Save,
  FileJson,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { ActiveTool, Editor } from "./types";
import { Logo } from "./logo";
import { Hint } from "./hint";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  isSaving?: boolean;
  hasError?: boolean;
  title: string;
  onChangeTitle: (value: string) => void;
  onSave: () => void;
  onSaveAsTemplate: () => void;
  onSaveACopy: () => void;
};

export const Navbar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  isSaving = false,
  hasError = false,
  title,
  onChangeTitle,
  onSave,
  onSaveAsTemplate,
  onSaveACopy,
}: NavbarProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = () => {
      editor?.loadJson(reader.result as string);
    };
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <nav className="w-full flex items-center p-4 h-[68px] gap-x-8 border-b border-border bg-background text-foreground lg:pl-[34px] z-[50]">
      <div className="flex items-center gap-x-3 transition-all shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full"
          onClick={() => router.push("/dashboard/designer")}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </Button>
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push("/dashboard")}>
          <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-all">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight leading-none lowercase">
              Agent <span className="text-indigo-600">Elephant</span>
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
              Creative Designer
            </span>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center gap-x-1 h-full">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent/50 font-semibold">
              File
              <ChevronDown className="size-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-60 bg-background border-border text-foreground">
            <DropdownMenuItem
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-x-2 hover:bg-accent/50 cursor-pointer"
            >
              <CiFileOn className="size-8 text-[var(--ci-accent-primary)]" />
              <div>
                <p className="font-medium">Open</p>
                <p className="text-xs text-muted-foreground">
                  Open a JSON file
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="mx-2 h-6 bg-accent" />
        <div className="flex items-center gap-x-2 max-w-[200px]">
          <input
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            onBlur={onSave}
            placeholder="Untitled design"
            className="bg-transparent border-none outline-none text-sm font-medium hover:bg-accent/50 focus:bg-accent/50 p-1 rounded transition-colors w-full"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileOpen}
        />
        <Separator orientation="vertical" className="mx-2 h-6 bg-accent" />
        <Hint label="Select" side="bottom" sideOffset={10}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeActiveTool("select")}
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors",
              activeTool === "select" && "text-[var(--ci-accent-primary)] bg-accent/50"
            )}
          >
            <MousePointerClick className="size-4" />
          </Button>
        </Hint>
        <Hint label="Undo" side="bottom" sideOffset={10}>
          <Button
            disabled={!editor?.canUndo()}
            variant="ghost"
            size="icon"
            onClick={() => editor?.onUndo()}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 disabled:opacity-20"
          >
            <Undo2 className="size-4" />
          </Button>
        </Hint>
        <Hint label="Redo" side="bottom" sideOffset={10}>
          <Button
            disabled={!editor?.canRedo()}
            variant="ghost"
            size="icon"
            onClick={() => editor?.onRedo()}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 disabled:opacity-20"
          >
            <Redo2 className="size-4" />
          </Button>
        </Hint>
        <Separator orientation="vertical" className="mx-2 h-6 bg-accent" />
        {isSaving && ( 
          <div className="flex items-center gap-x-2">
            <Loader className="size-4 animate-spin text-muted-foreground" />
            <div className="text-xs text-muted-foreground font-medium tracking-wide">
              SAVING...
            </div>
          </div>
        )}
        {!isSaving && hasError && ( 
          <div className="flex items-center gap-x-2">
            <BsCloudSlash className="size-[20px] text-rose-500" />
            <div className="text-xs text-rose-500 font-medium">
              FAILED TO SAVE
            </div>
          </div>
        )}
        {!isSaving && !hasError && ( 
          <div className="flex items-center gap-x-2">
            <BsCloudCheck className="size-[20px] text-emerald-500" />
            <div className="text-xs text-emerald-500 font-medium tracking-wide uppercase">
              Changes Saved
            </div>
          </div>
        )}
        <div className="ml-auto flex items-center gap-x-2">
          {/* ── Split Save Button ── */}
          <div className="flex items-center rounded-xl overflow-hidden border border-border shadow-sm">
            {/* Primary action */}
            <button
              disabled={isSaving}
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 h-9 text-sm font-semibold bg-background hover:bg-accent/50 text-foreground disabled:opacity-40 transition-colors border-r border-border"
            >
              {isSaving ? (
                <Loader className="size-3.5 animate-spin" />
              ) : (
                <Cloud className="size-3.5" />
              )}
              Save
            </button>

            {/* Dropdown chevron */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isSaving}
                  className="flex items-center justify-center w-8 h-9 bg-background hover:bg-accent/50 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56 bg-background border-border text-foreground rounded-xl shadow-xl p-1">
                {/* Normal Save */}
                <DropdownMenuItem
                  onClick={onSave}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/60 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <Save className="size-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Save</p>
                    <p className="text-xs text-muted-foreground">Update your current design</p>
                  </div>
                </DropdownMenuItem>

                {/* Save as Template */}
                <DropdownMenuItem
                  onClick={onSaveAsTemplate}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/60 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <LayoutTemplate className="size-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Save as Template</p>
                    <p className="text-xs text-muted-foreground">Reuse this design as a template</p>
                  </div>
                </DropdownMenuItem>

                {/* Save a Copy */}
                <DropdownMenuItem
                  onClick={onSaveACopy}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/60 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <Copy className="size-4 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Save a Copy</p>
                    <p className="text-xs text-muted-foreground">Duplicate as a new design</p>
                  </div>
                </DropdownMenuItem>

                {/* Download JSON */}
                <DropdownMenuItem
                  onClick={() => editor?.saveJson()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/60 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <FileJson className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Download JSON</p>
                    <p className="text-xs text-muted-foreground">Export for later editing</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator orientation="vertical" className="mx-2 h-6 bg-accent" />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="bg-[var(--ci-accent-primary)] hover:bg-[var(--ci-accent-primary)]/90 text-white shadow-[0_0_15px_rgba(71,26,255,0.3)] transition-all px-6">
                Export
                <Download className="size-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-60 bg-background border-border text-foreground">
              <DropdownMenuItem
                className="flex items-center gap-x-2 hover:bg-accent/50 cursor-pointer"
                onClick={() => editor?.saveJson()}
              >
                <CiFileOn className="size-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">JSON</p>
                  <p className="text-xs text-muted-foreground">
                    Save for later editing
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-2 hover:bg-accent/50 cursor-pointer"
                onClick={() => editor?.savePng()}
              >
                <CiFileOn className="size-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">PNG</p>
                  <p className="text-xs text-muted-foreground">
                    Best for sharing on the web
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-2 hover:bg-accent/50 cursor-pointer"
                onClick={() => editor?.saveJpg()}
              >
                <CiFileOn className="size-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">JPG</p>
                  <p className="text-xs text-muted-foreground">
                    Best for printing
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-x-2 hover:bg-accent/50 cursor-pointer"
                onClick={() => editor?.saveSvg()}
              >
                <CiFileOn className="size-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">SVG</p>
                  <p className="text-xs text-muted-foreground">
                    Best for editing in vector software
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};




