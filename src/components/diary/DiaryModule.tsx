import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Eye,
  CheckCheck,
  Paperclip,
  Image as ImageIcon,
  Camera,
  Upload,
  Send,
  AlertCircle,
  Filter,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Trash2,
  Sparkles,
  UserCheck,
  FileEdit,
  X,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { DiaryEntry } from '../../types';

export const DiaryModule: React.FC = () => {
  const {
    currentSchool,
    currentUser,
    students,
    diary,
    addDiaryEntry,
    markDiaryAsRead,
    deleteDiaryEntry,
    attendance,
  } = useSchoolData();

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const isParent = currentUser?.role === 'parent';

  // Parent's linked students
  const parentStudents = students.filter((s) => s.parent_id === currentUser?.id);
  const defaultStudent = parentStudents[0] || students[0];
  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultStudent?.id || '');

  // Class filters for teachers
  const availableClasses = Array.from(new Set(students.map((s) => s.class_id)));
  const [selectedClass, setSelectedClass] = useState<string>(
    isParent && defaultStudent ? defaultStudent.class_id : availableClasses[0] || 'Grade 10'
  );
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'absent_catchup'>('feed');

  // Input Mode: 'photo' (Primary - Take picture / upload) vs 'text' (Secondary - Type / write)
  const [primaryInputMode, setPrimaryInputMode] = useState<'photo' | 'text'>('photo');

  // New Diary Form State
  const [formClass, setFormClass] = useState<string>(availableClasses[0] || 'Grade 10');
  const [formSection, setFormSection] = useState<string>('A');
  const [formSubject, setFormSubject] = useState<string>('Mathematics');
  const [formClasswork, setFormClasswork] = useState<string>('');
  const [formHomework, setFormHomework] = useState<string>('');
  const [formDueDate, setFormDueDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  // Photo & Attachment State (Primary Option)
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ id: string; url: string; caption: string; type: 'blackboard' | 'worksheet' | 'handwritten' }>
  >([]);
  const [attachmentCaption, setAttachmentCaption] = useState<string>('Blackboard & Notes Capture');
  const [imageCategory, setImageCategory] = useState<'blackboard' | 'worksheet' | 'handwritten'>('blackboard');

  // Camera Live Capture State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [readReceiptModalEntry, setReadReceiptModalEntry] = useState<DiaryEntry | null>(null);

  const subjectsList = [
    'All',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English Literature',
    'Computer Science',
    'Urdu',
    'Islamiat',
    'Social Studies',
  ];

  // Camera Stream Handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera access unavailable or declined:', err);
          setIsCameraActive(false);
          alert('Camera could not be accessed in this browser. You can still use the "Upload from Device" or Preset Photo buttons!');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  // Capture frame from webcam / phone camera
  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setUploadedImages((prev) => [
        ...prev,
        {
          id: `img-${Date.now()}`,
          url: dataUrl,
          caption: attachmentCaption || 'Live Blackboard Capture',
          type: imageCategory,
        },
      ]);
      setIsCameraActive(false);
    }
  };

  // File picker handler (Upload image file from mobile gallery or desktop files)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url: event.target!.result as string,
              caption: attachmentCaption || file.name,
              type: imageCategory,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Quick Preset Blackboard / Worksheet samples for demo convenience
  const addPresetBlackboard = (presetType: 'blackboard' | 'worksheet' | 'handwritten') => {
    const presets = {
      blackboard: {
        url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
        caption: 'Blackboard Lecture Notes: Theorem proofs & key formulas',
      },
      worksheet: {
        url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=80',
        caption: 'Class Exercise Practice Worksheet (Questions 1 to 10)',
      },
      handwritten: {
        url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
        caption: 'Teacher Handwritten Class Notes & Derivations',
      },
    };

    const chosen = presets[presetType];
    setUploadedImages((prev) => [
      ...prev,
      {
        id: `img-preset-${Date.now()}`,
        url: chosen.url,
        caption: chosen.caption,
        type: presetType,
      },
    ]);
  };

  // Filter diary entries
  const filteredDiary = diary.filter((entry) => {
    if (isParent) {
      const activeStudent = students.find((s) => s.id === selectedStudentId);
      if (activeStudent) {
        const matchesClass = entry.class_id === activeStudent.class_id;
        const matchesSection = entry.section === 'All' || entry.section === activeStudent.section;
        const matchesSubject = selectedSubject === 'All' || entry.subject === selectedSubject;
        return matchesClass && matchesSection && matchesSubject;
      }
    }
    const matchesClass = selectedClass === 'All' || entry.class_id === selectedClass;
    const matchesSubject = selectedSubject === 'All' || entry.subject === selectedSubject;
    return matchesClass && matchesSubject;
  });

  // Active student status for Absent Catch-up helper
  const currentStudentObj = students.find((s) => s.id === selectedStudentId);
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isCurrentStudentAbsentToday = attendance.some(
    (a) => a.student_id === selectedStudentId && a.date === todayDateStr && a.status === 'absent'
  );

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Must have either photos or text
    if (uploadedImages.length === 0 && !formClasswork.trim() && !formHomework.trim()) {
      alert('Please either snap/upload a picture of blackboard/work OR write the classwork text!');
      return;
    }

    const attachments = uploadedImages.map((img) => ({
      id: img.id,
      type: 'image' as const,
      url: img.url,
      caption: img.caption,
    }));

    // Auto-fill fallback text if teacher primarily uploaded photos
    const finalClasswork =
      formClasswork.trim() ||
      (uploadedImages.length > 0
        ? `[See attached ${uploadedImages.length} whiteboard / classwork photo(s)]\nCovered textbook curriculum as captured on the blackboard.`
        : 'Daily class exercises and guided textbook discussions.');

    const finalHomework =
      formHomework.trim() ||
      (uploadedImages.length > 0
        ? `[Review attached board photos]\nComplete textbook homework questions and replicate notes into homework register.`
        : 'Complete daily exercises and practice workbook questions.');

    addDiaryEntry({
      class_id: formClass,
      section: formSection,
      subject: formSubject,
      date: todayDateStr,
      classwork: finalClasswork,
      homework: finalHomework,
      due_date: formDueDate,
      attachments,
    });

    // Reset Form
    setFormClasswork('');
    setFormHomework('');
    setUploadedImages([]);
    setIsComposeOpen(false);
  };

  const handleParentAcknowledge = (entry: DiaryEntry) => {
    if (!currentStudentObj) return;
    markDiaryAsRead(entry.id, currentStudentObj.id, currentStudentObj.name);
  };

  return (
    <div className="space-y-6">
      {/* 1. Prestigious Classroom Blackboard & Study Banner */}
      <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-[#EDE7C7] bg-[#200E01] text-[#EDE7C7]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80"
            alt="School Classroom Blackboard"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/85 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Chalkboard & Lecture Notes • Daily Academic Log</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
              Digital Student Diary & Homework Feed
            </h2>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Instant blackboard snapshots, laboratory worksheets, absent student syllabus catch-up, and verified parent signatures for Cambridge & Matric streams.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="group relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 w-28 h-20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&auto=format&fit=crop&q=80"
                alt="Library Textbooks"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                <span className="text-[10px] font-bold text-[#EDE7C7] leading-tight">Curriculum</span>
              </div>
            </div>
            <div className="group relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 w-28 h-20 shadow-md hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&auto=format&fit=crop&q=80"
                alt="Classroom Study"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                <span className="text-[10px] font-bold text-[#EDE7C7] leading-tight">Study Hall</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Control & Action Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-[#EDE7C7] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#8B0000] text-[#EDE7C7] flex items-center justify-center font-black shadow-md border border-[#D4AF37]/40">
            <BookOpen className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-[#200E01] tracking-tight font-['Cormorant_Garamond',serif] italic">
                Active Curriculum Feed
              </h3>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE7C7] text-[#8B0000] border border-[#D4AF37]/40 font-['Cinzel',serif]">
                Digital Roster
              </span>
            </div>
            <p className="text-xs text-[#5B0202]/70 mt-0.5 font-medium">
              Review assigned homework, textbook exercises, and laboratory submissions.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isTeacherOrAdmin && (
            <button
              id="btn-new-diary-entry"
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-[#8B0000] hover:bg-[#700000] shadow-sm shadow-[#8B0000]/20 transition active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Post Diary (Snap or Write)</span>
            </button>
          )}

          {/* Sub Tab Switcher */}
          <div className="flex items-center p-1 bg-[#F4F4F4] rounded-2xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'feed'
                  ? 'bg-white text-[#8B0000] shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Feed ({filteredDiary.length})
            </button>
            <button
              onClick={() => setActiveTab('absent_catchup')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'absent_catchup'
                  ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Absent Catch-Up</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Parent Persona Context Bar */}
      {isParent && (
        <div className="bg-[#FAF8F2] border border-[#E7E0EE] rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#8B0000] text-white flex items-center justify-center font-black text-sm shadow-xs">
              {currentStudentObj?.name.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-[11px] text-[#8B0000] font-extrabold uppercase tracking-wider">
                Viewing Diary As Guardian of:
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  id="select-parent-student"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-white border border-[#D4AF37/40] text-slate-900 font-extrabold text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#8B0000]"
                >
                  {parentStudents.length > 0 ? (
                    parentStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class_id} - Sec {s.section}, Roll: {s.roll_number})
                      </option>
                    ))
                  ) : (
                    <option value={students[0]?.id}>{students[0]?.name} (Demo Student)</option>
                  )}
                </select>
                {isCurrentStudentAbsentToday && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-black animate-pulse flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Absent Today
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-[#8B0000] bg-white/90 px-3.5 py-2 rounded-2xl border border-[#D4AF37/40] font-medium">
            <span className="font-bold">Verifiable Signatures:</span> Clicking "Sign & Mark as Read" logs an official timestamp to end communication arguments.
          </div>
        </div>
      )}

      {/* 3. Class & Subject Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {!isParent && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Class:</span>
              <select
                id="select-diary-class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#8B0000]"
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Subject:</span>
            <select
              id="select-diary-subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#8B0000]"
            >
              {subjectsList.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-semibold text-[11px] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#8B0000]" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* 4. Absent Student Catch-Up Portal Banner */}
      {activeTab === 'absent_catchup' && (
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-amber-900 text-sm sm:text-base font-['Outfit',sans-serif]">
                Absent Student Catch-Up Portal (Ghar Baithe Classwork & Blackboard Notes)
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Jo bachay kisi wajah se school nahi aa sake, unka syllabus peeche na rahe. 
                Neeche teachers ki share ki hui blackboard ki pictures, derivations, aur daily homework dekh kar bachay ghar bethe register par kaam complete kar sakte hain.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
              <p className="text-[10px] uppercase tracking-wider text-amber-700 font-extrabold">Active Class</p>
              <p className="text-base font-black text-slate-900 mt-0.5">{selectedClass}</p>
            </div>
            <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
              <p className="text-[10px] uppercase tracking-wider text-amber-700 font-extrabold">Lessons Today</p>
              <p className="text-base font-black text-slate-900 mt-0.5">{filteredDiary.length} Recorded</p>
            </div>
            <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
              <p className="text-[10px] uppercase tracking-wider text-amber-700 font-extrabold">Board Photos Available</p>
              <p className="text-base font-black text-emerald-600 mt-0.5">
                {filteredDiary.filter((d) => d.attachments && d.attachments.length > 0).length} Photo Logs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Diary Entries Feed */}
      {filteredDiary.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF8F2] text-[#8B0000] mx-auto flex items-center justify-center shadow-xs">
            <BookOpen className="w-7 h-7" />
          </div>
          <h4 className="font-extrabold text-slate-800 text-sm font-['Outfit',sans-serif]">No Diary Entries For This Selection Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Teachers haven't posted notes for this class/subject today. You can snap a blackboard picture or write an entry.
          </p>
          {isTeacherOrAdmin && (
            <button
              onClick={() => setIsComposeOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000] transition shadow-xs"
            >
              <Camera className="w-4 h-4" />
              Post Blackboard Picture or Notes
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredDiary.map((entry) => {
            const hasParentRead = currentStudentObj
              ? entry.read_by_parents.some(
                  (r) => r.parent_id === currentUser?.id && r.student_id === currentStudentObj.id
                )
              : false;

            const readCount = entry.read_by_parents.length;

            return (
              <article
                key={entry.id}
                id={`diary-card-${entry.id}`}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(121,82,179,0.06)] hover:shadow-md transition overflow-hidden"
              >
                {/* Entry Header */}
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F2]/50">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-9 rounded-full bg-[#8B0000]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base font-['Outfit',sans-serif]">
                          {entry.subject}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE7C7] text-[#8B0000]">
                          {entry.class_id} • Sec {entry.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Teacher: <span className="font-semibold text-slate-700">{entry.teacher_name}</span> • {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Read Receipts Indicator */}
                    <button
                      id={`btn-read-receipts-${entry.id}`}
                      onClick={() => setReadReceiptModalEntry(entry)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-[#FAF8F2] text-slate-700 text-xs font-bold transition shadow-2xs"
                      title="View parents who have read this diary entry"
                    >
                      <CheckCheck className={`w-4 h-4 ${readCount > 0 ? 'text-[#8B0000]' : 'text-slate-400'}`} />
                      <span>{readCount} Parent{readCount === 1 ? '' : 's'} Signed</span>
                    </button>

                    {/* Delete for Author / Admin */}
                    {isTeacherOrAdmin && (
                      <button
                        onClick={() => deleteDiaryEntry(entry.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Delete diary entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Photo & Attachment Sharing (PRIMARY EMPHASIS) */}
                  {entry.attachments && entry.attachments.length > 0 && (
                    <div className="space-y-3 bg-[#FAF8F2] p-4 sm:p-5 rounded-2xl border border-[#ECE5F4]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#8B0000] flex items-center gap-2 font-['Outfit',sans-serif]">
                          <Camera className="w-4 h-4 text-[#8B0000]" />
                          Whiteboard & Work Photos ({entry.attachments.length})
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Tap image to zoom or copy notes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {entry.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="group relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-2xs"
                          >
                            <img
                              src={att.url}
                              alt={att.caption}
                              className="w-full h-48 object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex flex-col justify-end p-3 text-white">
                              <span className="text-xs font-bold line-clamp-1">{att.caption}</span>
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-purple-200 hover:text-white"
                              >
                                <span>Inspect Full Resolution</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Two Column Grid: Classwork & Homework */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Classwork Block */}
                    <div className="bg-[#F8F9FE] rounded-2xl p-4 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-['Outfit',sans-serif]">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8B0000]" />
                          Classwork (Aaj Class Ka Kaam)
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                        {entry.classwork}
                      </p>
                    </div>

                    {/* Homework Block */}
                    <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 font-['Outfit',sans-serif]">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Homework (Ghar Ka Kaam)
                        </span>
                        {entry.due_date && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-200/80 text-amber-950 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due: {entry.due_date}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-amber-950 leading-relaxed whitespace-pre-line font-medium">
                        {entry.homework}
                      </p>
                    </div>
                  </div>

                  {/* Read Receipts Action Bar for Parents */}
                  {isParent && (
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      <div className="text-xs">
                        {hasParentRead ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Acknowledged by you (Diary Viewed & Signed)
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">
                            Please confirm that you have reviewed your child's diary today.
                          </span>
                        )}
                      </div>

                      {!hasParentRead && (
                        <button
                          id={`btn-acknowledge-diary-${entry.id}`}
                          onClick={() => handleParentAcknowledge(entry)}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>Mark Diary as Read (Sign Acknowledgment)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 6. Compose Diary Entry Modal with PRIMARY IMAGE / BLACKBOARD CAPTURE */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#8B0000] text-white flex items-center justify-center shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                    Post Class Diary & Blackboard Work
                  </h3>
                  <p className="text-xs text-slate-500">
                    Snap or upload blackboard pictures first, with option to type details.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsComposeOpen(false);
                  setIsCameraActive(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* PRIMARY VS SECONDARY MODE SELECTOR */}
            <div className="flex items-center p-1.5 bg-[#FAF8F2] rounded-2xl border border-[#D4AF37/40]">
              <button
                type="button"
                onClick={() => setPrimaryInputMode('photo')}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition ${
                  primaryInputMode === 'photo'
                    ? 'bg-[#8B0000] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>PRIMARY: Snap / Upload Blackboard Photo</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">Instant</span>
              </button>
              <button
                type="button"
                onClick={() => setPrimaryInputMode('text')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  primaryInputMode === 'text'
                    ? 'bg-[#8B0000] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileEdit className="w-4 h-4" />
                <span>SECONDARY: Type / Write Notes</span>
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
              {/* Class, Section, Subject Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Grade</label>
                  <select
                    id="modal-input-diary-class"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-[#8B0000]"
                  >
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <select
                    id="modal-input-diary-section"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-[#8B0000]"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="All">All Sections</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    id="modal-input-diary-subject"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-[#8B0000]"
                  >
                    {subjectsList.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PRIMARY OPTION: CAMERA SNAP & IMAGE UPLOADER */}
              {primaryInputMode === 'photo' && (
                <div className="bg-[#FAF8F2] border-2 border-dashed border-[#8B0000]/40 rounded-3xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-['Outfit',sans-serif]">
                        <ImageIcon className="w-4 h-4 text-[#8B0000]" />
                        Capture Blackboard or Upload Worksheet Photo
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Take a photo of the board directly with your phone camera or select from device files.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsCameraActive(!isCameraActive)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                          isCameraActive
                            ? 'bg-rose-600 text-white'
                            : 'bg-[#8B0000] text-white hover:bg-[#700000]'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{isCameraActive ? 'Close Camera' : 'Snap with Camera'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#8B0000]" />
                        <span>Upload Image</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {/* Live Camera Viewfinder */}
                  {isCameraActive && (
                    <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-[#8B0000] p-1 flex flex-col items-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-h-64 object-cover rounded-xl"
                      />
                      <div className="absolute bottom-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={capturePhotoFromCamera}
                          className="px-5 py-2.5 rounded-full font-black text-xs text-white bg-[#8B0000] hover:bg-[#700000] shadow-lg flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Capture Photo Now</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Photo Category Picker & Caption */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Image Type:</label>
                      <select
                        value={imageCategory}
                        onChange={(e) => setImageCategory(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold focus:ring-2 focus:ring-[#8B0000]"
                      >
                        <option value="blackboard">Blackboard Lecture</option>
                        <option value="worksheet">Practice Worksheet</option>
                        <option value="handwritten">Handwritten Notes</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Photo Caption:</label>
                      <input
                        type="text"
                        value={attachmentCaption}
                        onChange={(e) => setAttachmentCaption(e.target.value)}
                        placeholder="e.g. Chapter 5 Theorem derivation & diagram on board"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium focus:ring-2 focus:ring-[#8B0000]"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons for Quick Testing */}
                  <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-bold text-slate-500">Quick Demo Presets:</span>
                    <button
                      type="button"
                      onClick={() => addPresetBlackboard('blackboard')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#8B0000] font-bold hover:bg-[#FAF8F2]"
                    >
                      + Blackboard Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => addPresetBlackboard('worksheet')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-blue-700 font-bold hover:bg-blue-50"
                    >
                      + Worksheet Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => addPresetBlackboard('handwritten')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-amber-700 font-bold hover:bg-amber-50"
                    >
                      + Handwritten Notes Sample
                    </button>
                  </div>

                  {/* Attached Images Gallery Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <p className="font-bold text-slate-700">Attached Images ({uploadedImages.length}):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {uploadedImages.map((img) => (
                          <div
                            key={img.id}
                            className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-900"
                          >
                            <img src={img.url} alt={img.caption} className="w-full h-24 object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-end justify-between p-1.5 text-white">
                              <span className="text-[10px] truncate max-w-[80%] font-medium">{img.caption}</span>
                              <button
                                type="button"
                                onClick={() => setUploadedImages((prev) => prev.filter((i) => i.id !== img.id))}
                                className="p-1 text-white bg-rose-600 rounded-md hover:bg-rose-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECONDARY OPTION: WRITE / TYPE TEXT CLASSWORK & HOMEWORK */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Classwork Summary (Aaj Class Mein Kya Parhaya / Karwaya)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {primaryInputMode === 'photo' ? 'Optional if photo attached' : 'Required'}
                    </span>
                  </div>
                  <textarea
                    id="modal-textarea-classwork"
                    rows={primaryInputMode === 'photo' ? 2 : 3}
                    value={formClasswork}
                    onChange={(e) => setFormClasswork(e.target.value)}
                    placeholder={
                      primaryInputMode === 'photo'
                        ? 'Brief remarks (e.g. Discussed textbook exercises 4.2 questions 1-6 as shown on blackboard)...'
                        : 'Explain classwork lecture details here...'
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-[#8B0000]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Homework Assignment (Ghar Ka Kaam)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {primaryInputMode === 'photo' ? 'Optional if photo attached' : 'Required'}
                    </span>
                  </div>
                  <textarea
                    id="modal-textarea-homework"
                    rows={primaryInputMode === 'photo' ? 2 : 3}
                    value={formHomework}
                    onChange={(e) => setFormHomework(e.target.value)}
                    placeholder={
                      primaryInputMode === 'photo'
                        ? 'e.g. Complete questions written on board in home homework notebooks...'
                        : 'Write homework instructions here...'
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-[#8B0000]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Submission Due Date</label>
                  <input
                    id="modal-input-due-date"
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-[#8B0000]"
                  />
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsComposeOpen(false);
                    setIsCameraActive(false);
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-diary-entry"
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl font-bold text-white bg-[#8B0000] hover:bg-[#700000] transition shadow-md shadow-[#8B0000]/20 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish to Diary Feed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Read Receipts Verifiable Audit Modal */}
      {readReceiptModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 font-['Outfit',sans-serif]">
                  <CheckCheck className="w-4 h-4 text-[#8B0000]" />
                  Verified Parent Read Receipts
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {readReceiptModalEntry.subject} • {readReceiptModalEntry.class_id}
                </p>
              </div>
              <button
                onClick={() => setReadReceiptModalEntry(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                Audited timeline of parents who opened and acknowledged this diary entry on their devices:
              </p>

              {readReceiptModalEntry.read_by_parents.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No parent has viewed and signed this entry yet.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {readReceiptModalEntry.read_by_parents.map((r, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-[#FAF8F2] border border-[#D4AF37/40] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{r.parent_name}</p>
                        <p className="text-[11px] text-[#8B0000] font-medium">Child: {r.student_name}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-600 font-semibold block">
                          {new Date(r.read_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-[#8B0000] font-bold block">
                          {new Date(r.read_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setReadReceiptModalEntry(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
