"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Pencil, 
  AlignHorizontalJustifyStart, 
  AlignHorizontalJustifyCenter, 
  AlignHorizontalJustifyEnd, 
  AlignVerticalJustifyStart, 
  AlignVerticalJustifyCenter, 
  AlignVerticalJustifyEnd,
  FlipHorizontal,
  FlipVertical,
  Eye,
  EyeOff,
  ChevronRight,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Trash,
  Copy,
  Layers,
  Settings2,
  Type,
  Sparkles,
} from "lucide-react";

import { ActiveTool, Editor, fonts } from "./types";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

// Sub-panels
import { FillColorSidebar } from "./fill-color-sidebar";
import { StrokeColorSidebar } from "./stroke-color-sidebar";
import { StrokeWidthSidebar } from "./stroke-width-sidebar";
import { FontSidebar } from "./font-sidebar";
import { FilterSidebar } from "./filter-sidebar";
import { AdjustSidebar } from "./adjust-sidebar";
import { SettingsSidebar } from "./settings-sidebar";
import { RemoveBgSidebar } from "./remove-bg-sidebar";

interface InspectorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const InspectorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: InspectorSidebarProps) => {
  const selectedObject = editor?.selectedObjects[0];
  
  const [angle, setAngle] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [blendMode, setBlendMode] = useState("source-over");
  const [cornerRadius, setCornerRadius] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [showTransform, setShowTransform] = useState(false);
  const [showTypography, setShowTypography] = useState(true);
  const [showArrange, setShowArrange] = useState(false);

  const [fontWeight, setFontWeight] = useState(400);
  const [fontStyle, setFontStyle] = useState("normal");
  const [fontUnderline, setFontUnderline] = useState(false);
  const [fontLinethrough, setFontLinethrough] = useState(false);
  const [textAlign, setTextAlign] = useState("left");
  const [fontSize, setFontSize] = useState(32);
  const [lineHeight, setLineHeight] = useState(1.16);
  const [charSpacing, setCharSpacing] = useState(0);

  useEffect(() => {
    if (selectedObject) {
      setAngle(editor?.getActiveAngle() || 0);
      setOpacity(editor?.getActiveOpacity() || 1);
      setBlendMode(editor?.getActiveBlendMode() || "source-over");
      setCornerRadius(editor?.getActiveCornerRadius() || 0);
      setIsVisible(editor?.getActiveVisibility() ?? true);
      setPosition(editor?.getActiveObjectPosition() || { left: 0, top: 0 });
      setSize(editor?.getActiveObjectSize() || { width: 0, height: 0 });

      if (selectedObject.type === "textbox" || selectedObject.type === "text") {
        setFontWeight(editor?.getActiveFontWeight() || 400);
        setFontStyle(editor?.getActiveFontStyle() || "normal");
        setFontUnderline(editor?.getActiveFontUnderline() || false);
        setFontLinethrough(editor?.getActiveFontLinethrough() || false);
        setTextAlign(editor?.getActiveTextAlign() || "left");
        setFontSize(editor?.getActiveFontSize() || 32);
        setLineHeight(editor?.getActiveLineHeight() || 1.16);
        setCharSpacing(editor?.getActiveCharSpacing() || 0);
      }
    }
  }, [selectedObject, editor]);

  // Handle Drilling down to sub-panels
  const isDetailTool = [
    "fill", 
    "stroke-color", 
    "stroke-width", 
    "filter", 
    "adjust", 
    "settings", 
    "opacity",
    "remove-bg",
  ].includes(activeTool);

  if (isDetailTool) {
    return (
      <aside className="w-[300px] border-l border-border bg-background shrink-0 h-full flex flex-col z-[45]">
        {activeTool === "fill" && (
           <FillColorSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
        )}
        {activeTool === "stroke-color" && (
           <StrokeColorSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
        )}
        {activeTool === "stroke-width" && (
           <StrokeWidthSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
        )}
        {activeTool === "font" && (
           <FontSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
        )}
        {activeTool === "filter" && (
           <FilterSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
        )}
        {activeTool === "adjust" && (
           <AdjustSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
        )}
        {activeTool === "settings" && (
           <SettingsSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
        )}
        {activeTool === "remove-bg" && (
           <RemoveBgSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
        )}
      </aside>
    );
  }

