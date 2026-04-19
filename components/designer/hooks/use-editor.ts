import { fabric } from "fabric";
import { useCallback, useState, useMemo, useRef, useEffect } from "react";

import { 
  Editor, 
  FILL_COLOR,
  STROKE_WIDTH,
  STROKE_COLOR,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  TRIANGLE_OPTIONS,
  BuildEditorProps, 
  RECTANGLE_OPTIONS,
  EditorHookProps,
  STROKE_DASH_ARRAY,
  TEXT_OPTIONS,
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_SIZE,
  JSON_KEYS,
} from "../types";
import { useHistory } from "./use-history";
import { 
  createFilter, 
  downloadFile, 
  isTextType,
  transformText
} from "../utils";
import { useHotkeys } from "./use-hotkeys";
import { useClipboard } from "./use-clipboard";
import { useAutoResize } from "./use-auto-resize";
import { useCanvasEvents } from "./use-canvas-events";
import { useWindowEvents } from "./use-window-events";
import { useLoadState } from "./use-load-state";
import { initAligningGuidelines } from "./use-alignment-guides";

const buildEditor = ({
  save,
  undo,
  redo,
  canRedo,
  canUndo,
  autoZoom,
  copy,
  paste,
  canvas,
  fillColor,
  fontFamily,
  setFontFamily,
  setFillColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  selectedObjects,
  strokeDashArray,
  setStrokeDashArray,
  zoom,
  setZoom,
}: BuildEditorProps): Editor => {
  const generateSaveOptions = () => {
    const { width, height, left, top } = getWorkspace() as fabric.Rect;

    return {
      name: "Image",
      format: "png",
      quality: 1,
      width,
      height,
      left,
      top,
    };
  };

  const savePng = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "png");
    autoZoom();
  };

  const saveSvg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "svg");
    autoZoom();
  };

  const saveJpg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "jpg");
    autoZoom();
  };

  const saveJson = async () => {
    const data = canvas.toJSON(JSON_KEYS);

    await transformText(data.objects);
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, "\t"),
    )}`;
    downloadFile(fileString, "json");
  };

  const loadJson = (json: string | object) => {
    const data = typeof json === "string" ? JSON.parse(json) : json;

    canvas.loadFromJSON(data, () => {
      // Find the 'clip' object and set it as the canvas clipPath
      const workspace = canvas.getObjects().find((obj) => obj.name === "clip");
      if (workspace) {
        canvas.clipPath = workspace;
      }
      autoZoom();
      setZoom(canvas.getZoom());
    });
  };

    const loadTemplate = async (templateData: any) => {
    canvas.discardActiveObject();

    // If it's a string, try to parse it
    let data = templateData;
    if (typeof templateData === "string") {
      try {
        data = JSON.parse(templateData);
      } catch (e) {
        console.error("Invalid template data", e);
        return;
      }
    }

    // Check if it's the simplified "canvas/elements" format
    if (data.canvas && data.elements) {
      const { width, height, background } = data.canvas;

      // 1. Adjust workspace size and position
      const workspace = getWorkspace();
      if (workspace) {
        workspace.set({ left: 0, top: 0, width, height });
        if (background?.startsWith("#") || background?.startsWith("rgb")) {
          workspace.set({ fill: background });
        }
      }

      // 2. Clear other objects (except workspace)
      canvas.getObjects().forEach((obj) => {
        if (obj.name !== "clip") canvas.remove(obj);
      });

      // 3. Process elements
      let currentTop = 100;
      const margin = 50;

      for (const element of data.elements) {
        if (element.type === "heading" || element.type === "body" || element.type === "cta") {
          const fontSize = parseInt(element.style?.size) || (element.type === "heading" ? 80 : 40);
          const color = element.style?.color || (element.type === "cta" ? "#FF6B00" : "#000000");
          const fontWeight = element.style?.weight || (element.type === "heading" || element.type === "cta" ? "bold" : "normal");
          const fontFamily = element.style?.font || "Inter";

          const text = new fabric.Textbox(element.text, {
            ...TEXT_OPTIONS,
            left: width / 2,
            top: currentTop,
            width: width * 0.8,
            fontSize,
            fill: color,
            fontWeight,
            fontFamily,
            originX: "center",
            textAlign: "center",
          });

          canvas.add(text);
          currentTop += text.height! + margin;
        } else if (element.type === "image") {
          // Add image logic
          fabric.Image.fromURL(element.src, (img) => {
            img.scaleToWidth(width * 0.6);
            img.set({
              left: width / 2,
              top: currentTop,
              originX: "center",
              objectCaching: false,
            });
            img.setCoords();
            canvas.add(img);
            currentTop += img.getScaledHeight() + margin;
            canvas.renderAll();
          }, { crossOrigin: "anonymous" });
        }
      }

      canvas.renderAll();
      autoZoom();
      return;
    }

    // Check if it's the "Schema V2" (Nike format: dimensions/background/layers)
    if (data.dimensions && data.layers) {
      const { width, height } = data.dimensions;

      // 1. Adjust workspace size and position
      const workspace = getWorkspace();
      if (workspace) {
        workspace.set({ 
          left: 0, 
          top: 0, 
          width, 
          height, 
          fill: "#FFFFFF" 
        });
        // Refresh clipping immediately
        workspace.clone((cloned: fabric.Rect) => {
          canvas.clipPath = cloned;
        });
      }

      // 2. Clear other objects (except workspace)
      canvas.getObjects().forEach((obj) => {
        if (obj.name !== "clip") canvas.remove(obj);
      });

      // 3. Process background image (Scale to Cover)
      if (data.background?.src) {
        fabric.Image.fromURL(data.background.src, (img) => {
          if (!img) return;
          const scale = Math.max(width / img.width!, height / img.height!);
          img.set({
            scaleX: scale,
            scaleY: scale,
            selectable: true,
            evented: true,
            name: "background_image",
            originX: "center",
            originY: "center",
            left: width / 2,
            top: height / 2,
            objectCaching: false,
          });
          img.setCoords();
          canvas.add(img);
          img.moveTo(1); // Workspace is at 0, background at 1
          canvas.renderAll();
        }, { crossOrigin: "anonymous" });
      }

      // 4. Process layers
      const layerStartIndex = data.background?.src ? 2 : 1;
      data.layers.forEach((layer: any, index: number) => {
        const left = layer.position?.x ?? 0;
        const top = layer.position?.y ?? 0;

        if (layer.type === "text") {
          const text = new fabric.Textbox(layer.content || "", {
            ...TEXT_OPTIONS,
            left,
            top,
            width: layer.max_width || width - left - 40,
            fontSize: layer.font_size || 40,
            fill: layer.color || "#000000",
            fontWeight: layer.font_weight || "normal",
            fontFamily: layer.font_family || "Inter",
            textAlign: "left",
          });
          canvas.add(text);
          text.moveTo(layerStartIndex + index);
        } else if (layer.type === "shape" && layer.shape_type === "rectangle") {
          const shape = new fabric.Rect({
            left,
            top,
            width: layer.size?.width || 100,
            height: layer.size?.height || 100,
            fill: layer.color || "rgba(0,0,0,0.5)",
          });
          canvas.add(shape);
          shape.moveTo(layerStartIndex + index);
        } else if (layer.type === "image") {
          fabric.Image.fromURL(layer.src, (img) => {
            if (!img) return;
            if (layer.size?.width && layer.size?.width !== "auto") {
              img.scaleToWidth(layer.size.width);
            }
            img.set({ 
              left, 
              top,
              objectCaching: false,
            });
            img.setCoords();
            canvas.add(img);
            img.moveTo(layerStartIndex + index);
            canvas.renderAll();
          }, { crossOrigin: "anonymous" });
        }
      });

      canvas.renderAll();
      setTimeout(autoZoom, 50); // Small delay to ensure all async images are handled or at least started
      return;
    }

    // Fallback to standard Fabric JSON
    canvas.loadFromJSON(data, () => {
      // Find the 'clip' object and set it as the canvas clipPath
      const workspace = canvas.getObjects().find((obj) => obj.name === "clip");
      if (workspace) {
        canvas.clipPath = workspace;
      }
      autoZoom();
      setZoom(canvas.getZoom());
    });
  };

  const getWorkspace = () => {
    return canvas
    .getObjects()
    .find((object) => object.name === "clip");
  };

  const center = (object: fabric.Object) => {
    const workspace = getWorkspace();
    const center = workspace?.getCenterPoint();

    if (!center) return;

    // @ts-ignore
    canvas._centerObject(object, center);
  };

  const addToCanvas = (object: fabric.Object) => {
    center(object);
    canvas.add(object);
    canvas.setActiveObject(object);
  };

  return {
    savePng,
    saveJpg,
    saveSvg,
    saveJson,
    loadJson,
    loadTemplate,
    canUndo,
    canRedo,
    autoZoom,
    zoomIn: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio += 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio > 1 ? 1 : zoomRatio
      );
      setZoom(canvas.getZoom());
    },
    zoomOut: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio -= 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio < 0.2 ? 0.2 : zoomRatio,
      );
      setZoom(canvas.getZoom());
    },
    setZoom: (value: number) => setZoom(value),
    zoom,
    getWorkspace,
    changeSize: (value: { width: number; height: number }) => {
      const workspace = getWorkspace();

      workspace?.set(value);
      autoZoom();
      save();
    },
    changeBackground: (value: string) => {
      const workspace = getWorkspace();
      workspace?.set({ fill: value });
      canvas.renderAll();
      save();
    },
    enableDrawingMode: () => {
      canvas.discardActiveObject();
      canvas.renderAll();
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
    },
    disableDrawingMode: () => {
      canvas.isDrawingMode = false;
    },
    onUndo: () => undo(),
    onRedo: () => redo(),
    onCopy: () => copy(),
    onPaste: () => paste(),
    changeImageFilter: (value: string) => {
      const objects = canvas.getActiveObjects();
      objects.forEach((object) => {
        if (object.type === "image") {
          const imageObject = object as fabric.Image;

          const effect = createFilter(value);

          imageObject.filters = effect ? [effect] : [];
          imageObject.applyFilters();
          canvas.renderAll();
        }
      });
    },
    changeImageAdjustment: (type: string, value: number) => {
      const objects = canvas.getActiveObjects();
      objects.forEach((object) => {
        if (object.type === "image") {
          const imageObject = object as fabric.Image;
          let filter: any;

          switch (type) {
            case "brightness":
              filter = imageObject.filters?.find(f => f instanceof fabric.Image.filters.Brightness);
              if (filter) {
                filter.brightness = value;
              } else {
                imageObject.filters?.push(new fabric.Image.filters.Brightness({ brightness: value }));
              }
              break;
            case "contrast":
              filter = imageObject.filters?.find(f => f instanceof fabric.Image.filters.Contrast);
              if (filter) {
                filter.contrast = value;
              } else {
                imageObject.filters?.push(new fabric.Image.filters.Contrast({ contrast: value }));
              }
              break;
            case "saturation":
              filter = imageObject.filters?.find(f => f instanceof fabric.Image.filters.Saturation);
              if (filter) {
                filter.saturation = value;
              } else {
                imageObject.filters?.push(new fabric.Image.filters.Saturation({ saturation: value }));
              }
              break;
            case "blur":
              filter = imageObject.filters?.find(f => f instanceof fabric.Image.filters.Blur);
              if (filter) {
                filter.blur = value;
              } else {
                imageObject.filters?.push(new fabric.Image.filters.Blur({ blur: value }));
              }
              break;
             case "hue":
              filter = imageObject.filters?.find(f => f instanceof fabric.Image.filters.HueRotation);
              if (filter) {
                filter.rotation = value;
              } else {
                imageObject.filters?.push(new fabric.Image.filters.HueRotation({ rotation: value }));
              }
              break;
             case "gamma":
              filter = imageObject.filters?.find(f => f instanceof (fabric.Image.filters as any).Gamma);
              if (filter) {
                filter.gamma = [value, value, value];
              } else {
                imageObject.filters?.push(new (fabric.Image.filters as any).Gamma({ gamma: [value, value, value] }) as any);
              }
              break;
          }

          imageObject.applyFilters();
          canvas.renderAll();
        }
      });
    },
    getActiveAdjustment: (type: string) => {
      const selectedObject = selectedObjects[0] as fabric.Image;
      if (!selectedObject || selectedObject.type !== "image") return 0;

      const filter = (selectedObject.filters || []).find((f) => {
        switch (type) {
          case "brightness": return f instanceof fabric.Image.filters.Brightness;
          case "contrast": return f instanceof fabric.Image.filters.Contrast;
          case "saturation": return f instanceof fabric.Image.filters.Saturation;
          case "blur": return f instanceof fabric.Image.filters.Blur;
          case "hue": return f instanceof fabric.Image.filters.HueRotation;
          case "gamma": return f instanceof (fabric.Image.filters as any).Gamma;
          default: return false;
        }
      });

      if (!filter) {
        if (type === "brightness" || type === "contrast" || type === "saturation" || type === "blur" || type === "hue" || type === "gamma") {
          return 0;
        }
        return 0;
      }

      const f = filter as any;
      switch (type) {
        case "brightness": return f.brightness ?? 0;
        case "contrast": return f.contrast ?? 0;
        case "saturation": return f.saturation ?? 0;
        case "blur": return f.blur ?? 0;
        case "hue": return f.rotation ?? 0;
        case "gamma": return f.gamma?.[0] ?? 0;
        default: return 0;
      }
    },
    addImage: (value: string) => {
      fabric.Image.fromURL(
        value,
        (image) => {
          const workspace = getWorkspace();

          // Scale to 80% of workspace width, keeping aspect ratio
          const workspaceWidth = workspace?.width || 0;
          const workspaceHeight = workspace?.height || 0;
          
          if (image.width! > workspaceWidth || image.height! > workspaceHeight) {
            const scale = Math.min(
                (workspaceWidth * 0.8) / image.width!, 
                (workspaceHeight * 0.8) / image.height!
            );
            image.set({
                scaleX: scale,
                scaleY: scale,
            });
          }

          image.set({
            objectCaching: false,
          });

          addToCanvas(image);
        },
        {
          crossOrigin: "anonymous",
        },
      );
    },
    getActiveImageSrc: (): string | null => {
      const active = selectedObjects[0];
      if (!active || active.type !== "image") return null;
      const img = active as fabric.Image;
      // Try to export the current object as a data URL (works for any source)
      try {
        const dataUrl = img.toDataURL({ format: "png", quality: 1 });
        return dataUrl;
      } catch {
        // Fallback: return the src of the underlying img element
        // @ts-ignore
        return img._originalElement?.currentSrc || img.getSrc?.() || null;
      }
    },
    replaceActiveImage: (value: string) => {
      const activeObject = selectedObjects[0];
      if (!activeObject || activeObject.type !== "image") return;
      const oldImg = activeObject as fabric.Image;

      // Store current position/scale/angle so the replacement looks seamless
      const props = {
        left: oldImg.left,
        top: oldImg.top,
        scaleX: oldImg.scaleX,
        scaleY: oldImg.scaleY,
        angle: oldImg.angle,
        flipX: oldImg.flipX,
        flipY: oldImg.flipY,
        opacity: oldImg.opacity,
        objectCaching: false,
        // preserve z-index
        _idx: canvas.getObjects().indexOf(oldImg),
      };

      fabric.Image.fromURL(
        value,
        (newImg) => {
          newImg.set({
            left: props.left,
            top: props.top,
            scaleX: props.scaleX,
            scaleY: props.scaleY,
            angle: props.angle,
            flipX: props.flipX,
            flipY: props.flipY,
            opacity: props.opacity,
            objectCaching: false,
          });
          newImg.setCoords();

          // Remove old, insert new at same z-index
          canvas.remove(oldImg);
          canvas.add(newImg);
          if (props._idx >= 0) {
            newImg.moveTo(props._idx);
          }
          canvas.setActiveObject(newImg);
          canvas.renderAll();
          save();
        },
        { crossOrigin: "anonymous" }
      );
    },
    delete: () => {
      canvas.getActiveObjects().forEach((object) => canvas.remove(object));
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    addText: (value, options) => {
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        ...options,
      });

      addToCanvas(object);
    },
    getActiveOpacity: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 1;
      }

      const value = selectedObject.get("opacity") || 1;

      return value;
    },
    changeFontSize: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontSize exists.
          object.set({ fontSize: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_SIZE;
      }

      // @ts-ignore
      // Faulty TS library, fontSize exists.
      const value = selectedObject.get("fontSize") || FONT_SIZE;

      return value;
    },
    changeTextAlign: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, textAlign exists.
          object.set({ textAlign: value });
        }
      });
      canvas.renderAll();
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "left";
      }

      // @ts-ignore
      // Faulty TS library, textAlign exists.
      const value = selectedObject.get("textAlign") || "left";

      return value;
    },
    changeFontUnderline: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, underline exists.
          object.set({ underline: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      // Faulty TS library, underline exists.
      const value = selectedObject.get("underline") || false;

      return value;
    },
    changeFontLinethrough: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, linethrough exists.
          object.set({ linethrough: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      // Faulty TS library, linethrough exists.
      const value = selectedObject.get("linethrough") || false;

      return value;
    },
    changeFontStyle: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontStyle exists.
          object.set({ fontStyle: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "normal";
      }

      // @ts-ignore
      // Faulty TS library, fontStyle exists.
      const value = selectedObject.get("fontStyle") || "normal";

      return value;
    },
    changeFontWeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontWeight exists.
          object.set({ fontWeight: value });
        }
      });
      canvas.renderAll();
    },
    changeOpacity: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ opacity: value });
      });
      canvas.renderAll();
    },
    bringForward: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.bringForward(object);
      });
      canvas.renderAll();
    },
    sendBackwards: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.sendBackwards(object);
      });

      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    bringToFront: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.bringToFront(object);
      });
      canvas.renderAll();
    },
    sendToBack: () => {
      canvas.getActiveObjects().forEach((object) => {
        canvas.sendToBack(object);
      });
      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    changeFontFamily: (value: string) => {
      setFontFamily(value);
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          // Faulty TS library, fontFamily exists.
          object.set({ fontFamily: value });
        }
      });
      canvas.renderAll();
    },
    changeFillColor: (value: string) => {
      setFillColor(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: value });
      });
      canvas.renderAll();
    },
    changeStrokeColor: (value: string) => {
      setStrokeColor(value);
      canvas.getActiveObjects().forEach((object) => {
        // Text types don't have stroke
        if (isTextType(object.type)) {
          object.set({ fill: value });
          return;
        }

        object.set({ stroke: value });
      });
      canvas.freeDrawingBrush.color = value;
      canvas.renderAll();
    },
    changeStrokeWidth: (value: number) => {
      setStrokeWidth(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: value });
      });
      canvas.freeDrawingBrush.width = value;
      canvas.renderAll();
    },
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeDashArray: value });
      });
      canvas.renderAll();
    },
    addCircle: () => {
      const object = new fabric.Circle({
        ...CIRCLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addSoftRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 50,
        ry: 50,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addTriangle: () => {
      const object = new fabric.Triangle({
        ...TRIANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addInverseTriangle: () => {
      const HEIGHT = TRIANGLE_OPTIONS.height;
      const WIDTH = TRIANGLE_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: 0, y: 0 },
          { x: WIDTH, y: 0 },
          { x: WIDTH / 2, y: HEIGHT },
        ],
        {
          ...TRIANGLE_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );

      addToCanvas(object);
    },
    addDiamond: () => {
      const HEIGHT = DIAMOND_OPTIONS.height;
      const WIDTH = DIAMOND_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: WIDTH / 2, y: 0 },
          { x: WIDTH, y: HEIGHT / 2 },
          { x: WIDTH / 2, y: HEIGHT },
          { x: 0, y: HEIGHT / 2 },
        ],
        {
          ...DIAMOND_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );
      addToCanvas(object);
    },
    getObjects: () => {
      return canvas.getObjects().filter((obj) => obj.name !== "clip");
    },
    group: () => {
      const activeSelection = canvas.getActiveObject() as fabric.ActiveSelection;
      if (!activeSelection || activeSelection.type !== "activeSelection") {
        return;
      }

      activeSelection.toGroup();
      canvas.requestRenderAll();
      save();
    },
    ungroup: () => {
      const activeObject = canvas.getActiveObject() as fabric.Group;
      if (!activeObject || activeObject.type !== "group") {
        return;
      }

      activeObject.toActiveSelection();
      canvas.requestRenderAll();
      save();
    },
    align: (direction: string) => {
      const workspace = getWorkspace();
      const activeObjects = canvas.getActiveObjects();

      if (!workspace || activeObjects.length === 0) return;

      activeObjects.forEach((obj) => {
        switch (direction) {
          case "left":
            obj.set({ left: workspace.left });
            break;
          case "right":
            obj.set({ left: (workspace.left || 0) + (workspace.width || 0) - (obj.getScaledWidth() || 0) });
            break;
          case "center":
            obj.set({ left: (workspace.left || 0) + (workspace.width || 0) / 2 - (obj.getScaledWidth() || 0) / 2 });
            break;
          case "top":
            obj.set({ top: workspace.top });
            break;
          case "bottom":
            obj.set({ top: (workspace.top || 0) + (workspace.height || 0) - (obj.getScaledHeight() || 0) });
            break;
          case "middle":
            obj.set({ top: (workspace.top || 0) + (workspace.height || 0) / 2 - (obj.getScaledHeight() || 0) / 2 });
            break;
        }
        obj.setCoords();
      });

      canvas.renderAll();
      save();
    },
    changeLineHeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ lineHeight: value });
        }
      });
      canvas.renderAll();
    },
    getActiveLineHeight: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return 1.16;
      // @ts-ignore
      return selectedObject.get("lineHeight") || 1.16;
    },
    changeCharSpacing: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ charSpacing: value });
        }
      });
      canvas.renderAll();
    },
    getActiveCharSpacing: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return 0;
      // @ts-ignore
      return selectedObject.get("charSpacing") || 0;
    },
    canvas,
    getActiveFontWeight: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_WEIGHT;
      }

      // @ts-ignore
      // Faulty TS library, fontWeight exists.
      const value = selectedObject.get("fontWeight") || FONT_WEIGHT;

      return value;
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fontFamily;
      }

      // @ts-ignore
      // Faulty TS library, fontFamily exists.
      const value = selectedObject.get("fontFamily") || fontFamily;

      return value;
    },
    getActiveFillColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fillColor;
      }

      const value = selectedObject.get("fill") || fillColor;

      // Currently, gradients & patterns are not supported
      return value as string;
    },
    getActiveStrokeColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeColor;
      }

      const value = selectedObject.get("stroke") || strokeColor;

      return value;
    },
    getActiveStrokeWidth: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeWidth;
      }

      const value = selectedObject.get("strokeWidth") || strokeWidth;

      return value;
    },
    getActiveStrokeDashArray: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeDashArray;
      }

      const value = selectedObject.get("strokeDashArray") || strokeDashArray;

      return value;
    },
    changeAngle: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ angle: value });
        object.setCoords();
      });
      canvas.renderAll();
      save();
    },
    getActiveAngle: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return 0;
      return selectedObject.get("angle") || 0;
    },
    flipX: () => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ flipX: !object.flipX });
      });
      canvas.renderAll();
      save();
    },
    flipY: () => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ flipY: !object.flipY });
      });
      canvas.renderAll();
      save();
    },
    getActiveFlipX: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return false;
      return selectedObject.get("flipX") || false;
    },
    getActiveFlipY: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return false;
      return selectedObject.get("flipY") || false;
    },
    changeBlendMode: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ globalCompositeOperation: value });
      });
      canvas.renderAll();
      save();
    },
    getActiveBlendMode: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return "source-over";
      return selectedObject.get("globalCompositeOperation") as string || "source-over";
    },
    changeCornerRadius: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "rect") {
          object.set({ rx: value, ry: value } as any);
        }
      });
      canvas.renderAll();
      save();
    },
    getActiveCornerRadius: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject || selectedObject.type !== "rect") return 0;
      // @ts-ignore
      return selectedObject.get("rx") || 0;
    },
    changeVisibility: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ visible: value });
      });
      canvas.renderAll();
      save();
    },
    getActiveVisibility: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return true;
      return selectedObject.get("visible") ?? true;
    },
    changeObjectPosition: (value: { left?: number; top?: number }) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set(value);
        object.setCoords();
      });
      canvas.renderAll();
      save();
    },
    getActiveObjectPosition: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return { left: 0, top: 0 };
      return { 
        left: Math.round(selectedObject.get("left") || 0), 
        top: Math.round(selectedObject.get("top") || 0) 
      };
    },
    changeObjectSize: (value: { width?: number; height?: number }) => {
      canvas.getActiveObjects().forEach((object) => {
        if (object.type === "image") {
            const img = object as fabric.Image;
            if (value.width) {
                img.scaleToWidth(value.width);
            }
            if (value.height) {
                img.scaleToHeight(value.height);
            }
        } else {
            object.set(value);
        }
        object.setCoords();
      });
      canvas.renderAll();
      save();
    },
    getActiveObjectSize: () => {
      const selectedObject = selectedObjects[0];
      if (!selectedObject) return { width: 0, height: 0 };
      return { 
        width: Math.round(selectedObject.getScaledWidth() || 0), 
        height: Math.round(selectedObject.getScaledHeight() || 0) 
      };
    },
    selectedObjects,
  };
};

export const useEditor = ({
  defaultState,
  defaultHeight,
  defaultWidth,
  clearSelectionCallback,
  saveCallback,
}: EditorHookProps) => {
  const initialState = useRef(defaultState);
  const initialWidth = useRef(defaultWidth);
  const initialHeight = useRef(defaultHeight);

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
  const [fillColor, setFillColor] = useState(FILL_COLOR);
  const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
  const [strokeDashArray, setStrokeDashArray] = useState<number[]>(STROKE_DASH_ARRAY);
  const [zoom, setZoom] = useState(1);

  useWindowEvents();

  const { 
    save, 
    canRedo, 
    canUndo, 
    undo, 
    redo,
    canvasHistory,
    setHistoryIndex,
  } = useHistory({ 
    canvas,
    saveCallback,
    defaultHeight,
    defaultWidth,
  });

  const { copy, paste } = useClipboard({ canvas });

  const { autoZoom } = useAutoResize({
    canvas,
    container,
    setZoom,
  });

  useCanvasEvents({
    save,
    canvas,
    setSelectedObjects,
    clearSelectionCallback,
  });

  useHotkeys({
    undo,
    redo,
    copy,
    paste,
    save,
    canvas,
  });

  useLoadState({
    canvas,
    autoZoom,
    initialState,
    canvasHistory,
    setHistoryIndex,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        save,
        undo,
        redo,
        canUndo,
        canRedo,
        autoZoom,
        copy,
        paste,
        canvas,
        fillColor,
        strokeWidth,
        strokeColor,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        strokeDashArray,
        selectedObjects,
        setStrokeDashArray,
        fontFamily,
        setFontFamily,
        zoom,
        setZoom,
      });
    }

    return undefined;
  }, 
  [
    canRedo,
    canUndo,
    undo,
    redo,
    save,
    autoZoom,
    copy,
    paste,
    canvas,
    fillColor,
    strokeWidth,
    strokeColor,
    selectedObjects,
    strokeDashArray,
    fontFamily,
    zoom,
  ]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3b82f6",
      });

      const initialWorkspace = new fabric.Rect({
        width: initialWidth.current,
        height: initialHeight.current,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        evented: false,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.5)",
          blur: 15,
        }),
      });

      initialCanvas.setWidth(initialContainer.offsetWidth);
      initialCanvas.setHeight(initialContainer.offsetHeight);

      initialCanvas.add(initialWorkspace);
      initialCanvas.centerObject(initialWorkspace);
      initialCanvas.clipPath = initialWorkspace;

      initAligningGuidelines(initialCanvas);

      setCanvas(initialCanvas);
      setContainer(initialContainer);

      const currentState = JSON.stringify(
        initialCanvas.toJSON(JSON_KEYS)
      );
      canvasHistory.current = [currentState];
      setHistoryIndex(0);
    },
    [
      canvasHistory, 
      setHistoryIndex, 
    ]
  );

  return { init, editor };
};
