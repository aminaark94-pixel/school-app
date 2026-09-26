import React, { useState, useRef } from 'react';
import {
  Lock,
  Unlock,
  Download,
  Printer,
  DollarSign,
  AlertCircle,
  FileCheck,
  Calendar,
  UserCheck,
  ChevronRight,
  GraduationCap,
  Building2,
  Award,
  Sparkles,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { useSkin } from '../../hooks/useSkin';
import { ReportCardPrintable } from './ReportCardPrintable';
import { ExamTerm, Student } from '../../types';

export const ResultCardModule: React.FC = () => {
  const {
    currentSchool,
    currentUser,
    students,
    fees,
    results,
    payFeeForStudent,
    updateFeeStatus,
  } = useSchoolData();
  const skin = useSkin();

  const [selectedTerm, setSelectedTerm] = useState<ExamTerm>('mid_term');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Determine eligible students
  const parentChildren = students.filter(
    (s) => s.parent_id === currentUser?.id || s.parent_email === currentUser?.email
  );
  const availableStudents =
    currentUser?.role === 'parent' && parentChildren.length > 0 ? parentChildren : students;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    availableStudents[0]?.id || ''
  );

  // Keep selected student synced if list changes
  const activeStudent =
    students.find((s) => s.id === selectedStudentId) || availableStudents[0] || null;

  // Joint Query: Student fee status alongside exam results
  const studentFee = fees.find((f) => f.student_id === activeStudent?.id);
  const isFeePaid = studentFee?.status === 'paid';
  const pendingAmount = studentFee ? studentFee.amount : 450.0;

  // Student result for selected term
  const studentResult = results.find(
    (r) => r.student_id === activeStudent?.id && r.term === selectedTerm
  );

  // PDF Export using html2pdf.js or print fallback
  const handleDownloadPDF = async () => {
    if (!isFeePaid) return;
    if (!reportRef.current || !activeStudent || !currentSchool) return;

    setIsExporting(true);
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule.default || html2pdfModule) as (element: HTMLElement) => {
        set: (opt: object) => {
          from: (element: HTMLElement) => {
            save: () => Promise<void>;
          };
        };
      };

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${skin.name.replace(/\s+/g, '_')}_${activeStudent.name.replace(/\s+/g, '_')}_${selectedTerm}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf(reportRef.current).set(opt).from(reportRef.current).save();
    } catch (err) {
      console.warn('html2pdf export fallback to browser print dialog:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  if (!activeStudent) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-[#EDE7C7] p-8">
        <GraduationCap className="w-12 h-12 text-[#8B0000] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic text-xl">No Student Records Found</h3>
        <p className="text-xs text-[#5B0202]/70 mt-1">
          Add or import students via the Admin Panel to view official transcripts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Academic Honors & Graduation Showcase Banner */}
      <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-[#EDE7C7] bg-[#200E01] text-[#EDE7C7]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80"
            alt="School Academic Graduation Hall"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/85 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Cambridge & Board Terminal Certified Results</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
              Official Academic Transcript Portal
            </h2>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Generate verified Cambridge O/A-Levels and Matric transcript cards with institutional watermarks, house rankings, and fee bursar clearance locks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="group relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 w-28 h-20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&auto=format&fit=crop&q=80"
                alt="Convocation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                <span className="text-[10px] font-bold text-[#EDE7C7] leading-tight">Honors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Bar: Student Selector & Exam Term Toggle */}
      <div className="bg-white p-4 sm:p-6 rounded-[28px] shadow-sm border border-[#EDE7C7]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B0202] mb-1 font-['Cinzel',serif]">
                Select Scholar
              </label>
              <select
                id="select-student-report"
                value={activeStudent.id}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-[#FAF8F2] border border-[#EDE7C7] text-[#200E01] text-sm font-semibold rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden cursor-pointer"
              >
                {availableStudents.map((s) => {
                  const sFee = fees.find((f) => f.student_id === s.id);
                  const isPaid = sFee?.status === 'paid';
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roll_number}) • {s.class_id}-{s.section} [{isPaid ? 'Bursar Cleared' : 'Fee Pending'}]
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B0202] mb-1 font-['Cinzel',serif]">
                Examination Term
              </label>
              <div className="flex items-center bg-[#FAF8F2] p-1 rounded-xl border border-[#EDE7C7]">
                <button
                  onClick={() => setSelectedTerm('mid_term')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    selectedTerm === 'mid_term'
                      ? 'bg-[#8B0000] text-[#EDE7C7] shadow-sm'
                      : 'text-[#5B0202] hover:text-[#200E01]'
                  }`}
                >
                  Mid-Term Exam
                </button>
                <button
                  onClick={() => setSelectedTerm('final')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    selectedTerm === 'final'
                      ? 'bg-[#8B0000] text-[#EDE7C7] shadow-sm'
                      : 'text-[#5B0202] hover:text-[#200E01]'
                  }`}
                >
                  Final Term Exam
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: PDF Export & Fee Status Toggle */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            {/* Fee Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${
                isFeePaid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {isFeePaid ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tuition Cleared (Unlocked)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Pending Dues: Rs. {(pendingAmount * 280).toLocaleString()}</span>
                </>
              )}
            </div>

            {/* Print / Download Button */}
            <button
              id="export-pdf-button"
              onClick={handleDownloadPDF}
              disabled={!isFeePaid || isExporting}
              title={
                isFeePaid
                  ? 'Download Official Branded PDF'
                  : 'Report Card locked: Clear pending fees to enable PDF download'
              }
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl shadow-sm transition active:scale-95 border ${
                isFeePaid
                  ? 'bg-[#8B0000] hover:bg-[#700000] text-[#EDE7C7] cursor-pointer border-[#D4AF37]/50 shadow-md'
                  : 'bg-[#FAF8F2] text-[#200E01]/40 cursor-not-allowed border-[#EDE7C7]'
              }`}
            >
              {isExporting ? (
                <span>Generating PDF...</span>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#D4AF37]" />
                  <span>1-Click PDF Export</span>
                </>
              )}
            </button>

            {/* Quick Demo Pay / Re-lock Action */}
            <button
              onClick={() => {
                if (isFeePaid && studentFee) {
                  updateFeeStatus(studentFee.id, 'pending');
                } else {
                  payFeeForStudent(activeStudent.id);
                }
              }}
              title="Toggle fee status to test locked vs unlocked report card"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border border-[#EDE7C7] hover:bg-[#FAF8F2] text-[#5B0202] transition"
            >
              <DollarSign className="w-3.5 h-3.5 text-[#8B0000]" />
              <span>{isFeePaid ? 'Simulate Unpaid' : 'Clear Dues (Unlock)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RESULT CARD CONTAINER WITH CONDITIONAL UNLOCK */}
      <div className="relative">
        {/* CONDITIONAL LOCKED OVERLAY BANNER */}
        {studentResult && !isFeePaid && (
          <div
            id="result-card-locked-overlay"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-[#200E01]/70 backdrop-blur-md rounded-3xl text-center"
          >
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-[#8B0000]">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50">
                <Lock className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic">
                Terminal Report Card Locked
              </h3>

              <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                Please clear pending tuition dues with the accounts office to view and export the official transcript.
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-[#200E01]/80 border-t border-b border-[#EDE7C7] py-3">
                <div className="flex justify-between">
                  <span>Scholar:</span>
                  <span className="font-bold text-[#200E01]">{activeStudent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outstanding Dues:</span>
                  <span className="font-bold text-[#8B0000]">Rs. {(pendingAmount * 280).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span className="text-[#200E01] font-medium">
                    {studentFee?.due_date || 'Past Due'}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <button
                  id="pay-dues-now-button"
                  onClick={() => payFeeForStudent(activeStudent.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#8B0000] hover:bg-[#700000] active:scale-98 text-[#EDE7C7] font-bold text-xs shadow-md transition border border-[#D4AF37]/40"
                >
                  <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                  <span>Pay Now & Unlock Transcript</span>
                </button>
              </div>

              <p className="mt-3 text-[11px] text-[#5B0202]/70">
                Authorized Bursar Clearance. Changes reflect instantaneously.
              </p>
            </div>
          </div>
        )}

        {/* The Actual Report Card Component */}
        <div
          className={`transition-all duration-300 ${
            !isFeePaid ? 'filter blur-[7px] select-none pointer-events-none opacity-50' : 'opacity-100'
          }`}
        >
          {currentSchool && studentResult && (
            <ReportCardPrintable
              reportRef={reportRef}
              school={currentSchool}
              student={activeStudent}
              result={studentResult}
              fee={studentFee}
            />
          )}
          {!studentResult && (
            <div className="rounded-3xl border border-[#EDE7C7] bg-white p-8 text-center shadow-sm">
              <FileCheck className="mx-auto h-10 w-10 text-[#8B0000]" />
              <h3 className="mt-3 text-lg font-bold text-[#200E01]">No {selectedTerm === 'mid_term' ? 'mid-term' : 'final-term'} report published</h3>
              <p className="mt-1 text-xs text-[#5B0202]/70">This student does not have results for the selected examination term yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
