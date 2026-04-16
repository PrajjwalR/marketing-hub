'use client';

import React from 'react';
import { useDesigner } from '@/lib/designer-context';
import { 
  LayoutTemplate, 
  Shapes, 
  Type, 
  Upload as UploadIcon, 
  Sparkles, 
  Box, 
  Palette
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { fabric } from 'fabric';
import { MagicSidebar } from '@/components/designer/magic-sidebar';
import { useRef } from 'react';
import { PRESET_TEMPLATES } from '@/lib/designer-templates';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const tabs = [
  { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
  { id: 'elements', icon: Shapes, label: 'Elements' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'uploads', icon: UploadIcon, label: 'Uploads' },
  { id: 'brand', icon: Palette, label: 'Brand' },
  { id: 'magic', icon: Sparkles, label: 'Magic' },
];

export function Sidebar() {
  const { activeTab, setActiveTab, addObject, canvas, saveState } = useDesigner();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedAssets, setUploadedAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  useEffect(() => {
    if (activeTab === 'uploads') {
      fetchAssets();
    }
  }, [activeTab]);

  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const res = await fetch('/api/media?all=true');
      const data = await res.json();
      setUploadedAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to load uploads');
    } finally {
      setLoadingAssets(false);
    }
  };

  const addShape = (type: string) => {
    let shape;
    if (type === 'rect') {
      shape = new fabric.Rect({
        width: 100,
        height: 100,
        fill: '#18181b',
        left: 100,
        top: 100,
      });
    } else if (type === 'circle') {
      shape = new fabric.Circle({
        radius: 50,
        fill: '#18181b',
        left: 100,
        top: 100,
      });
    } else if (type === 'triangle') {
      shape = new fabric.Triangle({
        width: 100,
        height: 100,
        fill: '#18181b',
        left: 100,
        top: 100,
      });
    }
    if (shape) addObject(shape);
  };

  const addText = (preset: string) => {
    let text;
    if (preset === 'heading') {
      text = new fabric.IText('Add Heading', {
        fontSize: 48,
        fontWeight: 'bold',
        left: 100,
        top: 100,
        fontFamily: 'Inter',
      });
    } else if (preset === 'subheading') {
      text = new fabric.IText('Add Subheading', {
        fontSize: 24,
        left: 100,
        top: 100,
        fontFamily: 'Inter',
      });
    } else {
      text = new fabric.IText('Add body text', {
        fontSize: 16,
        left: 100,
        top: 100,
        fontFamily: 'Inter',
      });
    }
    addObject(text);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Uploading image...');

    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const asset = await res.json();
      
      toast.success('Image uploaded', { id: toastId });
      setUploadedAssets(prev => [asset, ...prev]);

      // Add to canvas immediately
      fabric.Image.fromURL(asset.url, (img) => {
        img.scaleToWidth(300);
        addObject(img);
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      e.target.value = '';
    }
  };

  const loadTemplate = (templateJson: any) => {
    if (canvas) {
      const c = canvas;
      c.loadFromJSON(templateJson, () => {
        c.renderAll();
        saveState();
      });
    }
  };

  return (
    <div className="flex w-[450px] h-full border-r shrink-0">
      {/* Tab Icons */}
      <div className="w-20 border-r flex flex-col items-center py-4 bg-zinc-50 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full py-4 transition-colors",
              activeTab === tab.id ? "bg-white text-zinc-900 border-l-2 border-zinc-900" : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-white overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">{activeTab}</h2>

            {activeTab === 'elements' && (
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => addShape('rect')} className="aspect-square bg-zinc-100 rounded-lg flex items-center justify-center border hover:border-zinc-400 transition-all">
                  <div className="w-12 h-12 bg-zinc-900" />
                </button>
                <button onClick={() => addShape('circle')} className="aspect-square bg-zinc-100 rounded-lg flex items-center justify-center border hover:border-zinc-400 transition-all">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full" />
                </button>
                <button onClick={() => addShape('triangle')} className="aspect-square bg-zinc-100 rounded-lg flex items-center justify-center border hover:border-zinc-400 transition-all">
                   <div style={{ width: 0, height: 0, borderLeft: '24px solid transparent', borderRight: '24px solid transparent', borderBottom: '40px solid #18181b' }} />
                </button>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-3">
                <button onClick={() => addText('heading')} className="w-full py-3 px-4 bg-zinc-100 rounded-lg text-left hover:bg-zinc-200 transition-all">
                   <span className="text-2xl font-bold">Add a heading</span>
                </button>
                <button onClick={() => addText('subheading')} className="w-full py-2 px-4 bg-zinc-100 rounded-lg text-left hover:bg-zinc-200 transition-all">
                   <span className="text-lg font-semibold">Add a subheading</span>
                </button>
                <button onClick={() => addText('body')} className="w-full py-2 px-4 bg-zinc-100 rounded-lg text-left hover:bg-zinc-200 transition-all">
                   <span className="text-sm">Add a little bit of body text</span>
                </button>
              </div>
            )}

            {activeTab === 'magic' && <MagicSidebar />}

            {activeTab === 'uploads' && (
              <div className="space-y-6">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  className="w-full h-24 border-dashed flex-col gap-2 rounded-xl transition-all hover:bg-zinc-50 hover:border-zinc-400 group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="h-6 w-6 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                  <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-900 transition-colors">Upload new image</span>
                </Button>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Library</h3>
                    {loadingAssets && <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />}
                  </div>

                  {uploadedAssets.length === 0 && !loadingAssets ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-300">
                       <Box className="h-12 w-12 mb-2 opacity-20" />
                       <p className="text-xs italic">No uploads yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {uploadedAssets.map((asset) => (
                        <button 
                          key={asset.id} 
                          onClick={() => {
                            fabric.Image.fromURL(asset.url, (img) => {
                              img.scaleToWidth(300);
                              addObject(img);
                            });
                          }}
                          className="group relative aspect-square rounded-xl overflow-hidden border bg-zinc-50 hover:border-zinc-400 shadow-sm transition-all"
                        >
                          <img 
                            src={asset.url} 
                            alt={asset.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'templates' && (
              <div className="grid grid-cols-2 gap-4">
                {PRESET_TEMPLATES.map((template) => (
                  <button 
                    key={template.id} 
                    onClick={() => loadTemplate(template.json_data)}
                    className="group relative aspect-video rounded-xl overflow-hidden border bg-zinc-100 hover:border-zinc-400 transition-all text-left"
                  >
                    <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2 left-3 text-xs font-bold text-white uppercase tracking-wider">{template.name}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Other tabs can be empty placeholders or basic implementations */}
            {['brand'].includes(activeTab) && (
                 <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                     <Box className="h-12 w-12 mb-2 opacity-20" />
                     <p className="text-xs italic">No items found in {activeTab}</p>
                 </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
