import React, { useState, useMemo } from 'react';
import {
  Bell,
  MessageSquare,
  Send,
  Plus,
  AlertTriangle,
  Calendar,
  Sparkles,
  Clock,
  CheckCheck,
  Megaphone,
  HelpCircle,
  FileCheck,
  Trash2,
  Lock,
  User,
  CheckCircle,
  Smartphone,
  Zap,
  Ticket,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  UserCheck,
  Users,
  ShieldAlert,
  Phone,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { Notice, CommunicationQuery, TicketPriority, TicketCategory, TicketStatus } from '../../types';
import { NotificationDispatcher } from './NotificationDispatcher';
import { CircularAutomationPanel } from './CircularAutomationPanel';

export const CommunicationModule: React.FC = () => {
  const {
    currentSchool,
    currentUser,
    students,
    usersInSchool,
    notices,
    queries,
    addNotice,
    deleteNotice,
    createQuery,
    replyToQuery,
    updateQueryStatus,
  } = useSchoolData();

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';
  const isParent = currentUser?.role === 'parent';

  // Sub Module Switcher: 'tickets' (Complaints & Tickets Desk) vs 'notices' (Digital Circulars) vs 'automation' (Holidays & Fees) vs 'broadcast' (WhatsApp & SMS)
  const [subModule, setSubModule] = useState<'tickets' | 'notices' | 'automation' | 'broadcast'>('tickets');
  const [broadcastPresetText, setBroadcastPresetText] = useState<string>('');

  // Ticket Search & Filters
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketFilterRole, setTicketFilterRole] = useState<'all' | 'parent' | 'teacher'>('all');
  const [ticketFilterStatus, setTicketFilterStatus] = useState<'all' | TicketStatus>('all');
  const [ticketFilterPriority, setTicketFilterPriority] = useState<'all' | TicketPriority>('all');

  // Active Selected Ticket
  const [selectedQueryId, setSelectedQueryId] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  // Modals
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  // Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<Notice['category']>('general');
  const [noticePriority, setNoticePriority] = useState<'normal' | 'urgent'>('normal');

  // Parent Ticket Form State
  const [parentChildId, setParentChildId] = useState('');
  const [parentTeacherId, setParentTeacherId] = useState('');
  const [parentCategory, setParentCategory] = useState<TicketCategory>('homework');
  const [parentPriority, setParentPriority] = useState<TicketPriority>('normal');
  const [parentSubject, setParentSubject] = useState('');
  const [parentMessage, setParentMessage] = useState('');

  // Teacher Complaint Form State
  const [teacherStudentId, setTeacherStudentId] = useState('');
  const [teacherCategory, setTeacherCategory] = useState<TicketCategory>('discipline');
  const [teacherPriority, setTeacherPriority] = useState<TicketPriority>('urgent');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [teacherMessage, setTeacherMessage] = useState('');

  // Faculty and Admins in current campus
  const teachersInSchool = useMemo(
    () => usersInSchool.filter((u) => u.role === 'teacher'),
    [usersInSchool]
  );
  const adminsInSchool = useMemo(
    () => usersInSchool.filter((u) => u.role === 'admin'),
    [usersInSchool]
  );

  // Parent's linked students (supports multi-child parents like Pari Khan with 4 kids)
  const parentStudents = useMemo(() => {
    if (!currentUser) return [];
    const directMatches = students.filter((s) => s.parent_id === currentUser.id);
    if (directMatches.length > 0) return directMatches;

    // Fallback: match by parent name or email (e.g. Pari Khan)
    const normalizedName = currentUser.full_name?.toLowerCase().trim() || '';
    const normalizedEmail = currentUser.email?.toLowerCase().trim() || '';
    return students.filter(
      (s) =>
        (s.parent_name && s.parent_name.toLowerCase().includes('pari') && normalizedName.includes('pari')) ||
        (s.parent_email && s.parent_email.toLowerCase() === normalizedEmail)
    );
  }, [students, currentUser]);

  // Office Hours Checking (Mon-Sat 08:00 AM - 04:00 PM)
  const now = new Date();
  const currentHour = now.getHours();
  const isWithinOfficeHours = currentHour >= 8 && currentHour < 16;

  // Filter queries based on campus & user role
  const visibleQueries = useMemo(() => {
    return queries.filter((q) => {
      if (currentSchool && q.school_id !== currentSchool.id) return false;

      if (isParent) {
        const studentIds = new Set(parentStudents.map((s) => s.id));
        return (
          q.parent_id === currentUser?.id ||
          studentIds.has(q.student_id) ||
          q.messages.some((m) => m.sender_id === currentUser?.id)
        );
      }

      // Teachers & Admins see all school tickets for full transparent oversight
      return true;
    });
  }, [queries, currentSchool, isParent, parentStudents, currentUser]);

  // Apply Search & Filter Pills
  const filteredTickets = useMemo(() => {
    return visibleQueries.filter((t) => {
      // Role filter
      if (ticketFilterRole === 'parent' && t.raised_by_role === 'teacher') return false;
      if (ticketFilterRole === 'teacher' && t.raised_by_role === 'parent') return false;

      // Status filter
      if (ticketFilterStatus !== 'all' && t.status !== ticketFilterStatus) return false;

      // Priority filter
      if (ticketFilterPriority !== 'all' && (t.priority || 'normal') !== ticketFilterPriority)
        return false;

      // Search text
      if (ticketSearch.trim()) {
        const q = ticketSearch.toLowerCase();
        const matches =
          (t.ticket_number && t.ticket_number.toLowerCase().includes(q)) ||
          t.subject.toLowerCase().includes(q) ||
          t.student_name.toLowerCase().includes(q) ||
          t.parent_name.toLowerCase().includes(q) ||
          (t.teacher_name && t.teacher_name.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [visibleQueries, ticketFilterRole, ticketFilterStatus, ticketFilterPriority, ticketSearch]);

  // Active selected ticket object
  const selectedQuery = useMemo(() => {
    if (selectedQueryId) {
      const found = visibleQueries.find((q) => q.id === selectedQueryId);
      if (found) return found;
    }
    return filteredTickets[0] || visibleQueries[0] || null;
  }, [visibleQueries, filteredTickets, selectedQueryId]);

  // Summary Metrics
  const ticketKpis = useMemo(() => {
    const total = visibleQueries.length;
    const open = visibleQueries.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
    const urgent = visibleQueries.filter(
      (t) => (t.priority === 'urgent' || t.priority === 'critical') && t.status !== 'closed' && t.status !== 'resolved'
    ).length;
    const parentRaised = visibleQueries.filter((t) => t.raised_by_role === 'parent').length;
    const teacherRaised = visibleQueries.filter((t) => t.raised_by_role === 'teacher').length;
    return { total, open, urgent, parentRaised, teacherRaised };
  }, [visibleQueries]);

  // Handlers
  const handleOpenParentModal = () => {
    setParentChildId(parentStudents[0]?.id || students[0]?.id || '');
    setParentTeacherId(teachersInSchool[0]?.id || '');
    setParentCategory('homework');
    setParentPriority('normal');
    setParentSubject('');
    setParentMessage('');
    setIsParentModalOpen(true);
  };

  const handleOpenTeacherModal = () => {
    setTeacherStudentId(students[0]?.id || '');
    setTeacherCategory('discipline');
    setTeacherPriority('urgent');
    setTeacherSubject('');
    setTeacherMessage('');
    setIsTeacherModalOpen(true);
  };

  const handleSubmitParentTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentSubject.trim() || !parentMessage.trim()) return;

    const child = students.find((s) => s.id === parentChildId) || parentStudents[0] || students[0];
    const teacher = teachersInSchool.find((t) => t.id === parentTeacherId);

    const newTicket = createQuery({
      student_id: child.id,
      student_name: child.name,
      student_class: `${child.class_id} - Sec ${child.section}`,
      parent_id: currentUser?.id || 'user-parent-1',
      parent_name: currentUser?.full_name || 'Parent',
      parent_phone: child.parent_phone || '+92 300 1234567',
      teacher_id: teacher?.id,
      teacher_name: teacher?.full_name || 'Class Coordinator',
      target_audience: 'teacher',
      subject: parentSubject.trim(),
      category: parentCategory,
      priority: parentPriority,
      initial_message: parentMessage.trim(),
    });

    setSelectedQueryId(newTicket.id);
    setIsParentModalOpen(false);
  };

  const handleSubmitTeacherComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherSubject.trim() || !teacherMessage.trim()) return;

    const studentObj = students.find((s) => s.id === teacherStudentId) || students[0];

    const newTicket = createQuery({
      student_id: studentObj.id,
      student_name: studentObj.name,
      student_class: `${studentObj.class_id} - Sec ${studentObj.section}`,
      parent_id: studentObj.parent_id,
      parent_name: studentObj.parent_name || 'Parent / Guardian',
      parent_phone: studentObj.parent_phone || '+92 300 1234567',
      teacher_id: currentUser?.id || 'user-teacher',
      teacher_name: currentUser?.full_name || 'Faculty Member',
      target_audience: 'parent',
      subject: teacherSubject.trim(),
      category: teacherCategory,
      priority: teacherPriority,
      initial_message: teacherMessage.trim(),
    });

    setSelectedQueryId(newTicket.id);
    setIsTeacherModalOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedQuery) return;
    replyToQuery(selectedQuery.id, replyText);
    setReplyText('');
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    addNotice({
      title: noticeTitle,
      content: noticeContent,
      category: noticeCategory,
      target_audience: 'all',
      priority: noticePriority,
      publish_date: new Date().toISOString().split('T')[0],
    });

    setNoticeTitle('');
    setNoticeContent('');
    setIsNoticeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Quadrangle Banner */}
      <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-[#EDE7C7] bg-[#200E01] text-[#EDE7C7]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80"
            alt="School Quadrangle"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/85 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
              <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Complaints &amp; Support Tickets Desk (Parents ⇄ Faculty ⇄ Management)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
              Parent-Teacher Complaints, Inquiries &amp; Official Circulars
            </h2>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Structured ticket desk for parent complaints to teachers, teacher student conduct reports, and immediate dual-notification to School Administration with collaborative reply threads.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isParent && (
              <button
                onClick={handleOpenParentModal}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Raise Complaint to Teacher</span>
              </button>
            )}

            {isTeacherOrAdmin && (
              <button
                onClick={handleOpenTeacherModal}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Raise Student Notice / Complaint</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="bg-white p-4 sm:p-5 rounded-[28px] border border-[#EDE7C7] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#EDE7C7] font-black shadow-xs bg-[#8B0000] border border-[#D4AF37]/40">
            {subModule === 'tickets' ? (
              <Ticket className="w-5 h-5 text-[#D4AF37]" />
            ) : subModule === 'notices' ? (
              <Megaphone className="w-5 h-5 text-[#D4AF37]" />
            ) : subModule === 'automation' ? (
              <Zap className="w-5 h-5 text-amber-300" />
            ) : (
              <Smartphone className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#200E01] flex items-center gap-2 font-['Cormorant_Garamond',serif] italic leading-tight">
              {subModule === 'tickets' && 'Complaints & Support Tickets Desk'}
              {subModule === 'notices' && 'Official Digital Circulars & Gazettes'}
              {subModule === 'automation' && 'Annual Holiday & Fee Automation Calendar'}
              {subModule === 'broadcast' && 'WhatsApp & Android SMS Gateway'}
            </h3>
            <p className="text-xs text-[#5B0202]/70 font-medium">
              {subModule === 'tickets' && 'Collaborative ticketing with instant teacher and admin oversight.'}
              {subModule === 'notices' && 'Zero-paper verified administrative broadcasts.'}
              {subModule === 'automation' && 'Pre-scheduled gazette breaks and 4-stage tuition reminders.'}
              {subModule === 'broadcast' && 'Direct phone dispatch with anti-ban delay queues.'}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 text-xs font-bold">
          <button
            onClick={() => setSubModule('tickets')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer font-extrabold ${
              subModule === 'tickets'
                ? 'bg-white text-[#8B0000] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ticket className="w-4 h-4 text-[#8B0000]" />
            <span>Complaints &amp; Tickets ({ticketKpis.open})</span>
            {ticketKpis.urgent > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setSubModule('notices')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer font-extrabold ${
              subModule === 'notices'
                ? 'bg-white text-[#8B0000] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-4 h-4 text-[#8B0000]" />
            <span>Digital Circulars ({notices.length})</span>
          </button>

          {isTeacherOrAdmin && (
            <>
              <button
                onClick={() => setSubModule('automation')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer font-extrabold ${
                  subModule === 'automation'
                    ? 'bg-[#8B0000] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Holidays &amp; Fee Automation</span>
              </button>

              <button
                onClick={() => setSubModule('broadcast')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer font-extrabold ${
                  subModule === 'broadcast'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>WhatsApp &amp; SMS</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. COMPLAINTS & TICKETS DESK VIEW */}
      {subModule === 'tickets' && (
        <div className="space-y-4">
          {/* Dual Notification & Oversight Alert Bar */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <span className="font-extrabold block text-amber-900 text-xs uppercase tracking-wide">
                  Dual Teacher &amp; Admin Notification Active
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium mt-0.5">
                  Whenever a parent raises a complaint or a teacher reports a student, <strong className="font-bold">both the assigned faculty teacher and School Administration receive instant notification</strong>. Both parties are authorized to investigate and reply collaboratively in the thread below.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {ticketKpis.urgent > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-[11px] flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{ticketKpis.urgent} Urgent Action Needed</span>
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-[11px]">
                {ticketKpis.open} Open • {ticketKpis.total} Total Tickets
              </span>
            </div>
          </div>

          {/* Ticket Filter Pills & Search */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>

              {/* Role Filter */}
              {(['all', 'parent', 'teacher'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTicketFilterRole(r)}
                  className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                    ticketFilterRole === r
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : r === 'parent' ? 'From Parents' : 'From Teachers'}
                </button>
              ))}

              <span className="text-slate-300 mx-1">|</span>

              {/* Status Filter */}
              {(['all', 'open', 'in_progress', 'resolved'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setTicketFilterStatus(s)}
                  className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer ${
                    ticketFilterStatus === s
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s === 'all'
                    ? 'All'
                    : s === 'in_progress'
                    ? 'In Progress'
                    : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}

              <span className="text-slate-300 mx-1">|</span>

              {/* Priority Filter */}
              {(['all', 'urgent', 'critical'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setTicketFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer ${
                    ticketFilterPriority === p
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[260px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Search ticket #, student, subject..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Main 2-Column Split Desk */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs min-h-[580px]">
            {/* Left Ticket Feed (4 cols) */}
            <div className="lg:col-span-5 border-r border-slate-200 flex flex-col bg-slate-50/50">
              <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-amber-600" />
                  <span>Complaints Roster ({filteredTickets.length})</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {isParent && (
                    <button
                      onClick={handleOpenParentModal}
                      className="text-xs text-emerald-700 font-extrabold bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Raise Complaint
                    </button>
                  )}
                  {isTeacherOrAdmin && (
                    <button
                      onClick={handleOpenTeacherModal}
                      className="text-xs text-amber-800 font-extrabold bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Report Student
                    </button>
                  )}
                </div>
              </div>

              {/* Ticket Cards List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[620px]">
                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <Ticket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold">No complaints or tickets matching this filter.</p>
                  </div>
                ) : (
                  filteredTickets.map((t) => {
                    const isSelected = t.id === selectedQuery?.id;
                    const isUrgent = t.priority === 'urgent' || t.priority === 'critical';
                    const lastMsg = t.messages[t.messages.length - 1];

                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedQueryId(t.id)}
                        className={`w-full text-left p-3.5 sm:p-4 transition flex flex-col gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/70 border-l-4 border-amber-500 shadow-2xs'
                            : 'hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            {t.ticket_number || `TKT-${t.id.slice(-4)}`}
                          </span>

                          <div className="flex items-center gap-1">
                            {isUrgent && (
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  t.priority === 'critical'
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : 'bg-amber-500 text-slate-950 font-black'
                                }`}
                              >
                                {t.priority}
                              </span>
                            )}

                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                t.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : t.status === 'closed'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {t.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <h5 className="text-xs font-black text-slate-900 line-clamp-1 leading-snug">
                          {t.subject}
                        </h5>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                          <span>
                            Scholar: <strong className="font-bold text-slate-900">{t.student_name}</strong>
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              t.raised_by_role === 'teacher'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {t.raised_by_role === 'teacher' ? 'Faculty Notice' : 'Parent Complaint'}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 line-clamp-1 italic mt-0.5">
                          "{lastMsg?.text || 'No replies yet'}"
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Active Ticket Stream (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-white min-h-[580px]">
              {selectedQuery ? (
                <>
                  {/* Active Ticket Top Bar */}
                  <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800">
                          {selectedQuery.ticket_number || `TKT-${selectedQuery.id.slice(-4)}`}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm">{selectedQuery.subject}</h4>
                      </div>

                      {/* Status Selector for Teachers & Management */}
                      {isTeacherOrAdmin && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <label className="text-[11px] font-bold text-slate-500">Status:</label>
                          <select
                            value={selectedQuery.status}
                            onChange={(e) =>
                              updateQueryStatus(selectedQuery.id, e.target.value as TicketStatus)
                            }
                            className="bg-white border border-slate-300 rounded-lg text-xs font-bold px-2 py-1 text-slate-800 focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Metadata Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 font-bold">Student:</span>{' '}
                        <strong className="text-slate-900 font-bold">{selectedQuery.student_name}</strong>{' '}
                        ({selectedQuery.student_class})
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">Parent:</span>{' '}
                        <strong className="text-slate-900 font-bold">{selectedQuery.parent_name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">Faculty Member:</span>{' '}
                        <strong className="text-slate-900 font-bold">
                          {selectedQuery.teacher_name || 'Faculty Incharge'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">Category:</span>{' '}
                        <span className="font-bold uppercase text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          {selectedQuery.category}
                        </span>
                      </div>
                    </div>

                    {/* Dual Notification Seal & WhatsApp Quick Connect */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="inline-flex items-center gap-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Teacher Notified • School Administration Oversight Active</span>
                      </div>

                      {selectedQuery.parent_phone && (
                        <a
                          href={`https://wa.me/${selectedQuery.parent_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Regarding Ticket ${selectedQuery.ticket_number || ''} for ${selectedQuery.student_name} (${currentSchool?.name || 'School'}): `
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition shadow-2xs"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WhatsApp Parent</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[380px]">
                    {selectedQuery.messages.map((msg) => {
                      const isMe = msg.sender_id === currentUser?.id;
                      const isMsgAdmin = msg.sender_role === 'admin';
                      const isMsgTeacher = msg.sender_role === 'teacher';
                      const isMsgParent = msg.sender_role === 'parent';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          {/* Role Badge and Sender Header */}
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mb-1 px-1">
                            {isMsgAdmin ? (
                              <span className="px-2 py-0.5 rounded-md bg-[#8B0000] text-[#EDE7C7] font-black uppercase text-[9px] border border-[#D4AF37]/50 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                                <span>School Management</span>
                              </span>
                            ) : isMsgTeacher ? (
                              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold uppercase text-[9px] border border-blue-200 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-blue-700" />
                                <span>Faculty Teacher</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold uppercase text-[9px] border border-emerald-200 flex items-center gap-1">
                                <Users className="w-3 h-3 text-emerald-700" />
                                <span>Parent</span>
                              </span>
                            )}
                            <span className="font-bold text-slate-700">{msg.sender_name}</span>
                            <span>•</span>
                            <span>
                              {new Date(msg.sent_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Speech Bubble */}
                          <div
                            className={`max-w-lg p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed font-medium ${
                              isMsgAdmin
                                ? 'bg-amber-50/90 text-amber-950 border-2 border-amber-300 rounded-tl-xs shadow-2xs'
                                : isMe
                                ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                                : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Response Chips & Reply Box (Available to Parent, Teacher & Admin) */}
                  <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50/80 space-y-2.5">
                    {/* Quick Response Chips for Teachers/Admins */}
                    {isTeacherOrAdmin && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">Quick Reply:</span>
                        {[
                          'Diary & homework verified in 1st period.',
                          'Parent-teacher meeting scheduled tomorrow at 10 AM.',
                          'Van contractor cautioned; on time tomorrow.',
                          'Issue investigated & resolved with class prefect.',
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setReplyText(chip)}
                            className="text-[10px] bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold px-2 py-0.5 rounded-md transition cursor-pointer"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    <form onSubmit={handleSendReply} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={
                          isTeacher
                            ? 'Type teacher response (visible to Parent and School Management)...'
                            : isAdmin
                            ? 'Type administrative resolution or incharge directive...'
                            : 'Type your message for the teacher and management...'
                        }
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Send Reply</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <Ticket className="w-12 h-12 mb-2 text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">No Ticket Selected</p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Select a complaint or support ticket from the left or raise a new ticket.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. DIGITAL CIRCULARS & NOTICES VIEW */}
      {subModule === 'notices' && (
        <div className="space-y-4">
          {/* Automated Circulars Quick Banner */}
          {isTeacherOrAdmin && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-amber-500/10 border border-amber-300/80 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-bold text-[#200E01] block">
                    Automated Gazette Circulars Active
                  </span>
                  <span className="text-[11px] text-[#5B0202]/70">
                    Kashmir Day, Pakistan Day, Eid breaks, Summer/Winter vacations &amp; Monthly 1st/7th/10th/15th Fee Cycles.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSubModule('automation')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#8B0000] text-white hover:bg-[#700000] transition shadow-2xs shrink-0 cursor-pointer"
              >
                <span>Manage Automation Calendar</span>
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm font-['Outfit',sans-serif]">Instant Digital Circulars (School Broadcasts)</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Official notices published directly to parents' phones. Replaces paper circular printing 100%.
              </p>
            </div>
            {isTeacherOrAdmin && (
              <button
                id="btn-new-circular"
                onClick={() => setIsNoticeModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000] transition shadow-sm shadow-[#8B0000]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Issue New Circular</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notices.map((notice) => {
              const isUrgent = notice.priority === 'urgent' || notice.category === 'emergency';
              const categoryColors: Record<Notice['category'], string> = {
                emergency: 'bg-rose-100 text-rose-800 border-rose-200',
                holiday: 'bg-purple-100 text-purple-800 border-purple-200',
                event: 'bg-blue-100 text-blue-800 border-blue-200',
                fee_reminder: 'bg-amber-100 text-amber-800 border-amber-200',
                general: 'bg-slate-100 text-slate-800 border-slate-200',
              };

              return (
                <article
                  key={notice.id}
                  id={`notice-card-${notice.id}`}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition space-y-4 ${
                    isUrgent ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          categoryColors[notice.category] || categoryColors.general
                        }`}
                      >
                        {notice.category.replace('_', ' ')}
                      </span>

                      <div className="flex items-center gap-1">
                        {isUrgent && (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                            <AlertTriangle className="w-3 h-3" /> Priority
                          </span>
                        )}
                        {isTeacherOrAdmin && (
                          <button
                            onClick={() => deleteNotice(notice.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                            title="Delete notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {notice.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-4">
                      {notice.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>By: {notice.author_name}</span>
                    <span>{new Date(notice.publish_date).toLocaleDateString()}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. AUTOMATED CIRCULARS & HOLIDAY ENGINE */}
      {subModule === 'automation' && (
        <CircularAutomationPanel
          onSelectForBroadcast={(text) => {
            setBroadcastPresetText(text);
            setSubModule('broadcast');
          }}
          onNavigateToNotices={() => setSubModule('notices')}
        />
      )}

      {/* 6. WHATSAPP & ANDROID SMS BROADCAST GATEWAY */}
      {subModule === 'broadcast' && (
        <NotificationDispatcher initialMessageText={broadcastPresetText} />
      )}

      {/* MODAL 1: Parent Raise Complaint / Query Modal */}
      {isParentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-600" />
                Raise Parent Complaint / Ticket to Teacher
              </h4>
              <button
                onClick={() => setIsParentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitParentTicket} className="space-y-4 text-xs">
              {/* Multi-Child Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Child / Student *</label>
                {parentStudents.length > 1 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {parentStudents.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => setParentChildId(child.id)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          parentChildId === child.id
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-slate-900">{child.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {child.class_id} • Sec {child.section}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <select
                    value={parentChildId}
                    onChange={(e) => setParentChildId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    {parentStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class_id} - Sec {s.section}, Roll: {s.roll_number})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Target Teacher */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Direct to Faculty Member:</label>
                <select
                  value={parentTeacherId}
                  onChange={(e) => setParentTeacherId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900"
                >
                  {teachersInSchool.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.email})
                    </option>
                  ))}
                  {adminsInSchool.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} (School Administration)
                    </option>
                  ))}
                </select>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900"
                  >
                    <option value="homework">Homework &amp; Diary</option>
                    <option value="academic">Academic &amp; Studies</option>
                    <option value="discipline">Classroom Conduct / Behavior</option>
                    <option value="safety_bullying">Safety / Peer Issue</option>
                    <option value="transport">School Van / Transport</option>
                    <option value="fee">Tuition Fee Voucher</option>
                    <option value="general">General Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={parentPriority}
                    onChange={(e) => setParentPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical (Immediate Attention)</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject / Complaint Summary *</label>
                <input
                  type="text"
                  value={parentSubject}
                  onChange={(e) => setParentSubject(e.target.value)}
                  placeholder="e.g. Clarification on daily homework assignment or van delay..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Message *</label>
                <textarea
                  rows={4}
                  value={parentMessage}
                  onChange={(e) => setParentMessage(e.target.value)}
                  placeholder="Explain your complaint or question clearly. Both the teacher and school administration will receive this ticket."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsParentModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Dispatch Ticket to Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Teacher Raise Complaint / Student Report Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Raise Student Disciplinary Notice / Parent Complaint
              </h4>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTeacherComplaint} className="space-y-4 text-xs">
              {/* Student Picker from School Roster */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Student from Roster *</label>
                <select
                  value={teacherStudentId}
                  onChange={(e) => setTeacherStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.class_id} - Sec {s.section}, Roll: {s.roll_number}) • Parent: {s.parent_name || 'Guardian'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Complaint Nature</label>
                  <select
                    value={teacherCategory}
                    onChange={(e) => setTeacherCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900"
                  >
                    <option value="discipline">Classroom Misconduct / Disobedience</option>
                    <option value="homework">Chronic Incomplete Homework / Diary</option>
                    <option value="attendance">Frequent Truancy / Unexcused Leaves</option>
                    <option value="safety_bullying">Bullying / Physical Altercation</option>
                    <option value="academic">Critical Academic Deficiency</option>
                    <option value="general">Urgent Parent-Teacher Meeting Request</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={teacherPriority}
                    onChange={(e) => setTeacherPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900"
                  >
                    <option value="urgent">Urgent Notice</option>
                    <option value="critical">Critical (Immediate Principal Hearing)</option>
                    <option value="normal">Routine Academic Reminder</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice / Complaint Subject *</label>
                <input
                  type="text"
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value)}
                  placeholder="e.g. Disciplinary Warning: Incomplete Math homework & unsigned diary..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Detailed Incident Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Teacher Incident Report *</label>
                <textarea
                  rows={4}
                  value={teacherMessage}
                  onChange={(e) => setTeacherMessage(e.target.value)}
                  placeholder="Detail the incident or homework deficit. Both the student's parent and School Administration will receive this formal ticket."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs cursor-pointer"
                >
                  Issue Formal Notice to Parent &amp; Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Compose Digital Circular Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                Issue Official Digital Circular
              </h4>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Circular Title *</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Examination Schedule & Roll Number Slip Distribution"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Announcement</option>
                    <option value="event">Event / Exam</option>
                    <option value="holiday">Holiday Notice</option>
                    <option value="fee_reminder">Fee Reminder</option>
                    <option value="emergency">Emergency / Weather</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent / High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Circular Body / Instructions *</label>
                <textarea
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Enter official circular message for parents..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Broadcast Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
