import React, { useState, useEffect, useCallback } from 'react';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import type { AppModule } from './components/Navbar';
import { CampusNavigation, CampusHome, pageNames } from './components/CampusHome';
import { PWAInstallButton } from './components/PWAInstallButton';
import { DiaryModule } from './components/diary/DiaryModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { ResultCardModule } from './components/results/ResultCardModule';
import { KidsProgressModule } from './components/progress/KidsProgressModule';
import { CommunicationModule } from './components/communication/CommunicationModule';
import { ExamsDatesheetModule } from './components/datesheets/ExamsDatesheetModule';
import { UpdatesPage } from './components/updates/UpdatesPage';
import { TeacherProgressModule } from './components/admin/TeacherProgressModule';
import { ParentsReportModule } from './components/parents/ParentsReportModule';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';
import { useSchoolData } from './hooks/useSchoolData';
import { useSkin } from './hooks/useSkin';
import { PageTourButton, ProductTour, triggerPageTour } from './components/ProductTour';

export default function App() {
  const { currentSchool, currentUser, isOwnerCampusView, exitOwnerCampusView, dataState, refreshRemote, isLiveData } = useSchoolData();
  const skin = useSkin();
  const [homeSubject, setHomeSubject] = useState('All');
  const role = currentUser?.role;
  
  // Keep direct page links and browser Back working. A bare URL opens Subjects.
  const [activeModule, setActiveModuleState] = useState<AppModule>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as AppModule;
      const validModules: AppModule[] = [
        'portal', 'diary', 'attendance', 'results', 'progress', 'teacher-progress', 'parents-report', 'communication', 'datesheets', 'updates', 'admin'
      ];
      if (validModules.includes(hash)) return hash;
    }
    return 'portal';
  });

  const setActiveModule = useCallback((m: AppModule) => {
    setHomeSubject('All');
    setActiveModuleState(m);
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.hash = m === 'portal' ? '' : m;
        if (url.href !== window.location.href) window.history.pushState(null, '', url);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = (window.location.hash.replace('#', '') || 'portal') as AppModule;
      const validModules: AppModule[] = [
        'portal', 'diary', 'attendance', 'results', 'progress', 'teacher-progress', 'parents-report', 'communication', 'datesheets', 'updates', 'admin'
      ];
      if (validModules.includes(hash)) {
        setHomeSubject('All');
        setActiveModuleState(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  const openPage = (module: AppModule) => {
    setActiveModule(module);
    window.scrollTo({ top: 0 });
  };

  const openSubject = (subject: string) => {
    openPage('diary');
    setHomeSubject(subject);
  };

  if (!isLiveData && dataState === 'loading') {
    return <main role="status" className="school-workspace mx-auto max-w-xl space-y-4 p-5 text-slate-900">
      <p className="font-semibold">Loading school records…</p>
      <div aria-hidden="true" className="h-20 rounded-xl bg-slate-200 motion-safe:animate-pulse" />
      <div aria-hidden="true" className="h-28 rounded-xl bg-slate-200 motion-safe:animate-pulse" />
    </main>;
  }

  if (!isLiveData && dataState === 'remote_error') {
    return <main role="alert" className="school-workspace mx-auto max-w-xl space-y-4 p-5 text-slate-900">
      <h1 className="text-xl font-bold">School records could not load</h1>
      <button type="button" onClick={refreshRemote} className="min-h-11 rounded-lg bg-[var(--t-primary)] px-4 font-semibold text-white">Try again</button>
      <RoleSwitcherBar />
    </main>;
  }

  if (role === 'owner' && !isOwnerCampusView) {
    return (
      <div className="min-h-dvh bg-[var(--t-bg)] text-slate-900">
        <RoleSwitcherBar />
        <main className="school-workspace mx-auto max-w-5xl p-4 pb-24 sm:p-8">
          <h1 data-tour="page-heading" className="mb-5 text-3xl font-bold">Manage schools</h1>
          <OwnerDashboard />
        </main>
        <ProductTour key={role} role={role} activeModule={activeModule} setActiveModule={setActiveModule} />
        <OfflineIndicator />
      </div>
    );
  }

  const allowed = activeModule === 'admin' || activeModule === 'teacher-progress'
    ? role === 'admin'
    : activeModule === 'parents-report'
      ? role === 'admin' || role === 'teacher'
      : true;

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900" style={{ fontFamily: 'var(--t-font-sans)' }}>
      <RoleSwitcherBar />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <button type="button" onClick={() => openPage('portal')} className="flex items-center gap-3 text-left text-lg font-bold">
            {currentSchool?.logo_url && <img src={currentSchool.logo_url} alt="" className="h-10 w-10 rounded-lg object-contain" />}
            {currentSchool?.name || skin.name}
          </button>
          <PWAInstallButton />
        </div>
        <CampusNavigation role={role} activeModule={activeModule} onNavigate={openPage} />
      </header>

      {isOwnerCampusView && (
        <div className="bg-amber-50 p-3 text-center text-sm">
          Read-only campus view. <button type="button" onClick={exitOwnerCampusView} className="font-bold underline">Back to schools</button>
        </div>
      )}

      <main id="school-content" className="school-workspace mx-auto max-w-6xl space-y-6 px-4 pb-28 pt-6 sm:px-6 sm:pt-9">
        {activeModule !== 'portal' && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 data-tour="page-heading" className="text-2xl font-bold sm:text-3xl">{pageNames[activeModule]}</h1>
            {allowed && <PageTourButton onClick={triggerPageTour} />}
          </div>
        )}
        {!allowed ? <p className="rounded-xl border border-slate-200 bg-white p-5">This page is available to school staff with access.</p> : <>
          {activeModule === 'portal' && <CampusHome role={role} onNavigate={openPage} onSubject={openSubject} />}
          {activeModule === 'diary' && <DiaryModule initialSubject={homeSubject} />}
          {activeModule === 'attendance' && <AttendanceModule />}
          {activeModule === 'results' && <ResultCardModule />}
          {activeModule === 'progress' && <KidsProgressModule />}
          {activeModule === 'teacher-progress' && <TeacherProgressModule />}
          {activeModule === 'parents-report' && <ParentsReportModule />}
          {activeModule === 'communication' && <CommunicationModule />}
          {activeModule === 'datesheets' && <ExamsDatesheetModule />}
          {activeModule === 'updates' && <UpdatesPage />}
          {activeModule === 'admin' && <AdminDashboard />}
        </>}
      </main>
      <OfflineIndicator />
      <PWAUpdateNotification />
      <ProductTour key={role} role={isOwnerCampusView ? 'parent' : role} activeModule={activeModule} setActiveModule={setActiveModule} />
    </div>
  );
}
