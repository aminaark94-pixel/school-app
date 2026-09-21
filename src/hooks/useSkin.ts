import { useEffect, useState } from 'react';
import { applySkinTokens, getSkin, isSkinId, readPreviewedSkinId } from '../lib/skins';
import type { SkinDefinition, SkinId } from '../lib/skins';
import { THEME_KEYS, hasOwnerPreview, normalizeHex } from '../lib/theme';
import type { ThemeColors } from '../lib/theme';
import { getSupabase } from '../lib/supabase';
import { useSchoolData } from './useSchoolData';

declare global {
  interface Window {
    __SKIN__?: string;
  }
}

/** Fired whenever the skin should be re-resolved (preview changed, or a skin was just published). */
export const SKIN_CHANGE_EVENT = 'owner-skin-change';

function bakedSkinId(): string | undefined {
  const fromWindow = typeof window !== 'undefined' ? window.__SKIN__ : undefined;
  const fromAttr =
    typeof document !== 'undefined' ? document.documentElement.getAttribute('data-skin') : undefined;
  return fromWindow || fromAttr || undefined;
}

/**
 * The skin that was just published in this tab. Every component that reads the skin
 * sees it instantly, without waiting for (or depending on) a data refetch. After a
 * page reload the value comes from the database row instead.
 */
let publishedOverride: {
  schoolId: string;
  skin: SkinId;
  primary?: string;
  accent?: string;
} | null = null;

function setColorVars(colors: ThemeColors) {
  const root = document.documentElement;
  for (const k of THEME_KEYS) {
    root.style.setProperty(`--t-${k}`, colors[k]);
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.primary);
}

function useSkinState() {
  const { currentSchool, schools } = useSchoolData();
  const [previewId, setPreviewId] = useState<SkinId | null>(() => readPreviewedSkinId());
  const [, setVersion] = useState(0);

  useEffect(() => {
    const sync = () => {
      setPreviewId(readPreviewedSkinId());
      setVersion((v) => v + 1);
    };
    window.addEventListener(SKIN_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SKIN_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Prefer the freshly loaded school row over the copy captured at sign-in.
  const fresh = schools.find((s) => s.id === currentSchool?.id) ?? currentSchool;
  const override =
    publishedOverride && publishedOverride.schoolId === currentSchool?.id ? publishedOverride : null;

  const rawSkin: unknown = override?.skin ?? fresh?.skin;
  const explicit: SkinId | undefined = isSkinId(rawSkin) ? rawSkin : undefined;
  const baked = bakedSkinId();
  const publishedId: SkinId = explicit ?? (isSkinId(baked) ? baked : 'imperial');

  return {
    previewId,
    explicit,
    publishedId,
    primary: override?.primary ?? fresh?.primary_color,
    accent: override?.accent ?? fresh?.secondary_color,
  };
}

/** The skin that is live for everyone (not the owner's browser-only preview). */
export function usePublishedSkinId(): SkinId {
  return useSkinState().publishedId;
}

/**
 * Resolves the skin in force right now, in priority order:
 *   1. Owner's live preview (this browser only, via Owner Studio)
 *   2. The school's published skin in the database (real one-click publish)
 *   3. Whatever skin is baked into this build (theme.config.json)
 *
 * It also applies that skin's fonts, shape and (for a database-published skin) colours.
 */
export function useSkin(): SkinDefinition {
  const { previewId, explicit, publishedId, primary, accent } = useSkinState();
  const skin = getSkin(previewId ?? publishedId);

  useEffect(() => {
    applySkinTokens(skin);
    // While the owner is previewing, Owner Studio already set the colours.
    if (!previewId && !hasOwnerPreview() && explicit) {
      const p = primary ? normalizeHex(primary) : null;
      const a = accent ? normalizeHex(accent) : null;
      setColorVars({
        ...skin.colors,
        ...(p ? { primary: p } : {}),
        ...(a ? { accent: a } : {}),
      });
    }
  }, [skin.id, previewId, explicit, primary, accent]);

  return skin;
}

export interface PublishSkinArgs {
  schoolId: string;
  skin: SkinId;
  primary: string;
  accent: string;
  /** true when the app is running on real Supabase data, false for the local demo store */
  live: boolean;
  /** local demo mode only */
  saveLocal: (updates: { skin: SkinId; primary_color: string; secondary_color: string }) => void;
}

/**
 * Saves the skin for the school and reports the REAL outcome. In live mode it verifies
 * that the row was actually changed (Row Level Security silently updates 0 rows when
 * the signed-in account isn't allowed to).
 */
export async function publishSkinToSchool(
  args: PublishSkinArgs,
): Promise<{ ok: boolean; error?: string }> {
  const updates = {
    skin: args.skin,
    primary_color: args.primary,
    secondary_color: args.accent,
  };

  if (args.live) {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: 'Supabase se connection nahi hai.' };
    const { data, error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', args.schoolId)
      .select('id, skin');
    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) {
      return {
        ok: false,
        error:
          'Database ne save nahi karne diya. Publish sirf us school ke Admin account se hota hai jo sign-in hai.',
      };
    }
  } else {
    args.saveLocal(updates);
  }

  publishedOverride = {
    schoolId: args.schoolId,
    skin: args.skin,
    primary: args.primary,
    accent: args.accent,
  };
  return { ok: true };
}
