import React, { useState } from 'react';
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
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { Notice, CommunicationQuery } from '../../types';

export const CommunicationModule: React.FC = () => {
  const {
    currentSchool,
    currentUser,
    students,
    notices,
    queries,
    addNotice,
    deleteNotice,
    createQuery,
    replyToQuery,
    updateQueryStatus,
  } = useSchoolData();

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const isParent = currentUser?.role === 'parent';

  // Sub Module Switcher: 'notices' (Digital Circulars) vs 'queries' (Structured Parent-Teacher Chat)
  const [subModule, setSubModule] = useState<'notices' | 'queries'>('notices');

  // Notice Form Modal
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<Notice['category']>('general');
  const [noticePriority, setNoticePriority] = useState<'normal' | 'urgent'>('normal');

  // Query State
  const [selectedQueryId, setSelectedQueryId] = useState<string>(queries[0]?.id || '');
  const [isNewQueryModalOpen, setIsNewQueryModalOpen] = useState(false);
  const [querySubject, setQuerySubject] = useState('');
  const [queryCategory, setQueryCategory] = useState<CommunicationQuery['category']>('academic');
  const [queryInitialMessage, setQueryInitialMessage] = useState('');
  const [replyText, setReplyText] = useState('');

  // Parent's linked students
  const parentStudents = students.filter((s) => s.parent_id === currentUser?.id);
  const defaultStudent = parentStudents[0] || students[0];
  const [selectedStudentForQuery, setSelectedStudentForQuery] = useState(defaultStudent?.id || '');

  // Office Hours Checking (Structured communication: Mon-Sat 08:00 AM - 04:00 PM)
  const now = new Date();
  const currentHour = now.getHours();
  const isWithinOfficeHours = currentHour >= 8 && currentHour < 16;

  // Filter queries based on role
  const visibleQueries = queries.filter((q) => {
    if (isParent) {
      return q.parent_id === currentUser?.id;
    }
    return true; // Teachers/Admins see all school queries
  });

  const selectedQuery = queries.find((q) => q.id === selectedQueryId) || visibleQueries[0];

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

  const handleCreateQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!querySubject.trim() || !queryInitialMessage.trim()) return;

    const studentObj = students.find((s) => s.id === selectedStudentForQuery) || students[0];
    const newQ = createQuery({
      student_id: studentObj.id,
      student_name: studentObj.name,
      student_class: `${studentObj.class_id} - Sec ${studentObj.section}`,
      subject: querySubject,
      category: queryCategory,
      initial_message: queryInitialMessage,
    });

    setSelectedQueryId(newQ.id);
    setQuerySubject('');
    setQueryInitialMessage('');
    setIsNewQueryModalOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedQuery) return;
    replyToQuery(selectedQuery.id, replyText);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* 1. School Notice Board & Campus Quadrangle Banner */}
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
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
              <Megaphone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Campus Gazette & Parent-Teacher Senate</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
              Official School Circulars & Inquiries
            </h2>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Publish and receive verified administrative gazettes, term break notifications, fee circulars, and structured academic consultations within office hours.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="group relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 w-28 h-20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=300&auto=format&fit=crop&q=80"
                alt="Teacher Parent Conference"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                <span className="text-[10px] font-bold text-[#EDE7C7] leading-tight">Faculty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Header Banner & Sub-Module Toggle */}
      <div className="bg-white p-6 rounded-[28px] border border-[#EDE7C7] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#EDE7C7] font-black shadow-xs bg-[#8B0000] border border-[#D4AF37]/40"
          >
            {subModule === 'notices' ? <Megaphone className="w-5 h-5 text-[#D4AF37]" /> : <MessageSquare className="w-5 h-5 text-[#D4AF37]" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#200E01] flex items-center gap-2 font-['Cormorant_Garamond',serif] italic text-xl">
              Parent-Teacher Official Dispatch
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE7C7] text-[#8B0000] border border-[#D4AF37]/40 font-['Cinzel',serif]">
                Verified Desk
              </span>
            </h3>
            <p className="text-xs text-[#5B0202]/70 font-medium mt-0.5">
              Official school notices, circular broadcasts, and timed inquiry channels.
            </p>
          </div>
        </div>

        {/* Sub-Module Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-[#F4F4F4] rounded-2xl border border-slate-200/80 text-xs font-bold">
            <button
              id="tab-digital-circulars"
              onClick={() => setSubModule('notices')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-extrabold ${
                subModule === 'notices'
                  ? 'bg-white text-[#8B0000] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Megaphone className="w-4 h-4 text-[#8B0000]" />
              <span>Digital Circulars ({notices.length})</span>
            </button>
            <button
              id="tab-structured-queries"
              onClick={() => setSubModule('queries')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition font-extrabold ${
                subModule === 'queries'
                  ? 'bg-white text-[#8B0000] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
              <span>Structured Queries ({visibleQueries.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DIGITAL CIRCULARS & NOTICES VIEW */}
      {subModule === 'notices' && (
        <div className="space-y-4">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000] transition shadow-sm shadow-[#8B0000]/20"
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
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
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

      {/* 3. STRUCTURED PARENT-TEACHER QUERIES VIEW */}
      {subModule === 'queries' && (
        <div className="space-y-4">
          {/* Office Hours / Specific Timings Protection Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            isWithinOfficeHours
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl text-white ${isWithinOfficeHours ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">
                  Teacher Office Timings: 08:00 AM – 04:00 PM (Mon – Sat)
                </p>
                <p className="text-xs mt-0.5 leading-relaxed font-medium">
                  {isWithinOfficeHours
                    ? 'Official communication window is currently OPEN. Teachers will respond promptly to academic queries.'
                    : 'Official hours are currently CLOSED. You can still post queries; teachers will respond during next morning office hours (no late-night WhatsApp calls).'}
                </p>
              </div>
            </div>

            {isParent && (
              <button
                id="btn-ask-teacher-query"
                onClick={() => setIsNewQueryModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Query to Teacher</span>
              </button>
            )}
          </div>

          {/* Chat Split Layout: Left list of queries, Right conversation stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs min-h-[550px]">
            {/* Left Query Threads List (5 cols) */}
            <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                  Discussion Threads ({visibleQueries.length})
                </span>
                {isParent && (
                  <button
                    onClick={() => setIsNewQueryModalOpen(true)}
                    className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> New
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {visibleQueries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No query threads found.
                  </div>
                ) : (
                  visibleQueries.map((q) => {
                    const isSelected = q.id === selectedQuery?.id;
                    const lastMsg = q.messages[q.messages.length - 1];

                    return (
                      <button
                        key={q.id}
                        id={`query-thread-${q.id}`}
                        onClick={() => setSelectedQueryId(q.id)}
                        className={`w-full text-left p-4 transition flex flex-col gap-1.5 ${
                          isSelected ? 'bg-white border-l-4 border-indigo-600 shadow-xs' : 'hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {q.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              q.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {q.status.replace('_', ' ')}
                          </span>
                        </div>

                        <h5 className="text-xs font-black text-slate-900 line-clamp-1">{q.subject}</h5>
                        <p className="text-[11px] text-slate-600 line-clamp-1 font-medium">
                          {isParent ? `Student: ${q.student_name}` : `${q.parent_name} (${q.student_name})`}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                          "{lastMsg?.text || 'No messages'}"
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Chat Stream & Reply Box (7 cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between bg-white min-h-[500px]">
              {selectedQuery ? (
                <>
                  {/* Active Thread Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{selectedQuery.subject}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {selectedQuery.student_class}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Parent: <span className="font-semibold text-slate-700">{selectedQuery.parent_name}</span> • Student: <span className="font-semibold text-slate-700">{selectedQuery.student_name}</span>
                      </p>
                    </div>

                    {/* Status Resolver Control for Teachers/Admins */}
                    {isTeacherOrAdmin && (
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-600">Status:</label>
                        <select
                          id="select-query-status"
                          value={selectedQuery.status}
                          onChange={(e) => updateQueryStatus(selectedQuery.id, e.target.value as any)}
                          className="bg-white border border-slate-300 rounded-lg text-xs font-semibold px-2.5 py-1 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Messages Bubble List */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[400px]">
                    {selectedQuery.messages.map((msg) => {
                      const isMe = msg.sender_id === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mb-1 px-1">
                            <span>{msg.sender_name}</span>
                            <span className="uppercase text-[9px] px-1.5 py-0.2 bg-slate-100 rounded-md">
                              {msg.sender_role}
                            </span>
                            <span>{new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed font-medium ${
                              isMe
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

                  {/* Reply Input Form */}
                  <form
                    onSubmit={handleSendReply}
                    className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3"
                  >
                    <input
                      id="input-query-reply-text"
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={
                        isWithinOfficeHours
                          ? "Type your message or response here..."
                          : "Type message (note: sent during off-hours, will be reviewed next morning)..."
                      }
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                    <button
                      id="btn-send-query-reply"
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send Reply</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-2 text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">No Query Selected</p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Select a conversation thread from the left or submit a new query to start communicating.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Compose Digital Circular Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                Issue Official Digital Circular
              </h4>
              <button onClick={() => setIsNoticeModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Circular Title *</label>
                <input
                  id="modal-input-notice-title"
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
                    id="modal-select-notice-category"
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
                    id="modal-select-notice-priority"
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
                  id="modal-textarea-notice-body"
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
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="btn-publish-circular"
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Broadcast Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Submit Query Modal (For Parents) */}
      {isNewQueryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Ask Teacher / School Query
              </h4>
              <button onClick={() => setIsNewQueryModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateQuery} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Regarding Student</label>
                <select
                  id="modal-select-query-student"
                  value={selectedStudentForQuery}
                  onChange={(e) => setSelectedStudentForQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-indigo-500"
                >
                  {parentStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.class_id} - Sec {s.section}, Roll: {s.roll_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject / Topic *</label>
                  <input
                    id="modal-input-query-subject"
                    type="text"
                    value={querySubject}
                    onChange={(e) => setQuerySubject(e.target.value)}
                    placeholder="e.g. Help with Physics numericals"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    id="modal-select-query-category"
                    value={queryCategory}
                    onChange={(e) => setQueryCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="academic">Academic & Subjects</option>
                    <option value="homework">Homework & Diary</option>
                    <option value="attendance">Attendance / Leave</option>
                    <option value="behavior">Behavior & Conduct</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Detail *</label>
                <textarea
                  id="modal-textarea-query-detail"
                  rows={4}
                  value={queryInitialMessage}
                  onChange={(e) => setQueryInitialMessage(e.target.value)}
                  placeholder="Explain your question clearly for the teacher..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewQueryModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-parent-query"
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Send Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
