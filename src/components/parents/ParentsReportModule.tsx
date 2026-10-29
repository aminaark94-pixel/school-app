import React, { useState, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  BookOpen,
  MessageSquare,
  Clock,
  Phone,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Printer,
  Edit3,
  Calendar,
  X,
  Sparkles,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { ParentReportCard, ParentVigilanceLevel } from '../../types';

export const ParentsReportModule: React.FC = () => {
  const {
    currentUser,
    currentSchool,
    parentsReports,
    saveParentReportCard,
    students,
  } = useSchoolData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<
    'all' | 'attention_needed' | 'proactive' | 'multi_kid'
  >('all');
  const [editingCard, setEditingCard] = useState<ParentReportCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printCard, setPrintCard] = useState<ParentReportCard | null>(null);

  // STRICT ACCESS CONTROL: Only Admin & Teachers can view the Parents Report Card
  const canAccess = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  // Filter report cards for current school
  const schoolReports = useMemo(() => {
    return parentsReports.filter((r) => r.school_id === currentSchool?.id);
  }, [parentsReports, currentSchool]);

  // Filtered view by search and status
  const filteredReports = useMemo(() => {
    return schoolReports.filter((card) => {
      // Search matching parent name, parent email, or any linked child name
      const query = searchQuery.toLowerCase();
      const matchesParent =
        card.parent_name.toLowerCase().includes(query) ||
        card.parent_email.toLowerCase().includes(query) ||
        card.parent_phone.includes(query);
      const matchesChild = card.children.some((c) =>
        c.student_name.toLowerCase().includes(query) || c.class_id.toLowerCase().includes(query)
      );

      if (!matchesParent && !matchesChild) return false;

      if (filterMode === 'attention_needed') return card.extense_attention_needed;
      if (filterMode === 'proactive') return card.vigilance_level === 'proactive';
      if (filterMode === 'multi_kid') return card.children_count > 1;
      return true;
    });
  }, [schoolReports, searchQuery, filterMode]);

  // KPI Analytics for Teachers & Management
  const kpiStats = useMemo(() => {
    const total = schoolReports.length;
    if (total === 0) {
      return {
        totalParents: 0,
        totalChildren: 0,
        attentionNeededCount: 0,
        proactiveCount: 0,
        avgDiaryReadRate: 0,
      };
    }
    const totalKids = schoolReports.reduce((acc, c) => acc + c.children_count, 0);
    const attentionNeeded = schoolReports.filter((c) => c.extense_attention_needed).length;
    const proactive = schoolReports.filter((c) => c.vigilance_level === 'proactive').length;
    const sumRead = schoolReports.reduce((acc, c) => acc + c.metrics.diary_read_rate, 0);

    return {
      totalParents: total,
      totalChildren: totalKids,
      attentionNeededCount: attentionNeeded,
      proactiveCount: proactive,
      avgDiaryReadRate: Math.round(sumRead / total),
    };
  }, [schoolReports]);

  // Form State for editing teacher notes or attention directives
  const [formData, setFormData] = useState<{
    teacher_notes: string;
    extense_attention_needed: boolean;
    attention_reason: string;
    vigilance_level: ParentVigilanceLevel;
  }>({
    teacher_notes: '',
    extense_attention_needed: false,
    attention_reason: '',
    vigilance_level: 'proactive',
  });

  const handleOpenEdit = (card: ParentReportCard) => {
    setEditingCard(card);
    setFormData({
      teacher_notes: card.teacher_notes || '',
      extense_attention_needed: card.extense_attention_needed,
      attention_reason: card.attention_reason || '',
      vigilance_level: card.vigilance_level,
    });
    setIsModalOpen(true);
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    const updatedCard: ParentReportCard = {
      ...editingCard,
      teacher_notes: formData.teacher_notes,
      extense_attention_needed: formData.extense_attention_needed,
      attention_reason: formData.attention_reason,
      vigilance_level: formData.vigilance_level,
      last_contacted_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveParentReportCard(updatedCard);
    setIsModalOpen(false);
  };

  // Restrict access for parents
  if (!canAccess) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-300">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-amber-950 font-['Cinzel',serif]">
          Confidential Faculty &amp; Incharge Document
        </h2>
        <p className="mt-2 text-sm text-amber-800 leading-relaxed">
          The <strong>Parents Vigilance &amp; App Engagement Report Card</strong> is an internal academic tool exclusively for <strong>Teachers and School Administration</strong> to diagnose which students have low home study supervision and require extended classroom attention.
        </p>
        <p className="mt-3 text-xs text-amber-700/80 font-mono">
          Parent accounts cannot view internal faculty appraisals of parental vigilance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div
        className="rounded-2xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, var(--t-primary) 100%)',
          borderColor: 'var(--t-accent)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-amber-300 border border-amber-400/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Internal Faculty &amp; Incharge Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-['Cinzel',serif]">
              Parents Report Card &amp; App Vigilance Index
            </h1>
            <p className="mt-1 text-sm text-indigo-100 max-w-2xl">
              Monitors which parents are proactive for their children vs neglectful, tracks backend app usage, diary sign-offs, and alerts teachers on who requires <strong>extense classroom attention</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-indigo-200">
              Logged in as: <strong className="text-white uppercase">{currentUser?.role}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Management KPI Overview Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent Accounts</p>
            <p className="text-2xl font-black text-slate-900">{kpiStats.totalParents}</p>
            <p className="text-[11px] text-slate-500 font-medium">Covering {kpiStats.totalChildren} Students</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Attention Needed</p>
            <p className="text-2xl font-black text-rose-700">{kpiStats.attentionNeededCount}</p>
            <p className="text-[11px] text-rose-600 font-bold">Inactive Parents ➔ Extra Focus</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proactive Parents</p>
            <p className="text-2xl font-black text-emerald-700">{kpiStats.proactiveCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Daily App Users &amp; Checkers</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Diary Reads</p>
            <p className="text-2xl font-black text-teal-700">{kpiStats.avgDiaryReadRate}%</p>
            <p className="text-[11px] text-teal-600 font-medium">Homework Receipt Ratio</p>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Parents ({schoolReports.length})
          </button>
          <button
            onClick={() => setFilterMode('attention_needed')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filterMode === 'attention_needed'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:text-rose-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Extense Attention Needed ({kpiStats.attentionNeededCount})</span>
          </button>
          <button
            onClick={() => setFilterMode('proactive')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === 'proactive'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            🌟 Highly Vigilant ({kpiStats.proactiveCount})
          </button>
          <button
            onClick={() => setFilterMode('multi_kid')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterMode === 'multi_kid'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👨‍👩‍👧‍👦 Multi-Kid Parents
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search parent name, student or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          />
        </div>
      </div>

      {/* 4. Parent Report Cards List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 font-['Cinzel',serif]">
            No Parent Report Cards Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            No parent accounts match the current filter or search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredReports.map((card) => {
            const isAttention = card.extense_attention_needed;
            return (
              <div
                key={card.id}
                className={`bg-white rounded-2xl border shadow-sm transition overflow-hidden ${
                  isAttention ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
                }`}
              >
                {/* 1. Header Strip: Parent Identity & Linked Kids */}
                <div
                  className={`p-5 sm:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isAttention ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50/70 border-slate-100'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 font-['Cinzel',serif] border ${
                        card.vigilance_level === 'proactive'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : card.vigilance_level === 'cooperative'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : card.vigilance_level === 'passive'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {card.parent_name
                        .split(' ')
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join('')}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 font-['Cinzel',serif]">
                          {card.parent_name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                          ID: {card.parent_id}
                        </span>

                        {card.vigilance_level === 'proactive' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Proactive &amp; Highly Vigilant</span>
                          </span>
                        )}
                        {card.vigilance_level === 'cooperative' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            <span>Regular &amp; Cooperative</span>
                          </span>
                        )}
                        {card.vigilance_level === 'passive' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Passive / Needs Reminders</span>
                          </span>
                        )}
                        {card.vigilance_level === 'neglectful' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Dormant / Neglectful</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                        <span>Email: <strong>{card.parent_email}</strong></span>
                        <span>•</span>
                        <span>Phone: <strong>{card.parent_phone}</strong></span>
                        <span>•</span>
                        <span className="text-indigo-700 font-bold">
                          {card.children_count} {card.children_count > 1 ? 'Children Enrolled' : 'Child Enrolled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Engagement & Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 leading-none">
                        {card.engagement_score}%
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Vigilance Index
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <a
                        href={`https://wa.me/${card.parent_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Send WhatsApp update to parent"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(card)}
                        title="Edit teacher notes & attention flags"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setPrintCard(card);
                          setTimeout(() => window.print(), 200);
                        }}
                        title="Print Parent Vigilance Slip"
                        className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Linked Children Strip (Shows all kids under this Single Parent ID) */}
                <div className="px-5 sm:px-6 py-3 bg-indigo-50/40 border-b border-indigo-100/60 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Linked Scholars ({card.children.length}):</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {card.children.map((child) => (
                      <span
                        key={child.student_id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <span>{child.student_name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px]">
                          {child.class_id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({child.roll_number})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. EXTENSE ATTENTION DIRECTIVE BANNER (For Teachers) */}
                {isAttention ? (
                  <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider">
                        🚨 Teacher Action Directive: Extense Attention Required For Children
                      </h4>
                      <p className="text-xs text-rose-900 mt-0.5 leading-relaxed font-medium">
                        {card.attention_reason ||
                          'Parent has shown negligible app interaction and does not review homework feeds. Teachers must conduct daily notebook verification and provide direct in-class coaching.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 sm:px-6 py-2 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Active Parental Vigilance: Children have consistent homework support at home.</span>
                  </div>
                )}

                {/* 4. Backend App Usage & Vigilance Metrics */}
                <div className="p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Metric 1: App Logins & Recency */}
                  <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-1.5 text-indigo-700">
                        <Smartphone className="w-4 h-4" />
                        <span>App Logins</span>
                      </span>
                      <span className="text-slate-800 font-black">{card.metrics.logins_last_30_days}x / mo</span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 mt-1">
                      {card.metrics.days_since_last_active === 0
                        ? '🟢 Active Today'
                        : card.metrics.days_since_last_active <= 3
                        ? `🟢 Active ${card.metrics.days_since_last_active}d ago`
                        : card.metrics.days_since_last_active <= 14
                        ? `🟡 Inactive ${card.metrics.days_since_last_active}d`
                        : `🔴 Dormant (${card.metrics.days_since_last_active}d ago)`}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      Frequency: <span className="capitalize font-bold">{card.metrics.usage_frequency.replace(/_/g, ' ')}</span>
                    </p>
                  </div>

                  {/* Metric 2: Diary Read Receipts */}
                  <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-1.5 text-teal-700">
                        <BookOpen className="w-4 h-4" />
                        <span>Diary Receipts</span>
                      </span>
                      <span className="text-slate-800 font-black">{card.metrics.diary_read_rate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full ${
                          card.metrics.diary_read_rate >= 80
                            ? 'bg-teal-600'
                            : card.metrics.diary_read_rate >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${card.metrics.diary_read_rate}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      Daily homework &amp; planners signed
                    </p>
                  </div>

                  {/* Metric 3: Academic Inquiries Asked */}
                  <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-1.5 text-blue-700">
                        <MessageSquare className="w-4 h-4" />
                        <span>Inquiries Asked</span>
                      </span>
                      <span className="text-slate-800 font-black">{card.metrics.queries_asked_count}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      {card.metrics.queries_asked_count >= 5
                        ? '🌟 Highly Inquisitive'
                        : card.metrics.queries_asked_count >= 2
                        ? 'Regular Updates Asked'
                        : 'Rarely Contacts Faculty'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      Questions on child's study progress
                    </p>
                  </div>

                  {/* Metric 4: Fee & Notice Punctuality */}
                  <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-1.5 text-purple-700">
                        <Clock className="w-4 h-4" />
                        <span>Voucher Status</span>
                      </span>
                      <span className="capitalize font-bold text-slate-700">
                        {card.metrics.fee_payment_punctuality.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      {card.metrics.fee_payment_punctuality === 'prompt' ? (
                        <span className="text-emerald-700 font-bold">🟢 Prompt Clearance</span>
                      ) : card.metrics.fee_payment_punctuality === 'requires_reminders' ? (
                        <span className="text-amber-700 font-bold">🟡 Multiple Reminders</span>
                      ) : (
                        <span className="text-rose-700 font-bold">🔴 Chronic Defaulter</span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      Attendance notices signed: {card.metrics.alerts_acknowledged_count}
                    </p>
                  </div>
                </div>

                {/* 5. Teacher Incharge Notes & Classroom Strategy */}
                <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-700 shrink-0">Teacher Case Notes:</span>
                    <p className="text-slate-600 italic">"{card.teacher_notes}"</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-[11px] text-slate-500">
                    <span>Last Faculty Contact:</span>
                    <span className="font-mono font-bold text-slate-700">
                      {card.last_contacted_date
                        ? new Date(card.last_contacted_date).toLocaleDateString()
                        : 'Not logged'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Edit Modal (For Teachers/Incharge to update case notes & attention flags) */}
      {isModalOpen && editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Cinzel',serif]">
                  Update Parent Vigilance Case Notes
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingCard.parent_name} (ID: {editingCard.parent_id})
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
              {/* Vigilance Level */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Parent Vigilance Classification:
                </label>
                <select
                  value={formData.vigilance_level}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vigilance_level: e.target.value as ParentVigilanceLevel,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-slate-50"
                >
                  <option value="proactive">🌟 Proactive &amp; Highly Vigilant (Daily App Checker)</option>
                  <option value="cooperative">🟢 Regular &amp; Cooperative</option>
                  <option value="passive">🟡 Passive (Needs Regular Reminders)</option>
                  <option value="neglectful">🔴 Dormant / Neglectful (Requires Extense Teacher Attention)</option>
                </select>
              </div>

              {/* Extense Attention Checkbox */}
              <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 space-y-2">
                <label className="flex items-center gap-2 font-bold text-rose-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.extense_attention_needed}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        extense_attention_needed: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Flag: Extense Attention Required For Children in Class</span>
                </label>
                {formData.extense_attention_needed && (
                  <div>
                    <label className="block text-[11px] font-bold text-rose-900 mb-1">
                      Reason for Extra Attention:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.attention_reason}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, attention_reason: e.target.value }))
                      }
                      placeholder="e.g. Parent has not opened app in 40 days. Student lacks homework supervision at home and needs a classroom mentor..."
                      className="w-full px-3 py-1.5 rounded-lg border border-rose-200 text-slate-900 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Teacher Case Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Faculty Case Notes / Follow-up History:
                </label>
                <textarea
                  rows={3}
                  value={formData.teacher_notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, teacher_notes: e.target.value }))
                  }
                  placeholder="Record teacher phone calls, PTM feedback, or home study recommendations..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-slate-50"
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md cursor-pointer"
                >
                  Save Parent Case Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Printable Parent Vigilance Slip (Visible during window.print) */}
      {printCard && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 z-50 text-slate-900">
          <div className="border-4 border-double border-slate-800 p-6 rounded-lg max-w-2xl mx-auto">
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
              <h1 className="text-2xl font-black font-['Cinzel',serif] uppercase tracking-wide">
                {currentSchool?.name}
              </h1>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-600 mt-0.5">
                Confidential Faculty Assessment: Parent Vigilance &amp; App Engagement
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-4 pb-4 border-b border-slate-200">
              <div>
                <p><strong>Parent Name:</strong> {printCard.parent_name}</p>
                <p><strong>Single Parent ID:</strong> {printCard.parent_id}</p>
                <p><strong>Phone:</strong> {printCard.parent_phone}</p>
              </div>
              <div className="text-right">
                <p><strong>Vigilance Score:</strong> {printCard.engagement_score}%</p>
                <p><strong>Classification:</strong> {printCard.vigilance_level.toUpperCase()}</p>
                <p><strong>Extense Attention Flag:</strong> {printCard.extense_attention_needed ? 'YES (HIGH ATTENTION)' : 'NO (BALANCED)'}</p>
              </div>
            </div>

            <div className="mb-4 text-xs">
              <p className="font-bold mb-1">Enrolled Children ({printCard.children_count}):</p>
              <ul className="list-disc pl-5 space-y-0.5">
                {printCard.children.map((c) => (
                  <li key={c.student_id}>
                    {c.student_name} — {c.class_id} (Sec {c.section}, Roll: {c.roll_number})
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 text-xs mb-6 border p-3 rounded">
              <p><strong>App Logins (30 Days):</strong> {printCard.metrics.logins_last_30_days} times (Last active {printCard.metrics.days_since_last_active} days ago)</p>
              <p><strong>Homework Diary Sign-off Rate:</strong> {printCard.metrics.diary_read_rate}%</p>
              <p><strong>Academic Inquiries Asked:</strong> {printCard.metrics.queries_asked_count}</p>
              <p><strong>Fee Payment Punctuality:</strong> {printCard.metrics.fee_payment_punctuality.toUpperCase()}</p>
            </div>

            <div className="border-t border-slate-400 pt-3 text-xs mb-8">
              <p><strong>Faculty Case Notes:</strong> {printCard.teacher_notes}</p>
              {printCard.extense_attention_needed && (
                <p className="mt-2 text-rose-800 font-bold">
                  <strong>Classroom Directive:</strong> {printCard.attention_reason}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-8 border-t border-slate-300">
              <div className="text-center">
                <div className="w-36 border-b border-slate-600 mb-1"></div>
                <span>Class Teacher Sign</span>
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
