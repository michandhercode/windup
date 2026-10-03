'use client';

import { useSyncExternalStore } from 'react';

/** Fired by Login / Signup / Settings after they write profile keys directly to localStorage. */
const PROFILE_EVENT = 'windup_profile_updated';

const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener('storage', onChange); // other tabs
  window.addEventListener(PROFILE_EVENT, onChange); // same-tab profile writes
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
    window.removeEventListener(PROFILE_EVENT, onChange);
  };
};

const notify = () => listeners.forEach((listener) => listener());

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Reads a localStorage string and re-renders when it changes (this tab or another).
 * Returns `null` on the server and during hydration, so SSR markup always matches.
 */
export function useLocalStorageItem(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null
  );
}

export function setLocalStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to save "${key}" to localStorage`, error);
  }
  notify();
}

export function removeLocalStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage unavailable - nothing to remove */
  }
  notify();
}

const subscribeNever = () => () => {};

/** `false` on the server / while hydrating, `true` afterwards. Replaces the `mounted` effect pattern. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}