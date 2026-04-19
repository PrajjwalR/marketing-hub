import { fabric } from "fabric";
import { useEffect, useRef } from "react";

import { JSON_KEYS } from "../types";

interface UseLoadStateProps {
  autoZoom: () => void;
  canvas: fabric.Canvas | null;
  initialState: React.MutableRefObject<any>;
  canvasHistory: React.MutableRefObject<string[]>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
};

export const useLoadState = ({
  canvas,
  autoZoom,
  initialState,
  canvasHistory,
  setHistoryIndex,
}: UseLoadStateProps) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initialState?.current && canvas) {
      const data = typeof initialState.current === "string" 
        ? JSON.parse(initialState.current) 
        : initialState.current;

      canvas.loadFromJSON(data, () => {
        // Find the 'clip' object and set it as the canvas clipPath
        const workspace = canvas.getObjects().find((obj) => obj.name === "clip");
        if (workspace) {
          canvas.clipPath = workspace;
        }

        const currentState = JSON.stringify(
          canvas.toJSON(JSON_KEYS),
        );

        canvasHistory.current = [currentState];
        setHistoryIndex(0);
        autoZoom();
      });
      initialized.current = true;
    }
  }, 
  [
    canvas,
    autoZoom,
    initialState, 
    canvasHistory, 
    setHistoryIndex, 
  ]);
};
