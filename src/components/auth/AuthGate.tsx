import React from 'react';
import { Loader2, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { LoginScreen } from './LoginScreen';

/**
 * Wraps the application.
 *  - No Supabase credentials  -> the app runs exactly as before, on local demo data.
 *  - Credentials, no session  -> the login / signup screen.
 *  - Signed in                -> the app. The account details and the sign out
 *    button live in RoleSwitcherBar, so nothing is duplicated here.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { enabled, loading, session, profile, profileError, signOut } = useAuth();

  if (!enabled) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B0202]">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading your portal…
        </span>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white border border-[#EDE7C7] p-6 text-center shadow-sm">
          <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="mt-3 text-lg font-bold text-[#200E01]">Profile not linked</h2>
          <p className="mt-2 text-xs text-[#5B0202]/90 font-medium">
            {profileError ??
              'This account is not attached to a school yet, so there is nothing to show.'}
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#8B0000] px-4 py-2.5 text-xs font-bold text-[#FAF8F2]"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
