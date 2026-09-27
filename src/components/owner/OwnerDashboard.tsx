import React, { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';

interface SchoolRow {
  id: string;
  name: string;
  created_at: string;
}

interface AdminRow {
  id: string;
  school_id: string;
  full_name: string;
  email: string;
}

async function callManageAccounts(body: Record<string, unknown>): Promise<{ error?: string; [key: string]: unknown }> {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase is not connected.' };
  const { data, error } = await supabase.functions.invoke('manage-accounts', { body });
  if (error) {
    const context = (error as { context?: { error?: string } }).context;
    return { error: context?.error || error.message || 'Request failed.' };
  }
  if (data?.error) return { error: data.error as string };
  return { ...(data || {}) };
}

const inputClass =
  'w-full min-h-[42px] rounded-xl border border-[#EDE7C7] bg-white px-3.5 py-2 text-sm text-[#200E01] focus:outline-hidden focus:ring-2 focus:ring-[#8B0000]';
const labelClass = 'block text-[11px] font-bold uppercase tracking-wide text-[#5B0202]/80 mb-1.5';

export const OwnerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoadError('Supabase is not connected.');
      setLoading(false);
      return;
    }
    setLoading(true);
    const [schoolsRes, usersRes] = await Promise.all([
      supabase.from('schools').select('id, name, created_at').order('created_at', { ascending: false }),
      supabase.from('users').select('id, school_id, full_name, email').eq('role', 'admin'),
    ]);
    if (schoolsRes.error) setLoadError(schoolsRes.error.message);
    else if (usersRes.error) setLoadError(usersRes.error.message);
    else setLoadError(null);
    setSchools((schoolsRes.data as SchoolRow[]) || []);
    setAdmins((usersRes.data as AdminRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // --- Create school + admin ---
  const [schoolName, setSchoolName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{ school_name: string; admin_email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setCreateError(null);
    setCreatedResult(null);
    if (!schoolName.trim() || !adminName.trim() || !adminEmail.trim()) {
      setCreateError('School name, admin full name and admin email are all required.');
      return;
    }
    setCreating(true);
    const result = await callManageAccounts({
      action: 'create_school_admin',
      school_name: schoolName.trim(),
      admin_full_name: adminName.trim(),
      admin_email: adminEmail.trim(),
      admin_password: adminPassword.trim() || undefined,
    });
    setCreating(false);
    if (result.error) {
      setCreateError(result.error as string);
      return;
    }
    setCreatedResult({
      school_name: schoolName.trim(),
      admin_email: (result.admin_email as string) || adminEmail.trim(),
      password: result.password as string,
    });
    setSchoolName('');
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    load();
  };

  const copyCredentials = async () => {
    if (!createdResult) return;
    const text = `Login email: ${createdResult.admin_email}\nPassword: ${createdResult.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  // --- Reset / delete admin accounts ---
  const [resetResult, setResetResult] = useState<{ id: string; password: string } | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  const handleResetPassword = async (userId: string) => {
    setRowError(null);
    setResetResult(null);
    setRowBusy(userId);
    const result = await callManageAccounts({ action: 'reset_password', user_id: userId });
    setRowBusy(null);
    if (result.error) {
      setRowError(result.error as string);
      return;
    }
    setResetResult({ id: userId, password: result.password as string });
  };

  const handleDelete = async (userId: string, label: string) => {
    if (!confirm(`Delete the admin account "${label}"? This cannot be undone.`)) return;
    setRowError(null);
    setRowBusy(userId);
    const result = await callManageAccounts({ action: 'delete_account', user_id: userId });
    setRowBusy(null);
    if (result.error) {
      setRowError(result.error as string);
      return;
    }
    load();
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#EDE7C7]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#8B0000]" />
          <h1 className="text-xl font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic">
            Owner Dashboard
          </h1>
        </div>
        <p className="text-xs text-[#5B0202]/70 mt-1">
          Signed in as {profile?.full_name || profile?.email}. Create a school and its admin
          account here, then share the login details with that school directly. Each admin
          manages their own teachers and parents from their own School Admin panel.
        </p>
      </div>

      {/* Create school + admin */}
      <div className="bg-[#FAF8F2] border border-[#EDE7C7] rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#8B0000]" />
          <h2 className="text-sm font-bold text-[#200E01]">Create a new school + admin</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>School name</label>
            <input className={inputClass} value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g. Beaconhouse North Campus" />
          </div>
          <div>
            <label className={labelClass}>Admin full name</label>
            <input className={inputClass} value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Ayesha Khan" />
          </div>
          <div>
            <label className={labelClass}>Admin email</label>
            <input className={inputClass} type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@school.edu" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Password (optional — leave blank to auto-generate)</label>
            <input className={inputClass} type="text" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
        </div>

        {createError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{createError}</span>
          </div>
        )}

        {createdResult && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>{createdResult.school_name} created. Share these login details with the admin:</p>
              <p className="font-mono">Email: {createdResult.admin_email}</p>
              <p className="font-mono">Password: {createdResult.password}</p>
              <button
                onClick={copyCredentials}
                className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-bold"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000] transition disabled:opacity-60"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          <span>{creating ? 'Creating…' : 'Create school + admin'}</span>
        </button>
      </div>

      {/* Schools + admins list */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-[#200E01]">Schools ({schools.length})</h2>
        {loadError && (
          <p className="text-xs font-semibold text-rose-700">Could not load schools: {loadError}</p>
        )}
        {rowError && <p className="text-xs font-semibold text-rose-700">{rowError}</p>}
        {loading ? (
          <p className="text-xs text-[#5B0202]/60 py-4">Loading…</p>
        ) : schools.length === 0 ? (
          <p className="text-xs text-[#5B0202]/60 py-4">No schools yet — create one above.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EDE7C7] divide-y divide-[#EDE7C7] overflow-hidden">
            {schools.map((s) => {
              const schoolAdmins = admins.filter((a) => a.school_id === s.id);
              return (
                <div key={s.id} className="p-3.5 space-y-2">
                  <div className="text-sm font-bold text-[#200E01]">{s.name}</div>
                  {schoolAdmins.length === 0 ? (
                    <p className="text-[11px] text-[#5B0202]/60">No admin account for this school yet.</p>
                  ) : (
                    schoolAdmins.map((a) => (
                      <div key={a.id} className="flex items-center justify-between gap-3 pl-2 border-l-2 border-[#EDE7C7]">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#200E01] truncate">{a.full_name}</div>
                          <div className="text-[11px] text-[#5B0202]/70 truncate">{a.email}</div>
                          {resetResult?.id === a.id && (
                            <div className="mt-1 text-[11px] font-mono text-emerald-700">
                              New password: {resetResult.password}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleResetPassword(a.id)}
                            disabled={rowBusy === a.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#8B0000] border border-[#8B0000]/30 hover:bg-[#FAF8F2] transition disabled:opacity-60"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                          <button
                            onClick={() => handleDelete(a.id, a.full_name)}
                            disabled={rowBusy === a.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-rose-700 border border-rose-200 hover:bg-rose-50 transition disabled:opacity-60"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
