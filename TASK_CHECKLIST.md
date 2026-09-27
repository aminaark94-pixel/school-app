# School App — Owner/Admin Account System Rebuild — Task Checklist

Repo: https://github.com/aminaark94-pixel/school-app (branch: `main`, auto-deploys to Vercel prod)
Supabase project: `nyehfsqlvtxibqgbnmij` (org: lac5416ey@gmail.com)
Live URL: school-app-git-diary-realtime-test11-43d7.vercel.app

## Context / why
Owner (Raheel) sells this school-management app to different schools. Needed:
1. Emails should come from a recognizable brand name, and the subject/sender should show
   the specific school's "skin" name (not a fixed generic brand — different schools have
   different names).
2. Confirmation-email links were opening a stale cached build instead of the current deploy.
3. Public signup was completely open — anyone could self-register as **Admin**. Correct
   model: Owner creates School+Admin accounts (and sells access); Admin creates Teacher and
   Parent accounts for their own school only; Teacher/Parent can never self-register or see
   each other's credentials; Admin can view/reset (not "see forever") their staff's login
   info.

Decision: because schools+users all live in ONE shared Supabase project (multi-tenant,
`schools` table with a row per school), branded "From" name per email requires sending mail
ourselves (Gmail SMTP, dynamic display name = school name) instead of Supabase's single
global SMTP sender. This also structurally fixes #2, because admin-created accounts are
pre-confirmed — no confirmation-link/redirect flow at all.

NOTE: while investigating, found `CODEX_HANDOFF.md` in the repo and recent commits (Sep 26-27)
showing another AI/session already doing related hardening (removed "Admin" from the public
signup role dropdown, tightened the `get_current_user_role/school_id` RLS helper functions).
That work does NOT conflict with this checklist but always re-pull `main` before editing files
below, in case more changes landed since this doc was written.

## Status legend: [x] done  [ ] not started  [~] in progress

## A. Database (Supabase project nyehfsqlvtxibqgbnmij)
- [ ] A1. Migration: add `owner` role to `public.users.role` check constraint; make
      `school_id` nullable for owner rows only (CHECK enforces null iff role=owner)
- [ ] A2. Migration: DROP the `on_auth_user_created` trigger + `handle_new_auth_user()`
      function — it trusted client-supplied `role`/`school_id` from signup metadata, which
      is the root cause of #3. All account creation moves to a service-role Edge Function.
- [ ] A3. Migration: tighten RLS on `public.users` — remove "view all members in school" /
      "admin manage users" policies; replace with: owner sees all, admin sees own-school
      rows only, everyone sees their own row. No client INSERT/UPDATE/DELETE policies (all
      writes go through the Edge Function using the service role key).
- [ ] A4. Migration: tighten RLS on `public.schools` — remove public/anon SELECT (no more
      school picker on a public signup form); owner manages all rows; members can view own
      school; admin can still update own school's branding columns.
- [ ] A5. Bootstrap the Owner account directly in `auth.users` + `auth.identities` +
      `public.users` (raheel8work@gmail.com / password given in chat — NOT reproduced in
      this file). Verify login works after.
- [ ] A6. Decide fate of the 5 non-admin test/self-signup accounts already in `public.users`
      (4 teacher, 1 parent, all via the old open signup) — user has not confirmed
      delete-vs-keep yet, ask again or leave alone and mention it in the final summary.

## B. Backend logic — Supabase Edge Function
- [ ] B1. Deploy `manage-accounts` Edge Function (Deno). Actions:
      - `create_school_admin` (owner only): creates a `schools` row + an `admin` auth user
        (email/password set directly by owner, `email_confirm:true`, no confirmation email)
        + `public.users` row.
      - `create_staff` (admin only): creates a `teacher`/`parent` auth user for the caller's
        OWN `school_id` (taken server-side from the caller's own profile, never trusted from
        the request body) + `public.users` row.
      - `reset_password` (admin/owner, scoped to their own school unless owner): sets a new
        password via the Admin API.
      - `delete_account` (admin/owner, same scoping).
      Auth model: function reads the caller's JWT from the Authorization header, resolves
      their role+school_id server-side (service role client), and rejects anything the
      caller isn't allowed to do. Never trusts a client-supplied role or school_id for the
      *target* account except in the owner→create-school-admin case.
- [ ] B2. Email sending inside the function: written as an optional module. If
      `GMAIL_SENDER_USER` / `GMAIL_SENDER_APP_PASSWORD` secrets are present, send a branded
      email via Gmail SMTP with **From display name = that school's name** (this is what
      makes the "title show the skin name" requirement work) and body containing the new
      login email + password. If secrets are absent (current state — owner hasn't set up a
      sender Gmail yet), skip sending and just return the credentials in the API response so
      the Owner/Admin UI can display them once on-screen to copy/share manually.

## C. Frontend (React/Vite, `src/`)
- [ ] C1. `LoginScreen.tsx`: remove signup entirely — sign-in only, no role/school picker.
- [ ] C2. New Owner screen (extend or sit alongside `OwnerStudio.tsx`): create School + Admin
      form, list of schools with their admin(s).
- [ ] C3. New Admin "Team" screen (in `AdminDashboard.tsx`): create Teacher/Parent form,
      list of own-school staff (name, email, role), reset-password action, delete action.
      Shows generated password once right after creation/reset.
- [ ] C4. `authContext.tsx`: remove `signUp`; add owner-aware session handling; add helper to
      call the Edge Function with the current session's access token.
- [ ] C5. `App.tsx` / routing: route `role === 'owner'` to the new Owner screen.
- [ ] C6. `types/index.ts`: add `'owner'` to `UserRole`.

## D. Deploy & manual steps
- [ ] D1. Commit + push all of the above to `main` (Vercel auto-deploys prod from `main`).
- [ ] D2. Verify the new build on the live URL: old accounts still sign in, new owner login
      works, public signup is gone.
- [ ] D3. **Manual, user must do in Supabase Dashboard** (no API for this in the tools
      available): Authentication → Sign In / Providers → turn OFF "Allow new users to sign
      up", so even a direct API call can't self-register. Defense in depth on top of A2-A4.
- [ ] D4. **Manual, later, whenever owner sets up a sender Gmail**: Supabase Dashboard →
      Edge Functions → `manage-accounts` → Secrets → add `GMAIL_SENDER_USER` and
      `GMAIL_SENDER_APP_PASSWORD`. No code change needed — B2 already checks for these.
      (How to generate a Gmail App Password was already explained earlier in this chat: a
      dedicated Gmail account → enable 2-Step Verification → Google Account → Security →
      App Passwords.)

## E. How to change the owner password later (asked by user)
Two ways, either works:
1. In the app itself (once built): Owner logs in → Account/Settings → Change password
   (standard `supabase.auth.updateUser({ password })` call, needs the current session).
2. From Supabase Dashboard directly: Authentication → Users → find raheel8work@gmail.com →
   "..." menu → Reset password / set new password.
