import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
  isDemoMode: boolean;
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
  const profileRequest = useRef(0);

  const loadProfile = useCallback(async (activeSession: Session | null) => {
    const request = ++profileRequest.current;
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

    if (request !== profileRequest.current) return;
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

    const user = userRow as User;
    const { data: schoolRow, error: schoolError } = user.school_id ? await supabase
      .from('schools')
      .select('*')
      .eq('id', user.school_id)
      .maybeSingle() : { data: null, error: null };

    if (request !== profileRequest.current) return;
    if (schoolError) {
      setProfileError(schoolError.message);
      setProfile(null);
      setSchool(null);
      return;
    }
    setProfileError(null);
    setProfile(user);
    setSchool((schoolRow as School) ?? null);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!enabled || !supabase) {
      setLoading(false);
      return;
    }

    let activeUserId: string | null | undefined;
    let timer: number | undefined;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      const userId = newSession?.user.id ?? null;
      if (userId === activeUserId) return;
      activeUserId = userId;
      const request = ++profileRequest.current;
      window.clearTimeout(timer);
      setProfile(null);
      setSchool(null);
      setProfileError(null);
      setLoading(Boolean(newSession));
      if (!newSession) return;
      // Profile requests must run outside the auth callback's lock.
      timer = window.setTimeout(() => {
        void loadProfile(newSession)
          .catch(() => { if (activeUserId === userId && profileRequest.current === request + 1) setProfileError('Unable to load your school profile.'); })
          .finally(() => { if (activeUserId === userId && profileRequest.current === request + 1) setLoading(false); });
      }, 0);
    });

    return () => {
      profileRequest.current++;
      window.clearTimeout(timer);
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
    setLoading(true);
    const request = profileRequest.current + 1;
    try {
      await loadProfile(session);
    } catch {
      if (request === profileRequest.current) setProfileError('Unable to load your school profile.');
    } finally {
      if (request === profileRequest.current) setLoading(false);
    }
  }, [loadProfile, session]);

  const value: AuthContextValue = {
    enabled,
    isDemoMode: !enabled,
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
