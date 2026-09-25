# School App — Codex Handoff

Last updated: 2026-09-25

## What has been implemented

### Skin system

- Built-in skins: `ideas`, `highstar`, `leading`, and the original maroon/gold look renamed **Premium Branding** in palette labels.
- Skin selection changes the header, portal/home shell, colours, fonts, corner style, shadows, gradients, and shared legacy module colour utilities.
- The active skin name is used in key portal locations: header/home, admin heading, footer, datesheet, report card heading/watermark/seal, and PDF filename.
- Owner Studio is opened using `#owner` and has a browser-local PIN lock.
- Owner Studio supports saved **Custom School Skins**: custom name + five colours + a selected base layout. Custom skins are stored in browser localStorage and shown in the Owner Studio saved list.
- Custom skin base layouts are explicitly selectable: Ideas, High Star, Leading, or Premium/Imperial.

### Roles and permissions (local demo)

- Admin only sees the Admin module.
- Teacher cannot access the Admin module.
- Parent cannot access the Admin module.
- Parent attendance is read-only: only linked child/children are shown; no Present/Absent/Late controls, no save buttons, and no absence-alert controls.
- Teacher/Admin can record attendance.
- Removed the attendance absence-alert UI section and sales-style copy mentioning parent alerts.

### Admin and branding

- Removed SQL/database schema UI from school Admin dashboard. Database tooling must remain platform-owner-only.
- Admin tab is **School Branding**.
- Admin page heading uses selected skin name, e.g. `The Leading Schooling System Administration`.
- Branding color presets are exactly:
  - Ideas Schooling System
  - High Star Public Secondary School
  - The Leading Schooling System
  - Premium Branding (old maroon/gold)

### Report cards

- Mid-term and final-term selection no longer silently falls back to the other term. If no result exists for the chosen term, an explicit empty state is displayed.
- A report-card designer is intentionally NOT implemented yet; this is a future feature.

## Important current limitations

1. Custom skins are local browser data only (`localStorage`). They are not published/shared with other devices or users yet.
2. Built-in skin shell/home layouts differ, but Diary, Attendance, Results, Notices, Datesheets, and Admin still reuse common component structures. They receive the active skin visual system (palette/font/shape/shadows), but are not unique page-by-page layouts for every skin.
3. Real multi-user authentication, account approval, parent-child assignment, shared data, and owner-wide publishing require Supabase/database setup.
4. Current role switching at localhost is demo-mode only; it is not real login.
5. Some internal comments/data structures may still use old terms such as `Imperial` or `absence alerts`, but end-user attendance UI copy was cleaned up.

## How to test locally

1. Run `npm run dev` (or `run.bat`) and open `http://localhost:3000`.
2. Use role buttons in local demo mode:
   - Admin: school administration and branding.
   - Teacher: teaching modules and editable attendance.
   - Parent: read-only attendance for linked child/children.
3. Open `http://localhost:3000/#owner` for Owner Studio. Set/enter the browser-local PIN.
4. To create a custom skin:
   - Choose/tune colours.
   - Enter a custom school skin name.
   - Select a Base layout.
   - Click `Save & preview custom skin`.
5. Use hard refresh (`Ctrl + Shift + R`) if PWA/browser cache shows old CSS.

## Build verification

`npm run build` passes as of this handoff.

`npm run lint` currently has three pre-existing TypeScript generic constraint errors in:

- `src/lib/alertStore.ts`
- `src/lib/datesheetStore.ts`
- `src/lib/noticeStore.ts`

These are unrelated to the recent skin/role/UI work.

## Deployment / Git status

- Git remote: `https://github.com/aminaark94-pixel/school-app.git`
- Branch: `main`
- The repository does not include Vercel/Netlify deployment configuration. A Git push alone does not make the application live unless a hosting provider is already connected externally.
- Do not commit `node_modules/`, `dev-dist/`, or generated `dist/` files.
- Commit source changes, `theme.config.json`, `vite.config.ts`, `package.json`, and this handoff file.

## Useful files

- `src/lib/skins.ts` — skin registry and custom-skin local storage helpers.
- `src/hooks/useSkin.ts` — resolves and applies current skin.
- `src/components/owner/OwnerStudio.tsx` — owner PIN, skins, palettes, custom skin creator.
- `src/components/skins/ReferenceSchoolSkins.tsx` — Ideas/Leading headers and portals.
- `src/components/highstar/` — High Star header and portal.
- `src/components/attendance/AttendanceModule.tsx` — attendance permissions and parent read-only view.
- `src/components/admin/AdminDashboard.tsx` — school admin modules.
- `src/components/results/ReportCardPrintable.tsx` — printable report branding.
