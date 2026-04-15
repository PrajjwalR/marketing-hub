'use client';

import { useState, useRef, useEffect } from 'react';
import { useWorkspace, type Workspace } from '@/context/workspace-context';
import { Check, ChevronDown, Plus, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4',
];

const EMOJIS = ['🏢', '🚀', '💼', '🌿', '🎯', '🔥', '👑', '💎', '🌟', '🎨'];

interface WorkspaceSwitcherProps {
  isCollapsed: boolean;
}

export function WorkspaceSwitcher({ isCollapsed }: WorkspaceSwitcherProps) {
  const { workspaces, activeWorkspace, isLoading, switchWorkspace, linkWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCreate(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSwitch = (ws: Workspace) => {
    switchWorkspace(ws);
    setOpen(false);
    toast.success(`Switched to "${ws.name}"`, { duration: 2000 });
    // Hard-refresh to ensure all Server Components and client-side fetches use the new __ws_owner cookie
    setTimeout(() => {
        window.location.reload();
    }, 300);
  };

  const handleLink = async () => {
    if (!linkEmail.trim() || !linkPassword.trim()) {
      toast.error('Enter both email and password');
      return;
    }
    setCreating(true);
    try {
      await linkWorkspace(linkEmail.trim(), linkPassword);
      toast.success(`Account linked successfully!`);
      setLinkEmail('');
      setLinkPassword('');
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to link account. Check credentials.');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-white/40" />
      </div>
    );
  }

  if (!activeWorkspace) return null;

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(!open); setShowCreate(false); }}
        className={cn(
          'group w-full flex items-center justify-center rounded-xl py-1.5 transition-all duration-200',
          'hover:bg-white/10',
          open && 'bg-white/10',
          isCollapsed ? 'px-0' : 'px-2 gap-2.5 justify-start',
        )}
        title={isCollapsed ? activeWorkspace.name : undefined}
      >
        {/* Logo / Emoji badge */}
        <span
          className="relative flex h-7 w-7 shrink-0 overflow-hidden items-center justify-center rounded-lg text-sm font-semibold shadow-sm"
          style={{ backgroundColor: activeWorkspace.color + '33', border: `1.5px solid ${activeWorkspace.color}55` }}
        >
          {activeWorkspace.logo_url ? (
            <img src={activeWorkspace.logo_url} alt={activeWorkspace.name} className="h-full w-full object-cover" />
          ) : (
            activeWorkspace.emoji
          )}
        </span>

        {/* Name + chevron */}
        {!isCollapsed && (
          <>
            <span className="flex-1 min-w-0 text-left transition-all duration-300">
              <span className="block truncate text-[13px] font-semibold text-white leading-tight">
                {activeWorkspace.name}
              </span>
              <span className="block truncate text-[10px] text-white/45 leading-tight">
                {workspaces.length} account{workspaces.length !== 1 ? 's' : ''}
              </span>
            </span>

            <ChevronDown className={cn(
              'h-3.5 w-3.5 shrink-0 text-white/50 transition-all duration-300',
              open && 'rotate-180',
            )} />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className={cn(
          'absolute z-50 mt-1 min-w-[220px] overflow-hidden rounded-xl border border-white/10 bg-[#1e2a2a] shadow-2xl',
          isCollapsed ? 'left-full ml-2 top-0' : 'left-0 top-full',
        )}>
          {/* Account list */}
          <div className="max-h-[260px] overflow-y-auto p-1.5 space-y-0.5">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspace.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => handleSwitch(ws)}
                  className={cn(
                    'group w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all',
                    isActive ? 'bg-white/15' : 'hover:bg-white/10',
                  )}
                >
                  <span
                    className="relative flex h-7 w-7 shrink-0 overflow-hidden items-center justify-center rounded-lg text-sm shadow-sm"
                    style={{ backgroundColor: ws.color + '33', border: `1.5px solid ${ws.color}55` }}
                  >
                    {ws.logo_url ? (
                      <img src={ws.logo_url} alt={ws.name} className="h-full w-full object-cover" />
                    ) : (
                      ws.emoji
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-white">{ws.name}</span>
                    {ws.is_default && (
                      <span className="block text-[10px] text-white/40">Default</span>
                    )}
                  </span>
                  {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-indigo-300" />}
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="border-t border-white/[0.08] p-1.5 space-y-0.5">
            {!showCreate ? (
              <>
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Link existing account
                </button>
                <Link
                  href="/dashboard/settings?tab=workspaces"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Manage accounts
                </Link>
              </>
            ) : (
              <div className="space-y-2 p-1">
                {/* Email and Password mapping list */}
                <p className="text-[10px] text-white/50 text-center uppercase tracking-widest font-semibold pb-1">Link Account</p>
                <input
                  autoFocus
                  type="email"
                  placeholder="Email Address"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/5 px-2.5 py-2 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all mb-1"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={linkPassword}
                  onChange={(e) => setLinkPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLink()}
                  className="w-full rounded-md border border-white/15 bg-white/5 px-2.5 py-2 text-[12px] text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                />

                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => { setShowCreate(false); setLinkEmail(''); setLinkPassword(''); }}
                    className="flex-1 rounded-md py-1.5 text-[11px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLink}
                    disabled={creating || !linkEmail.trim() || !linkPassword.trim()}
                    className="flex-1 rounded-md bg-white text-[#1e2a2a] py-1.5 text-[11px] font-semibold hover:bg-white/90 disabled:opacity-50 disabled:hover:bg-white transition-all flex items-center justify-center gap-1"
                  >
                    {creating && <Loader2 className="h-3 w-3 animate-spin" />}
                    Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
