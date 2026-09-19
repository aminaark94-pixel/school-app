import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getStoredSupabaseConfig = () => {
  if (typeof window === 'undefined') return { url: '', key: '' };
  const customUrl = localStorage.getItem('supabase_custom_url');
  const customKey = localStorage.getItem('supabase_custom_key');
  return {
    url: customUrl || (import.meta.env.VITE_SUPABASE_URL as string) || '',
    key: customKey || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
  };
};

let clientInstance: SupabaseClient | null = null;
let currentConfigKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key || !url.startsWith('http')) {
    return null;
  }
  const configKey = `${url}:::${key}`;
  if (!clientInstance || currentConfigKey !== configKey) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      currentConfigKey = configKey;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return clientInstance;
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getStoredSupabaseConfig();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
}

export function saveCustomSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('supabase_custom_url', url.trim());
      localStorage.setItem('supabase_custom_key', key.trim());
    } else {
      localStorage.removeItem('supabase_custom_url');
      localStorage.removeItem('supabase_custom_key');
    }
    clientInstance = null;
  }
}

export function getSupabaseCredentials(): { url: string; key: string } {
  return getStoredSupabaseConfig();
}
