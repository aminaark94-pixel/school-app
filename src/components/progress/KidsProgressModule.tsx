import React, { useState, useMemo } from 'react';
import {
  Award,
  Sparkles,
  Star,
  BookOpen,
  PenTool,
  MessageCircle,
  ShieldCheck,
  Sparkle,
  Plus,
  Edit3,
  Calendar,
  Filter,
  Users,
  Search,
  CheckCircle2,
  ChevronRight,
  Printer,
  Heart,
  Smile,
  Zap,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { MonthlyKidsProgress, SkillEvaluation, SkillLevel, Student } from '../../types';

const PILLARS = [
  { key: 'language', label: 'Language & Communication', icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-600' },
  { key: 'discipline', label: 'Discipline & Behavior', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-600' },
  { key: 'writing', label: 'Writing & Penmanship', icon: PenTool, color: 'text-purple-600', bg: 'bg-purple-50', bar: 'bg-purple-600' },
  { key: 'reading', label: 'Reading & Comprehension', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-600' },
  { key: 'cleaning', label: 'Cleaning & Personal Hygiene', icon: Sparkle, color: 'text-teal-600', bg: 'bg-teal-50', bar: 'bg-teal-600' },
] as const;

const AVAILABLE_BADGES = [
  '⭐ Star of the Month',
  '📚 Avid Bookworm',
  '🧼 Neat Desk Champion',
  '🗣️ Eloquent Speaker',
  '🤝 Helpful Classmate',
  '✨ Creative Thinker',
  '🎖️ Perfect Attendance',
  '🎨 Artistic Expression',
];

export const KidsProgressModule: React.FC = () => {
  const { currentSchool, currentUser, students } = useSchoolData();

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const isParent = currentUser?.role === 'parent';

  // Selected Month
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  // Filter states for Teacher
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Parent's linked children (e.g. Pari's 4 kids!)
  const parentChildren = useMemo(() => {
    return students.filter(
      (s) => s.parent_id === currentUser?.id || s.parent_email === currentUser?.email
    );
  }, [students, currentUser]);

  const [selectedChildId, setSelectedChildId] = useState<string>(
    parentChildren[0]?.id || students[0]?.id || ''
  );

  // Sync child when user switches
  React.useEffect(() => {
    if (parentChildren.length > 0 && !parentChildren.some((c) => c.id === selectedChildId)) {
      setSelectedChildId(parentChildren[0].id);
    }
  }, [parentChildren, selectedChildId]);

  // Storage for Progress Reports
  const [progressReports, setProgressReports] = useState<MonthlyKidsProgress[]>(() => {
    try {
      const raw = localStorage.getItem('sms_kids_progress_v1');
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    // Default initial seed progress reports
    return [];
  });

  // Save changes
  const saveReport = (report: MonthlyKidsProgress) => {
    setProgressReports((prev) => {
      const index = prev.findIndex((r) => r.student_id === report.student_id && r.month === report.month);
      const updated = index >= 0 ? prev.map((r, i) => (i === index ? report : r)) : [report, ...prev];
      localStorage.setItem('sms_kids_progress_v1', JSON.stringify(updated));
      return updated;
    });
  };

  // Evaluation Form Modal state for Teacher
  const [evaluatingStudent, setEvaluatingStudent] = useState<Student | null>(null);
  const [formLanguage, setFormLanguage] = useState<SkillLevel>(5);
  const [formDiscipline, setFormDiscipline] = useState<SkillLevel>(5);
  const [formWriting, setFormWriting] = useState<SkillLevel>(4);
  const [formReading, setFormReading] = useState<SkillLevel>(5);
  const [formCleaning, setFormCleaning] = useState<SkillLevel>(5);
  const [formRemarks, setFormRemarks] = useState('');
  const [formBadges, setFormBadges] = useState<string[]>(['⭐ Star of the Month']);

  const openEvaluationModal = (student: Student) => {
    setEvaluatingStudent(student);
    const existing = progressReports.find(
      (r) => r.student_id === student.id && r.month === selectedMonth
    );

    if (existing) {
      setFormLanguage(existing.language.score);
      setFormDiscipline(existing.discipline.score);
      setFormWriting(existing.writing.score);
      setFormReading(existing.reading.score);
      setFormCleaning(existing.cleaning.score);
      setFormRemarks(existing.teacher_remarks);
      setFormBadges(existing.badges || []);
    } else {
      setFormLanguage(5);
      setFormDiscipline(5);
      setFormWriting(4);
      setFormReading(5);
      setFormCleaning(5);
      setFormRemarks(
        `${student.name} has demonstrated commendable enthusiasm in class, maintaining exceptional personal cleanliness and polite communication.`
      );
      setFormBadges(['⭐ Star of the Month', '🧼 Neat Desk Champion']);
    }
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingStudent) return;

    const scores = [formLanguage, formDiscipline, formWriting, formReading, formCleaning];
    const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / 25) * 100);
    const overallGrade = avgScore >= 90 ? 'A+' : avgScore >= 80 ? 'A' : avgScore >= 70 ? 'B' : 'C';

    const scoreToEval = (score: SkillLevel): SkillEvaluation => ({
      score,
      grade: score === 5 ? 'A+' : score === 4 ? 'A' : score === 3 ? 'B' : 'C',
      status:
        score === 5 ? 'Outstanding' : score === 4 ? 'Very Good' : score === 3 ? 'Satisfactory' : 'Needs Support',
    });

    const existingReport = progressReports.find(
      (report) =>
        report.student_id === evaluatingStudent.id &&
        report.month === selectedMonth &&
        report.year === 2026
    );

    const newReport: MonthlyKidsProgress = {
      // Preserve the existing primary key when an evaluation is amended. A new
      // ID would create a second report for the same child and month in cloud mode.
      id: existingReport?.id || `prog-${evaluatingStudent.id}-${selectedMonth.toLowerCase()}-2026`,
      school_id: currentSchool?.id || 'school-apex',
      student_id: evaluatingStudent.id,
      student_name: evaluatingStudent.name,
      class_id: evaluatingStudent.class_id,
      section: evaluatingStudent.section,
      month: selectedMonth,
      year: 2026,
      language: scoreToEval(formLanguage),
      discipline: scoreToEval(formDiscipline),
      writing: scoreToEval(formWriting),
      reading: scoreToEval(formReading),
      cleaning: scoreToEval(formCleaning),
      teacher_id: currentUser?.id || 'teacher-1',
      teacher_name: currentUser?.full_name || 'Class Faculty Incharge',
      teacher_remarks: formRemarks.trim() || 'Remarkable academic and behavioral growth observed this month.',
      badges: formBadges,
      overall_score: avgScore,
      overall_grade: overallGrade,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveReport(newReport);
    setEvaluatingStudent(null);
  };

  const toggleBadge = (badge: string) => {
    setFormBadges((prev) => (prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]));
  };

  // Find report for a student
  const getStudentReport = (studentId: string): MonthlyKidsProgress | undefined => {
    const found = progressReports.find((r) => r.student_id === studentId && r.month === selectedMonth);
    if (found) return found;

    // Generate smart virtual report so demo is never blank!
    const std = students.find((s) => s.id === studentId);
    if (!std) return undefined;

    return {
      id: `prog-auto-${studentId}`,
      school_id: std.school_id,
      student_id: std.id,
      student_name: std.name,
      class_id: std.class_id,
      section: std.section,
      month: selectedMonth,
      year: 2026,
      language: { score: 5, grade: 'A+', status: 'Articulate & Expressive' },
      discipline: { score: 5, grade: 'A+', status: 'Courteous & Attentive' },
      writing: { score: 4, grade: 'A', status: 'Neat Handwriting' },
      reading: { score: 5, grade: 'A+', status: 'Fluent Pronunciation' },
      cleaning: { score: 5, grade: 'A+', status: 'Immaculate Uniform & Desk' },
      teacher_id: 'user-teacher-apex',
      teacher_name: 'Prof. Asim Munir',
      teacher_remarks: `${std.name} has shown remarkable progress in classroom participation, reading fluency, and personal grooming. Maintains a very tidy desk and respectful behavior.`,
      badges: ['⭐ Star of the Month', '🧼 Neat Desk Champion', '📚 Avid Bookworm'],
      overall_score: 96,
      overall_grade: 'A+',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  // Filtered Students for Teacher
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== 'all' && s.class_id !== selectedClass) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q);
      }
      return true;
    });
  }, [students, selectedClass, searchQuery]);

  const uniqueClasses = Array.from(new Set(students.map((s) => s.class_id))).sort();

  // Selected Child for Parent
  const activeChild = students.find((s) => s.id === selectedChildId) || parentChildren[0] || students[0];
  const activeChildReport = activeChild ? getStudentReport(activeChild.id) : undefined;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EDE7C7] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#200E01] font-['Cinzel',serif]">
                  Kids Monthly Character &amp; Skills Progress
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Developmental Report
                </span>
              </div>
              <p className="text-xs text-[#5B0202]/70 mt-1 max-w-2xl">
                Comprehensive monthly evaluation of junior and senior scholars across 5 fundamental pillars:{' '}
                <b>Language, Discipline, Writing, Reading, and Cleaning (Hygiene &amp; Uniform)</b>.
              </p>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <Calendar className="w-4 h-4 text-[#8B0000]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold p-2 rounded-xl border border-[#EDE7C7] bg-[#FAF8F2] text-[#200E01] focus:ring-[#8B0000]"
            >
              <option value="October 2026">October 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="November 2026">November 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. PARENT VIEW: Multi-Child Switcher & Official Development Card */}
      {isParent && (
        <div className="space-y-6">
          {/* Pari's 4 Kids Switcher Tabs */}
          {parentChildren.length > 1 && (
            <div className="bg-[#FAF8F2] p-3 rounded-3xl border border-[#EDE7C7] space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B0202]">
                  Enrolled Children of {currentUser?.full_name} ({parentChildren.length} Kids)
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Select child to view report</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {parentChildren.map((child) => {
                  const isSelected = child.id === activeChild?.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChildId(child.id)}
                      className={`p-3 rounded-2xl text-left transition border flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-[#8B0000] shadow-sm ring-2 ring-[#8B0000]/20'
                          : 'bg-white/70 border-[#EDE7C7] hover:bg-white hover:border-[#D4AF37]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#FAF8F2] text-[#8B0000] border border-[#EDE7C7]">
                          {child.class_id}
                        </span>
                        {isSelected && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <div className="mt-2">
                        <h4 className="text-xs font-bold text-[#200E01] truncate">{child.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Roll: {child.roll_number}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Child's Monthly Visual Progress Card */}
          {activeChild && activeChildReport && (
            <div className="bg-white rounded-3xl border border-[#EDE7C7] p-6 shadow-sm space-y-6">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EDE7C7]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-2xl shadow-md font-['Cinzel',serif]">
                    {activeChild.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#200E01]">{activeChild.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Grade {activeChildReport.overall_grade}
                      </span>
                    </div>
                    <p className="text-xs text-[#5B0202]/70 mt-0.5">
                      Class: <b>{activeChild.class_id}</b> (Section {activeChild.section}) • Roll No:{' '}
                      <span className="font-mono">{activeChild.roll_number}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Report Month: <b>{activeChildReport.month}</b> • Evaluated by:{' '}
                      <b>{activeChildReport.teacher_name}</b>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF8F2] border border-[#EDE7C7] text-[#5B0202] hover:bg-[#8B0000]/10 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Progress Slip</span>
                  </button>
                </div>
              </div>

              {/* 5 Core Pillars Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#5B0202]">
                  Pillar-wise Monthly Skills Assessment
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PILLARS.map((pillar) => {
                    const evalData: SkillEvaluation = activeChildReport[pillar.key];
                    const Icon = pillar.icon;
                    const stars = Array.from({ length: 5 }, (_, i) => i < evalData.score);

                    return (
                      <div
                        key={pillar.key}
                        className="p-4 rounded-2xl border border-[#EDE7C7] bg-[#FAF8F2]/60 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg ${pillar.bg} ${pillar.color}`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <span className="text-xs font-bold text-[#200E01]">{pillar.label}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-white border border-[#EDE7C7] text-[#8B0000]">
                            {evalData.grade}
                          </span>
                        </div>

                        {/* Stars Rating */}
                        <div className="flex items-center gap-1">
                          {stars.map((filled, sIdx) => (
                            <Star
                              key={sIdx}
                              className={`w-4 h-4 ${
                                filled ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-1.5">
                            {evalData.score} / 5
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${pillar.bar} transition-all duration-500`}
                            style={{ width: `${(evalData.score / 5) * 100}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-slate-600 italic">
                          Status: <b>{evalData.status}</b>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Awarded Badges & Stars */}
              {activeChildReport.badges && activeChildReport.badges.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#5B0202]">
                    Achieved Badges &amp; Monthly Honors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeChildReport.badges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-bold text-xs shadow-2xs"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher Remarks & Encouragement */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                  Class Teacher Commendation &amp; Advice:
                </span>
                <p className="text-xs text-[#200E01] leading-relaxed font-medium">
                  "{activeChildReport.teacher_remarks}"
                </p>
                <p className="text-[10px] text-[#5B0202]/70 text-right font-bold mt-1">
                  — {activeChildReport.teacher_name} ({currentSchool?.name})
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TEACHER & ADMIN VIEW: Full School Class Roster & Progress Recording */}
      {isTeacherOrAdmin && (
        <div className="space-y-5">
          {/* Controls Bar: Filter by Class, Search, Quick Counts */}
          <div className="bg-white rounded-3xl border border-[#EDE7C7] p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-[#8B0000]" />
                <span className="text-xs font-bold text-[#200E01]">Filter by Class:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-xs font-bold p-1.5 rounded-xl border border-[#EDE7C7] bg-[#FAF8F2]"
                >
                  <option value="all">All Classes ({students.length})</option>
                  {uniqueClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student or roll no..."
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-[#EDE7C7] bg-[#FAF8F2]"
                />
              </div>
            </div>
          </div>

          {/* Student Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((std) => {
              const report = getStudentReport(std.id);
              return (
                <div
                  key={std.id}
                  className="bg-white rounded-3xl border border-[#EDE7C7] p-5 space-y-3 shadow-xs hover:border-[#D4AF37] transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#FAF8F2] border border-[#EDE7C7] text-[#8B0000]">
                            {std.class_id}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{std.roll_number}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#200E01] mt-1 truncate">{std.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          Guardian: {std.parent_name || 'Guardian'}
                        </p>
                      </div>

                      {report && (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                          {report.overall_grade} ({report.overall_score}%)
                        </span>
                      )}
                    </div>

                    {/* 5 Skills Summary Pill Strip */}
                    {report && (
                      <div className="grid grid-cols-5 gap-1 pt-1 text-center text-[10px] font-bold">
                        <div className="p-1 rounded-lg bg-blue-50 text-blue-900">
                          <span className="block text-[8px] text-slate-400">LANG</span>
                          {report.language.score}★
                        </div>
                        <div className="p-1 rounded-lg bg-amber-50 text-amber-900">
                          <span className="block text-[8px] text-slate-400">DISC</span>
                          {report.discipline.score}★
                        </div>
                        <div className="p-1 rounded-lg bg-purple-50 text-purple-900">
                          <span className="block text-[8px] text-slate-400">WRIT</span>
                          {report.writing.score}★
                        </div>
                        <div className="p-1 rounded-lg bg-emerald-50 text-emerald-900">
                          <span className="block text-[8px] text-slate-400">READ</span>
                          {report.reading.score}★
                        </div>
                        <div className="p-1 rounded-lg bg-teal-50 text-teal-900">
                          <span className="block text-[8px] text-slate-400">CLEAN</span>
                          {report.cleaning.score}★
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#EDE7C7]/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">Month: {selectedMonth}</span>
                    <button
                      onClick={() => openEvaluationModal(std)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8B0000] text-white hover:bg-[#700000] transition shadow-2xs"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Record Progress</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Teacher Evaluation Modal */}
      {evaluatingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 border border-[#EDE7C7] shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE7C7]">
              <div>
                <h3 className="text-base font-bold text-[#200E01]">
                  Record Monthly Progress: {evaluatingStudent.name}
                </h3>
                <p className="text-xs text-[#5B0202]/70">
                  {evaluatingStudent.class_id} • Roll: {evaluatingStudent.roll_number} • {selectedMonth}
                </p>
              </div>
              <button
                onClick={() => setEvaluatingStudent(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              {/* 5 Core Pillars Ratings */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B0202] block">
                  Evaluate Core Pillars (1 to 5 Stars):
                </span>

                {/* 1. Language */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="font-bold text-[#200E01]">1. Language &amp; Communication</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormLanguage(num as SkillLevel)}
                        className={`p-1 rounded-md ${
                          num <= formLanguage ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Discipline */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="font-bold text-[#200E01]">2. Discipline &amp; Behavior</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormDiscipline(num as SkillLevel)}
                        className={`p-1 rounded-md ${
                          num <= formDiscipline ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Writing */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="font-bold text-[#200E01]">3. Writing &amp; Penmanship</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormWriting(num as SkillLevel)}
                        className={`p-1 rounded-md ${
                          num <= formWriting ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Reading */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="font-bold text-[#200E01]">4. Reading &amp; Fluency</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormReading(num as SkillLevel)}
                        className={`p-1 rounded-md ${
                          num <= formReading ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Cleaning */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F2] border border-[#EDE7C7]">
                  <span className="font-bold text-[#200E01]">5. Cleaning, Uniform &amp; Hygiene</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormCleaning(num as SkillLevel)}
                        className={`p-1 rounded-md ${
                          num <= formCleaning ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges Checklist */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Award Special Badges:</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_BADGES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBadge(b)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                        formBadges.includes(b)
                          ? 'bg-amber-100 border-amber-300 text-amber-950 font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teacher Remarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Teacher's Personal Remarks &amp; Feedback:
                </label>
                <textarea
                  rows={3}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#EDE7C7] bg-[#FAF8F2] focus:ring-2 focus:ring-[#8B0000]"
                  placeholder="Share constructive feedback and praise for the student..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EDE7C7]">
                <button
                  type="button"
                  onClick={() => setEvaluatingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000] shadow-xs"
                >
                  Save Monthly Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
