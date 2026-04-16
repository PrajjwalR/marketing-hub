'use client';

import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useDesigner } from '@/lib/designer-context';

interface FabricCanvasProps {
  width?: number;
  height?: number;
  initialData?: any;
}

export function FabricCanvas({ width = 1080, height = 1080, initialData }: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas, setSelectedObject, saveState } = useDesigner();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric Canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    // Handle Selection Events
    fabricCanvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
    fabricCanvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
    fabricCanvas.on('selection:cleared', () => setSelectedObject(null));
    
    // Save state on changes
    fabricCanvas.on('object:modified', () => saveState());
    fabricCanvas.on('object:added', () => saveState());

    // Load initial data if provided
    if (initialData) {
      fabricCanvas.loadFromJSON(initialData, () => {
        fabricCanvas.renderAll();
      });
    }

    setCanvas(fabricCanvas);

    // Responsive scaling
    const handleResize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const scale = Math.min(
        (containerWidth - 40) / width,
        (containerHeight - 40) / height
      );

      const canvasWrapper = document.querySelector('.canvas-container') as HTMLElement;
      if (canvasWrapper) {
        canvasWrapper.style.transform = `scale(${scale})`;
        canvasWrapper.style.transformOrigin = 'center';
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      fabricCanvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [width, height, initialData, setCanvas, setSelectedObject, saveState]);

  return (
    <div ref={containerRef} className="relative flex-1 flex items-center justify-center bg-zinc-100 overflow-hidden h-full">
      <div className="shadow-2xl">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
