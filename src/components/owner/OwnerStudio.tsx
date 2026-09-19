import React, { useEffect, useState } from 'react';
import {
  Palette,
  Lock,
  X,
  RotateCcw,
  Copy,
  Check,
  Eye,
  EyeOff,
  ClipboardPaste,
  ShieldCheck,
} from 'lucide-react';
import {
  THEME_KEYS,
  COLOR_LABELS,
  PRESETS,
  applyColors,
  clearOwnerTheme,
  hasOwnerPreview,
  readCurrentColors,
  normalizeHex,
  contrastRatio,
  themeToJson,
  parseThemeJson,
} from '../../lib/theme';
import type { ThemeColors, ThemeKey } from '../../lib/theme';

/**
 * Owner Studio: a private panel for the app owner (not linked anywhere in the UI).
 * Open it by adding #owner to the site address, e.g. https://your-site.vercel.app/#owner
 * It asks for a PIN that is set the first time and stored (hashed) in this browser only.
 * Changes are previewed live and saved in this browser; to publish them for a school,
 * copy the theme JSON into theme.config.json.
 */

const PIN_KEY = 'owner_pin_hash_v1';
const SESSION_KEY = 'owner_unlocked_v1';

const safeGet = (store: Storage, key: string): string | null => {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (store: Storage, key: string, value: string) => {
  try {
    store.setItem(key, value);
  } catch {
    /* ignore */
  }
};

const isOwnerHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  return h === 'owner';
};

