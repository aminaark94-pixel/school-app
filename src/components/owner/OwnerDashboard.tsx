import React, { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Database,
  Sparkles,
  Server,
  Layers,
  ArrowRight,
  Settings2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';
import { useSchoolData } from '../../hooks/useSchoolData';
import { LocalStore, SchoolSupabaseConfig } from '../../lib/storage';
import { DemoDataManager } from '../admin/DemoDataManager';
import { School, UserRole } from '../../types';
import { SkinId } from '../../lib/skins';

interface SchoolRow {
  id: string;
  name: string;
  created_at: string;
  skin?: string;
  motto?: string;
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
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === 'function') {
      try {
        const parsed = await context.json();
        if (parsed?.error) return { error: parsed.error as string };
      } catch {
        /* context wasn't JSON */
      }
    }
    return { error: error.message || 'Request failed.' };
  }
  if (data?.error) return { error: data.error as string };
  return { ...(data || {}) };
}

const inputClass =
  'w-full min-h-[42px] rounded-xl border border-[#EDE7C7] bg-white px-3.5 py-2 text-sm text-[#200E01] focus:outline-hidden focus:ring-2 focus:ring-[#8B0000]';
const labelClass = 'block text-[11px] font-bold uppercase tracking-wide text-[#5B0202]/80 mb-1.5';

const AVAILABLE_SKINS: Array<{ id: SkinId; name: string; desc: string }> = [
  { id: 'imperial', name: 'Imperial Crimson', desc: 'Aitchisonian classical look, crimson & gold' },
  { id: 'highstar', name: 'High Star Navy', desc: 'Navy & yellow modern public school shell' },
  { id: 'ideas', name: 'Ideas Red & Navy', desc: 'Bold navy & vibrant red parent/student portal' },
  { id: 'leading', name: 'Leading Indigo', desc: 'Contemporary indigo & amber city campus character' },
];

