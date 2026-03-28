'use client';

import { useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function UserSync() {
  const hasSyncedOk = useRef(false);
  const syncing = useRef(false);

  useEffect(() => {
    async function pushUserRow(user: User) {
      if (hasSyncedOk.current || syncing.current) return;
      syncing.current = true;
      try {
        const token = await user.getIdToken(true);
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;

        const partnerInfoStr = localStorage.getItem('partner_auth_info');
        let body: Record<string, unknown> = {};
        if (partnerInfoStr) {
          try {
            body = JSON.parse(partnerInfoStr) as Record<string, unknown>;
            localStorage.removeItem('partner_auth_info');
          } catch (e) {
            console.error('Failed to parse partner auth info:', e);
          }
        }

        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          console.error('Failed to sync user data', response.status, payload);
          return;
        }

        hasSyncedOk.current = true;
      } catch (error) {
        console.error('Error synchronizing user:', error);
      } finally {
        syncing.current = false;
      }
    }

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        hasSyncedOk.current = false;
        return;
      }
      void pushUserRow(user);
    });

    const unsubToken = onIdTokenChanged(auth, (user) => {
      if (!user) {
        hasSyncedOk.current = false;
        return;
      }
      if (!hasSyncedOk.current) void pushUserRow(user);
    });

    return () => {
      unsubAuth();
      unsubToken();
    };
  }, []);

  return null;
}