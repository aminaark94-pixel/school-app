import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, Search, UserCheck, Shield, GraduationCap, Building2, Users } from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';

interface DribbbleClassesViewProps {
  onBack: () => void;
  onSelectStudent?: (studentId: string) => void;
}

export const DribbbleClassesView: React.FC<DribbbleClassesViewProps> = ({
  onBack,
  onSelectStudent,
}) => {
  const { students, currentSchool } = useSchoolData();
  const [selectedGrade, setSelectedGrade] = useState<'Grade 10 (O-Levels)' | 'Grade 11 (A-Levels)' | 'Grade 9 (Matric)'>('Grade 10 (O-Levels)');
  const [selectedSec, setSelectedSec] = useState<'Section A (Jinnah House)' | 'Section B (Iqbal House)'>('Section A (Jinnah House)');
  const [searchQuery, setSearchQuery] = useState('');

  // Localized Pakistani scholars in premier school uniform
  const mockupStudents = [
    { no: '01.', name: 'Muhammad Hamza', roll: 'AIC-101', blood: 'B +', house: 'Jinnah', status: 'Prefect' },
    { no: '02.', name: 'Zainab Fatima', roll: 'AIC-102', blood: 'O +', house: 'Iqbal', status: 'Honor Roll' },
    { no: '03.', name: 'Daniyal Tariq', roll: 'AIC-103', blood: 'A +', house: 'Liaquat', status: 'Active' },
    { no: '04.', name: 'Ayesha Siddiqui', roll: 'AIC-104', blood: 'AB +', house: 'Sir Syed', status: 'Science Club' },
    { no: '05.', name: 'Bilal Ahmed Khan', roll: 'AIC-105', blood: 'B -', house: 'Jinnah', status: 'Sports Captain' },
    { no: '06.', name: 'Fatima Noor', roll: 'AIC-106', blood: 'O -', house: 'Iqbal', status: 'Debating Head' },
    { no: '07.', name: 'Mustafa Raza', roll: 'AIC-107', blood: 'A +', house: 'Sir Syed', status: 'Active' },
    { no: '08.', name: 'Mahnoor Tariq', roll: 'AIC-108', blood: 'B +', house: 'Liaquat', status: 'Honor Roll' },
  ];

  const filtered = mockupStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[85vh] pb-24 bg-[#FAF8F2] text-[#200E01]">
      {/* 1. Curved Golden Luxe Imperial Header */}
      <div className="bg-gradient-to-br from-[#8B0000] via-[#700000] to-[#5B0202] text-[#EDE7C7] rounded-b-[44px] px-5 sm:px-8 pt-5 pb-8 shadow-[0_12px_40px_rgba(139,0,0,0.3)] border-b-2 border-[#D4AF37]/50 relative overflow-hidden">
        {/* Subtle background luxury pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Top App Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl bg-black/20 hover:bg-black/30 border border-[#D4AF37]/30 transition active:scale-95 text-[#EDE7C7]"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="font-['Cinzel',serif] text-[10px] uppercase tracking-widest text-[#D4AF37] block">
              Academic House Roster
            </span>
            <h2 className="text-lg font-bold tracking-tight text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic">
              Class Roster & Scholars
            </h2>
          </div>

          <div className="w-10 h-10 rounded-full ring-2 ring-[#D4AF37] overflow-hidden shadow-sm bg-[#200E01]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Dropdown Pills inside Header */}
        <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value as any)}
              className="w-full appearance-none bg-[#200E01]/70 hover:bg-[#200E01]/90 border border-[#D4AF37]/40 text-[#EDE7C7] font-bold text-xs rounded-2xl px-4 py-2.5 pr-8 focus:outline-hidden cursor-pointer shadow-inner"
            >
              <option value="Grade 10 (O-Levels)" className="bg-[#200E01] text-[#EDE7C7]">Grade 10 (O-Levels)</option>
              <option value="Grade 11 (A-Levels)" className="bg-[#200E01] text-[#EDE7C7]">Grade 11 (A-Levels)</option>
              <option value="Grade 9 (Matric)" className="bg-[#200E01] text-[#EDE7C7]">Grade 9 (Matric)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37] absolute right-3 top-3 pointer-events-none" />
          </div>

          <div className="relative w-full sm:flex-1">
            <select
              value={selectedSec}
              onChange={(e) => setSelectedSec(e.target.value as any)}
              className="w-full appearance-none bg-[#200E01]/70 hover:bg-[#200E01]/90 border border-[#D4AF37]/40 text-[#EDE7C7] font-bold text-xs rounded-2xl px-4 py-2.5 pr-8 focus:outline-hidden cursor-pointer shadow-inner"
            >
              <option value="Section A (Jinnah House)" className="bg-[#200E01] text-[#EDE7C7]">Section A (Jinnah House)</option>
              <option value="Section B (Iqbal House)" className="bg-[#200E01] text-[#EDE7C7]">Section B (Iqbal House)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37] absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Container with School Classroom Imagery & Student List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 space-y-5">
        
        {/* School Classroom Image Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#EDE7C7] bg-[#200E01] h-36 sm:h-44">
          <img
            src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80"
            alt="School Classroom"
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#200E01] via-[#200E01]/60 to-transparent p-5 flex flex-col justify-end">
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold font-['Cinzel',serif]">
              <Building2 className="w-4 h-4" />
              <span>Wing 3 • Senior Academic Block • Room 204</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic mt-1">
              {selectedGrade} — {selectedSec}
            </h3>
            <p className="text-xs text-[#EDE7C7]/80">Class Incharge: Prof. Tariq Mahmood • 35 Registered Scholars</p>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-[#200E01] tracking-tight font-['Cormorant_Garamond',serif] italic text-xl">
            Enrolled Scholars Directory
          </h3>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EDE7C7] text-[#5B0202] border border-[#D4AF37]/50 font-['Cinzel',serif]">
            {filtered.length} Scholars
          </span>
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#5B0202]/60 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholar by name, roll number, or house..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#EDE7C7] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B0000] shadow-sm text-[#200E01] placeholder:text-[#200E01]/40"
          />
        </div>

        {/* Table / List */}
        <div className="bg-white rounded-[28px] border border-[#EDE7C7] shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-12 px-5 py-3.5 border-b border-[#EDE7C7] text-[10px] font-bold uppercase tracking-wider text-[#5B0202] bg-[#FAF8F2] font-['Cinzel',serif]">
            <div className="col-span-1">No.</div>
            <div className="col-span-4 sm:col-span-4">Scholar Name</div>
            <div className="col-span-3 sm:col-span-2">Roll No.</div>
            <div className="hidden sm:block sm:col-span-2">House</div>
            <div className="col-span-2 sm:col-span-2 text-center">Status</div>
            <div className="col-span-2 sm:col-span-1 text-right">Blood</div>
          </div>

          {/* Student rows */}
          <div className="divide-y divide-[#EDE7C7]/60">
            {filtered.map((st) => (
              <div
                key={st.no}
                onClick={() => onSelectStudent && onSelectStudent(st.roll)}
                className="grid grid-cols-12 px-5 py-3.5 items-center text-xs font-bold text-[#200E01] hover:bg-[#FAF8F2] transition cursor-pointer"
              >
                <div className="col-span-1 text-[#5B0202]/70 font-semibold">{st.no}</div>
                <div className="col-span-4 sm:col-span-4 font-bold text-[#200E01] font-['Outfit',sans-serif] flex items-center gap-1.5">
                  <span>{st.name}</span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-[#5B0202] font-mono text-[11px]">{st.roll}</div>
                <div className="hidden sm:block sm:col-span-2 text-xs font-medium text-[#200E01]/70">{st.house}</div>
                <div className="col-span-2 sm:col-span-2 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#EDE7C7] text-[#5B0202] text-[10px] font-bold border border-[#D4AF37]/40">
                    {st.status}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 text-right">
                  <span className="inline-block font-black px-2 py-0.5 rounded-md bg-[#8B0000]/10 text-[#8B0000] text-[10px]">
                    {st.blood}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
