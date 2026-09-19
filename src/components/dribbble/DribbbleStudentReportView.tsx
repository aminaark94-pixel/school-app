import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  ChevronDown,
  ChevronUp,
  Edit2,
  FileText,
  Lock,
  Download,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { jsPDF } from 'jspdf';

interface DribbbleStudentReportViewProps {
  onBack: () => void;
}

export const DribbbleStudentReportView: React.FC<DribbbleStudentReportViewProps> = ({ onBack }) => {
  const { currentSchool, students, fees, results } = useSchoolData();

  // Accordion states
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const [isMarksOpen, setIsMarksOpen] = useState(true);
  const [activeTerm, setActiveTerm] = useState<'quarterly' | 'half_yearly'>('quarterly');

  // Personal details state (Pakistani Cambridge O-Levels Student)
  const [personalDetails, setPersonalDetails] = useState({
    fatherName: 'Tariq Mahmood',
    motherName: 'Ayesha Tariq',
    dob: '14.04.2009',
    bloodGroup: 'O +',
    age: '16 Years',
    mobileNumber: '+92 300 8492011',
  });

  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [isFeePaid, setIsFeePaid] = useState(true);

  // Subject marks (Cambridge O-Levels Curriculum)
  const quarterlyMarks = [
    { subject: 'Mathematics (Syllabus D)', max: 100, obtained: 96, grade: 'A*' },
    { subject: 'Physics', max: 100, obtained: 92, grade: 'A*' },
    { subject: 'Chemistry', max: 100, obtained: 89, grade: 'A' },
    { subject: 'Computer Science (2210)', max: 100, obtained: 98, grade: 'A*' },
    { subject: 'Pakistan Studies (History & Geo)', max: 100, obtained: 94, grade: 'A*' },
    { subject: 'Urdu Literature & Composition', max: 100, obtained: 91, grade: 'A*' },
    { subject: 'English Language & Lit', max: 100, obtained: 88, grade: 'A' },
  ];

  const halfYearlyMarks = [
    { subject: 'Mathematics (Syllabus D)', max: 100, obtained: 98, grade: 'A*' },
    { subject: 'Physics', max: 100, obtained: 95, grade: 'A*' },
    { subject: 'Chemistry', max: 100, obtained: 93, grade: 'A*' },
    { subject: 'Computer Science (2210)', max: 100, obtained: 99, grade: 'A*' },
    { subject: 'Pakistan Studies (History & Geo)', max: 100, obtained: 96, grade: 'A*' },
    { subject: 'Urdu Literature & Composition', max: 100, obtained: 94, grade: 'A*' },
    { subject: 'English Language & Lit', max: 100, obtained: 91, grade: 'A*' },
  ];

  const currentMarks = activeTerm === 'quarterly' ? quarterlyMarks : halfYearlyMarks;
  const totalObtained = currentMarks.reduce((acc, m) => acc + m.obtained, 0);
  const totalMax = currentMarks.reduce((acc, m) => acc + m.max, 0);
  const percentage = Math.round((totalObtained / totalMax) * 100);

  // PDF Export
  const handleDownloadPDF = () => {
    if (!isFeePaid) {
      alert('Report Card Locked: Clear pending tuition fees to download official transcript.');
      return;
    }

    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(139, 0, 0);
    doc.text(currentSchool?.name || 'Aitchisonian Imperial College', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(91, 2, 2);
    doc.text('CAMBRIDGE INTERNATIONAL EDUCATION • OFFICIAL ACADEMIC TRANSCRIPT', 105, 28, { align: 'center' });

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(20, 32, 190, 32);

    // Student Info
    doc.setFontSize(11);
    doc.setTextColor(32, 14, 1);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Name: Muhammad Hamza', 20, 42);
    doc.text('Class: Class 10 (O-Levels) • Sec A', 130, 42);
    doc.text('Roll No: A-1048', 20, 50);
    doc.text(`Term: ${activeTerm === 'quarterly' ? 'Quarterly Assessment' : 'Mid-Term Examination'}`, 130, 50);

    // Marks Table
    let y = 65;
    doc.setFillColor(237, 231, 199);
    doc.rect(20, y - 6, 170, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 0, 0);
    doc.text('Subject', 25, y);
    doc.text('Max Marks', 95, y);
    doc.text('Obtained', 130, y);
    doc.text('Grade', 165, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(32, 14, 1);
    currentMarks.forEach((item) => {
      y += 8;
      doc.text(item.subject, 25, y);
      doc.text(String(item.max), 95, y);
      doc.text(String(item.obtained), 130, y);
      doc.text(item.grade, 165, y);
    });

    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 0, 0);
    doc.text(`Total Marks: ${totalObtained} / ${totalMax} (${percentage}%)`, 25, y);
    doc.text('Result: PASS (High Distinction)', 130, y);

    y += 25;
    doc.setLineWidth(0.3);
    doc.setDrawColor(91, 2, 2);
    doc.line(25, y, 75, y);
    doc.line(135, y, 185, y);
    doc.setFontSize(9);
    doc.setTextColor(91, 2, 2);
    doc.text('Housemaster Signature', 30, y + 5);
    doc.text('Principal Seal & Signature', 140, y + 5);

    doc.save('Muhammad_Hamza_OLevels_Transcript.pdf');
  };

  return (
    <div className="min-h-[85vh] pb-28 bg-[#FAF8F2] text-[#200E01]">
      {/* 1. Curved Golden Luxe Header */}
      <div className="bg-gradient-to-br from-[#8B0000] via-[#700000] to-[#5B0202] text-[#EDE7C7] rounded-b-[44px] px-5 sm:px-10 pt-6 pb-8 shadow-[0_12px_40px_rgba(139,0,0,0.3)] border-b-2 border-[#D4AF37]/50">
        {/* Top App Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl bg-black/20 hover:bg-black/30 border border-[#D4AF37]/30 transition active:scale-95 text-[#EDE7C7]"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] font-['Cinzel',serif] block">
              Academic Standing
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic">
              Student Transcript & Dossier
            </h2>
          </div>

          <div className="w-10 h-10 rounded-full ring-2 ring-[#D4AF37] overflow-hidden shadow-md bg-[#EDE7C7]">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Student Profile Card (Golden Luxe) */}
        <div className="mt-5 max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-center gap-4 bg-black/25 backdrop-blur-md rounded-[28px] p-4 sm:p-5 border border-[#D4AF37]/40 shadow-inner">
          <div className="w-20 h-20 rounded-[22px] overflow-hidden flex-shrink-0 border-2 border-[#D4AF37] shadow-md bg-[#EDE7C7]">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80"
              alt="Muhammad Hamza"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#EDE7C7] truncate font-['Cormorant_Garamond',serif] italic">
                  Muhammad Hamza
                </h3>
                <p className="text-xs text-[#EDE7C7]/80 font-medium mt-0.5 font-['Cinzel',serif]">
                  Class 10 (Cambridge O-Levels) • Roll: A-1048
                </p>
              </div>

              {/* Distinction badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B0000] border border-[#D4AF37] text-[#D4AF37] shadow-xs self-center sm:self-auto">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-bold font-['Cinzel',serif]">Rank #1 Scholar</span>
              </div>
            </div>

            {/* Stars rating */}
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-2 text-[#D4AF37]">
              <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
              <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
              <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
              <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
              <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
              <span className="text-xs font-bold text-[#EDE7C7] ml-2 font-['Cinzel',serif]">95.8% Aggregate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Accordions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 space-y-5">
        {/* Accordion 1: Personal Details */}
        <div className="bg-white rounded-[26px] border border-[#EDE7C7] shadow-[0_4px_20px_rgba(32,14,1,0.04)] overflow-hidden transition">
          <div
            onClick={() => setIsPersonalOpen(!isPersonalOpen)}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F2]/60 transition border-b border-[#EDE7C7]/60"
          >
            <div>
              <h4 className="text-lg font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic">
                Personal & Guardian Profile
              </h4>
              <p className="text-xs text-[#200E01]/70">Official enrollment & contact records</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditPersonalOpen(true);
                }}
                className="p-1.5 rounded-lg text-[#8B0000] hover:bg-[#FAF8F2] transition border border-[#D4AF37]/40"
                title="Edit Personal Details"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {isPersonalOpen ? (
                <ChevronUp className="w-5 h-5 text-[#8B0000]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8B0000]" />
              )}
            </div>
          </div>

          {isPersonalOpen && (
            <div className="px-5 py-4 space-y-2.5 text-xs bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="text-[#5B0202] font-semibold">Father's Name</span>
                  <span className="font-bold text-[#200E01]">: {personalDetails.fatherName}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="text-[#5B0202] font-semibold">Mother's Name</span>
                  <span className="font-bold text-[#200E01]">: {personalDetails.motherName}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="text-[#5B0202] font-semibold">Date of Birth</span>
                  <span className="font-bold text-[#200E01]">: {personalDetails.dob}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="text-[#5B0202] font-semibold">Blood Group</span>
                  <span className="font-bold text-[#8B0000]">: {personalDetails.bloodGroup}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="text-[#5B0202] font-semibold">Age Category</span>
                  <span className="font-bold text-[#200E01]">: {personalDetails.age}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="text-[#5B0202] font-semibold">Registered Contact</span>
                  <span className="font-bold text-[#8B0000]">: {personalDetails.mobileNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: Mark Details */}
        <div className="bg-white rounded-[26px] border border-[#EDE7C7] shadow-[0_4px_20px_rgba(32,14,1,0.04)] overflow-hidden transition">
          <div
            onClick={() => setIsMarksOpen(!isMarksOpen)}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F2]/60 transition border-b border-[#EDE7C7]/60"
          >
            <div>
              <h4 className="text-lg font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic">
                Official Examination Grades
              </h4>
              <p className="text-xs text-[#200E01]/70">Verified Cambridge syllabus assessments</p>
            </div>
            {isMarksOpen ? (
              <ChevronUp className="w-5 h-5 text-[#8B0000]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#8B0000]" />
            )}
          </div>

          {isMarksOpen && (
            <div className="px-5 pb-5 pt-3 space-y-4">
              {/* Term Tabs */}
              <div className="flex items-center gap-2 p-1 bg-[#FAF8F2] rounded-2xl border border-[#EDE7C7]">
                <button
                  onClick={() => setActiveTerm('quarterly')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition font-['Cinzel',serif] ${
                    activeTerm === 'quarterly'
                      ? 'bg-[#8B0000] text-[#EDE7C7] shadow-sm border border-[#D4AF37]'
                      : 'text-[#5B0202] hover:text-[#200E01]'
                  }`}
                >
                  Quarterly Assessment
                </button>
                <button
                  onClick={() => setActiveTerm('half_yearly')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition font-['Cinzel',serif] ${
                    activeTerm === 'half_yearly'
                      ? 'bg-[#8B0000] text-[#EDE7C7] shadow-sm border border-[#D4AF37]'
                      : 'text-[#5B0202] hover:text-[#200E01]'
                  }`}
                >
                  Mid-Term Examination
                </button>
              </div>

              {/* Subject Breakdown Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentMarks.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EDE7C7] text-xs"
                  >
                    <span className="font-bold text-[#200E01]">{m.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#5B0202]">
                        {m.obtained} <span className="text-[#5B0202]/50 text-[10px]">/ {m.max}</span>
                      </span>
                      <span className="w-8 text-center font-black px-2 py-0.5 rounded-md bg-[#8B0000] text-[#EDE7C7] border border-[#D4AF37]/50 text-[11px]">
                        {m.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Pill & Download */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#EDE7C7]">
                <div>
                  <span className="text-sm font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic block text-base">
                    Overall Aggregate: {percentage}% (High Distinction)
                  </span>
                  <p className="text-xs text-[#5B0202]/80 font-['Cinzel',serif]">
                    Total Marks: {totalObtained} / {totalMax}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFeePaid(!isFeePaid)}
                    className="text-xs px-3 py-2 rounded-xl border border-[#EDE7C7] bg-white text-[#5B0202] hover:bg-[#FAF8F2] font-semibold"
                    title="Toggle Fee Status to simulate locked vs unlocked PDF"
                  >
                    Tuition Fee: {isFeePaid ? 'Cleared (Unlocked)' : 'Pending (Locked)'}
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm border border-[#D4AF37] ${
                      isFeePaid
                        ? 'bg-[#8B0000] hover:bg-[#700000] text-[#EDE7C7] active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border-none'
                    }`}
                  >
                    {isFeePaid ? (
                      <>
                        <Download className="w-4 h-4 text-[#D4AF37]" />
                        <span>Download Official PDF</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Transcript Locked</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Personal Details Modal */}
      {isEditPersonalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F2] w-full max-w-sm rounded-[32px] p-6 shadow-2xl border-2 border-[#D4AF37] space-y-4">
            <h4 className="font-bold text-lg text-[#200E01] font-['Cormorant_Garamond',serif] italic">
              Edit Guardian & Student Details
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                setPersonalDetails({
                  fatherName: (form.elements.namedItem('father') as HTMLInputElement).value,
                  motherName: (form.elements.namedItem('mother') as HTMLInputElement).value,
                  dob: (form.elements.namedItem('dob') as HTMLInputElement).value,
                  bloodGroup: (form.elements.namedItem('blood') as HTMLInputElement).value,
                  age: (form.elements.namedItem('age') as HTMLInputElement).value,
                  mobileNumber: (form.elements.namedItem('mobile') as HTMLInputElement).value,
                });
                setIsEditPersonalOpen(false);
              }}
              className="space-y-2.5 text-xs"
            >
              <div>
                <label className="block font-bold text-[#5B0202] mb-0.5">Father's Name</label>
                <input
                  name="father"
                  defaultValue={personalDetails.fatherName}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#EDE7C7] bg-white font-semibold text-[#200E01]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#5B0202] mb-0.5">Mother's Name</label>
                <input
                  name="mother"
                  defaultValue={personalDetails.motherName}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#EDE7C7] bg-white font-semibold text-[#200E01]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#5B0202] mb-0.5">DOB</label>
                  <input
                    name="dob"
                    defaultValue={personalDetails.dob}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#EDE7C7] bg-white font-semibold text-[#200E01]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5B0202] mb-0.5">Blood Group</label>
                  <input
                    name="blood"
                    defaultValue={personalDetails.bloodGroup}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#EDE7C7] bg-white font-semibold text-[#200E01]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#5B0202] mb-0.5">Age</label>
                  <input
                    name="age"
                    defaultValue={personalDetails.age}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#EDE7C7] bg-white font-semibold text-[#200E01]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5B0202] mb-0.5">Mobile</label>
                  <input
                    name="mobile"
                    defaultValue={personalDetails.mobileNumber}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#EDE7C7] bg-white font-semibold text-[#200E01]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditPersonalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#EDE7C7] bg-white font-bold text-[#5B0202]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#8B0000] text-[#EDE7C7] font-bold hover:bg-[#700000] border border-[#D4AF37]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