async function hashPin(pin: string): Promise<string> {
  const text = 'school-owner:' + pin;
  if (window.crypto && window.crypto.subtle) {
    const data = new TextEncoder().encode(text);
    const buf = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return 'x' + btoa(text);
}

/* ------------------------------------------------------------------ */
/* PIN screen                                                          */
/* ------------------------------------------------------------------ */

const PinGate: React.FC<{
  stage: 'setup' | 'login';
  onDone: () => void;
  onClose: () => void;
}> = ({ stage, onDone, onClose }) => {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pin.length < 4) {
      setError('PIN kam az kam 4 characters ka rakhein.');
      return;
    }
    if (stage === 'setup' && pin !== confirm) {
      setError('Dono PIN match nahi kar rahe.');
      return;
    }
    setBusy(true);
    try {
      const hashed = await hashPin(pin);
      if (stage === 'setup') {
        safeSet(localStorage, PIN_KEY, hashed);
      } else if (hashed !== safeGet(localStorage, PIN_KEY)) {
        setError('PIN ghalat hai.');
        return;
      }
      safeSet(sessionStorage, SESSION_KEY, '1');
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-slate-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base">Owner Studio</h2>
              <p className="text-xs text-slate-500">Sirf aap ke liye</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {stage === 'setup'
            ? 'Pehli baar: apna PIN set karein. Ye sirf is browser mein save hota hai.'
            : 'Studio kholne ke liye apna PIN likhein.'}
        </p>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-400"
        />
        {stage === 'setup' && (
          <input
            type="password"
            inputMode="numeric"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="PIN dobara likhein"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-400"
          />
        )}

        {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition disabled:opacity-60"
        >
          {stage === 'setup' ? 'PIN set karein' : 'Kholein'}
        </button>
      </form>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Studio panel                                                        */
/* ------------------------------------------------------------------ */

const StudioPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [colors, setColors] = useState<ThemeColors>(() => readCurrentColors());
  const [drafts, setDrafts] = useState<ThemeColors>(() => readCurrentColors());
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [preview, setPreview] = useState<boolean>(() => hasOwnerPreview());

  const commit = (next: ThemeColors) => {
    setColors(next);
    applyColors(next);
    setPreview(true);
  };

  const pickColor = (key: ThemeKey, value: string) => {
    const hex = normalizeHex(value);
    if (!hex) return;
    setDrafts((d) => ({ ...d, [key]: hex }));
    commit({ ...colors, [key]: hex });
  };

  const typeColor = (key: ThemeKey, text: string) => {
    setDrafts((d) => ({ ...d, [key]: text }));
    const hex = normalizeHex(text);
    if (hex) commit({ ...colors, [key]: hex });
  };

  const usePreset = (next: ThemeColors) => {
    setDrafts(next);
    commit(next);
  };

  const reset = () => {
    clearOwnerTheme();
    const base = readCurrentColors();
    setColors(base);
    setDrafts(base);
    setPreview(false);
  };

  const copyJson = async () => {
    const text = themeToJson(colors);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const applyImport = () => {
    const parsed = parseThemeJson(importText);
    if (!parsed) {
      setImportError('JSON samajh nahi aaya. 5 colours (primary, accent, ink, bg, sand) hex mein chahiye.');
      return;
    }
    setImportError('');
    usePreset(parsed);
    setShowImport(false);
    setImportText('');
  };

  const lock = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    onClose();
  };

  const checks = [
    { label: 'Header / button text', a: colors.sand, b: colors.primary },
    { label: 'Body text on page', a: colors.ink, b: colors.bg },
    { label: 'Headings on white cards', a: colors.primary, b: '#FFFFFF' },
  ];

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-20 right-4 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xl hover:bg-slate-800 transition"
      >
        <Palette className="w-4 h-4" />
        <span>Studio</span>
      </button>
    );
  }

  return (
    <div className="fixed z-[100] bottom-0 left-0 right-0 md:left-auto md:top-0 md:w-[400px] max-h-[78vh] md:max-h-none flex flex-col bg-white text-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.25)] md:shadow-[-10px_0_40px_rgba(0,0,0,0.2)] rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-l border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Palette className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm">Owner Studio</h2>
            <p className="text-[11px] text-slate-500">Colour palette • sirf aap ke liye</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            title="Panel chhupayein aur poori site dekhein"
          >
            <EyeOff className="w-4 h-4" />
          </button>
          <button
            onClick={lock}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            title="Lock & close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto px-5 py-4 space-y-5">
        {/* Where changes live */}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed font-medium border ${
            preview
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {preview
            ? 'Preview mode: ye look sirf is browser mein hai. School ke sab users ko dikhane ke liye neeche "Copy theme JSON" karke theme.config.json mein daalna hoga.'
            : 'Abhi published look dikh raha hai (theme.config.json). Kuch bhi badlein to yahan preview shuru ho jata hai.'}
        </div>

        {/* Presets */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Ready-made palettes</h3>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => usePreset(p.colors)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-left transition"
              >
                <span className="flex -space-x-1 shrink-0">
                  {[p.colors.primary, p.colors.accent, p.colors.sand].map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-white ring-1 ring-slate-200"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
                <span className="text-[11px] font-bold leading-tight">{p.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Individual colours */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Fine-tune colours</h3>
          {THEME_KEYS.map((k) => (
            <div key={k} className="flex items-center gap-3">
              <input
                type="color"
                value={colors[k]}
                onChange={(e) => pickColor(k, e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0"
                aria-label={COLOR_LABELS[k].label}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">{COLOR_LABELS[k].label}</p>
                <p className="text-[11px] text-slate-500 leading-tight">{COLOR_LABELS[k].hint}</p>
              </div>
              <input
                type="text"
                value={drafts[k]}
                onChange={(e) => typeColor(k, e.target.value)}
                spellCheck={false}
                className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-slate-400"
              />
            </div>
          ))}
        </section>

        {/* Readability */}
        <section className="space-y-1.5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Readability check</h3>
          {checks.map((c) => {
            const ratio = contrastRatio(c.a, c.b);
            const good = ratio >= 4.5;
            const okBig = ratio >= 3;
            return (
              <div key={c.label} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">{c.label}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    good
                      ? 'bg-emerald-100 text-emerald-800'
                      : okBig
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {ratio.toFixed(1)} : 1 {good ? 'Good' : okBig ? 'Big text only' : 'Too low'}
                </span>
              </div>
            );
          })}
        </section>

        {/* Publish / import / reset */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Save for this school</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyJson}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy theme JSON'}</span>
            </button>
            <button
              onClick={() => setShowImport((v) => !v)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste JSON</span>
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset preview</span>
            </button>
          </div>

          {showImport && (
            <div className="space-y-2">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={5}
                placeholder='{ "colors": { "primary": "#1E3A8A", ... } }'
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-slate-400"
              />
              {importError && <p className="text-[11px] font-semibold text-rose-600">{importError}</p>}
              <button
                onClick={applyImport}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Apply
              </button>
            </div>
          )}

          <p className="text-[11px] text-slate-500 leading-relaxed flex gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
            <span>
              Ye PIN sirf ek halki lock hai (browser ke andar). Studio se hue changes ki wajah se doosre users ka look
              nahi badalta; woh sirf theme.config.json se aata hai.
            </span>
          </p>
        </section>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

type Stage = 'setup' | 'login' | 'studio';

const OwnerStudio: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [stage, setStage] = useState<Stage>(() =>
    safeGet(sessionStorage, SESSION_KEY) === '1'
      ? 'studio'
      : safeGet(localStorage, PIN_KEY)
        ? 'login'
        : 'setup'
  );

  if (stage === 'studio') return <StudioPanel onClose={onClose} />;
  return <PinGate stage={stage} onDone={() => setStage('studio')} onClose={onClose} />;
};

export const OwnerStudioGate: React.FC = () => {
  const [open, setOpen] = useState<boolean>(() => isOwnerHash());

  useEffect(() => {
    const onHash = () => setOpen(isOwnerHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (!open) return null;

  return (
    <OwnerStudio
      onClose={() => {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        setOpen(false);
      }}
    />
  );
};
