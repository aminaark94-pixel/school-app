import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

/**
 * Theme support
 * -------------
 * The UI was designed with a fixed palette (crimson / gold / cream...). Instead of editing every
 * component, the built CSS is rewritten so that each palette colour becomes a CSS variable
 * (--t-primary, --t-accent, ...). The variables get their values from:
 *   1. index.html (defaults),
 *   2. theme.config.json or the VITE_THEME_JSON env var (the look published for a school),
 *   3. Owner Studio (#owner), live, in the owner's own browser.
 * If a colour is not in the table below it simply stays as it was.
 */
const THEME_MAP: Record<string, string> = {
  '8b0000': 'var(--t-primary)',
  '700000': 'var(--t-primary-dark)',
  '5b0202': 'var(--t-primary-deep)',
  '200e01': 'var(--t-ink)',
  'ede7c7': 'var(--t-sand)',
  'faf8f2': 'var(--t-bg)',
  'd4af37': 'var(--t-accent)',
  'f8ebeb': 'var(--t-primary-tint)',
  'f3dddd': 'var(--t-primary-tint2)',
  'fdf9ee': 'var(--t-accent-tint)',
  'f9f0d9': 'var(--t-accent-tint2)',
  '2d1605': 'var(--t-ink-lift)',
  '3d1e07': 'var(--t-ink-lift2)',
};

// "#8b0000" or "#8b0000cc" (with alpha), but never inside the --t-* variable definitions themselves.
const THEME_RE = new RegExp(
  '(?<!--t-[a-z0-9-]+\\s*:\\s*)#(' + Object.keys(THEME_MAP).join('|') + ')([0-9a-f]{2})?(?![0-9a-f])',
  'gi',
);

function rewriteThemeColors(css: string): string {
  return css.replace(THEME_RE, (_match: string, hex: string, alpha?: string) => {
    const expr = THEME_MAP[hex.toLowerCase()];
    if (!alpha) return expr;
    const pct = Math.round((parseInt(alpha, 16) / 255) * 100);
    return `color-mix(in srgb, ${expr} ${pct}%, transparent)`;
  });
}

function themeVarsPlugin(): Plugin {
  return {
    name: 'theme-vars',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && file.fileName.endsWith('.css')) {
          const source =
            typeof file.source === 'string' ? file.source : Buffer.from(file.source).toString('utf8');
          file.source = rewriteThemeColors(source);
        }
      }
    },
  };
}

/** Injects the published look (theme.config.json or VITE_THEME_JSON) into the page, so there is no colour flash. */
function bakedThemePlugin(): Plugin {
  const keys = ['primary', 'accent', 'ink', 'bg', 'sand'];

  // Skin presets must mirror src/lib/skins.ts. Kept inline because this plugin
  // runs in Node at build time and cannot import the app's TS modules.
  const SKIN_PRESETS: Record<string, {colors: Record<string, string>; sans: string; display: string; radius: string}> = {
    imperial: {
      colors: {primary: '#8B0000', accent: '#D4AF37', ink: '#200E01', bg: '#FAF8F2', sand: '#EDE7C7'},
      sans: "'Plus Jakarta Sans', sans-serif",
      display: "'Cinzel', serif",
      radius: 'soft',
    },
    highstar: {
      colors: {primary: '#0A2540', accent: '#F5B800', ink: '#041226', bg: '#F0F4F8', sand: '#E2E8F0'},
      sans: "'Inter', sans-serif",
      display: "'Inter', sans-serif",
      radius: 'sharp',
    },
  };

  const readConfig = (): {colors: Record<string, string>; skin: string} => {
    try {
      const raw =
        process.env.VITE_THEME_JSON || fs.readFileSync(path.resolve(__dirname, 'theme.config.json'), 'utf8');
      const parsed = JSON.parse(raw);
      const skin = typeof parsed?.skin === 'string' && SKIN_PRESETS[parsed.skin] ? parsed.skin : 'imperial';
      // An explicit "colors" block always wins, so a skin can still be re-tinted
      // per school; otherwise fall back to the skin's own palette.
      const colors = parsed && parsed.colors ? parsed.colors : SKIN_PRESETS[skin].colors;
      return {colors, skin};
    } catch {
      return {colors: {}, skin: 'imperial'};
    }
  };

  return {
    name: 'baked-theme',
    transformIndexHtml() {
      const {colors, skin} = readConfig();
      const preset = SKIN_PRESETS[skin];
      const colorDecls = keys
        .filter((k) => /^#[0-9a-fA-F]{6}$/.test(colors[k] ?? ''))
        .map((k) => `--t-${k}:${colors[k]}`)
        .join(';');
      const skinDecls = [
        `--t-font-sans:${preset.sans}`,
        `--t-font-display:${preset.display}`,
        `--t-radius-card:${preset.radius === 'soft' ? '1.5rem' : '0.75rem'}`,
        `--t-radius-pill:${preset.radius === 'soft' ? '9999px' : '0.5rem'}`,
      ].join(';');
      const decls = [colorDecls, skinDecls].filter(Boolean).join(';');
      if (!decls) return;
      return [
        {
          tag: 'style',
          attrs: {id: 'theme-baked'},
          children: `:root{${decls}}`,
          injectTo: 'head' as const,
        },
        {
          tag: 'script',
          attrs: {id: 'skin-baked'},
          children: `document.documentElement.setAttribute('data-skin','${skin}');window.__SKIN__='${skin}';`,
          injectTo: 'head' as const,
        },
      ];
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      themeVarsPlugin(),
      bakedThemePlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'Multi-Tenant School Management',
          short_name: 'EduPortal',
          description: 'Multi-Tenant School Management System with Attendance, Fee Tracking & Report Cards',
          theme_color: '#1e3a8a',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
