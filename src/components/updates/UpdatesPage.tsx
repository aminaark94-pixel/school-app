import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  GitCommit,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Copy,
  Check,
  ArrowRight,
  Award,
  Layers,
  History,
} from 'lucide-react';
import { SYSTEM_UPDATES } from '../../lib/updatesLog';
import { useSchoolData } from '../../hooks/useSchoolData';
import { UserRole } from '../../types';

export const UpdatesPage: React.FC = () => {
  const { currentUser, switchRole, setCurrentUserId } = useSchoolData();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Live Karachi Time ticker
  const [khiLiveTime, setKhiLiveTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format in Asia/Karachi timezone
      const formatted = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateFormatted = now.toLocaleDateString('en-US', {
        timeZone: 'Asia/Karachi',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      setKhiLiveTime(`${dateFormatted}, ${formatted} PKT`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyCreds = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const TEST_ACCOUNTS = [
    {
      role: 'parent' as UserRole,
      id: 'user-parent-pari',
      name: 'Pari Khan (Mother of 4)',
      email: 'pari@example.com',
      desc: 'Has 4 kids enrolled: KG 1 (Zaviyar), Class 2 (Mirha), Class 5 (Rayyan), Class 9 (Shahmeer)',
      badge: 'Mother of 4 Kids',
    },
    {
      role: 'teacher' as UserRole,
      id: 'user-teacher-apex',
      name: 'Prof. Asim Munir',
      email: 'teacher@imperialgrammar.edu.pk',
      desc: 'Can evaluate monthly Kids Progress (Language, Discipline, Writing, Reading, Cleaning) & post diary',
      badge: 'Faculty Teacher',
    },
    {
      role: 'admin' as UserRole,
      id: 'user-admin-apex',
      name: 'Principal Syed Ali Raza',
      email: 'principal@imperialgrammar.edu.pk',
      desc: 'Full school administration, admissions, fees, circulars, and branding',
      badge: 'School Admin',
    },
    {
      role: 'parent' as UserRole,
      id: 'user-parent-1',
      name: 'Tariq Mehmood',
      email: 'tariq.mehmood@example.com',
      desc: 'Parent of Muhammad Bilal (Grade 10 O-Levels)',
      badge: 'Parent',
    },
    {
      role: 'owner' as UserRole,
      id: 'user-owner-platform',
      name: 'Platform SaaS Owner',
      email: 'owner@schoolpwa.com',
      desc: 'SaaS Platform Seller managing all institutions and Supabase connections',
      badge: 'Super Owner',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Live Deployment & Karachi Clock Header */}
      <div className="bg-white rounded-3xl border border-[#EDE7C7] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-6 h-6 text-[#8B0000]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#200E01] font-['Cinzel',serif]">
                System Deployment &amp; Live Updates Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                Live on Vercel
              </span>
            </div>
            <p className="text-xs text-[#5B0202]/70 mt-1 max-w-2xl">
              Real-time changelog and deployment audit trail stamped with exact <b>Karachi Time (PKT / UTC+5)</b>.
              Verify that every feature request has been built, tested, and pushed to the live production site.
            </p>
          </div>

          {/* Karachi Live Clock Card */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EDE7C7] flex items-center gap-3 shrink-0 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#8B0000] text-white flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B0202]/70 block">
                Official Karachi Time (PKT)
              </span>
              <span className="text-xs font-mono font-bold text-[#200E01] block">
                {khiLiveTime || 'Calculating...'}
              </span>
            </div>
          </div>
        </div>

        {/* Live URL Pill */}
        <div className="pt-3 border-t border-[#EDE7C7] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Production Endpoint:</span>
            <a
              href="https://school-app-nine-beta.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="font-mono font-bold text-[#8B0000] hover:underline inline-flex items-center gap-1"
            >
              https://school-app-nine-beta.vercel.app
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <span className="text-[11px] text-[#5B0202]/70">
            Current User: <b>{currentUser?.full_name}</b> ({currentUser?.role})
          </span>
        </div>
      </div>

      {/* 2. Ready-To-Test Demo Accounts (1-Click Switch) */}
      <div className="bg-[#FAF8F2] rounded-3xl border border-[#EDE7C7] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#8B0000]" />
            <h2 className="text-base font-bold text-[#200E01] font-['Cinzel',serif]">
              Test Accounts &amp; Quick Persona Logins
            </h2>
          </div>
          <span className="text-xs text-[#5B0202]/70 font-medium">Click any row to test instantly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEST_ACCOUNTS.map((acc) => {
            const isCurrent = currentUser?.id === acc.id || currentUser?.email === acc.email;
            return (
              <div
                key={acc.id}
                className={`p-4 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-white border-[#8B0000] ring-2 ring-[#8B0000]/20'
                    : 'bg-white border-[#EDE7C7] hover:border-[#D4AF37]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                      {acc.badge}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-red-100 text-[#8B0000]">
                        Active Now
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#200E01]">{acc.name}</h3>
                  <p className="text-[11px] font-mono text-[#5B0202]/80">{acc.email}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{acc.desc}</p>
                </div>

                <div className="pt-3 mt-2 border-t border-[#EDE7C7]/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => copyCreds(acc.email)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                  >
                    {copiedText === acc.email ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === acc.email ? 'Copied' : 'Copy Email'}</span>
                  </button>

                  <button
                    onClick={() => {
                      switchRole(acc.role);
                      setCurrentUserId(acc.id);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-[#8B0000] text-white hover:bg-[#700000] transition shadow-2xs"
                  >
                    <span>Switch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Chronological Update Timeline with Karachi Time */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#200E01] font-['Cinzel',serif]">
            Verified Release Timeline (Karachi PKT Stamped)
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {SYSTEM_UPDATES.length} Production Releases Logged
          </span>
        </div>

        <div className="space-y-4">
          {SYSTEM_UPDATES.map((update, idx) => (
            <div
              key={update.version}
              className="bg-white rounded-3xl border border-[#EDE7C7] p-5 sm:p-6 shadow-xs space-y-4 transition hover:border-[#D4AF37]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EDE7C7]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-xl bg-[#8B0000] text-white">
                    {update.version}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      update.badge === 'Latest'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : update.badge === 'Major Feature'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {update.badge}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {update.status}
                  </span>
                </div>

                {/* Exact Karachi Timestamp */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B0202]">
                  <Clock className="w-3.5 h-3.5 text-[#8B0000]" />
                  <span>{update.khiTime}</span>
                  <span className="text-slate-400 font-normal">({update.date})</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#200E01]">{update.title}</h3>
                <p className="text-xs text-[#5B0202]/80 mt-1 leading-relaxed">{update.summary}</p>
              </div>

              {/* Feature Checklist */}
              <div className="bg-[#FAF8F2] p-4 rounded-2xl border border-[#EDE7C7] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B0202]/70 block">
                  Delivered Capabilities:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {update.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
