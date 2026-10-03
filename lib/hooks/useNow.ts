'use client';

import { useSyncExternalStore } from 'react';

const TICK_MS = 30_000;

const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
};

// Quantised so the snapshot is stable between ticks (required by useSyncExternalStore).
const getSnapshot = () => Math.floor(Date.now() / TICK_MS) * TICK_MS;

/** Current time (ms), refreshed every 30s. Keeps `Date.now()` out of render bodies. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}