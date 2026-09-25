/**
 * Owner theme helpers.
 *
 * The whole UI reads its colours from CSS variables (--t-primary, --t-accent, ...).
 * - Defaults live in index.html.
 * - The "published" look for a school lives in theme.config.json (baked into the page at build time).
 * - While the owner experiments in Owner Studio, the choice is kept in this browser only (localStorage)
 *   until it is copied into theme.config.json.
 */

export type ThemeKey = 'primary' | 'accent' | 'ink' | 'bg' | 'sand';
export type ThemeColors = Record<ThemeKey, string>;

export const THEME_KEYS: ThemeKey[] = ['primary', 'accent', 'ink', 'bg', 'sand'];

export const STORAGE_KEY = 'owner_theme_v1';

export const DEFAULT_COLORS: ThemeColors = {
  primary: '#8B0000',
  accent: '#D4AF37',
  ink: '#200E01',
  bg: '#FAF8F2',
  sand: '#EDE7C7',
};

export const COLOR_LABELS: Record<ThemeKey, { label: string; hint: string }> = {
  primary: { label: 'Main colour', hint: 'Header, buttons, headings' },
  accent: { label: 'Accent / trim', hint: 'Borders, highlights, small details' },
  ink: { label: 'Dark colour', hint: 'Text and dark bars' },
  bg: { label: 'Page background', hint: 'Behind all the cards' },
  sand: { label: 'Soft surface', hint: 'Chips, pills, light panels, header text' },
};

export const PRESETS: Array<{ id: string; name: string; colors: ThemeColors }> = [
  {
    id: 'premium',
    name: 'Premium Branding',
    colors: { primary: '#8B0000', accent: '#D4AF37', ink: '#200E01', bg: '#FAF8F2', sand: '#EDE7C7' },
  },
  {
    id: 'ideas',
    name: 'Ideas Schooling System',
    colors: { primary: '#0C1F38', accent: '#F02434', ink: '#0C1F38', bg: '#EDF2F7', sand: '#DCE5EF' },
  },
  {
    id: 'highstar',
    name: 'High Star Public Secondary School',
    colors: { primary: '#0A2540', accent: '#F5B800', ink: '#041226', bg: '#F0F4F8', sand: '#E2E8F0' },
  },
  {
    id: 'leading',
    name: 'The Leading Schooling System',
    colors: { primary: '#312E81', accent: '#F59E0B', ink: '#17134B', bg: '#F7F7FF', sand: '#E5E4FA' },
  },
];

/** Accepts "#abc", "abc", "#aabbcc", "aabbcc" and returns "#AABBCC" (or null when invalid). */
export function normalizeHex(input: string): string | null {
  let v = (input || '').trim();
  if (!v) return null;
  if (!v.startsWith('#')) v = '#' + v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  }
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : null;
}

/** Reads the colours that are currently active on the page (published look + any owner preview). */
export function readCurrentColors(): ThemeColors {
  const out: ThemeColors = { ...DEFAULT_COLORS };
  if (typeof window === 'undefined') return out;
  const cs = getComputedStyle(document.documentElement);
  for (const k of THEME_KEYS) {
    const v = normalizeHex(cs.getPropertyValue(`--t-${k}`));
    if (v) out[k] = v;
  }
  return out;
}

function setMetaThemeColor(color: string) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
}

/** Applies colours instantly and remembers them in this browser (owner preview). */
export function applyColors(colors: ThemeColors) {
  const root = document.documentElement;
  for (const k of THEME_KEYS) {
    root.style.setProperty(`--t-${k}`, colors[k]);
  }
  setMetaThemeColor(colors.primary);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ colors }));
  } catch {
    /* storage may be blocked; the live preview still works */
  }
}

/** Removes the owner preview so the published look (theme.config.json) shows again. */
export function clearOwnerTheme() {
  const root = document.documentElement;
  for (const k of THEME_KEYS) {
    root.style.removeProperty(`--t-${k}`);
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  setMetaThemeColor(readCurrentColors().primary);
}

export function hasOwnerPreview(): boolean {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two "#RRGGBB" colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** The text that goes into theme.config.json. */
export function themeToJson(colors: ThemeColors): string {
  return JSON.stringify({ colors }, null, 2);
}

/** Reads pasted JSON ({ "colors": {...} } or just the colours object). Returns null when invalid. */
export function parseThemeJson(text: string): ThemeColors | null {
  try {
    const raw = JSON.parse(text);
    const src = raw && typeof raw === 'object' && raw.colors ? raw.colors : raw;
    const out: ThemeColors = { ...DEFAULT_COLORS };
    for (const k of THEME_KEYS) {
      const v = typeof src?.[k] === 'string' ? normalizeHex(src[k]) : null;
      if (!v) return null;
      out[k] = v;
    }
    return out;
  } catch {
    return null;
  }
}
