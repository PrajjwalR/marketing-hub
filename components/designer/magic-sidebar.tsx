'use client';

import React, { useState } from 'react';
import { useDesigner } from '@/lib/designer-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { fabric } from 'fabric';

export function MagicSidebar() {
  const { addObject } = useDesigner();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResultImage(null);

    try {
      // Calling the existing poster generation API
      const res = await fetch('/api/posters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'image',
          description: prompt,
          format: 'square-1-1',
          style: 'clean-modern',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      
      if (data.outputUrl) {
        setResultImage(data.outputUrl);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const addToCanvas = () => {
    if (!resultImage) return;
    
    fabric.Image.fromURL(resultImage, (img) => {
      img.scaleToWidth(400);
      addObject(img);
      setResultImage(null);
      setPrompt('');
    }, { crossOrigin: 'anonymous' });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">AI Prompt</label>
        <Textarea 
          placeholder="Describe what you want to generate... e.g. A futuristic city skyline"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] text-sm resize-none"
        />
      </div>

      <Button 
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {isGenerating ? 'Generating...' : 'Magic Generate'}
      </Button>

      {resultImage && (
        <div className="mt-4 space-y-3">
          <div className="relative rounded-lg overflow-hidden border bg-zinc-100 aspect-square">
            <img src={resultImage} alt="Generated" className="w-full h-full object-cover" />
          </div>
          <Button variant="outline" className="w-full gap-2" onClick={addToCanvas}>
            <Plus className="h-4 w-4" /> Add to design
          </Button>
        </div>
      )}

      <div className="pt-4 border-t">
         <p className="text-[10px] text-zinc-400 leading-relaxed italic">
            Tip: Be specific about styles, colors, and subjects for better results.
         </p>
      </div>
    </div>
  );
}
