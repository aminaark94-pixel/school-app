import React, { useState } from 'react';
import { GraduationCap, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../../lib/authContext';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are both required.');
      return;
    }

    setBusy(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) setError(signInError);
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full min-h-[48px] rounded-2xl border border-[#EDE7C7] bg-white px-4 py-3 text-base sm:text-sm text-[#200E01] outline-none focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/15';
  const labelClass = 'block text-[11px] font-bold uppercase tracking-wide text-[#5B0202]/80 mb-1.5';

  return (
    <div className="min-h-dvh bg-[#FAF8F2] text-[#200E01] flex items-start sm:items-center justify-center px-4 py-8 sm:p-4 font-['Plus_Jakarta_Sans',sans-serif] top-safe bottom-nav-safe">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#8B0000] flex items-center justify-center shadow-lg">
            <GraduationCap className="w-7 h-7 text-[#FAF8F2]" />
          </div>
          <h1 className="mt-4 text-2xl font-bold font-['Cormorant_Garamond',serif] italic">
            School Management Portal
          </h1>
          <p className="text-xs text-[#5B0202]/80 mt-1 font-medium">
            Sign in to access the diary, attendance, fees and report cards.
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-[#EDE7C7] shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-center gap-1.5 mb-5 pb-4 border-b border-[#EDE7C7]">
            <LogIn className="w-4 h-4 text-[#8B0000]" />
            <span className="text-xs font-bold text-[#5B0202] uppercase tracking-wide">Sign in</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                className={inputClass}
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                autoComplete="email"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                className={inputClass}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !busy) handleSubmit();
                }}
              />
            </div>

            {error && (
              <p className="rounded-2xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-red-800">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              className="w-full min-h-[48px] rounded-2xl bg-[#8B0000] py-3 text-sm font-bold text-[#FAF8F2] shadow-sm transition hover:bg-[#700000] active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Please wait…
                </span>
              ) : (
                'Sign in'
              )}
            </button>

            <p className="text-center text-[11px] text-[#5B0202]/70 pt-1">
              Don't have login details? Ask your school admin — accounts are created and
              managed by the school, not through public signup.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-[#5B0202]/70">
          Accounts and permissions are enforced by Supabase Row Level Security.
        </p>
      </div>
    </div>
  );
}
