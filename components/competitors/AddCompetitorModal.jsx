'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const PLATFORMS = ['YouTube', 'Facebook', 'Instagram', 'X'];
const SUGGESTED_TAGS = ['fashion', 'lifestyle', 'footwear', 'streetwear', 'beauty', 'wellness', 'food', 'tech', 'fitness'];

export default function AddCompetitorModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '',
    tags: [],
    tagInput: '',
    accounts: [{ platform: 'YouTube', url: '' }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const overlayRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  function addTag(tag) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm((f) => ({ ...f, tags: [...f.tags, trimmed], tagInput: '' }));
    } else {
      setForm((f) => ({ ...f, tagInput: '' }));
    }
  }

  function removeTag(tag) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(form.tagInput);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const validAccounts = form.accounts.filter(acc => acc.url.trim() !== '');
    if (validAccounts.length === 0) {
      alert("Please provide at least one valid social platform URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.tags.length > 0 ? form.tags : ['general'],
          accounts: validAccounts.map(acc => ({ platform: acc.platform, handle: acc.url.trim() }))
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const newCompetitor = await response.json();
      onAdd(newCompetitor);
      onClose();
    } catch (err) {
      console.error('Failed to analyze competitor:', err);
      alert('Failed to analyze competitor. Please check the URL and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4"
    >
      <div className="w-full max-w-md rounded-[8px] border border-[#E5E7EB] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-[16px] font-extrabold text-[#111827]">Add Competitor</h2>
          <button
            onClick={onClose}
            className="rounded-[6px] p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Brand Name */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#374151]">Brand Name</label>
            <input
              type="text"
              required
              placeholder="e.g. NovaBrand Co."
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3] transition-all"
            />
          </div>

          {/* Social Profiles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[13px] font-bold text-[#374151]">Social Profiles</label>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, accounts: [...f.accounts, { platform: 'Instagram', url: '' }] }))}
                className="text-[12px] font-bold text-[#205BC3] hover:text-[#1a4fa8] hover:underline"
              >
                + Add another platform
              </button>
            </div>
            
            <div className="space-y-2 border border-[#E5E7EB] rounded-[8px] p-2 bg-zinc-50 border-dashed">
              {form.accounts.map((acc, idx) => (
                <div key={idx} className="flex gap-2 relative">
                  <select
                    value={acc.platform}
                    onChange={(e) => {
                      const newAccs = [...form.accounts];
                      newAccs[idx].platform = e.target.value;
                      setForm({ ...form, accounts: newAccs });
                    }}
                    className="w-[120px] shrink-0 rounded-[6px] border border-[#E5E7EB] px-2 py-2 text-[13px] text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3]"
                  >
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={acc.url}
                    onChange={(e) => {
                      const newAccs = [...form.accounts];
                      newAccs[idx].url = e.target.value;
                      setForm({ ...form, accounts: newAccs });
                    }}
                    className="flex-1 rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-[13px] text-zinc-800 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3] group-first:pr-8"
                  />
                  {form.accounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newAccs = form.accounts.filter((_, i) => i !== idx);
                        setForm({ ...form, accounts: newAccs });
                      }}
                      className="shrink-0 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md w-8 transition-colors"
                      title="Remove profile"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Category Tags */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#374151]">Category Tags</label>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2D66C3] px-2.5 py-0.5 text-[12px] font-semibold capitalize">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              placeholder="Type a tag and press Enter"
              value={form.tagInput}
              onChange={(e) => setForm((f) => ({ ...f, tagInput: e.target.value }))}
              onKeyDown={handleTagKeyDown}
              className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3] transition-all"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t)).slice(0, 6).map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-200 transition-colors capitalize"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-[6px] bg-[#205BC3] px-4 py-2 text-sm font-bold text-white hover:bg-[#1a4fa8] transition-colors shadow-sm disabled:opacity-75 disabled:cursor-wait min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : 'Start Tracking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
