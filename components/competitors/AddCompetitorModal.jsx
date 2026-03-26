'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const PLATFORMS = ['YouTube', 'Facebook', 'Instagram', 'X'];
const SUGGESTED_TAGS = ['fashion', 'lifestyle', 'footwear', 'streetwear', 'beauty', 'wellness', 'food', 'tech', 'fitness'];

export default function AddCompetitorModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '',
    platform: 'YouTube',
    url: '',
    tags: [],
    tagInput: '',
  });
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

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const AVATAR_COLORS = ['#e85d4a', '#2f80ed', '#8b5cf6', '#27b65b', '#f5a623', '#d95bf3'];
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const initials = form.name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    const newCompetitor = {
      id: Date.now().toString(),
      name: form.name.trim(),
      platform: form.platform,
      category: form.tags.length > 0 ? form.tags : ['general'],
      avatarUrl: null,
      avatarInitials: initials,
      avatarColor: color,
      accounts: [
        {
          platform: form.platform,
          stats: {
            subscribers: 0,
            totalVideosPosts: 0,
            avgLikes: 0,
            avgComments: 0,
            engagementRate: 0,
            reach: 0,
          },
          recentContent: [
            { date: '2025-03-15', engagement: 0 },
            { date: '2025-03-16', engagement: 0 },
            { date: '2025-03-17', engagement: 0 },
            { date: '2025-03-18', engagement: 0 },
            { date: '2025-03-19', engagement: 0 },
            { date: '2025-03-20', engagement: 0 },
            { date: '2025-03-21', engagement: 0 },
          ],
        }
      ]
    };

    onAdd(newCompetitor);
    onClose();
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

          {/* Platform */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#374151]">Platform</label>
            <select
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3] transition-all cursor-pointer"
            >
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Channel URL */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#374151]">Channel or Page URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="w-full rounded-[6px] border border-[#E5E7EB] px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2D66C3]/30 focus:border-[#2D66C3] transition-all"
            />
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
              className="rounded-[6px] bg-[#205BC3] px-4 py-2 text-sm font-bold text-white hover:bg-[#1a4fa8] transition-colors shadow-sm"
            >
              Start Tracking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