export const OwnerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const {
    schools: localSchools,
    currentSchool,
    setCurrentSchoolId,
    importSchoolDemoData,
    purgeSchoolData,
    allStudents,
  } = useSchoolData();

  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [, setLoading] = useState(false);
  const [, setLoadError] = useState<string | null>(null);

  // Per-school Supabase configs
  const [dbConfigs, setDbConfigs] = useState<Record<string, SchoolSupabaseConfig>>({});
  const [activeConfigSchoolId, setActiveConfigSchoolId] = useState<string | null>(null);
  const [dbUrlInput, setDbUrlInput] = useState('');
  const [dbKeyInput, setDbKeyInput] = useState('');
  const [dbShowKey, setDbShowKey] = useState(false);
  const [dbSaveNotice, setDbSaveNotice] = useState<string | null>(null);

  // --- Load Data (Remote if connected, Local otherwise) ---
  const load = useCallback(async () => {
    const configs = LocalStore.getSchoolSupabaseConfigs();
    setDbConfigs(configs);

    const supabase = getSupabase();
    if (!supabase) {
      // Local fallback
      const ls = LocalStore.getSchools();
      const users = LocalStore.getUsers().filter((u) => u.role === 'admin');
      setSchools(
        ls.map((s) => ({
          id: s.id,
          name: s.name,
          created_at: s.created_at,
          skin: s.skin,
          motto: s.motto,
        }))
      );
      setAdmins(
        users.map((u) => ({
          id: u.id,
          school_id: u.school_id || '',
          full_name: u.full_name,
          email: u.email,
        }))
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    const [schoolsRes, usersRes] = await Promise.all([
      supabase.from('schools').select('id, name, created_at, skin').order('created_at', { ascending: false }),
      supabase.from('users').select('id, school_id, full_name, email').eq('role', 'admin'),
    ]);
    if (schoolsRes.error) {
      setLoadError(schoolsRes.error.message);
      // Fallback to local
      const ls = LocalStore.getSchools();
      setSchools(ls);
    } else {
      setLoadError(null);
      setSchools((schoolsRes.data as SchoolRow[]) || []);
      setAdmins((usersRes.data as AdminRow[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // --- Create School Form State ---
  const [schoolName, setSchoolName] = useState('');
  const [schoolMotto, setSchoolMotto] = useState('');
  const [selectedSkin, setSelectedSkin] = useState<SkinId>('highstar');
  const [primaryColor, setPrimaryColor] = useState('#0A2540');
  const [secondaryColor, setSecondaryColor] = useState('#F5B800');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [autoPopulateDemo, setAutoPopulateDemo] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    school_name: string;
    admin_email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreateError(null);
    setCreatedResult(null);
    setActionSuccessNotice(null);

    if (!schoolName.trim() || !adminName.trim() || !adminEmail.trim()) {
      setCreateError('School name, admin full name and admin email are all required.');
      return;
    }

    setCreating(true);

    const supabase = getSupabase();
    if (supabase) {
      // Remote Supabase creation
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
    } else {
      // LocalStore creation
      const slug = schoolName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 20);
      const newSchoolId = `school-${slug}-${Date.now().toString().slice(-4)}`;

      const newSchool: School = {
        id: newSchoolId,
        name: schoolName.trim(),
        motto: schoolMotto.trim() || 'Excellence in Academics & Character',
        logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        skin: selectedSkin,
        created_at: new Date().toISOString(),
      };

      const existingSchools = LocalStore.getSchools();
      LocalStore.saveSchools([...existingSchools, newSchool]);

      const newAdmin = {
        id: `user-admin-${newSchoolId}`,
        school_id: newSchoolId,
        full_name: adminName.trim(),
        role: 'admin' as UserRole,
        email: adminEmail.trim(),
        created_at: new Date().toISOString(),
      };
      const existingUsers = LocalStore.getUsers();
      LocalStore.saveUsers([...existingUsers, newAdmin]);

      if (autoPopulateDemo) {
        importSchoolDemoData(newSchoolId, newSchool.name);
      }

      setCreatedResult({
        school_name: schoolName.trim(),
        admin_email: adminEmail.trim(),
        password: adminPassword.trim() || 'SchoolAdmin123!',
      });
      setCreating(false);
    }

    setSchoolName('');
    setSchoolMotto('');
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

  const handlePurgeSchool = (schoolId: string, schoolNameStr: string) => {
    if (!confirm(`Purge all scholars and demo data for "${schoolNameStr}"?`)) return;
    purgeSchoolData(schoolId);
    setActionSuccessNotice(`Cleared all demo scholars and records for ${schoolNameStr}.`);
    load();
  };

  const handleOpenDbConfig = (schoolId: string) => {
    setActiveConfigSchoolId(schoolId);
    const existing = dbConfigs[schoolId];
    setDbUrlInput(existing?.url || '');
    setDbKeyInput(existing?.anon_key || '');
    setDbSaveNotice(null);
  };

  const handleSaveDbConfig = () => {
    if (!activeConfigSchoolId) return;
    LocalStore.saveSchoolSupabaseConfig(activeConfigSchoolId, {
      url: dbUrlInput.trim(),
      anon_key: dbKeyInput.trim(),
      enabled: Boolean(dbUrlInput.trim() && dbKeyInput.trim()),
    });
    setDbConfigs(LocalStore.getSchoolSupabaseConfigs());
    setDbSaveNotice('Database connection saved successfully for this school!');
    setTimeout(() => {
      setDbSaveNotice(null);
      setActiveConfigSchoolId(null);
    }, 1500);
  };

  const handleRemoveDbConfig = (schoolId: string) => {
    LocalStore.removeSchoolSupabaseConfig(schoolId);
    setDbConfigs(LocalStore.getSchoolSupabaseConfigs());
  };

  return (
    <div className="space-y-6">
      {/* Platform Owner Header */}
      <div className="pb-4 border-b border-[#EDE7C7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#8B0000]" />
              <h1 className="text-2xl font-bold text-[#200E01] font-['Cinzel',serif]">
                SaaS Owner Administration
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-[#5B0202]/70 mt-1 max-w-2xl">
              You are signed in as the SaaS Platform Seller ({profile?.full_name || profile?.email || 'Platform Owner'}).
              Manage all client institutions, configure dedicated Supabase database projects per school, issue school admin
              credentials, and inject realistic demonstration packages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8B0000]/10 text-[#8B0000] border border-[#8B0000]/20">
              <Layers className="w-3.5 h-3.5" />
              {schools.length} Active Schools
            </span>
          </div>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
          <button onClick={() => setActionSuccessNotice(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. All Client Institutions (Multi-Tenant Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#200E01] font-['Cinzel',serif]">
              Registered Institutions ({schools.length})
            </h2>
            <p className="text-[11px] text-[#5B0202]/70">
              Each school operates with complete data isolation, its own branding theme, and optional dedicated Supabase database.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools.map((s) => {
            const schoolAdmins = admins.filter((a) => a.school_id === s.id);
            const studentCount = allStudents.filter((std) => std.school_id === s.id).length;
            const dbConfig = dbConfigs[s.id];
            const hasDedicatedDb = dbConfig && dbConfig.enabled && dbConfig.url;
            const isCurrent = currentSchool?.id === s.id;

            return (
              <div
                key={s.id}
                className={`bg-white rounded-3xl border p-5 space-y-4 transition shadow-xs ${
                  isCurrent ? 'border-[#8B0000] ring-2 ring-[#8B0000]/20' : 'border-[#EDE7C7] hover:border-[#D4AF37]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#200E01] truncate">{s.name}</h3>
                      {isCurrent && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-[#8B0000]">
                          Active View
                        </span>
                      )}
                    </div>
                    {s.motto && <p className="text-[11px] text-[#5B0202]/60 truncate italic mt-0.5">{s.motto}</p>}
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{s.id}</p>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    Skin: {s.skin || 'imperial'}
                  </span>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    {studentCount} Scholars
                  </span>

                  {hasDedicatedDb ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px]">
                      <Server className="w-3 h-3 text-emerald-600" />
                      Dedicated Supabase DB
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-medium text-[11px]">
                      <Database className="w-3 h-3 text-slate-400" />
                      Shared / Local Store
                    </span>
                  )}
                </div>

                {/* Admins */}
                <div className="space-y-1.5 pt-2 border-t border-[#EDE7C7]/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B0202]/60">School Administration:</span>
                  {schoolAdmins.length === 0 ? (
                    <p className="text-[11px] text-[#5B0202]/60 italic">No admin assigned yet.</p>
                  ) : (
                    schoolAdmins.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-xs bg-[#FAF8F2] p-2 rounded-xl">
                        <div className="min-w-0">
                          <span className="font-bold text-[#200E01] block truncate">{a.full_name}</span>
                          <span className="text-[11px] text-[#5B0202]/70 font-mono block truncate">{a.email}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EDE7C7]/60">
                  <button
                    onClick={() => setCurrentSchoolId(s.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8B0000] text-white hover:bg-[#700000] transition shadow-2xs"
                  >
                    <span>View Campus</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      const stats = importSchoolDemoData(s.id, s.name);
                      setActionSuccessNotice(
                        `Populated 26 scholars, 8 diary lessons, 26 fee vouchers & result cards for ${s.name}!`
                      );
                      load();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-900 border border-amber-500/30 hover:bg-amber-500/20 transition"
                  >
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>Load 26 Demo</span>
                  </button>

                  <button
                    onClick={() => handleOpenDbConfig(s.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 transition"
                  >
                    <Settings2 className="w-3 h-3 text-slate-600" />
                    <span>DB Config</span>
                  </button>

                  <button
                    onClick={() => handlePurgeSchool(s.id, s.name)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 border border-rose-200 hover:bg-rose-50 transition ml-auto"
                    title="Purge scholars for this school"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Dedicated Database Configuration Modal / Drawer */}
      {activeConfigSchoolId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EDE7C7] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE7C7]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#8B0000]" />
                <h3 className="text-base font-bold text-[#200E01]">
                  Dedicated Supabase Project Configuration
                </h3>
              </div>
              <button
                onClick={() => setActiveConfigSchoolId(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5B0202]/70">
              Configure a dedicated, independent Supabase project for <b>{schools.find((s) => s.id === activeConfigSchoolId)?.name}</b>.
              When enabled, all student rosters, diaries, fees, and chat queries for this school will route to its private database instead of the shared pool.
            </p>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>Supabase Project URL</label>
                <input
                  className={inputClass}
                  value={dbUrlInput}
                  onChange={(e) => setDbUrlInput(e.target.value)}
                  placeholder="https://your-school-project.supabase.co"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-[#5B0202]/80">
                    Supabase Anon / Public Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setDbShowKey(!dbShowKey)}
                    className="text-[11px] text-[#8B0000] font-bold inline-flex items-center gap-1"
                  >
                    {dbShowKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {dbShowKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  className={inputClass}
                  type={dbShowKey ? 'text' : 'password'}
                  value={dbKeyInput}
                  onChange={(e) => setDbKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
              </div>
            </div>

            {dbSaveNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                {dbSaveNotice}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#EDE7C7]">
              {dbConfigs[activeConfigSchoolId]?.enabled ? (
                <button
                  onClick={() => handleRemoveDbConfig(activeConfigSchoolId)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                >
                  Disconnect DB
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveConfigSchoolId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDbConfig}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000] transition shadow-xs"
                >
                  Save Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Register New School + Admin Form */}
      <div className="bg-[#FAF8F2] border border-[#EDE7C7] rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#8B0000]" />
          <div>
            <h2 className="text-base font-bold text-[#200E01] font-['Cinzel',serif]">
              Onboard New School Client
            </h2>
            <p className="text-xs text-[#5B0202]/70">
              Instantly create a new school tenant with selected theme branding, admin account credentials, and pre-loaded demonstration data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>School Name *</label>
            <input
              className={inputClass}
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Crescent Model Higher Secondary School"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>School Motto / Academic Tagline</label>
            <input
              className={inputClass}
              value={schoolMotto}
              onChange={(e) => setSchoolMotto(e.target.value)}
              placeholder="e.g. Learn & Serve with Pride • Knowledge is Light"
            />
          </div>

          <div>
            <label className={labelClass}>Select Campus Skin / Shell Theme</label>
            <select
              className={inputClass}
              value={selectedSkin}
              onChange={(e) => setSelectedSkin(e.target.value as SkinId)}
            >
              {AVAILABLE_SKINS.map((skin) => (
                <option key={skin.id} value={skin.id}>
                  {skin.name} — ({skin.desc})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-12 rounded-lg border border-[#EDE7C7] cursor-pointer"
                />
                <input
                  className={inputClass}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-12 rounded-lg border border-[#EDE7C7] cursor-pointer"
                />
                <input
                  className={inputClass}
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>School Administrator Full Name *</label>
            <input
              className={inputClass}
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Principal Dr. Salman Farooqui"
            />
          </div>

          <div>
            <label className={labelClass}>Administrator Email *</label>
            <input
              className={inputClass}
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@school.edu.pk"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Admin Password (optional — leave blank to auto-generate)</label>
            <input
              className={inputClass}
              type="text"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoDemoCheck"
              checked={autoPopulateDemo}
              onChange={(e) => setAutoPopulateDemo(e.target.checked)}
              className="h-4 w-4 rounded text-[#8B0000] focus:ring-[#8B0000]"
            />
            <label htmlFor="autoDemoCheck" className="text-xs font-bold text-[#200E01] cursor-pointer">
              Auto-generate 26 demo scholars (Class 10 O-Levels, Class 9 Matric, Grade 8, Grade 5 with fees, diary & results)
            </label>
          </div>
        </div>

        {createError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{createError}</span>
          </div>
        )}

        {createdResult && (
          <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-700" />
            <div className="space-y-1.5 flex-1">
              <p className="font-bold">
                🎉 {createdResult.school_name} onboarded successfully! Share these credentials with the school admin:
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 font-mono text-xs space-y-0.5">
                <p>Email: <span className="font-bold text-emerald-950">{createdResult.admin_email}</span></p>
                <p>Password: <span className="font-bold text-emerald-950">{createdResult.password}</span></p>
              </div>
              <button
                onClick={copyCredentials}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Credentials'}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000] transition disabled:opacity-60 shadow-xs"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          <span>{creating ? 'Creating Institution…' : 'Onboard Institution + Admin'}</span>
        </button>
      </div>

      {/* 4. Demonstration & Sample Data Operations Center */}
      <DemoDataManager />
    </div>
  );
};
