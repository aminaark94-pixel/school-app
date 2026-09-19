import React from 'react';
import { Shield, GraduationCap, Users, RefreshCw, Sparkles, Building2 } from 'lucide-react';
import { useSchoolData } from '../hooks/useSchoolData';
import { UserRole } from '../types';

export const RoleSwitcherBar: React.FC = () => {
  const {
    currentUser,
    currentSchool,
    schools,
    setCurrentSchoolId,
    switchRole,
    resetToDefaults,
  } = useSchoolData();

  const roleConfigs: Record<
    UserRole,
    { label: string; icon: React.ReactNode; color: string; desc: string }
  > = {
    admin: {
      label: 'School Admin',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'bg-[#8B0000] text-[#EDE7C7] border-[#D4AF37]',
      desc: 'Full access: Student roster, CSV import, soft delete, fees, branding',
    },
    teacher: {
      label: 'Faculty Teacher',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      color: 'bg-[#5B0202] text-[#EDE7C7] border-[#D4AF37]/70',
      desc: 'One-Click attendance sheet, roster review, academic results',
    },
    parent: {
      label: 'Guardian / Parent',
      icon: <Users className="w-3.5 h-3.5" />,
      color: 'bg-[#01411C] text-[#EDE7C7] border-emerald-400',
      desc: 'View child report card (fee locked/unlocked), fee dues & attendance',
    },
  };

  return (
    <div className="bg-[#200E01] text-[#EDE7C7] border-b border-[#5B0202] text-xs py-2.5 px-3 sm:px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Left: Tenant Selector & Active Persona */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-[#EDE7C7]/90 font-medium">
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-['Cinzel',serif] tracking-wider text-[11px] uppercase text-[#D4AF37]">Institution:</span>
            <select
              value={currentSchool?.id || ''}
              onChange={(e) => setCurrentSchoolId(e.target.value)}
              className="bg-[#2D1605] text-[#EDE7C7] rounded-xl px-3 py-1 border border-[#D4AF37]/40 font-bold focus:outline-hidden focus:ring-1 focus:ring-[#D4AF37] cursor-pointer text-xs"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#200E01] text-[#EDE7C7]">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#5B0202] hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[#EDE7C7]/60">Logged in:</span>
            <span className="font-bold text-[#EDE7C7] truncate max-w-[140px] sm:max-w-xs font-['Outfit',sans-serif]">
              {currentUser?.full_name}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                currentUser?.role === 'admin'
                  ? 'bg-[#8B0000] text-[#EDE7C7] border border-[#D4AF37]'
                  : currentUser?.role === 'teacher'
                  ? 'bg-[#5B0202] text-[#EDE7C7] border border-[#D4AF37]/50'
                  : 'bg-[#01411C] text-emerald-100 border border-emerald-500/50'
              }`}
            >
              {currentUser?.role}
            </span>
          </div>
        </div>

        {/* Right: Quick Role Switcher Buttons & Reset */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[#EDE7C7]/60 font-semibold hidden lg:inline font-['Cinzel',serif] text-[11px]">Role:</span>
          {(['admin', 'teacher', 'parent'] as UserRole[]).map((role) => {
            const isCurrent = currentUser?.role === role;
            const config = roleConfigs[role];
            return (
              <button
                key={role}
                onClick={() => switchRole(role)}
                title={config.desc}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl transition font-bold ${
                  isCurrent
                    ? `${config.color} shadow-sm font-black ring-1 ring-[#D4AF37]`
                    : 'bg-[#2D1605] hover:bg-[#3D1E07] text-[#EDE7C7]/80 border border-[#5B0202]'
                }`}
              >
                {config.icon}
                <span>{config.label.split(' ')[1] || config.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              if (confirm('Reset demo data to initial seed?')) {
                resetToDefaults();
              }
            }}
            title="Reset storage to original demo schools, students, and fees"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#2D1605] hover:bg-[#3D1E07] text-[#EDE7C7]/60 hover:text-[#EDE7C7] border border-[#5B0202] ml-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

