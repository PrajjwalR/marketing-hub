'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color: string;
  emoji: string;
  logo_url?: string | null;
  is_default: boolean;
  owner_user_id?: string | null; // original owner's Firebase UID (populated for linked accounts)
  created_at: string;
}

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  switchWorkspace: (workspace: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (data: { name: string; description?: string; color?: string; emoji?: string; logo_url?: string | null }) => Promise<Workspace>;
  updateWorkspace: (id: string, data: Partial<Pick<Workspace, 'name' | 'description' | 'color' | 'emoji' | 'logo_url'>>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  linkWorkspace: (email: string, password: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const ACTIVE_WS_KEY = 'ae_active_workspace_id';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  const loadWorkspaces = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspaces?t=${Date.now()}`);
      if (!res.ok) return;
      const data: Workspace[] = await res.json();
      setWorkspaces(data);

      // Restore last-active workspace, falling back to default
      const saved = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_WS_KEY) : null;
      const found = saved ? data.find((w) => w.id === saved) : null;
      const defaultWs = data.find((w) => w.is_default) ?? data[0] ?? null;
      const active = found ?? defaultWs;
      setActiveWorkspace(active);

      // Sync the owner cookie with the restored active workspace
      if (active && typeof window !== 'undefined') {
        const ownerUid = active.owner_user_id || '';
        document.cookie = `__ws_owner=${ownerUid}; path=/; max-age=86400; SameSite=Lax`;
      }
    } catch {
      /* silently ignore – user may not be authed yet */
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Only start fetching once Firebase confirms the user is signed in
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthed(true);
        loadWorkspaces();
      } else {
        setIsAuthed(false);
        setWorkspaces([]);
        setActiveWorkspace(null);
        setIsLoading(false);
      }
    });
    return unsub;
  }, [loadWorkspaces]);

  const switchWorkspace = useCallback((workspace: Workspace) => {
    setActiveWorkspace(workspace);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_WS_KEY, workspace.id);
      // Store the effective data-owner user ID in a cookie so API routes can use it
      // If owner_user_id is set (linked account), use it; otherwise use empty (means: use session userId)
      const ownerUid = workspace.owner_user_id || '';
      document.cookie = `__ws_owner=${ownerUid}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, []);

  const refreshWorkspaces = useCallback(async () => {
    await loadWorkspaces();
  }, [loadWorkspaces]);

  const createWorkspace = useCallback(async (data: {
    name: string; description?: string; color?: string; emoji?: string;
  }): Promise<Workspace> => {
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Failed to create workspace');
    }
    const created: Workspace = await res.json();
    setWorkspaces((prev) => [...prev, created]);
    return created;
  }, []);

  const updateWorkspace = useCallback(async (id: string, data: Partial<Pick<Workspace, 'name' | 'description' | 'color' | 'emoji'>>) => {
    const res = await fetch(`/api/workspaces/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Failed to update workspace');
    }
    const updated: Workspace = await res.json();
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? updated : w)));
    if (activeWorkspace?.id === id) setActiveWorkspace(updated);
  }, [activeWorkspace]);

  const deleteWorkspace = useCallback(async (id: string) => {
    const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Failed to delete workspace');
    }
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    // If we deleted the active workspace, fall back to default
    if (activeWorkspace?.id === id) {
      const remaining = workspaces.filter((w) => w.id !== id);
      const next = remaining.find((w) => w.is_default) ?? remaining[0] ?? null;
      setActiveWorkspace(next);
      if (next && typeof window !== 'undefined') localStorage.setItem(ACTIVE_WS_KEY, next.id);
    }
  }, [activeWorkspace, workspaces]);

  const linkWorkspace = useCallback(async (email: string, password: string): Promise<void> => {
    const res = await fetch('/api/workspaces/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Failed to link account');
    }
    // Refresh workspaces directly after successful link
    await loadWorkspaces();
  }, [loadWorkspaces]);

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspace,
      isLoading,
      switchWorkspace,
      refreshWorkspaces,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      linkWorkspace,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return ctx;
}