  if (!selectedObject) {
    return (
      <aside className="w-[300px] border-l border-border bg-background shrink-0 h-full min-h-0 flex flex-col z-[45]">
        <div className="p-4 border-b border-border">
          <span className="font-bold text-sm">Canvas Properties</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            <Button 
                variant="outline" 
                className="w-full justify-between h-10 bg-secondary/30 border-border text-xs"
                onClick={() => onChangeActiveTool("settings")}
            >
                <div className="flex items-center gap-x-2">
                    <Maximize2 className="size-4" />
                    <span>Page Settings</span>
                </div>
                <div className="flex items-center gap-x-2">
                    <span className="text-muted-foreground">{editor?.getWorkspace()?.width} x {editor?.getWorkspace()?.height}</span>
                    <ChevronRight className="size-4 opacity-50" />
                </div>
            </Button>
            <Separator className="bg-border" />
            <div className="text-center p-8 text-muted-foreground">
               <p className="text-xs">Select an element to edit its properties</p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const onAngleChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setAngle(numValue);
    editor?.changeAngle(numValue);
  };

  const onOpacityChange = (value: number[]) => {
    const val = value[0];
    setOpacity(val);
    editor?.changeOpacity(val);
  };

  const onBlendModeChange = (value: string) => {
    setBlendMode(value);
    editor?.changeBlendMode(value);
  };

  const onCornerRadiusChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setCornerRadius(numValue);
    editor?.changeCornerRadius(numValue);
  };

  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    editor?.changeVisibility(newValue);
  };

  const onPositionChange = (key: "left" | "top", value: string) => {
    const numValue = parseInt(value) || 0;
    const newPos = { ...position, [key]: numValue };
    setPosition(newPos);
    editor?.changeObjectPosition(newPos);
  };

  const onSizeChange = (key: "width" | "height", value: string) => {
    const numValue = parseInt(value) || 0;
    const newSize = { ...size, [key]: numValue };
    setSize(newSize);
    editor?.changeObjectSize(newSize);
  };

  const onBoldToggle = () => {
    const newValue = fontWeight > 500 ? 400 : 700;
    setFontWeight(newValue);
    editor?.changeFontWeight(newValue);
  };

  const onItalicToggle = () => {
    const newValue = fontStyle === "italic" ? "normal" : "italic";
    setFontStyle(newValue);
    editor?.changeFontStyle(newValue);
  };

  const onUnderlineToggle = () => {
    const newValue = !fontUnderline;
    setFontUnderline(newValue);
    editor?.changeFontUnderline(newValue);
  };

  const onLinethroughToggle = () => {
    const newValue = !fontLinethrough;
    setFontLinethrough(newValue);
    editor?.changeFontLinethrough(newValue);
  };

  const onTextAlignChange = (value: string) => {
    setTextAlign(value);
    editor?.changeTextAlign(value);
  };

  const onFontSizeChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    setFontSize(numValue);
    editor?.changeFontSize(numValue);
  };

  const onLineHeightChange = (values: number[]) => {
    const value = values[0];
    setLineHeight(value);
    editor?.changeLineHeight(value);
  };

  const onCharSpacingChange = (values: number[]) => {
    const value = values[0];
    setCharSpacing(value);
    editor?.changeCharSpacing(value);
  };

  const objectName = selectedObject.name || selectedObject.type || "Element";

  return (
    <aside className="w-[300px] border-l border-border bg-background shrink-0 h-full min-h-0 flex flex-col z-[45]">
      <Tabs defaultValue="design" className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <span className="font-bold text-sm truncate max-w-[150px] capitalize">{objectName}</span>
              <Button variant="ghost" size="icon" className="size-6 text-muted-foreground">
                <Pencil className="size-3" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => onChangeActiveTool("select")}>
              <X className="size-4" />
            </Button>
          </div>
          
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 h-9 p-1">
            <TabsTrigger value="design" className="text-xs data-[state=active]:bg-background">Design</TabsTrigger>
            <TabsTrigger value="placeholder" className="text-xs data-[state=active]:bg-background">Placeholder</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <TabsContent value="design" className="m-0 focus-visible:outline-none">
            <div className="p-4 space-y-6 pb-20">
          {/* Layer Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Layer</h3>
            
            {/* Alignment Grid */}
            <div className="grid grid-cols-6 gap-1">
              <Button variant="outline" size="icon" className="size-9 bg-secondary/30 border-border" onClick={() => editor?.align("left")}>
                <AlignHorizontalJustifyStart className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-9 bg-secondary/30 border-border" onClick={() => editor?.align("center")}>
                <AlignHorizontalJustifyCenter className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-9 bg-secondary/30 border-border" onClick={() => editor?.align("right")}>
                <AlignHorizontalJustifyEnd className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-9 bg-secondary/30 border-border" onClick={() => editor?.align("top")}>
                <AlignVerticalJustifyStart className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-9 bg-secondary/30 border-border" onClick={() => editor?.align("middle")}>
                <AlignVerticalJustifyCenter className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="size-9 bg-secondary/30 border-border" onClick={() => editor?.align("bottom")}>
                <AlignVerticalJustifyEnd className="size-4" />
              </Button>
            </div>

            {/* Rotate & Flip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Rotate & Flip</span>
                <div className="flex items-center gap-x-2">
                  <div className="relative">
                    <Input 
                      className="h-9 w-16 bg-secondary/30 border-border pr-5 text-right text-xs" 
                      value={angle}
                      onChange={(e) => onAngleChange(e.target.value)}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-50">°</span>
                  </div>
                  <Button variant="outline" size="icon" className={cn("size-9 bg-secondary/30 border-border", editor?.getActiveFlipX() && "bg-accent")} onClick={() => editor?.flipX()}>
                    <FlipHorizontal className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon" className={cn("size-9 bg-secondary/30 border-border", editor?.getActiveFlipY() && "bg-accent")} onClick={() => editor?.flipY()}>
                    <FlipVertical className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Opacity</span>
                <div className="relative">
                  <Input 
                    className="h-8 w-16 bg-secondary/30 border-border pr-2 text-right text-xs" 
                    value={Math.round(opacity * 100)}
                    readOnly
                  />
                </div>
              </div>
              <Slider 
                value={[opacity]}
                max={1}
                step={0.01}
                min={0}
                onValueChange={onOpacityChange}
                className="py-2"
              />
            </div>

            {/* Blend Mode */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Blend Mode</span>
                <Select value={blendMode} onValueChange={onBlendModeChange}>
                  <SelectTrigger className="h-9 w-32 bg-secondary/30 border-border text-xs">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="source-over">Normal</SelectItem>
                    <SelectItem value="multiply">Multiply</SelectItem>
                    <SelectItem value="screen">Screen</SelectItem>
                    <SelectItem value="overlay">Overlay</SelectItem>
                    <SelectItem value="darken">Darken</SelectItem>
                    <SelectItem value="lighten">Lighten</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transform */}
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-between h-9 px-0 hover:bg-transparent group"
                onClick={() => setShowTransform(!showTransform)}
              >
                <span className="text-xs font-medium">Transform</span>
                <div className="flex items-center gap-x-2 text-muted-foreground group-hover:text-foreground">
                  <span className="text-[10px]">Position & Size</span>
                  <ChevronRight className={cn("size-4 transition-transform", showTransform && "rotate-90")} />
                </div>
              </Button>
              
              {showTransform && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">X Position</label>
                      <Input 
                        className="h-8 bg-secondary/30 border-border text-xs" 
                        value={position.left}
                        onChange={(e) => onPositionChange("left", e.target.value)}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">Y Position</label>
                      <Input 
                        className="h-8 bg-secondary/30 border-border text-xs" 
                        value={position.top}
                        onChange={(e) => onPositionChange("top", e.target.value)}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">Width</label>
                      <Input 
                        className="h-8 bg-secondary/30 border-border text-xs" 
                        value={size.width}
                        onChange={(e) => onSizeChange("width", e.target.value)}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">Height</label>
                      <Input 
                        className="h-8 bg-secondary/30 border-border text-xs" 
                        value={size.height}
                        onChange={(e) => onSizeChange("height", e.target.value)}
                      />
                   </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Shape Section */}
          {(selectedObject.type === "rect" || selectedObject.type === "circle") && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Shape</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Shape</span>
                  <Button variant="outline" className="h-9 w-32 justify-between bg-secondary/30 border-border text-xs px-3 font-normal">
                    <span className="capitalize">{selectedObject.type}</span>
                    <ChevronRight className="size-4 opacity-50" />
                  </Button>
                </div>
              </div>

              {selectedObject.type === "rect" && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                    <span>Round Corners</span>
                    <Input 
                        className="h-9 w-16 bg-secondary/30 border-border text-right text-xs" 
                        value={cornerRadius}
                        onChange={(e) => onCornerRadiusChange(e.target.value)}
                    />
                    </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Vector</span>
                  <Button variant="outline" className="h-9 w-32 justify-center bg-secondary/30 border-border text-xs font-normal">
                    Edit Path
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Typography Section (Extended) */}
          {(selectedObject.type === "textbox" || selectedObject.type === "text") && (
             <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Typography</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground font-medium">Font Family</label>
                    <Select 
                      value={editor?.getActiveFontFamily()} 
                      onValueChange={(value) => editor?.changeFontFamily(value)}
                    >
                      <SelectTrigger className="h-9 bg-secondary/30 border-border text-xs px-3">
                        <div className="flex items-center gap-x-2 truncate">
                          <Type className="size-4 opacity-50 shrink-0" />
                          <SelectValue placeholder="Select font" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border max-h-[300px]">
                        {fonts.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium">Size</label>
                        <div className="flex items-center gap-x-2">
                            <Input 
                                className="h-9 bg-secondary/30 border-border text-xs w-full" 
                                value={fontSize}
                                onChange={(e) => onFontSizeChange(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium">Style</label>
                        <div className="flex items-center gap-x-1">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className={cn("size-9 bg-secondary/30 border-border", fontWeight > 500 && "bg-accent text-accent-foreground")}
                                onClick={onBoldToggle}
                            >
                                <Bold className="size-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className={cn("size-9 bg-secondary/30 border-border", fontStyle === "italic" && "bg-accent text-accent-foreground")}
                                onClick={onItalicToggle}
                            >
                                <Italic className="size-4" />
                            </Button>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium">Decoration</label>
                        <div className="flex items-center gap-x-1">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className={cn("size-9 bg-secondary/30 border-border", fontUnderline && "bg-accent text-accent-foreground")}
                                onClick={onUnderlineToggle}
                            >
                                <Underline className="size-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className={cn("size-9 bg-secondary/30 border-border", fontLinethrough && "bg-accent text-accent-foreground")}
                                onClick={onLinethroughToggle}
                            >
                                <Strikethrough className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground font-medium">Alignment</label>
                        <div className="flex items-center gap-x-1">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className={cn("size-9 bg-secondary/30 border-border", textAlign === "left" && "bg-accent text-accent-foreground")}
                                onClick={() => onTextAlignChange("left")}
                            >
                                <AlignLeft className="size-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className={cn("size-9 bg-secondary/30 border-border", textAlign === "center" && "bg-accent text-accent-foreground")}
                                onClick={() => onTextAlignChange("center")}
                            >
                                <AlignCenter className="size-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className={cn("size-9 bg-secondary/30 border-border", textAlign === "right" && "bg-accent text-accent-foreground")}
                                onClick={() => onTextAlignChange("right")}
                            >
                                <AlignRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                        <span>Line Height</span>
                        <span>{lineHeight.toFixed(2)}</span>
                    </div>
                    <Slider 
                        value={[lineHeight]}
                        max={3}
                        min={0.5}
                        step={0.01}
                        onValueChange={onLineHeightChange}
                        className="py-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                        <span>Character Spacing</span>
                        <span>{Math.round(charSpacing)}</span>
                    </div>
                    <Slider 
                        value={[charSpacing]}
                        max={1000}
                        min={-100}
                        step={1}
                        onValueChange={onCharSpacingChange}
                        className="py-2"
                    />
                  </div>
                </div>
             </div>
          )}

          <Separator className="bg-border" />

          {/* Fill Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Fill</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-4">
                <Button 
                  variant="outline" 
                   className="h-10 px-3 bg-secondary/30 border-border text-xs font-normal gap-x-3 min-w-[140px] justify-start"
                  onClick={() => onChangeActiveTool("fill")}
                >
                  <div className="size-4 rounded-sm border border-border" style={{ backgroundColor: editor?.getActiveFillColor() }} />
                  <span>{selectedObject.type === "image" ? "Image" : "Color"}</span>
                  <ChevronRight className="size-3 opacity-50 ml-auto" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="size-9" onClick={toggleVisibility}>
                {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </Button>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Stroke Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Stroke</h3>
            <div className="flex items-center justify-between">
               <Button 
                  variant="outline" 
                  className="h-10 px-3 bg-secondary/30 border-border text-xs font-normal gap-x-3 min-w-[140px] justify-start"
                  onClick={() => onChangeActiveTool("stroke-color")}
                >
                  <div className="size-4 rounded-sm border-2" style={{ borderColor: editor?.getActiveStrokeColor(), backgroundColor: "transparent" }} />
                  <span className="uppercase">{editor?.getActiveStrokeColor()}</span>
                  <ChevronRight className="size-3 opacity-50 ml-auto" />
                </Button>
                <div className="flex items-center gap-x-1">
                    <Button variant="ghost" size="icon" className="size-9" onClick={() => onChangeActiveTool("stroke-width")}>
                        <AlignLeft className="size-4 rotate-90" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-9">
                        <Eye className="size-4" />
                    </Button>
                </div>
            </div>
          </div>

           {/* Filters & Adjust Section (For Images) */}
           {selectedObject.type === "image" && (
             <>
               <Separator className="bg-border" />
               <div className="space-y-4">
                 <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Effects</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <Button 
                        variant="outline" 
                        className="h-20 flex-col bg-secondary/30 border-border text-xs gap-y-2"
                        onClick={() => onChangeActiveTool("filter")}
                    >
                        <span>Filters</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="h-20 flex-col bg-secondary/30 border-border text-xs gap-y-2"
                        onClick={() => onChangeActiveTool("adjust")}
                    >
                        <span>Adjust</span>
                    </Button>
                 </div>
                 {/* Magic Remove BG — Canva-style */}
                 <Button
                   variant="outline"
                   className="w-full h-10 gap-x-2 text-xs font-semibold bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-500/50 text-purple-400 hover:text-purple-300"
                   onClick={() => onChangeActiveTool("remove-bg")}
                 >
                   <Sparkles className="size-4" />
                   Magic Remove Background
                 </Button>
               </div>
             </>
           )}
          {/* Actions Section */}
          <Separator className="bg-border" />
          <div className="space-y-4">
             <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Arrange</h3>
             <div className="grid grid-cols-2 gap-2">
                <Button 
                    variant="outline" 
                    className="h-9 bg-secondary/30 border-border text-xs gap-x-2"
                    onClick={() => editor?.bringForward()}
                >
                    <ArrowUp className="size-3" />
                    <span>Bring Forward</span>
                </Button>
                <Button 
                    variant="outline" 
                    className="h-9 bg-secondary/30 border-border text-xs gap-x-2"
                    onClick={() => editor?.sendBackwards()}
                >
                    <ArrowDown className="size-3" />
                    <span>Send Backwards</span>
                </Button>
                <Button 
                    variant="outline" 
                    className="h-9 bg-secondary/30 border-border text-xs gap-x-2"
                    onClick={() => editor?.bringToFront()}
                >
                    <ChevronUp className="size-3" />
                    <span>To Front</span>
                </Button>
                <Button 
                    variant="outline" 
                    className="h-9 bg-secondary/30 border-border text-xs gap-x-2"
                    onClick={() => editor?.sendToBack()}
                >
                    <ChevronDown className="size-3" />
                    <span>To Back</span>
                </Button>
             </div>
          </div>

          <Separator className="bg-border" />
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
                <Button 
                    variant="outline" 
                    className="h-9 bg-secondary/30 border-border text-xs gap-x-2"
                    onClick={() => {
                        editor?.onCopy();
                        editor?.onPaste();
                    }}
                >
                    <Copy className="size-3" />
                    <span>Duplicate</span>
                </Button>
                <Button 
                    variant="outline" 
                    className="h-9 bg-secondary/30 border-border text-xs gap-x-2 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/50"
                    onClick={() => editor?.delete()}
                >
                    <Trash className="size-3" />
                    <span>Delete</span>
                </Button>
            </div>
          </div>
            </div>
          </TabsContent>
          <TabsContent value="placeholder" className="m-0">
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-xs italic">Placeholder settings appear here</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
};
