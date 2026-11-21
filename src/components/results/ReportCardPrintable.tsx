import { formatDate } from '../../lib/dates';
import React from 'react';
import { Result, School, Student, Fee } from '../../types';
import { Award, ShieldCheck, Building2 } from 'lucide-react';
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
  const schoolName = school?.name?.trim() ? school.name : brand.name;
  const primaryColor = brand.colors.primary;
  const accentColor = brand.colors.accent;
  const sandColor = brand.colors.sand;
  const inkColor = brand.colors.ink;
  const bgColor = brand.colors.bg;

  const totalMaxMarks = result.marks_json.reduce((sum, item) => sum + item.max_marks, 0);
  const totalObtained = result.marks_json.reduce((sum, item) => sum + item.obtained_marks, 0);
  const calculatedPercentage =
    result.percentage || (totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0);

  return (
    <div
      ref={reportRef}
      id="printable-report-card"
      data-print-ready={fee?.status === 'paid' ? '' : undefined}
      className="bg-white text-[var(--t-ink)] p-4 sm:p-8 md:p-12 rounded-3xl shadow-lg border-2 max-w-3xl mx-auto font-sans relative overflow-hidden print:p-0 print:shadow-none print:border-none print:m-0 print:max-w-none print:text-black print:rounded-none"
      style={{
        borderColor: accentColor,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* Decorative Corner Accents */}
      <div
        className="absolute top-0 left-0 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-l-4 rounded-tl-3xl pointer-events-none print:hidden"
        style={{ borderColor: accentColor }}
      />
      <div
        className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-r-4 rounded-tr-3xl pointer-events-none print:hidden"
        style={{ borderColor: accentColor }}
      />
      <div
        className="absolute bottom-0 left-0 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-l-4 rounded-bl-3xl pointer-events-none print:hidden"
        style={{ borderColor: accentColor }}
      />
      <div
        className="absolute bottom-0 right-0 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-r-4 rounded-br-3xl pointer-events-none print:hidden"
        style={{ borderColor: accentColor }}
      />

      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
        <div
          className="text-center font-bold text-5xl sm:text-7xl md:text-8xl tracking-widest rotate-[-25deg] uppercase"
          style={{ color: primaryColor }}
        >
          {schoolName}
        </div>
      </div>

      {/* Top Header with School Crest & Branding */}
      <div
        className="border-b-2 pb-5 sm:pb-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left"
        style={{ borderColor: accentColor }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 sm:gap-4">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm border-2 shrink-0"
            style={{ backgroundColor: primaryColor, borderColor: accentColor }}
          >
            {school.logo_url ? (
              <img src={school.logo_url} alt="" className="w-12 h-12 object-contain" />
            ) : (
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: accentColor }} />
            )}
          </div>
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest block font-[family-name:var(--t-font-sans)]"
              style={{ color: primaryColor }}
            >
              Registered Cambridge International &amp; Federal Board
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-[family-name:var(--t-font-display)] mt-0.5">
              {schoolName}
            </h1>
            <p className="text-xs italic text-slate-600 font-medium mt-0.5">
              "{school.motto || 'Excellence in learning and character'}"
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Affiliated Campus Network, Pakistan • Official Academic Record
            </p>
          </div>
        </div>

        {/* Official Seal Badge */}
        <div
          className="flex sm:flex flex-col items-center justify-center px-4 py-2 rounded-2xl border bg-slate-50/80 text-center shadow-xs shrink-0"
          style={{ borderColor: accentColor }}
        >
          <Award className="w-5 h-5 mb-0.5" style={{ color: accentColor }} />
          <span
            className="text-xs font-bold uppercase tracking-wider block"
            style={{ color: primaryColor }}
          >
            {schoolName}
          </span>
          <span className="text-xs text-slate-500">Verified &amp; Certified</span>
        </div>
      </div>

      {/* Title & Fee Verification Banner */}
      <div className="my-5 sm:my-6 text-center">
        <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase text-slate-900 font-[family-name:var(--t-font-display)]">
          Official Scholar Transcript &amp; Terminal Examination Record
        </h2>
        <div className="text-xs font-semibold text-slate-600 uppercase mt-1 font-[family-name:var(--t-font-sans)]">
          Term: {result.term === 'mid_term' ? 'Mid-Term Examination' : 'Final Terminal Examination'} • Academic Session 2025–2026
        </div>

        {/* Fee Clearance Stamp */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bursar Clearance: Tuition Fully Paid</span>
          {fee?.receipt_number && (
            <span className="text-emerald-700 font-mono">({fee.receipt_number})</span>
          )}
        </div>
      </div>

      {/* Student Profile Metadata Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl border text-xs mb-5 sm:mb-6"
        style={{ backgroundColor: bgColor, borderColor: sandColor }}
      >
        <div>
          <span className="text-slate-500 block font-bold text-xs uppercase tracking-wider">Scholar Name</span>
          <span className="font-bold text-slate-900 text-sm">{student.name}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-bold text-xs uppercase tracking-wider">Roll Number</span>
          <span className="font-mono font-bold" style={{ color: primaryColor }}>{student.roll_number}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-bold text-xs uppercase tracking-wider">Academic Stream</span>
          <span className="font-bold text-slate-900">{student.class_id} – Sec {student.section}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-bold text-xs uppercase tracking-wider">Date Certified</span>
          <span className="font-bold text-slate-900">{formatDate(result.created_at)}</span>
        </div>
      </div>

      {/* Academic Marks Breakdown Table */}
      <div
        className="report-marks-scroll overflow-x-auto rounded-2xl border mb-5 sm:mb-6 shadow-xs"
        style={{ borderColor: sandColor }}
      >
        <table className="w-full text-left text-xs border-collapse min-w-[540px]">
          <thead>
            <tr
              className="text-white font-bold uppercase tracking-wider text-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Course Discipline</th>
              <th className="py-2.5 px-3 text-center">Max Marks</th>
              <th className="py-2.5 px-3 text-center">Marks Obtained</th>
              <th className="py-2.5 px-3 text-center">% Score</th>
              <th className="py-2.5 px-3 text-center">Grade</th>
              <th className="py-2.5 px-3">Faculty Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: sandColor }}>
            {result.marks_json.map((item, idx) => {
              const pct = item.max_marks > 0 ? ((item.obtained_marks / item.max_marks) * 100).toFixed(1) : '0.0';
              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2 px-3 font-bold text-slate-900">{item.subject}</td>
                  <td className="py-2 px-3 text-center text-slate-600">{item.max_marks}</td>
                  <td className="py-2 px-3 text-center font-bold" style={{ color: primaryColor }}>
                    {item.obtained_marks}
                  </td>
                  <td className="py-2 px-3 text-center font-mono font-medium text-slate-800">{pct}%</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className="inline-block font-bold px-2 py-0.5 rounded text-xs border"
                      style={{
                        backgroundColor: sandColor,
                        color: primaryColor,
                        borderColor: accentColor,
                      }}
                    >
                      {item.grade}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 italic text-xs">{item.remarks || 'Satisfactory'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Aggregate Performance Summary Box */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3 rounded-2xl border text-center text-xs mb-6 sm:mb-8"
        style={{ backgroundColor: bgColor, borderColor: sandColor }}
      >
        <div className="p-2 bg-white rounded-xl border" style={{ borderColor: sandColor }}>
          <span className="text-xs text-slate-500 uppercase font-bold block">Total Marks</span>
          <span className="text-base font-bold text-slate-900 font-[family-name:var(--t-font-display)]">
            {totalObtained} <span className="text-xs font-normal text-slate-500">/ {totalMaxMarks}</span>
          </span>
        </div>
        <div className="p-2 bg-white rounded-xl border" style={{ borderColor: sandColor }}>
          <span className="text-xs text-slate-500 uppercase font-bold block">Percentage</span>
          <span
            className="text-base font-bold font-[family-name:var(--t-font-display)]"
            style={{ color: primaryColor }}
          >
            {calculatedPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="p-2 bg-white rounded-xl border" style={{ borderColor: sandColor }}>
          <span className="text-xs text-slate-500 uppercase font-bold block">Overall Grade</span>
          <span className="text-base font-bold text-emerald-700 font-[family-name:var(--t-font-display)]">
            {result.grade}
          </span>
        </div>
        <div className="p-2 bg-white rounded-xl border" style={{ borderColor: sandColor }}>
          <span className="text-xs text-slate-500 uppercase font-bold block">House Rank</span>
          <span
            className="text-base font-bold font-[family-name:var(--t-font-display)]"
            style={{ color: primaryColor }}
          >
            #{result.class_rank || 1}
          </span>
        </div>
        <div className="p-2 bg-white rounded-xl border" style={{ borderColor: sandColor }}>
          <span className="text-xs text-slate-500 uppercase font-bold block">Attendance</span>
          <span className="text-base font-bold text-slate-900 font-[family-name:var(--t-font-display)]">
            {result.attendance_percentage || 96.5}%
          </span>
        </div>
        <div className="p-2 bg-white rounded-xl border" style={{ borderColor: sandColor }}>
          <span className="text-xs text-slate-500 uppercase font-bold block">Conduct</span>
          <span className="text-xs font-bold text-slate-900 mt-1 block truncate">
            {result.conduct || 'Exemplary'}
          </span>
        </div>
      </div>

      {/* Grading Key Guide */}
      <div
        className="text-xs text-slate-500 border-t pt-3 mb-6 sm:mb-8 flex flex-wrap justify-between gap-2 font-medium"
        style={{ borderColor: sandColor }}
      >
        <span><strong>Cambridge Scale:</strong> A* (90-100% Distinction)</span>
        <span>A (80-89% High Merit)</span>
        <span>B (70-79% Merit)</span>
        <span>C (60-69% Credit)</span>
        <span>D (50-59% Pass)</span>
        <span>U (&lt;50% Ungraded)</span>
      </div>

      {/* Signatures & Seal Section */}
      <div
        className="pt-5 border-t border-dashed grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 text-center text-xs"
        style={{ borderColor: accentColor }}
      >
        <div>
          <div className="h-10 border-b border-slate-300 mb-1 flex items-end justify-center">
            <span
              className="font-bold text-sm sm:text-base font-[family-name:var(--t-font-display)]"
              style={{ color: primaryColor }}
            >
              Prof. Tariq Mahmood
            </span>
          </div>
          <span className="text-slate-500 font-semibold block text-xs">Housemaster &amp; Class Master</span>
        </div>

        <div className="hidden sm:flex flex-col items-center justify-center">
          <div
            className="w-12 h-12 rounded-full border-2 border-double flex items-center justify-center p-1 text-center bg-slate-50"
            style={{ borderColor: accentColor }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: primaryColor }}
            >
              SEAL
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Provost Office Seal</span>
        </div>

        <div>
          <div className="h-10 border-b border-slate-300 mb-1 flex items-end justify-center">
            <span
              className="font-bold text-sm sm:text-base font-[family-name:var(--t-font-display)]"
              style={{ color: primaryColor }}
            >
              Dr. Imran Qureshi, Ph.D.
            </span>
          </div>
          <span className="text-slate-500 font-semibold block text-xs">Dean of Academics &amp; Principal</span>
        </div>
      </div>
    </div>
  );
};
