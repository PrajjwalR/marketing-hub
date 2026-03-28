'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function AddPlatformModal({ companyName, platform, initialUrl = '', onClose, onAdd }) {
  const [url, setUrl] = useState(initialUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialUrl);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsSubmitting(true);
    await onAdd(url.trim());
    setIsSubmitting(false); // Only reached if onAdd doesn't unmount this component
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4">
      <div className="w-full max-w-sm rounded-[8px] border border-[#E5E7EB] bg-white shadow-2xl animate-in zoom-in-95 duration-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-extrabold text-[#111827]">
            {isEditing ? 'Edit' : 'Add'} {platform} Link
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-[13px] text-zinc-500 mb-4">
          Enter the {isEditing ? 'new ' : ''}{platform} URL for <strong>{companyName}</strong> to track it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="url"
            required
            autoFocus
            placeholder={`https://${platform.toLowerCase()}.com/...`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3]"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[6px] border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-[6px] bg-[#205BC3] px-4 py-2 text-sm font-bold text-white hover:bg-[#1a4fa8] disabled:opacity-75 disabled:cursor-wait min-w-[90px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Analyzing
                </>
              ) : isEditing ? 'Update Link' : 'Start Tracking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
