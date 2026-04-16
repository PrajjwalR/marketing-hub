'use client';

import React, { useState, useEffect } from 'react';
import { useDesigner } from '@/lib/designer-context';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  Copy, 
  MoveUp, 
  MoveDown,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Toolbar() {
  const { canvas, selectedObject, saveState } = useDesigner();
  const [fill, setFill] = useState('#000000');
  const [fontSize, setFontSize] = useState('16');

  useEffect(() => {
    if (selectedObject) {
      setFill((selectedObject.fill as string) || '#000000');
      // @ts-ignore
      setFontSize(selectedObject.fontSize?.toString() || '16');
    }
  }, [selectedObject]);

  if (!selectedObject) {
    return (
      <div className="h-12 border-b bg-white flex items-center px-4 shrink-0">
        <span className="text-xs text-zinc-400">Select an object to edit</span>
      </div>
    );
  }

  const isText = selectedObject.type === 'i-text' || selectedObject.type === 'text';

  const updateProp = (prop: string, value: any) => {
    if (selectedObject && canvas) {
      const c = canvas;
      selectedObject.set(prop as any, value);
      c.renderAll();
      saveState();
      
      if (prop === 'fill') setFill(value);
      if (prop === 'fontSize') setFontSize(value.toString());
    }
  };

  const deleteObject = () => {
    const c = canvas;
    if (selectedObject && c) {
      c.remove(selectedObject);
      c.discardActiveObject();
      c.renderAll();
      saveState();
    }
  };

  const bringToFront = () => {
    const c = canvas;
    if (selectedObject && c) {
        selectedObject.bringToFront();
        c.renderAll();
        saveState();
    }
  };

  const sendToBack = () => {
    const c = canvas;
    if (selectedObject && c) {
        selectedObject.sendToBack();
        c.renderAll();
        saveState();
    }
  };

  return (
    <div className="h-12 border-b bg-white flex items-center px-4 shrink-0 gap-2">
      {/* Property Controls */}
      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-6 w-10 rounded border shadow-sm" style={{ backgroundColor: fill }} />
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-6 gap-1">
              {['#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#71717a', '#facc15'].map(color => (
                <button 
                  key={color} 
                  className="h-6 w-6 rounded border" 
                  style={{ backgroundColor: color }} 
                  onClick={() => updateProp('fill', color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {isText && (
          <>
            <div className="h-4 w-px bg-zinc-200 mx-1" />
            <Select value={fontSize} onValueChange={(v) => updateProp('fontSize', parseInt(v))}>
                <SelectTrigger className="h-8 w-16 text-xs">
                    <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                    {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72].map(size => (
                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateProp('fontWeight', (selectedObject as any).fontWeight === 'bold' ? 'normal' : 'bold')}>
                <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateProp('fontStyle', (selectedObject as any).fontStyle === 'italic' ? 'normal' : 'italic')}>
                <Italic className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-zinc-200 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateProp('textAlign', 'left')}><AlignLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateProp('textAlign', 'center')}><AlignCenter className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateProp('textAlign', 'right')}><AlignRight className="h-4 w-4" /></Button>
          </>
        )}
      </div>

      <div className="flex-1" />

      {/* Layering & Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" title="Bring to Front" className="h-8 w-8" onClick={bringToFront}><MoveUp className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" title="Send to Back" className="h-8 w-8" onClick={sendToBack}><MoveDown className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" title="Duplicate" className="h-8 w-8" onClick={() => {
             if (canvas) {
                const c = canvas;
                selectedObject.clone((cloned: fabric.Object) => {
                    c.add(cloned.set({ left: (selectedObject.left || 0) + 10, top: (selectedObject.top || 0) + 10 }));
                    c.setActiveObject(cloned);
                    saveState();
                });
             }
        }}><Copy className="h-4 w-4" /></Button>
        <div className="h-4 w-px bg-zinc-200 mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={deleteObject}>
            <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
