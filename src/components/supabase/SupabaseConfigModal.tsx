import React, { useState } from 'react';
import { Database, Key, CheckCircle2, AlertTriangle, ExternalLink, X, Save, ShieldCheck } from 'lucide-react';
import { getSupabaseCredentials, saveCustomSupabaseConfig, isSupabaseConfigured, getSupabase } from '../../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const initial = getSupabaseCredentials();
  const [url, setUrl] = useState(initial.url);
  const [key, setKey] = useState(initial.key);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSave = () => {
    saveCustomSupabaseConfig(url, key);
    setTestStatus('idle');
    setTestMessage('Configuration saved! Re-checking connection...');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging Supabase REST endpoint...');
    try {
      if (!url || !key) {
        throw new Error('Please enter both Supabase URL and Anon Key');
      }
      const client = getSupabase();
      if (!client) {
        throw new Error('Unable to construct Supabase client. Check URL format.');
      }
      const { data, error } = await client.from('schools').select('id, name').limit(1);
      if (error) {
        // Even if table doesn't exist yet, connection might still be valid
        if (error.code === '42P01') {
          setTestStatus('success');
          setTestMessage('Connected to Supabase! (Tables need to be created via SQL migration).');
          return;
        }
        throw new Error(error.message);
      }
      setTestStatus('success');
      setTestMessage(`Connection Verified! Received response from Supabase successfully.`);
    } catch (err: unknown) {
      setTestStatus('error');
      setTestMessage(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Supabase Connection Settings</h3>
              <p className="text-xs text-slate-300">
                PostgreSQL Database, Supabase Auth & Multi-Tenant RLS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
              isConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {isConfigured ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {isConfigured ? 'Supabase Credentials Configured' : 'Offline / In-Browser Reactive Engine Active'}
              </div>
              <p className="mt-0.5 text-slate-600">
                {isConfigured
                  ? 'App is configured to sync with your remote Supabase PostgreSQL database.'
                  : 'Currently running on local persistence with multi-tenant data, attendance, fee locks, and report cards. You can connect your live Supabase project below anytime.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Supabase Project URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://xyzprojectid.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Found in Supabase Dashboard → Project Settings → API → Project URL
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Supabase Anon / Public API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Found in Supabase Dashboard → Project Settings → API → anon public key
              </p>
            </div>
          </div>

          {testMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : testStatus === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {testMessage}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={handleTestConnection}
              disabled={!url || !key || testStatus === 'testing'}
              className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition disabled:opacity-50"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                <Save className="w-3.5 h-3.5" />
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
