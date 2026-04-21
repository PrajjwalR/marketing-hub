import { fabric } from "fabric";
import { useCallback, useRef, useState } from "react";

import { JSON_KEYS } from "../types";

interface UseHistoryProps {
  canvas: fabric.Canvas | null;
  defaultHeight?: number;
  defaultWidth?: number;
  saveCallback?: (values: {
    json: any;
    height: number;
    width: number;
  }) => void;
};

export const useHistory = ({ canvas, saveCallback, defaultHeight, defaultWidth }: UseHistoryProps) => {
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasHistory = useRef<string[]>([]);
  const skipSave = useRef(false);

  const canUndo = useCallback(() => {
    return historyIndex > 0;
  }, [historyIndex]);

  const canRedo = useCallback(() => {
    return historyIndex < canvasHistory.current.length - 1;
  }, [historyIndex]);

  const save = useCallback((skip = false) => {
    if (!canvas) return;

    const currentState = canvas.toJSON(JSON_KEYS);
    const json = JSON.stringify(currentState);

    if (!skip && !skipSave.current) {
      canvasHistory.current.push(json);
      setHistoryIndex(canvasHistory.current.length - 1);
    }

    const workspace = canvas
      .getObjects()
      .find((object) => object.name === "clip");
    const height = workspace?.height || defaultHeight || 0;
    const width = workspace?.width || defaultWidth || 0;

    saveCallback?.({ json: currentState, height, width });
  }, 
  [
    canvas,
    saveCallback,
    defaultHeight,
    defaultWidth,
  ]);

  const undo = useCallback(() => {
    if (canUndo()) {
      skipSave.current = true;
      canvas?.clear().renderAll();

      const previousIndex = historyIndex - 1;
      const previousState = JSON.parse(
        canvasHistory.current[previousIndex]
      );

      canvas?.loadFromJSON(previousState, () => {
        // Find the 'clip' object and set it as the canvas clipPath
        const workspace = canvas?.getObjects().find((obj) => obj.name === "clip");
        if (workspace && canvas) {
          canvas.clipPath = workspace;
        }
        canvas?.renderAll();
        setHistoryIndex(previousIndex);
        skipSave.current = false;
      });
    }
  }, [canUndo, canvas, historyIndex]);

  const redo = useCallback(() => {
    if (canRedo()) {
      skipSave.current = true;
      canvas?.clear().renderAll();

      const nextIndex = historyIndex + 1;
      const nextState = JSON.parse(
        canvasHistory.current[nextIndex]
      );

      canvas?.loadFromJSON(nextState, () => {
        // Find the 'clip' object and set it as the canvas clipPath
        const workspace = canvas?.getObjects().find((obj) => obj.name === "clip");
        if (workspace && canvas) {
          canvas.clipPath = workspace;
        }
        canvas?.renderAll();
        setHistoryIndex(nextIndex);
        skipSave.current = false;
      });
    }
  }, [canvas, historyIndex, canRedo]);

  return { 
    save,
    canUndo,
    canRedo,
    undo,
    redo,
    setHistoryIndex,
    canvasHistory,
  };
};
