/**
 * Skin registry.
 *
 * A "theme" (see ./theme.ts) only changes COLOURS. A "skin" goes further: it
 * swaps the actual shell — header/navigation, the portal home layout,
 * typography and the shape language — so two schools running the same build
 * can look like completely different products.
 *
 * Skins are chosen by the OWNER at delivery time (Owner Studio -> Publish),
 * never by the school itself. There is deliberately no in-app school-facing
 * switcher.
 *
 * TO ADD A NEW SKIN: drop an entry in SKINS below with its own colours/fonts,
 * and optionally its own Header and Portal React components (see the
 * `highstar` entry for an example). Nothing else in the app needs to change
 * — App.tsx resolves whichever skin is published/previewed and renders that
 * skin's Header/Portal automatically, falling back to the shared Navbar /
 * DribbbleAppShell when a skin doesn't supply its own.
 */

import type { ComponentType } from 'react';
import { ThemeColors } from './theme';
import type { AppModule } from '../components/Navbar';
import { HighStarHeader } from '../components/highstar/HighStarHeader';
import { HighStarPortal } from '../components/highstar/HighStarPortal';
import { IdeasHeader, IdeasPortal, LeadingHeader, LeadingPortal } from '../components/skins/ReferenceSchoolSkins';

export type SkinId = 'imperial' | 'highstar' | 'ideas' | 'leading';

export interface SkinDefinition {
  id: SkinId;
  name: string;
  /** Short note for the owner when picking a skin at delivery time. */
  description: string;
  /** Colour palette shipped with this skin (the school can still be re-tinted). */
  colors: ThemeColors;
  /** Font stacks this skin uses, applied via CSS variables. */
  fonts: {
    /** Body / UI text. */
    sans: string;
    /** Headings & brand marks. */
    display: string;
  };
  /** Corner rounding language — "soft" = large radii, "sharp" = tighter, more corporate. */
  radius: 'soft' | 'sharp';
  /** This skin's own header + navigation. Falls back to the shared Navbar when omitted. */
  Header?: ComponentType<{ activeModule: AppModule; setActiveModule: (m: AppModule) => void }>;
  /** This skin's own portal/home screen. Falls back to the shared DribbbleAppShell when omitted. */
  Portal?: ComponentType<{ setActiveModule: (m: AppModule) => void }>;
}

export const SKINS: Record<SkinId, SkinDefinition> = {
  imperial: {
    id: 'imperial',
    name: 'Ideas Schooling System',
    description:
      'Warm crimson and gold with classic display type, rounded cards, and a traditional campus feel.',
    colors: {
      primary: '#8B0000',
      accent: '#D4AF37',
      ink: '#200E01',
      bg: '#FAF8F2',
      sand: '#EDE7C7',
    },
    fonts: {
      sans: "'Plus Jakarta Sans', sans-serif",
      display: "'Cinzel', serif",
    },
    radius: 'soft',
  },
  highstar: {
    id: 'highstar',
    name: 'High Star Public Secondary School',
    description:
      'Navy and gold with a crisp, modern secondary-school shell, compact navigation, and flat cards.',
    colors: {
      primary: '#0A2540',
      accent: '#F5B800',
      ink: '#041226',
      bg: '#F0F4F8',
      sand: '#E2E8F0',
    },
    fonts: {
      sans: "'Inter', sans-serif",
      display: "'Inter', sans-serif",
    },
    radius: 'sharp',
    Header: HighStarHeader,
    Portal: HighStarPortal,
  },
  ideas: {
    id: 'ideas',
    name: 'Ideas Schooling System',
    description:
      'Deep navy and school red, bold rounded cards and a focused parent/student dashboard. Based on the Ideas Schooling reference UI.',
    colors: {
      primary: '#0C1F38',
      accent: '#F02434',
      ink: '#0C1F38',
      bg: '#EDF2F7',
      sand: '#DCE5EF',
    },
    fonts: {
      sans: "'Plus Jakarta Sans', sans-serif",
      display: "'Montserrat', 'Plus Jakarta Sans', sans-serif",
    },
    radius: 'soft',
    Header: IdeasHeader,
    Portal: IdeasPortal,
  },
  leading: {
    id: 'leading',
    name: 'The Leading Schooling System',
    description:
      'A confident indigo and amber academic look with sharp cards and a contemporary, city-campus character.',
    colors: {
      primary: '#312E81',
      accent: '#F59E0B',
      ink: '#17134B',
      bg: '#F7F7FF',
      sand: '#E5E4FA',
    },
    fonts: {
      sans: "'Inter', sans-serif",
      display: "'Inter', sans-serif",
    },
    radius: 'sharp',
    Header: LeadingHeader,
    Portal: LeadingPortal,
  },
};

