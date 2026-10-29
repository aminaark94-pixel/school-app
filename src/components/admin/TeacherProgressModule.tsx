import React, { useState, useMemo } from 'react';
import {
  Award,
  ShieldCheck,
  UserCheck,
  Clock,
  Shirt,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Edit3,
  Plus,
  Search,
  Filter,
  User,
  ShieldAlert,
  Calendar,
  X,
  Star,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import {
  TeacherProgressEvaluation,
  RegularityStatus,
  SkillLevel,
} from '../../types';

const MONTHS = [
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
  'April',
  'May',
];

export const TeacherProgressModule: React.FC = () => {
  const {
    currentUser,
    currentSchool,
    usersInSchool,
    teacherProgress,
    saveTeacherProgressReport,
  } = useSchoolData();

  const [selectedMonth, setSelectedMonth] = useState('October');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [searchQuery, setSearchQuery] = useState('');
  const [regularityFilter, setRegularityFilter] = useState<'all' | RegularityStatus>('all');
  const [editingEval, setEditingEval] = useState<TeacherProgressEvaluation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printEval, setPrintEval] = useState<TeacherProgressEvaluation | null>(null);

  // STRICT ACCESS CONTROL: Only admin (School Incharge / Top Management) can view this
  const isAdmin = currentUser?.role === 'admin';

  // Get all teachers in current school
  const teachersInSchool = useMemo(() => {
    return usersInSchool.filter((u) => u.role === 'teacher');
  }, [usersInSchool]);

  // Filter evaluations for the current school and selected month
  const evaluationsForMonth = useMemo(() => {
    return teacherProgress.filter(
      (ev) =>
        ev.school_id === currentSchool?.id &&
        ev.month.toLowerCase() === selectedMonth.toLowerCase() &&
        ev.year === selectedYear
    );
  }, [teacherProgress, currentSchool, selectedMonth, selectedYear]);

  // Filtered view by search and regularity
  const filteredEvaluations = useMemo(() => {
    return evaluationsForMonth.filter((ev) => {
      const matchesSearch =
        ev.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.subject_specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegularity =
        regularityFilter === 'all' || ev.regularity.status === regularityFilter;
      return matchesSearch && matchesRegularity;
    });
  }, [evaluationsForMonth, searchQuery, regularityFilter]);

  // KPI Metrics for Management Summary
  const kpiStats = useMemo(() => {
    const total = evaluationsForMonth.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        regularCount: 0,
        irregularCount: 0,
        incrementsRecommended: 0,
      };
    }
    const sumScore = evaluationsForMonth.reduce((acc, ev) => acc + ev.overall_score, 0);
    const regular = evaluationsForMonth.filter((ev) => ev.regularity.status === 'regular').length;
    const irregular = evaluationsForMonth.filter(
      (ev) => ev.regularity.status === 'irregular' || ev.regularity.status === 'occasional_late'
    ).length;
    const increments = evaluationsForMonth.filter(
      (ev) => ev.incharge_recommendation === 'increment'
    ).length;

    return {
      total,
      avgScore: Math.round(sumScore / total),
      regularCount: regular,
      irregularCount: irregular,
      incrementsRecommended: increments,
    };
  }, [evaluationsForMonth]);

  // Form State for Adding / Editing Evaluation
  const [formData, setFormData] = useState<{
    teacher_id: string;
    teacher_name: string;
    teacher_email: string;
    subject_specialty: string;
    assigned_grades: string;
    month: string;
    year: number;
    languageScore: SkillLevel;
    languageRating: string;
    languageNotes: string;
    dressingScore: SkillLevel;
    dressingRating: string;
    dressingNotes: string;
    workingScore: SkillLevel;
    workingRating: string;
    workingNotes: string;
    regularityStatus: RegularityStatus;
    regularityScore: SkillLevel;
    daysPresent: number;
    daysAbsent: number;
    lateArrivals: number;
    regularityNotes: string;
    inchargeRemarks: string;
    inchargeRecommendation: 'increment' | 'satisfactory' | 'guidance_required' | 'warning_issued';
  }>({
    teacher_id: '',
    teacher_name: '',
    teacher_email: '',
    subject_specialty: 'Senior Sciences & Mathematics',
    assigned_grades: 'Class 9, Class 10',
    month: selectedMonth,
    year: selectedYear,
    languageScore: 5,
    languageRating: 'Outstanding & Articulate',
    languageNotes: 'Clear bilingual communication and respectful student engagement.',
    dressingScore: 5,
    dressingRating: 'Immaculate & Formal',
    dressingNotes: 'Strict adherence to formal dress code, displays school ID badge.',
    workingScore: 4,
    workingRating: 'Exemplary Pedagogy & Timely',
    workingNotes: 'Syllabus on track, homework diary updated without backlog.',
    regularityStatus: 'regular',
    regularityScore: 5,
    daysPresent: 22,
    daysAbsent: 0,
    lateArrivals: 0,
    regularityNotes: 'Punctual at morning assembly and zero unexcused absences.',
    inchargeRemarks: 'Consistent performance and positive contribution to school environment.',
    inchargeRecommendation: 'satisfactory',
  });

  const handleOpenCreateModal = () => {
    const firstTeacher = teachersInSchool[0];
    setFormData({
      teacher_id: firstTeacher?.id || 'user-teacher-apex',
      teacher_name: firstTeacher?.full_name || 'Prof. Asim Munir',
      teacher_email: firstTeacher?.email || 'teacher@imperialgrammar.edu.pk',
      subject_specialty: 'Mathematics & Science Faculty',
      assigned_grades: 'Class 9, Class 10',
      month: selectedMonth,
      year: selectedYear,
      languageScore: 5,
      languageRating: 'Outstanding & Articulate',
      languageNotes: 'Engages learners effectively, uses polite and formal academic vocabulary.',
      dressingScore: 5,
      dressingRating: 'Immaculate & Formal',
      dressingNotes: 'Executive formal suit / blazer with tie and proper footwear.',
      workingScore: 5,
      workingRating: 'Exemplary Pedagogy & Timely',
      workingNotes: 'Lesson plans submitted well in advance; digital diary checked daily.',
      regularityStatus: 'regular',
      regularityScore: 5,
      daysPresent: 22,
      daysAbsent: 0,
      lateArrivals: 0,
      regularityNotes: 'Arrives 20 mins prior to assembly; zero unscheduled casual leaves.',
      inchargeRemarks: 'Highly recommended for annual appreciation certificate.',
      inchargeRecommendation: 'increment',
    });
    setEditingEval(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evalItem: TeacherProgressEvaluation) => {
    setEditingEval(evalItem);
    setFormData({
      teacher_id: evalItem.teacher_id,
      teacher_name: evalItem.teacher_name,
      teacher_email: evalItem.teacher_email || '',
      subject_specialty: evalItem.subject_specialty,
      assigned_grades: evalItem.assigned_grades.join(', '),
      month: evalItem.month,
      year: evalItem.year,
      languageScore: evalItem.language.score,
      languageRating: evalItem.language.rating,
      languageNotes: evalItem.language.notes,
      dressingScore: evalItem.dressing.score,
      dressingRating: evalItem.dressing.rating,
      dressingNotes: evalItem.dressing.notes,
      workingScore: evalItem.working.score,
      workingRating: evalItem.working.rating,
      workingNotes: evalItem.working.notes,
      regularityStatus: evalItem.regularity.status,
      regularityScore: evalItem.regularity.score,
      daysPresent: evalItem.regularity.days_present,
      daysAbsent: evalItem.regularity.days_absent,
      lateArrivals: evalItem.regularity.late_arrivals,
      regularityNotes: evalItem.regularity.notes,
      inchargeRemarks: evalItem.incharge_remarks,
      inchargeRecommendation: evalItem.incharge_recommendation,
    });
    setIsModalOpen(true);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;

    // Calculate overall score out of 100 based on the 4 pillars (25% each)
    const langPct = (formData.languageScore / 5) * 25;
    const dressPct = (formData.dressingScore / 5) * 25;
    const workPct = (formData.workingScore / 5) * 25;
    const regPct = (formData.regularityScore / 5) * 25;
    const totalPct = Math.round(langPct + dressPct + workPct + regPct);
    const grade =
      totalPct >= 90 ? 'A+' : totalPct >= 80 ? 'A' : totalPct >= 70 ? 'B' : totalPct >= 60 ? 'C' : 'D';

    const newEval: TeacherProgressEvaluation = {
      id: editingEval?.id || `eval-${formData.teacher_id}-${formData.month.toLowerCase()}${formData.year}`,
      school_id: currentSchool.id,
      teacher_id: formData.teacher_id,
      teacher_name: formData.teacher_name,
      teacher_email: formData.teacher_email,
      subject_specialty: formData.subject_specialty,
      assigned_grades: formData.assigned_grades
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      month: formData.month,
      year: formData.year,
      language: {
        score: formData.languageScore,
        rating: formData.languageRating,
        notes: formData.languageNotes,
      },
      dressing: {
        score: formData.dressingScore,
        rating: formData.dressingRating,
        notes: formData.dressingNotes,
      },
      working: {
        score: formData.workingScore,
        rating: formData.workingRating,
        notes: formData.workingNotes,
      },
      regularity: {
        status: formData.regularityStatus,
        score: formData.regularityScore,
        days_present: Number(formData.daysPresent),
        days_absent: Number(formData.daysAbsent),
        late_arrivals: Number(formData.lateArrivals),
        notes: formData.regularityNotes,
      },
      overall_score: totalPct,
      overall_grade: grade,
      incharge_remarks: formData.inchargeRemarks,
      incharge_recommendation: formData.inchargeRecommendation,
      evaluated_by_id: currentUser?.id || 'admin',
      evaluated_by_name: currentUser?.full_name || 'School Incharge',
      created_at: editingEval?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveTeacherProgressReport(newEval);
    setIsModalOpen(false);
  };

  // If not admin, show security access barrier
  if (!isAdmin) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-300">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-amber-950 font-['Cinzel',serif]">
          Restricted Management &amp; Incharge Portal
        </h2>
        <p className="mt-2 text-sm text-amber-800 leading-relaxed">
          Faculty Performance Evaluations, Dressing Assessments, Work Audits, and Regularity Records are strictly confidential to <strong>School Principals, Campus Incharges, and Top Management</strong>.
        </p>
        <p className="mt-3 text-xs text-amber-700/80 font-mono">
          Current Role: <span className="font-bold uppercase">{currentUser?.role || 'Guest'}</span> — Access Denied by Role Level Security (RLS).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div
        className="rounded-2xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--t-primary) 0%, color-mix(in srgb, var(--t-primary) 70%, #000) 100%)',
          borderColor: 'var(--t-accent)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-amber-300 border border-amber-400/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Incharge &amp; Management Confidential Appraisal Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-['Cinzel',serif]">
              Teacher Performance &amp; Regularity Module
            </h1>
            <p className="mt-1 text-sm text-white/80 max-w-2xl">
              Monthly administrative evaluation of faculty across <strong>Language Proficiency</strong>, <strong>Professional Dressing</strong>, <strong>Teaching Pedagogy / Working</strong>, and <strong>Punctuality / Regularity</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Faculty Appraisal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Management KPI Overview Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty Assessed</p>
            <p className="text-2xl font-black text-slate-900">{kpiStats.total}</p>
            <p className="text-[11px] text-slate-500">{selectedMonth} {selectedYear}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Campus Index</p>
            <p className="text-2xl font-black text-emerald-700">{kpiStats.avgScore}%</p>
            <p className="text-[11px] text-emerald-600 font-medium">Composite 4-Pillar Score</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Regular &amp; Punctual</p>
            <p className="text-2xl font-black text-teal-700">{kpiStats.regularCount}</p>
            <p className="text-[11px] text-teal-600 font-medium">100% On-time Attendance</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Punctuality Flags</p>
            <p className="text-2xl font-black text-rose-700">{kpiStats.irregularCount}</p>
            <p className="text-[11px] text-rose-600 font-medium">Late or Irregular Attendance</p>
          </div>
        </div>
      </div>

      {/* 3. Filter & Month Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Appraisal Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m} {selectedYear}
              </option>
            ))}
          </select>
        </div>

        {/* Regularity Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setRegularityFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              regularityFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Teachers ({evaluationsForMonth.length})
          </button>
          <button
            onClick={() => setRegularityFilter('regular')}
            className={`px-3 py-1 rounded-lg transition ${
              regularityFilter === 'regular'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🟢 Regular &amp; Punctual
          </button>
          <button
            onClick={() => setRegularityFilter('irregular')}
            className={`px-3 py-1 rounded-lg transition ${
              regularityFilter === 'irregular'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔴 Irregular / Absentees
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50"
          />
        </div>
      </div>

      {/* 4. Teacher Evaluation Cards */}
      {filteredEvaluations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 font-['Cinzel',serif]">
            No Appraisals Found for {selectedMonth} {selectedYear}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            No evaluations match your search or filter criteria. Click "New Faculty Appraisal" above to grade a teacher for this academic month.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Grade Teacher for {selectedMonth}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredEvaluations.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* Card Top Banner */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-black text-xl shrink-0 font-['Cinzel',serif]">
                    {ev.teacher_name
                      .split(' ')
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 font-['Cinzel',serif]">
                        {ev.teacher_name}
                      </h3>
                      {ev.regularity.status === 'regular' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Regular &amp; Punctual</span>
                        </span>
                      ) : ev.regularity.status === 'occasional_late' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Occasional Late</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Irregular / Chronic Leaves</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {ev.subject_specialty} • Assigned: {ev.assigned_grades.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Score & Action Buttons */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900 leading-none">
                      {ev.overall_score}%
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      Grade {ev.overall_grade}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => handleOpenEditModal(ev)}
                      title="Edit this evaluation"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setPrintEval(ev);
                        setTimeout(() => window.print(), 200);
                      }}
                      title="Print Official Appraisal Slip"
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Pillars Breakdown Grid */}
              <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Language Pillar */}
                <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                      <span className="flex items-center gap-1.5 text-blue-700">
                        <MessageSquare className="w-4 h-4" />
                        <span>Language &amp; Tone</span>
                      </span>
                      <span className="text-amber-500 flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < ev.language.score ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{ev.language.rating}</p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{ev.language.notes}</p>
                  </div>
                </div>

                {/* 2. Dressing Pillar */}
                <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                      <span className="flex items-center gap-1.5 text-purple-700">
                        <Shirt className="w-4 h-4" />
                        <span>Dressing &amp; Grooming</span>
                      </span>
                      <span className="text-amber-500 flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < ev.dressing.score ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{ev.dressing.rating}</p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{ev.dressing.notes}</p>
                  </div>
                </div>

                {/* 3. Working Pillar */}
                <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <BookOpen className="w-4 h-4" />
                        <span>Working &amp; Pedagogy</span>
                      </span>
                      <span className="text-amber-500 flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < ev.working.score ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{ev.working.rating}</p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{ev.working.notes}</p>
                  </div>
                </div>

                {/* 4. Regularity Pillar */}
                <div
                  className={`rounded-xl p-3.5 border flex flex-col justify-between ${
                    ev.regularity.status === 'irregular'
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-slate-50/60 border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                      <span className="flex items-center gap-1.5 text-teal-700">
                        <Clock className="w-4 h-4" />
                        <span>Regularity Record</span>
                      </span>
                      <span className="text-amber-500 flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < ev.regularity.score ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-700">
                      <span>Pres: <strong className="text-emerald-700">{ev.regularity.days_present}d</strong></span>
                      <span>Abs: <strong className="text-rose-700">{ev.regularity.days_absent}d</strong></span>
                      <span>Late: <strong className="text-amber-700">{ev.regularity.late_arrivals}x</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{ev.regularity.notes}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Incharge Remarks & Recommendations */}
              <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0">Incharge Verdict:</span>
                  <p className="text-slate-600 italic">"{ev.incharge_remarks}"</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <span className="text-[11px] text-slate-500">Decision:</span>
                  {ev.incharge_recommendation === 'increment' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      🌟 Increment / Bonus Recommended
                    </span>
                  )}
                  {ev.incharge_recommendation === 'satisfactory' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                      ✅ Satisfactory Performance
                    </span>
                  )}
                  {ev.incharge_recommendation === 'guidance_required' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      ⚠️ Counseling / Guidance Required
                    </span>
                  )}
                  {ev.incharge_recommendation === 'warning_issued' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                      🚫 Formal Warning Issued
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Create / Edit Appraisal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Cinzel',serif]">
                    {editingEval ? 'Edit Teacher Appraisal' : 'New Teacher Performance Evaluation'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Confidential School Incharge &amp; Management Assessment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              {/* Teacher & Month Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Faculty Member:</label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => {
                      const t = teachersInSchool.find((teach) => teach.id === e.target.value);
                      if (t) {
                        setFormData((prev) => ({
                          ...prev,
                          teacher_id: t.id,
                          teacher_name: t.full_name,
                          teacher_email: t.email,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-amber-500"
                  >
                    {teachersInSchool.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Specialty:</label>
                  <input
                    type="text"
                    value={formData.subject_specialty}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subject_specialty: e.target.value }))
                    }
                    placeholder="e.g. Mathematics & Sciences"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-slate-50"
                  />
                </div>
              </div>

              {/* 1. Language Pillar Evaluation */}
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-blue-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>1. Language &amp; Professional Communication (1-5):</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {([1, 2, 3, 4, 5] as SkillLevel[]).map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            languageScore: star,
                            languageRating:
                              star === 5
                                ? 'Outstanding & Articulate'
                                : star === 4
                                ? 'Professional & Clear'
                                : star === 3
                                ? 'Satisfactory'
                                : 'Needs Accent / Grammar Attention',
                          }))
                        }
                        className={`p-1 rounded-md transition ${
                          formData.languageScore >= star ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.languageNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, languageNotes: e.target.value }))
                  }
                  placeholder="Incharge notes on teacher's English/Urdu delivery, pronunciation and tone..."
                  className="w-full px-3 py-1.5 rounded-lg border border-blue-200 text-slate-900 bg-white"
                />
              </div>

              {/* 2. Dressing Pillar Evaluation */}
              <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-purple-900 flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-purple-600" />
                    <span>2. Dressing &amp; Grooming (1-5):</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {([1, 2, 3, 4, 5] as SkillLevel[]).map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            dressingScore: star,
                            dressingRating:
                              star === 5
                                ? 'Immaculate & Formal'
                                : star === 4
                                ? 'Professional Attire'
                                : star === 3
                                ? 'Casual / Boundary'
                                : 'Non-Compliant with Dress Code',
                          }))
                        }
                        className={`p-1 rounded-md transition ${
                          formData.dressingScore >= star ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.dressingNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, dressingNotes: e.target.value }))
                  }
                  placeholder="Incharge notes on suit/tie, lab coat, clean formal wear, badge..."
                  className="w-full px-3 py-1.5 rounded-lg border border-purple-200 text-slate-900 bg-white"
                />
              </div>

              {/* 3. Working & Pedagogy Evaluation */}
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>3. Working &amp; Pedagogy (1-5):</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {([1, 2, 3, 4, 5] as SkillLevel[]).map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            workingScore: star,
                            workingRating:
                              star === 5
                                ? 'Exemplary Pedagogy & Timely'
                                : star === 4
                                ? 'Syllabus on Track'
                                : star === 3
                                ? 'Delayed Diary Checking'
                                : 'Below Academic Standard',
                          }))
                        }
                        className={`p-1 rounded-md transition ${
                          formData.workingScore >= star ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.workingNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, workingNotes: e.target.value }))
                  }
                  placeholder="Incharge notes on diary updates, checking quality, student engagement..."
                  className="w-full px-3 py-1.5 rounded-lg border border-emerald-200 text-slate-900 bg-white"
                />
              </div>

              {/* 4. Regularity & Absentee Monitoring */}
              <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-teal-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>4. Regularity &amp; Punctuality:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 font-bold text-emerald-800">
                      <input
                        type="radio"
                        name="regStatus"
                        checked={formData.regularityStatus === 'regular'}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            regularityStatus: 'regular',
                            regularityScore: 5,
                          }))
                        }
                      />
                      <span>Regular</span>
                    </label>
                    <label className="inline-flex items-center gap-1 font-bold text-amber-800">
                      <input
                        type="radio"
                        name="regStatus"
                        checked={formData.regularityStatus === 'occasional_late'}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            regularityStatus: 'occasional_late',
                            regularityScore: 3,
                          }))
                        }
                      />
                      <span>Late</span>
                    </label>
                    <label className="inline-flex items-center gap-1 font-bold text-rose-800">
                      <input
                        type="radio"
                        name="regStatus"
                        checked={formData.regularityStatus === 'irregular'}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            regularityStatus: 'irregular',
                            regularityScore: 2,
                          }))
                        }
                      />
                      <span>Irregular</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold">Days Present:</span>
                    <input
                      type="number"
                      value={formData.daysPresent}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, daysPresent: Number(e.target.value) }))
                      }
                      className="w-full px-2 py-1 rounded border border-teal-200 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold">Days Absent:</span>
                    <input
                      type="number"
                      value={formData.daysAbsent}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, daysAbsent: Number(e.target.value) }))
                      }
                      className="w-full px-2 py-1 rounded border border-teal-200 bg-white font-bold text-rose-600"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold">Late Arrivals:</span>
                    <input
                      type="number"
                      value={formData.lateArrivals}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, lateArrivals: Number(e.target.value) }))
                      }
                      className="w-full px-2 py-1 rounded border border-teal-200 bg-white font-bold text-amber-600"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.regularityNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, regularityNotes: e.target.value }))
                  }
                  placeholder="Incharge notes on morning assembly punctuality, biometric log..."
                  className="w-full px-3 py-1.5 rounded-lg border border-teal-200 text-slate-900 bg-white"
                />
              </div>

              {/* Final Incharge Remarks & Verdict */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Management Decision:</label>
                  <select
                    value={formData.inchargeRecommendation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        inchargeRecommendation: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-slate-50"
                  >
                    <option value="increment">🌟 Increment / Bonus Recommended</option>
                    <option value="satisfactory">✅ Satisfactory — Continue</option>
                    <option value="guidance_required">⚠️ Counseling / Guidance Required</option>
                    <option value="warning_issued">🚫 Formal Warning Issued</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confidential Incharge Verdict:</label>
                  <input
                    type="text"
                    value={formData.inchargeRemarks}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev,inchargeRemarks: e.target.value }))
                    }
                    placeholder="Executive summary of faculty performance..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-slate-50"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md cursor-pointer"
                >
                  Save Faculty Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Printable Appraisal Slip (Hidden from screen view, visible on window.print) */}
      {printEval && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 z-50 text-slate-900">
          <div className="border-4 border-double border-slate-800 p-6 rounded-lg max-w-2xl mx-auto">
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
              <h1 className="text-2xl font-black font-['Cinzel',serif] uppercase tracking-wide">
                {currentSchool?.name}
              </h1>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-600 mt-0.5">
                Confidential Faculty Performance Appraisal
              </p>
              <p className="text-xs font-mono mt-1">
                Evaluation Period: {printEval.month} {printEval.year}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-4 pb-4 border-b border-slate-200">
              <div>
                <p><strong>Faculty Name:</strong> {printEval.teacher_name}</p>
                <p><strong>Subject Specialty:</strong> {printEval.subject_specialty}</p>
                <p><strong>Assigned Classes:</strong> {printEval.assigned_grades.join(', ')}</p>
              </div>
              <div className="text-right">
                <p><strong>Composite Score:</strong> {printEval.overall_score}% (Grade {printEval.overall_grade})</p>
                <p><strong>Regularity Status:</strong> {printEval.regularity.status.toUpperCase()}</p>
                <p><strong>Evaluated By:</strong> {printEval.evaluated_by_name}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="border p-2 rounded">
                <p className="font-bold">1. Language &amp; Communication ({printEval.language.score}/5):</p>
                <p className="text-slate-700 italic">{printEval.language.notes}</p>
              </div>
              <div className="border p-2 rounded">
                <p className="font-bold">2. Professional Dressing &amp; Grooming ({printEval.dressing.score}/5):</p>
                <p className="text-slate-700 italic">{printEval.dressing.notes}</p>
              </div>
              <div className="border p-2 rounded">
                <p className="font-bold">3. Working &amp; Pedagogy ({printEval.working.score}/5):</p>
                <p className="text-slate-700 italic">{printEval.working.notes}</p>
              </div>
              <div className="border p-2 rounded">
                <p className="font-bold">4. Regularity &amp; Attendance Record ({printEval.regularity.score}/5):</p>
                <p className="text-slate-700">
                  Present: {printEval.regularity.days_present} days | Absent: {printEval.regularity.days_absent} days | Late: {printEval.regularity.late_arrivals} times
                </p>
                <p className="text-slate-700 italic mt-0.5">{printEval.regularity.notes}</p>
              </div>
            </div>

            <div className="border-t border-slate-400 pt-3 text-xs mb-8">
              <p><strong>Incharge Verdict:</strong> {printEval.incharge_remarks}</p>
              <p className="mt-1">
                <strong>Executive Action:</strong> {printEval.incharge_recommendation.toUpperCase()}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-8 border-t border-slate-300">
              <div className="text-center">
                <div className="w-36 border-b border-slate-600 mb-1"></div>
                <span>Faculty Signature</span>
              </div>
              <div className="text-center">
                <div className="w-36 border-b border-slate-600 mb-1"></div>
                <span>Campus Incharge Seal &amp; Sign</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
