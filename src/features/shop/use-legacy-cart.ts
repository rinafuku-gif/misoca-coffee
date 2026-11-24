"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { Product } from "./notion";

export interface LegacyCartItem { product: Product; quantity: number }
const KEY = "misoca-coffee-cart";
function parse(raw: string | null): LegacyCartItem[] {
  try { const value: unknown = JSON.parse(raw ?? "null"); return Array.isArray(value) ? value : []; }
  catch { return []; }
}

// Each mounted shop owns its fallback and subscriptions. SSR never reads or
// writes browser storage; hydration starts with the same empty server snapshot.
function createCartStore() {
  let fallback: string | null = null;
  let volatile = false;
  const listeners = new Set<() => void>();
  const snapshot = () => {
    if (!volatile) {
      try { fallback = window.localStorage.getItem(KEY); return fallback; } catch { /* Keep this page usable. */ }
    }
    return fallback;
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const changed = (event: StorageEvent) => {
      if (event.key !== KEY && event.key !== null) return;
      try { if (event.storageArea !== window.localStorage) return; } catch { return; }
      volatile = false; listener();
    };
    window.addEventListener("storage", changed);
    return () => { listeners.delete(listener); window.removeEventListener("storage", changed); };
  };
  const update = (change: (previous: LegacyCartItem[]) => LegacyCartItem[]) => {
    const raw = JSON.stringify(change(parse(snapshot())));
    fallback = raw;
    try { window.localStorage.setItem(KEY, raw); volatile = false; }
    catch { volatile = true; }
    listeners.forEach(listener => listener());
  };
  return { snapshot, subscribe, update };
}
const serverSnapshot = () => null;
export function useLegacyCart() {
  const [store] = useState(createCartStore);
  const raw = useSyncExternalStore(store.subscribe, store.snapshot, serverSnapshot);
  const cart = useMemo(() => parse(raw), [raw]);
  return [cart, store.update] as const;
}
