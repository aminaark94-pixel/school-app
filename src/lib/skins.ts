/**
 * Skin registry.
 *
 * A "theme" (see ./theme.ts) only changes COLOURS. A "skin" goes further: it
 * swaps the actual shell — header/navigation style, the portal home layout,
 * typography and the shape language — so two schools running the same build
 * can look like completely different products.
 *
 * Skins are chosen by the OWNER at delivery time (theme.config.json ->
 * "skin"), never by the school itself. There is deliberately no in-app
 * school-facing switcher.
 */

import { ThemeColors } from './theme';

export type SkinId = 'imperial' | 'highstar';

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
}

export const SKINS: Record<SkinId, SkinDefinition> = {
  imperial: {
    id: 'imperial',
    name: 'Imperial Heritage',
    description:
      'Warm crimson & gold, serif display type, rounded cards. Reads as an established, traditional institution.',
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
    name: 'High Star Corporate',
    description:
      'Navy & gold, Inter throughout, tighter corners and flat cards. Reads as a modern, corporate secondary school.',
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
  },
};

export const DEFAULT_SKIN: SkinId = 'imperial';

export function isSkinId(v: unknown): v is SkinId {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(SKINS, v);
}

export function getSkin(id: unknown): SkinDefinition {
  return isSkinId(id) ? SKINS[id] : SKINS[DEFAULT_SKIN];
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
