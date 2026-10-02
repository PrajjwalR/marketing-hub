'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { ALL_APPS, ALWAYS_ON, DEFAULT_ENABLED, type AppId } from '@/lib/apps';

type AppsContextValue = {
    enabledApps: AppId[];
    isEnabled: (id: AppId) => boolean;
    setEnabled: (id: AppId, enabled: boolean) => void;
    /** Turn several apps on or off at once (one sidebar tab = a group of apps). */
    setManyEnabled: (ids: AppId[], enabled: boolean) => void;
    /** False until the saved selection has been read (avoids acting on defaults). */
    ready: boolean;
};

const AppsContext = createContext<AppsContextValue | null>(null);

const VALID_IDS = new Set<string>(ALL_APPS.map((a) => a.id));

function storageKey(workspaceId: string | undefined) {
    return `ae-enabled-apps:${workspaceId || 'default'}`;
}

function readSaved(key: string): AppId[] {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return DEFAULT_ENABLED;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return DEFAULT_ENABLED;
        const ids = parsed.filter((id): id is AppId => typeof id === 'string' && VALID_IDS.has(id));
        return Array.from(new Set([...ALWAYS_ON, ...ids]));
    } catch {
        return DEFAULT_ENABLED;
    }
}

/** Which dashboard apps are switched on, saved per workspace in this browser. */
export function AppsProvider({ children }: { children: ReactNode }) {
    const { activeWorkspace } = useWorkspace();
    const key = storageKey(activeWorkspace?.id);
    const [enabledApps, setEnabledApps] = useState<AppId[]>(DEFAULT_ENABLED);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setEnabledApps(readSaved(key));
        setReady(true);
    }, [key]);

    const setManyEnabled = useCallback(
        (ids: AppId[], enabled: boolean) => {
            const changeable = ids.filter((id) => !ALWAYS_ON.includes(id));
            if (changeable.length === 0) return;
            setEnabledApps((prev) => {
                const next = enabled
                    ? Array.from(new Set([...prev, ...changeable]))
                    : prev.filter((x) => !changeable.includes(x));
                try {
                    localStorage.setItem(key, JSON.stringify(next));
                } catch {
                    // Storage unavailable (private mode): keep the in-memory selection.
                }
                return next;
            });
        },
        [key]
    );

    const setEnabled = useCallback((id: AppId, enabled: boolean) => setManyEnabled([id], enabled), [setManyEnabled]);

    const value = useMemo<AppsContextValue>(
        () => ({
            enabledApps,
            isEnabled: (id) => ALWAYS_ON.includes(id) || enabledApps.includes(id),
            setEnabled,
            setManyEnabled,
            ready,
        }),
        [enabledApps, setEnabled, setManyEnabled, ready]
    );

    return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
}

export function useApps(): AppsContextValue {
    const ctx = useContext(AppsContext);
    if (!ctx) throw new Error('useApps must be used within AppsProvider');
    return ctx;
}
