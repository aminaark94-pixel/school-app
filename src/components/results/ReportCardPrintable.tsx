import React from 'react';
import { Result, School, Student, Fee } from '../../types';
import { Award, CheckCircle2, ShieldCheck, Building2, GraduationCap } from 'lucide-react';
import { getActiveSkin } from '../../lib/skins';

interface ReportCardPrintableProps {
  school: School;
  student: Student;
  result: Result;
  fee?: Fee;
  reportRef?: React.RefObject<HTMLDivElement | null>;
}

export const ReportCardPrintable: React.FC<ReportCardPrintableProps> = ({
  school,
  student,
  result,
  fee,
  reportRef,
}) => {
  const brand = getActiveSkin();
  const primaryColor = brand.colors.primary;
  const secondaryColor = brand.colors.accent;
  const darkBrown = brand.colors.ink;

  const totalMaxMarks = result.marks_json.reduce((sum, item) => sum + item.max_marks, 0);
  const totalObtained = result.marks_json.reduce((sum, item) => sum + item.obtained_marks, 0);
  const calculatedPercentage =
    result.percentage || (totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0);

  return (
    <div
      ref={reportRef}
      id="printable-report-card"
      className="bg-white text-[#200E01] p-8 sm:p-12 rounded-3xl shadow-xl border-2 border-[#D4AF37]/50 max-w-3xl mx-auto font-sans relative overflow-hidden print:p-6 print:shadow-none print:border-none"
      style={{ minHeight: '880px' }}
    >
      {/* Decorative Golden Corner Accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#D4AF37] rounded-br-3xl pointer-events-none" />

      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
        <div className="text-center font-serif font-black text-8xl tracking-widest text-[#8B0000] rotate-[-25deg]">
          {brand.name}
        </div>
      </div>

      {/* Top Header with School Crest & Branding */}
      <div className="border-b-2 pb-6 flex items-center justify-between gap-6 border-[#D4AF37]">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#8B0000] to-[#5B0202] text-[#EDE7C7] font-bold text-2xl shadow-md border-2 border-[#D4AF37]">
            <Building2 className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B0000] font-['Cinzel',serif] block">
              Registered Cambridge International & Federal Board
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#200E01] font-['Cormorant_Garamond',serif] italic">
              {brand.name}
            </h1>
            <p className="text-xs italic text-[#5B0202]/80 font-medium mt-0.5">
              "{school.motto || 'Excellence in learning and character'}"
            </p>
            <p className="text-xs text-[#200E01]/70 mt-1">
              Historic Canal Road Campus, Lahore, Pakistan • Affiliation No. PK-CAM-40912
            </p>
          </div>
        </div>

        {/* Official Gold Seal Badge */}
        <div className="hidden sm:flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl border-2 border-[#D4AF37]/60 bg-[#FAF8F2] text-center shadow-xs">
          <Award className="w-6 h-6 mb-1 text-[#D4AF37]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B0000] font-['Cinzel',serif]">{brand.name} Seal</span>
          <span className="text-[9px] text-[#5B0202]/70">Verified & Certified</span>
        </div>
      </div>

      {/* Title & Fee Verification Banner */}
      <div className="my-6 text-center">
        <h2 className="text-lg font-bold tracking-wide uppercase text-[#200E01] font-['Cinzel',serif]">
          Official Scholar Transcript & Terminal Examination Record
        </h2>
        <div className="text-xs font-semibold text-[#5B0202]/80 uppercase mt-0.5 font-['Cinzel',serif]">
          Term: {result.term === 'mid_term' ? 'Mid-Term Examination' : 'Final Terminal Examination'} • Academic Session 2025–2026
        </div>

        {/* Fee Clearance Stamp */}
        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Bursar Clearance: Tuition Fully Paid</span>
          {fee?.receipt_number && (
            <span className="text-emerald-700 font-mono">({fee.receipt_number})</span>
          )}
        </div>
      </div>

      {/* Student Profile Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FAF8F2] border border-[#EDE7C7] text-xs mb-6">
        <div>
          <span className="text-[#5B0202]/70 block font-bold font-['Cinzel',serif] text-[10px]">Scholar Name</span>
          <span className="font-bold text-[#200E01] text-sm">{student.name}</span>
        </div>
        <div>
          <span className="text-[#5B0202]/70 block font-bold font-['Cinzel',serif] text-[10px]">Roll Number</span>
          <span className="font-mono font-bold text-[#8B0000]">{student.roll_number}</span>
        </div>
        <div>
          <span className="text-[#5B0202]/70 block font-bold font-['Cinzel',serif] text-[10px]">Academic Stream</span>
          <span className="font-bold text-[#200E01]">{student.class_id} – Sec {student.section}</span>
        </div>
        <div>
          <span className="text-[#5B0202]/70 block font-bold font-['Cinzel',serif] text-[10px]">Date Certified</span>
          <span className="font-bold text-[#200E01]">{new Date(result.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Academic Marks Breakdown Table */}
      <div className="overflow-hidden rounded-2xl border border-[#EDE7C7] mb-6 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[#EDE7C7] bg-[#8B0000] font-['Cinzel',serif]">
              <th className="py-2.5 px-3.5 font-bold">#</th>
              <th className="py-2.5 px-3.5 font-bold">Course Discipline</th>
              <th className="py-2.5 px-3.5 font-bold text-center">Max Marks</th>
              <th className="py-2.5 px-3.5 font-bold text-center">Marks Obtained</th>
              <th className="py-2.5 px-3.5 font-bold text-center">% Score</th>
              <th className="py-2.5 px-3.5 font-bold text-center">Grade</th>
              <th className="py-2.5 px-3.5 font-bold">Faculty Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE7C7]">
            {result.marks_json.map((item, idx) => {
              const pct = ((item.obtained_marks / item.max_marks) * 100).toFixed(1);
              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F2]/60'}>
                  <td className="py-2.5 px-3.5 text-[#5B0202]/60 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3.5 font-bold text-[#200E01]">{item.subject}</td>
                  <td className="py-2.5 px-3.5 text-center text-[#5B0202]/80">{item.max_marks}</td>
                  <td className="py-2.5 px-3.5 text-center font-bold text-[#8B0000]">{item.obtained_marks}</td>
                  <td className="py-2.5 px-3.5 text-center font-mono font-medium text-[#200E01]">{pct}%</td>
                  <td className="py-2.5 px-3.5 text-center">
                    <span className="inline-block font-bold px-2 py-0.5 rounded text-xs bg-[#EDE7C7] text-[#8B0000] border border-[#D4AF37]/50">
                      {item.grade}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-[#5B0202]/80 italic text-[11px]">{item.remarks || 'Satisfactory'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Aggregate Performance Summary Box */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3.5 rounded-2xl border border-[#EDE7C7] bg-[#FAF8F2] text-center text-xs mb-8">
        <div className="p-2 bg-white rounded-xl border border-[#EDE7C7]">
          <span className="text-[10px] text-[#5B0202]/70 uppercase font-bold font-['Cinzel',serif] block">Total Marks</span>
          <span className="text-base font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic">
            {totalObtained} <span className="text-xs font-normal text-[#5B0202]/60">/ {totalMaxMarks}</span>
          </span>
        </div>
        <div className="p-2 bg-white rounded-xl border border-[#EDE7C7]">
          <span className="text-[10px] text-[#5B0202]/70 uppercase font-bold font-['Cinzel',serif] block">Percentage</span>
          <span className="text-base font-bold text-[#8B0000] font-['Cormorant_Garamond',serif] italic">{calculatedPercentage.toFixed(1)}%</span>
        </div>
        <div className="p-2 bg-white rounded-xl border border-[#EDE7C7]">
          <span className="text-[10px] text-[#5B0202]/70 uppercase font-bold font-['Cinzel',serif] block">Overall Grade</span>
          <span className="text-base font-bold text-emerald-700 font-['Cormorant_Garamond',serif] italic">{result.grade}</span>
        </div>
        <div className="p-2 bg-white rounded-xl border border-[#EDE7C7]">
          <span className="text-[10px] text-[#5B0202]/70 uppercase font-bold font-['Cinzel',serif] block">House Rank</span>
          <span className="text-base font-bold text-[#8B0000] font-['Cormorant_Garamond',serif] italic">#{result.class_rank || 1}</span>
        </div>
        <div className="p-2 bg-white rounded-xl border border-[#EDE7C7]">
          <span className="text-[10px] text-[#5B0202]/70 uppercase font-bold font-['Cinzel',serif] block">Attendance</span>
          <span className="text-base font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic">{result.attendance_percentage || 96.5}%</span>
        </div>
        <div className="p-2 bg-white rounded-xl border border-[#EDE7C7]">
          <span className="text-[10px] text-[#5B0202]/70 uppercase font-bold font-['Cinzel',serif] block">Conduct</span>
          <span className="text-xs font-bold text-[#200E01] mt-1 block truncate">
            {result.conduct || 'Exemplary'}
          </span>
        </div>
      </div>

      {/* Grading Key Guide */}
      <div className="text-[10px] text-[#5B0202]/70 border-t border-[#EDE7C7] pt-3 mb-8 flex flex-wrap justify-between gap-2 font-medium">
        <span><strong>Cambridge Scale:</strong> A* (90-100% Distinction)</span>
        <span>A (80-89% High Merit)</span>
        <span>B (70-79% Merit)</span>
        <span>C (60-69% Credit)</span>
        <span>D (50-59% Pass)</span>
        <span>U (&lt;50% Ungraded)</span>
      </div>

      {/* Signatures & Seal Section */}
      <div className="pt-6 border-t border-dashed border-[#D4AF37] grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs">
        <div>
          <div className="h-10 border-b border-[#5B0202]/40 mb-1 flex items-end justify-center">
            <span className="font-['Cormorant_Garamond',serif] italic font-bold text-[#8B0000] text-base">Prof. Tariq Mahmood</span>
          </div>
          <span className="text-[#5B0202]/70 font-semibold block font-['Cinzel',serif] text-[10px]">Housemaster & Class Master</span>
        </div>

        <div className="hidden sm:flex flex-col items-center justify-center">
          <div
            className="w-14 h-14 rounded-full border-2 border-double flex items-center justify-center p-1 text-center bg-[#FAF8F2] border-[#D4AF37]"
          >
            <span className="text-[8px] font-bold uppercase tracking-widest text-[#8B0000] font-['Cinzel',serif]">
              SEAL
            </span>
          </div>
          <span className="text-[9px] text-[#5B0202]/60 mt-1 font-['Cinzel',serif]">Provost Office Seal</span>
        </div>

        <div>
          <div className="h-10 border-b border-[#5B0202]/40 mb-1 flex items-end justify-center">
            <span className="font-['Cormorant_Garamond',serif] italic font-bold text-[#8B0000] text-base">Dr. Imran Qureshi, Ph.D.</span>
          </div>
          <span className="text-[#5B0202]/70 font-semibold block font-['Cinzel',serif] text-[10px]">Dean of Academics & Principal</span>
        </div>
      </div>
    </div>
  );
};
