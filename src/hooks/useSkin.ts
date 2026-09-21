import { useEffect, useState } from 'react';
import { getSkin, readPreviewedSkinId, SkinDefinition, SkinId } from '../lib/skins';
import { useSchoolData } from './useSchoolData';

declare global {
  interface Window {
    __SKIN__?: string;
  }
}

/** Event fired by Owner Studio so the app re-renders the moment a skin is previewed. */
export const SKIN_CHANGE_EVENT = 'owner-skin-change';

function bakedSkinId(): SkinId | string | undefined {
  const fromWindow = typeof window !== 'undefined' ? window.__SKIN__ : undefined;
  const fromAttr =
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-skin') : undefined;
  return fromWindow || fromAttr || undefined;
}

/**
 * Resolves the skin in force right now, in priority order:
 *   1. Owner's live preview (this browser only, via Owner Studio)
 *   2. The school's published skin in the database (real one-click publish —
 *      no rebuild needed, every visitor sees it immediately)
 *   3. Whatever skin is baked into this build (theme.config.json) as the
 *      starting default for a brand-new school that's never had one set
 */
export function useSkin(): SkinDefinition {
  const { currentSchool } = useSchoolData();
  const [previewId, setPreviewId] = useState<SkinId | null>(() => readPreviewedSkinId());

  useEffect(() => {
    const sync = () => setPreviewId(readPreviewedSkinId());
    window.addEventListener(SKIN_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SKIN_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const resolved = previewId || currentSchool?.skin || bakedSkinId();
  return getSkin(resolved);
}
