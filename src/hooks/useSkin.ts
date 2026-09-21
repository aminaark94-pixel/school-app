import { useEffect, useState } from 'react';
import { getSkin, readPreviewedSkinId, SkinDefinition, SkinId } from '../lib/skins';

declare global {
  interface Window {
    __SKIN__?: string;
  }
}

/** Event fired by Owner Studio so the app re-renders the moment a skin is previewed. */
export const SKIN_CHANGE_EVENT = 'owner-skin-change';

function resolveSkinId(): SkinId | string | undefined {
  // Owner's live preview (this browser only) wins over the published skin.
  const previewed = readPreviewedSkinId();
  if (previewed) return previewed;

  const fromWindow = typeof window !== 'undefined' ? window.__SKIN__ : undefined;
  const fromAttr =
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-skin') : undefined;
  return fromWindow || fromAttr || undefined;
}

/**
 * Resolves the skin in force right now.
 *
 * Source of truth for a delivered build is theme.config.json -> "skin",
 * baked into the page by vite.config.ts. Schools cannot change it. The
 * owner can preview other skins live from Owner Studio (#owner), which is
 * kept in their own browser only until copied into theme.config.json.
 */
export function useSkin(): SkinDefinition {
  const [skin, setSkin] = useState<SkinDefinition>(() => getSkin(resolveSkinId()));

  useEffect(() => {
    const sync = () => setSkin(getSkin(resolveSkinId()));
    window.addEventListener(SKIN_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SKIN_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return skin;
}
