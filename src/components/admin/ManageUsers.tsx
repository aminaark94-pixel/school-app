import React, { useState } from 'react';
import { UserPlus, KeyRound, CheckCircle2, AlertTriangle, Users2, Loader2 } from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { getSupabase } from '../../lib/supabase';

async function callManageUsers(body: Record<string, unknown>): Promise<{ error?: string; success?: boolean }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase is not connected.' };
  const { data, error } = await supabase.functions.invoke('manage-users', { body });
  if (error) {
    // Edge Function errors carry the JSON body on error.context when available.
    const context = (error as { context?: { error?: string } }).context;
    return { error: context?.error || error.message || 'Request failed.' };
  }
  if (data?.error) return { error: data.error as string };
  return { success: true };
}

export const ManageUsers: React.FC = () => {
  const { usersInSchool, currentUser } = useSchoolData();

  // --- Create account form ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'parent'>('teacher');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreateError(null);
    setCreateSuccess(null);
    if (!fullName.trim() || !email.trim() || !password) {
      setCreateError('Full name, email and password are all required.');
      return;
    }
    if (password.length < 6) {
      setCreateError('Password must be at least 6 characters.');
      return;
    }
    setCreating(true);
    const result = await callManageUsers({
      action: 'create',
      full_name: fullName.trim(),
      email: email.trim(),
      password,
      role,
    });
    setCreating(false);
    if (result.error) {
      setCreateError(result.error);
      return;
    }
    setCreateSuccess(`Account created for ${fullName.trim()} — share the email and password with them directly.`);
    setFullName('');
    setEmail('');
    setPassword('');
  };

  // --- Reset password (inline per row) ---
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccessId, setResetSuccessId] = useState<string | null>(null);

  const handleResetPassword = async (userId: string) => {
    setResetError(null);
    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters.');
      return;
    }
    setResetBusy(true);
    const result = await callManageUsers({
      action: 'set_password',
      target_user_id: userId,
      new_password: newPassword,
    });
    setResetBusy(false);
    if (result.error) {
      setResetError(result.error);
      return;
    }
    setResettingId(null);
    setNewPassword('');
    setResetSuccessId(userId);
    setTimeout(() => setResetSuccessId(null), 3000);
  };

  const manageable = usersInSchool.filter((u) => u.role !== 'admin');

  const inputClass =
    'w-full min-h-[42px] rounded-xl border border-[#EDE7C7] bg-white px-3.5 py-2 text-sm text-[#200E01] focus:outline-hidden focus:ring-2 focus:ring-[#8B0000]';
  const labelClass = 'block text-[11px] font-bold uppercase tracking-wide text-[#5B0202]/80 mb-1.5';

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#EDE7C7]">
        <h3 className="text-base font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic text-xl">
          Teacher &amp; Parent Accounts
        </h3>
        <p className="text-xs text-[#5B0202]/70 mt-0.5">
          Public signup is disabled. Create logins here and share the email and password directly
          with the teacher or parent — they only need to sign in.
        </p>
      </div>

      {/* Create account */}
      <div className="bg-[#FAF8F2] border border-[#EDE7C7] rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#8B0000]" />
          <h4 className="text-sm font-bold text-[#200E01]">Create a new account</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Full name</label>
            <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ayesha Khan" />
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as 'teacher' | 'parent')}>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@example.com" />
          </div>
          <div>
            <label className={labelClass}>Temporary password</label>
            <input className={inputClass} type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
        </div>

        {createError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{createError}</span>
          </div>
        )}
        {createSuccess && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{createSuccess}</span>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000] transition disabled:opacity-60"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          <span>{creating ? 'Creating…' : 'Create account'}</span>
        </button>
      </div>

      {/* Existing accounts */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users2 className="w-4 h-4 text-[#8B0000]" />
          <h4 className="text-sm font-bold text-[#200E01]">Existing teacher &amp; parent accounts ({manageable.length})</h4>
        </div>

        {manageable.length === 0 ? (
          <p className="text-xs text-[#5B0202]/60 py-4">No teacher or parent accounts yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EDE7C7] divide-y divide-[#EDE7C7] overflow-hidden">
            {manageable.map((u) => (
              <div key={u.id} className="p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#200E01] truncate">{u.full_name}</div>
                    <div className="text-[11px] text-[#5B0202]/70 truncate">
                      {u.email} · <span className="capitalize">{u.role}</span>
                    </div>
                  </div>
                  {resetSuccessId === u.id ? (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Password updated
                    </span>
                  ) : (
                    u.id !== currentUser?.id && (
                      <button
                        onClick={() => {
                          setResettingId(resettingId === u.id ? null : u.id);
                          setResetError(null);
                          setNewPassword('');
                        }}
                        className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#8B0000] border border-[#8B0000]/30 hover:bg-[#FAF8F2] transition"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Reset password</span>
                      </button>
                    )
                  )}
                </div>

                {resettingId === u.id && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="New password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="min-w-0 flex-1 px-2.5 py-1.5 text-[11px] border border-[#EDE7C7] rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleResetPassword(u.id)}
                      disabled={resetBusy}
                      className="shrink-0 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-[#8B0000] text-white disabled:opacity-60"
                    >
                      {resetBusy ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => setResettingId(null)}
                      className="shrink-0 px-2 py-1.5 text-[11px] font-semibold text-[#5B0202]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {resettingId === u.id && resetError && (
                  <p className="text-[11px] font-semibold text-rose-700">{resetError}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