export const DEFAULT_SKIN: SkinId = 'imperial';

/** Owner's live skin preview, kept in this browser only (like the colour preview). */
export const SKIN_STORAGE_KEY = 'owner_skin_v1';
export const CUSTOM_SKINS_STORAGE_KEY = 'owner_custom_skins_v1';
export const ACTIVE_CUSTOM_SKIN_STORAGE_KEY = 'owner_active_custom_skin_v1';

export interface CustomSkin {
  id: string;
  name: string;
  baseSkin: SkinId;
  colors: ThemeColors;
}

export function readCustomSkins(): CustomSkin[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CUSTOM_SKINS_STORAGE_KEY) || '[]');
    return Array.isArray(raw)
      ? raw.filter((item): item is CustomSkin => item && typeof item.id === 'string' && typeof item.name === 'string' && isSkinId(item.baseSkin) && item.colors && typeof item.colors === 'object')
      : [];
  } catch {
    return [];
  }
}

export function saveCustomSkin(skin: CustomSkin): void {
  const skins = readCustomSkins().filter((item) => item.id !== skin.id);
  skins.unshift(skin);
  localStorage.setItem(CUSTOM_SKINS_STORAGE_KEY, JSON.stringify(skins));
}

export function readActiveCustomSkin(): CustomSkin | null {
  try {
    const id = localStorage.getItem(ACTIVE_CUSTOM_SKIN_STORAGE_KEY);
    return readCustomSkins().find((item) => item.id === id) ?? null;
  } catch {
    return null;
  }
}

export function clearActiveCustomSkin(): void {
  try {
    localStorage.removeItem(ACTIVE_CUSTOM_SKIN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isSkinId(v: unknown): v is SkinId {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(SKINS, v);
}

export function getSkin(id: unknown): SkinDefinition {
  return isSkinId(id) ? SKINS[id] : SKINS[DEFAULT_SKIN];
}

/** The active skin is also the visual product brand shown throughout the UI. */
export function getActiveSkin(): SkinDefinition {
  const id = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-skin') : null;
  const skin = getSkin(id);
  const custom = readActiveCustomSkin();
  return custom && custom.baseSkin === skin.id ? { ...skin, name: custom.name, colors: custom.colors } : skin;
}

/** Reads the owner's previewed skin, if any. */
export function readPreviewedSkinId(): SkinId | null {
  try {
    const v = localStorage.getItem(SKIN_STORAGE_KEY);
    return isSkinId(v) ? v : null;
  } catch {
    return null;
  }
}

/** Switches the skin live in this browser (owner preview only). */
export function applySkinPreview(id: SkinId): void {
  applySkinTokens(SKINS[id]);
  clearActiveCustomSkin();
  try {
    localStorage.setItem(SKIN_STORAGE_KEY, id);
  } catch {
    /* storage may be blocked; the live preview still works */
  }
}

export function applyCustomSkin(skin: CustomSkin): void {
  applySkinTokens(SKINS[skin.baseSkin]);
  try {
    localStorage.setItem(SKIN_STORAGE_KEY, skin.baseSkin);
    localStorage.setItem(ACTIVE_CUSTOM_SKIN_STORAGE_KEY, skin.id);
  } catch {
    /* preview remains active for this session */
  }
}

/** Drops the owner's skin preview so the published skin shows again. */
export function clearSkinPreview(): void {
  clearActiveCustomSkin();
  try {
    localStorage.removeItem(SKIN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** The text that goes into theme.config.json for a delivery. */
export function skinToJson(id: SkinId, colors?: Record<string, string>): string {
  const skin = SKINS[id];
  return JSON.stringify(
    { skin: id, name: skin.name, colors: colors ?? skin.colors },
    null,
    2,
  );
}

/**
 * Applies a skin's fonts and shape language to the document. Colours are
 * handled by theme.ts so an owner can still re-tint a skin per school.
 */
export function applySkinTokens(skin: SkinDefinition): void {
  const root = document.documentElement;
  root.style.setProperty('--t-font-sans', skin.fonts.sans);
  root.style.setProperty('--t-font-display', skin.fonts.display);
  root.style.setProperty('--t-radius-card', skin.radius === 'soft' ? '1.5rem' : '0.75rem');
  root.style.setProperty('--t-radius-pill', skin.radius === 'soft' ? '9999px' : '0.5rem');
  root.setAttribute('data-skin', skin.id);
}
