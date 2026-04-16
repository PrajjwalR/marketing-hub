'use client';

import React from 'react';
import { useDesigner, DesignerProvider } from '@/lib/designer-context';
import { FabricCanvas } from './fabric-canvas';
import { Sidebar } from './sidebar';
import { Toolbar } from '@/components/designer/toolbar';
import { Button } from '@/components/ui/button';
import { Save, Download, Share2, Undo2, Redo2 } from 'lucide-react';
import { toast } from 'sonner';

interface DesignerEditorProps {
  initialData?: any;
  designId?: string;
}

function EditorInner({ initialData, designId }: DesignerEditorProps) {
  const { canvas, saveState } = useDesigner();

  const handleSave = async () => {
    if (!canvas) return;
    const c = canvas;
    const json = c.toJSON();
    
    try {
      const res = await fetch(designId ? `/api/designs/${designId}` : '/api/designs', {
        method: designId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Untitled Design',
          json_data: json,
          preview_url: c.toDataURL({ format: 'png', quality: 0.8 }),
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      toast.success('Design saved');
    } catch (error) {
      toast.error('Error saving design');
    }
  };

  const handleExport = () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.download = 'design.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex h-screen w-full flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
             </div>
             <h1 className="font-semibold text-zinc-900">Creative AI</h1>
          </div>
          <div className="h-4 w-px bg-zinc-200" />
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8"><Undo2 className="h-4 w-4" /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8"><Redo2 className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button size="sm" className="bg-[#f2d412] hover:bg-[#f2c112] text-zinc-900 gap-2 font-medium" onClick={handleExport}>
            <Download className="h-4 w-4" /> Download
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <Toolbar />
          <div className="flex-1 relative">
             <FabricCanvas initialData={initialData} />
          </div>
        </main>
      </div>
    </div>
  );
}

export function DesignerEditor(props: DesignerEditorProps) {
  return (
    <DesignerProvider>
      <EditorInner {...props} />
    </DesignerProvider>
  );
}
