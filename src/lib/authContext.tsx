import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './supabase';
import type { School, User, UserRole } from '../types';

export interface SchoolOption {
  id: string;
  name: string;
}

interface AuthContextValue {
  /** True when Supabase credentials are present. When false the app runs in local demo mode. */
  enabled: boolean;
  loading: boolean;
  session: Session | null;
  profile: User | null;
  school: School | null;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    schoolId: string;
    role: UserRole;
  }) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  listSchools: () => Promise<SchoolOption[]>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const enabled = isSupabaseConfigured();
  const [loading, setLoading] = useState(enabled);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfile = useCallback(async (activeSession: Session | null) => {
    const supabase = getSupabase();
    if (!supabase || !activeSession) {
      setProfile(null);
      setSchool(null);
      setProfileError(null);
      return;
    }

    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', activeSession.user.id)
      .maybeSingle();

    if (userError) {
      setProfileError(userError.message);
      setProfile(null);
      setSchool(null);
      return;
    }

    if (!userRow) {
      setProfileError(
        'Your login works, but no profile row exists in the users table for this account yet.'
      );
      setProfile(null);
      setSchool(null);
      return;
    }

    setProfileError(null);
    setProfile(userRow as User);

    const { data: schoolRow } = await supabase
      .from('schools')
      .select('*')
      .eq('id', (userRow as User).school_id)
      .maybeSingle();

    setSchool((schoolRow as School) ?? null);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!enabled || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      await loadProfile(data.session);
      if (!cancelled) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (cancelled) return;
      setSession(newSession);
      await loadProfile(newSession);
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [enabled, loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase is not configured.' };
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error ? { error: error.message } : {};
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(async (params) => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase is not configured.' };

    const { data, error } = await supabase.auth.signUp({
      email: params.email.trim(),
      password: params.password,
      options: {
        data: {
          full_name: params.fullName.trim(),
          school_id: params.schoolId,
          role: params.role,
        },
      },
    });

    if (error) return { error: error.message };
    // When email confirmation is on, Supabase returns a user but no session.
    return { needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
    setSchool(null);
    setProfileError(null);
  }, []);

  const listSchools = useCallback(async (): Promise<SchoolOption[]> => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase.from('schools').select('id, name').order('name');
    if (error || !data) return [];
    return data as SchoolOption[];
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session);
  }, [loadProfile, session]);

  const value: AuthContextValue = {
    enabled,
    loading,
    session,
    profile,
    school,
    profileError,
    signIn,
    signUp,
    signOut,
    listSchools,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>.');
  }
  return ctx;
}
