import { useMemo } from 'react';
import { getSkin, SkinDefinition } from '../lib/skins';

declare global {
  interface Window {
    __SKIN__?: string;
  }
}

/**
 * Resolves the skin published for this build.
 *
 * Source of truth is theme.config.json -> "skin", baked into the page at
 * build time by vite.config.ts. This is deliberately owner-controlled: a
 * school running the app cannot change its own skin.
 */
export function useSkin(): SkinDefinition {
  return useMemo(() => {
    const fromWindow = typeof window !== 'undefined' ? window.__SKIN__ : undefined;
    const fromAttr =
      typeof document !== 'undefined' ? document.documentElement.getAttribute('data-skin') : undefined;
    return getSkin(fromWindow || fromAttr);
  }, []);
}
