import React, { useEffect, useState } from 'react';
import { GraduationCap, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuth, SchoolOption } from '../../lib/authContext';
import type { UserRole } from '../../types';

type Mode = 'signin' | 'signup';

export function LoginScreen() {
  const { signIn, signUp, listSchools } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [schoolId, setSchoolId] = useState('');
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSchools().then((rows) => {
      if (cancelled) return;
      setSchools(rows);
      if (rows.length > 0) setSchoolId((current) => current || rows[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, [listSchools]);

  const handleSubmit = async () => {
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError('Email and password are both required.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!schoolId) {
        setError('Please select a school.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error: signInError } = await signIn(email, password);
        if (signInError) setError(signInError);
      } else {
        const result = await signUp({ email, password, fullName, schoolId, role });
        if (result.error) {
          setError(result.error);
        } else if (result.needsConfirmation) {
          setNotice(
            'Account created. Check your inbox for the confirmation email, then sign in below.'
          );
          setMode('signin');
        }
      }
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
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#FAF8F2] border border-[#EDE7C7] mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-bold transition ${
                mode === 'signin' ? 'bg-[#8B0000] text-[#FAF8F2]' : 'text-[#5B0202]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-bold transition ${
                mode === 'signup' ? 'bg-[#8B0000] text-[#FAF8F2]' : 'text-[#5B0202]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Create account
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className={labelClass} htmlFor="auth-full-name">Full name</label>
                <input
                  id="auth-full-name"
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ayesha Khan"
                  autoComplete="name"
                />
              </div>
            )}

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
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !busy) handleSubmit();
                }}
              />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className={labelClass} htmlFor="auth-school">School</label>
                  <select
                    id="auth-school"
                    className={inputClass}
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                  >
                    {schools.length === 0 && <option value="">No schools found</option>}
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="auth-role">Role</label>
                  <select
                    id="auth-role"
                    className={inputClass}
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <p className="rounded-2xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-red-800">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
                {notice}
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
              ) : mode === 'signin' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-[#5B0202]/70">
          Accounts and permissions are enforced by Supabase Row Level Security.
        </p>
      </div>
    </div>
  );
}
