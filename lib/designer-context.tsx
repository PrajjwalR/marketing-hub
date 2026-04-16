'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { fabric } from 'fabric';

interface DesignerContextType {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
  selectedObject: fabric.Object | null;
  setSelectedObject: (obj: fabric.Object | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  addObject: (obj: fabric.Object) => void;
  saveState: () => void;
}

const DesignerContext = createContext<DesignerContextType | undefined>(undefined);

export function DesignerProvider({ children }: { children: React.ReactNode }) {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [activeTab, setActiveTab] = useState('templates');
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

  // Keep a ref of the canvas for stable callbacks
  useEffect(() => {
    canvasRef.current = canvas;
  }, [canvas]);

  const addObject = useCallback((obj: fabric.Object) => {
    if (canvasRef.current) {
      canvasRef.current.add(obj);
      canvasRef.current.setActiveObject(obj);
      canvasRef.current.renderAll();
      saveState();
    }
  }, []);

  const saveState = useCallback(() => {
    if (canvasRef.current) {
      const json = JSON.stringify(canvasRef.current.toJSON());
      undoStack.current.push(json);
      // Limit stack size
      if (undoStack.current.length > 50) undoStack.current.shift();
      redoStack.current = [];
    }
  }, []);

  return (
    <DesignerContext.Provider value={{
      canvas,
      setCanvas,
      selectedObject,
      setSelectedObject,
      activeTab,
      setActiveTab,
      addObject,
      saveState
    }}>
      {children}
    </DesignerContext.Provider>
  );
}

export function useDesigner() {
  const context = useContext(DesignerContext);
  if (!context) {
    throw new Error('useDesigner must be used within a DesignerProvider');
  }
  return context;
}
