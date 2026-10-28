import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  CheckCheck,
  Image as ImageIcon,
  Camera,
  Upload,
  Send,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Sparkles,
  FileEdit,
  X,
  FileText,
  Download,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { DiaryEntry } from '../../types';
import { LocalStore } from '../../lib/storage';

interface AttachmentItem {
  id: string;
  url: string;
  caption: string;
  type: 'planner_pdf' | 'classwork_photo' | 'worksheet' | 'handwritten' | 'document' | 'image';
  fileSize?: string;
  fileName?: string;
  isPdf?: boolean;
}

// Sample clean printable work planner PDF for testing & upload
const SAMPLE_PLANNER_PDF = '/sample-daily-work-planner.pdf';

export const DiaryModule: React.FC = () => {
  const {
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

  // Input Mode: 'photo' (Primary - Upload Planner PDF / Class Work) vs 'text' (Secondary - Type / write)
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

  // Attachment State (PDF / Class Work Photo)
  const [uploadedAttachments, setUploadedAttachments] = useState<AttachmentItem[]>([]);
  const [attachmentCaption, setAttachmentCaption] = useState<string>('Daily Work Planner & Class Work Notes');
  const [attachmentCategory, setAttachmentCategory] = useState<
    'planner_pdf' | 'classwork_photo' | 'worksheet' | 'handwritten'
  >('planner_pdf');

  // Camera Live Capture & In-App CamScanner Enhancer State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [enableMagicFilter, setEnableMagicFilter] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modals for PDF and Photo Inspection
  const [activePdfModal, setActivePdfModal] = useState<{ url: string; title: string; fileName?: string } | null>(
    null
  );
  const [activeImageModal, setActiveImageModal] = useState<{ url: string; caption: string } | null>(null);
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

  // Helper to determine if an attachment URL or object is a PDF
  const isPdfAttachment = (att: {
    type?: string;
    url: string;
    caption?: string;
    fileName?: string;
    isPdf?: boolean;
  }): boolean => {
    if (att.isPdf) return true;
    if (att.type === 'document' || att.type === 'planner_pdf') return true;
    if (att.url.startsWith('data:application/pdf')) return true;
    if (att.url.toLowerCase().split('?')[0].endsWith('.pdf')) return true;
    if (att.fileName && att.fileName.toLowerCase().endsWith('.pdf')) return true;
    if (att.caption && (att.caption.toLowerCase().includes('pdf') || att.caption.toLowerCase().includes('planner')))
      return true;
    return false;
  };

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
          alert(
            'Camera could not be accessed in this browser. You can still use the "Upload Work Planner PDF" or choose file button!'
          );
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  // Capture frame from webcam / phone camera with optional CamScanner Magic Filter
  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (enableMagicFilter) {
        // CamScanner style enhancement: high contrast, boosted whites, crisp dark ink
        ctx.filter = 'contrast(140%) brightness(110%) saturate(70%)';
      }
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setUploadedAttachments((prev) => [
        ...prev,
        {
          id: `att-cam-${Date.now()}`,
          url: dataUrl,
          caption:
            attachmentCaption ||
            (enableMagicFilter ? 'Class Work Capture (CamScanner Enhanced)' : 'Live Class Work Photo'),
          type: 'classwork_photo',
          isPdf: false,
          fileSize: 'Camera Snap',
          fileName: 'ClassWork_Live_Snap.jpg',
        },
      ]);
      setIsCameraActive(false);
    }
  };

  // File picker handler: Accepts both scanned Work Planner PDFs (from CamScanner) and class work photos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const fileSizeKb = (file.size / 1024).toFixed(1) + ' KB';
          setUploadedAttachments((prev) => [
            ...prev,
            {
              id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url: event.target!.result as string,
              caption:
                attachmentCaption ||
                (isPdf
                  ? `Daily Work Planner (${file.name})`
                  : `Class Work Notes - ${file.name.replace(/\.[^/.]+$/, '')}`),
              type: isPdf ? 'planner_pdf' : attachmentCategory,
              fileSize: fileSizeKb,
              fileName: file.name,
              isPdf,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Quick Presets: Scanned Work Planner PDF, Class Work Notes, Practice Worksheet
  const addPresetAttachment = (presetType: 'planner_pdf' | 'classwork_photo' | 'worksheet' | 'handwritten') => {
    if (presetType === 'planner_pdf') {
      setUploadedAttachments((prev) => [
        ...prev,
        {
          id: `preset-pdf-${Date.now()}`,
          url: SAMPLE_PLANNER_PDF,
          caption: 'Daily Work Planner (CamScanner Scanned PDF) - Full Page Schedule',
          type: 'planner_pdf',
          fileSize: '142.5 KB',
          fileName: 'Grade10_Daily_Work_Planner.pdf',
          isPdf: true,
        },
      ]);
      return;
    }

    const presets = {
      classwork_photo: {
        url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80',
        caption: 'Class Work Notes - Formula derivations & step-by-step example',
        fileName: 'Class_Work_Lecture.jpg',
      },
      worksheet: {
        url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=80',
        caption: 'Class Exercise Practice Worksheet (Questions 1 to 10)',
        fileName: 'Practice_Worksheet_Ch4.jpg',
      },
      handwritten: {
        url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
        caption: 'Teacher Handwritten Class Notes & Derivations',
        fileName: 'Teacher_Handwritten_Notes.jpg',
      },
    };

    const chosen = presets[presetType];
    setUploadedAttachments((prev) => [
      ...prev,
      {
        id: `preset-img-${Date.now()}`,
        url: chosen.url,
        caption: chosen.caption,
        type: presetType,
        fileName: chosen.fileName,
        fileSize: 'Sample',
        isPdf: false,
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

  const currentStudentObj = students.find((s) => s.id === selectedStudentId);
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isCurrentStudentAbsentToday = attendance.some(
    (a) => a.student_id === selectedStudentId && a.date === todayDateStr && a.status === 'absent'
  );

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Must have either attachments (PDF/photos) or written text
    if (uploadedAttachments.length === 0 && !formClasswork.trim() && !formHomework.trim()) {
      alert('Please either upload a Work Planner PDF / Class Work photo OR write the classwork text!');
      return;
    }

    const attachments = uploadedAttachments.map((att) => ({
      id: att.id,
      type: (att.isPdf ? 'document' : 'image') as 'document' | 'image',
      url: att.url,
      caption: att.caption,
      fileSize: att.fileSize,
      fileName: att.fileName,
    }));

    // Auto-fill fallback text if teacher primarily uploaded files/PDFs
    const finalClasswork =
      formClasswork.trim() ||
      (uploadedAttachments.length > 0
        ? `[See attached ${uploadedAttachments.length} Work Planner PDF / Class Work note(s)]\nCovered textbook curriculum as recorded in daily work planner.`
        : 'Daily class exercises and guided textbook discussions.');

    const finalHomework =
      formHomework.trim() ||
      (uploadedAttachments.length > 0
        ? `[Review attached Work Planner PDF / Class Work notes]\nComplete daily questions and transcribe assigned exercises into homework register.`
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
    setUploadedAttachments([]);
    setIsComposeOpen(false);
  };

  const handleParentAcknowledge = (entry: DiaryEntry) => {
    if (!currentStudentObj) return;
    markDiaryAsRead(entry.id, currentStudentObj.id, currentStudentObj.name);
  };

  // Load fresh sample diary data (clears stale localStorage diary cache)
  const handleLoadSampleData = () => {
    LocalStore.resetDiaryToSample();
    // Also reset selected class to match the sample data class
    setSelectedClass('Class 10 (O-Levels)');
    setSelectedSubject('All');
  };

  return (
    <div className="space-y-6">
      {/* 1. Academic Banner: Class Work & Work Planner PDF */}
      <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-[#EDE7C7] bg-[#200E01] text-[#EDE7C7]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80"
            alt="School Class Work"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/85 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Class Work &amp; Work Planner PDF • Daily Academic Log</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
              Digital Student Diary &amp; Work Planner Feed
            </h2>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Instant Class Work snapshots, daily work planner PDFs (CamScanner), laboratory worksheets, absent student
              syllabus catch-up, and verified parent signatures for Cambridge &amp; Matric streams.
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
                Active Curriculum &amp; Planner Feed
              </h3>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE7C7] text-[#8B0000] border border-[#D4AF37]/40 font-['Cinzel',serif]">
                Digital Roster
              </span>
            </div>
            <p className="text-xs text-[#5B0202]/70 mt-0.5 font-medium">
              Review assigned homework, work planner PDFs, and class work derivations.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isTeacherOrAdmin ? (
            <button
              id="btn-new-diary-entry"
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-[#8B0000] hover:opacity-90 shadow-sm shadow-[#8B0000]/20 transition active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Post Diary (Upload PDF / Snap or Write)</span>
            </button>
          ) : (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-[11px] font-bold text-[#8B0000] bg-[#FAF8F2] border border-[#D4AF37]/40">
              <span>Parent View (Switch to Teacher/Admin above to post)</span>
            </div>
          )}

          {/* Load Sample Data Button — always visible for quick testing */}
          <button
            onClick={handleLoadSampleData}
            title="Reset diary to built-in sample entries (3 subjects with PDF & photos)"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs text-[#8B0000] bg-[#FAF8F2] border border-[#D4AF37]/50 hover:bg-[#F0E8D0] transition active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Sample Data</span>
          </button>

          {/* Download Sample PDF file for quick test uploading */}
          <a
            href="/sample-daily-work-planner.pdf"
            download="sample-daily-work-planner.pdf"
            title="Download sample CamScanner Work Planner PDF to test uploading from phone"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition active:scale-95 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-700" />
            <span>Sample PDF File</span>
          </a>

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

      {/* Parent Persona Context Bar */}
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
                  className="bg-white border border-[#D4AF37]/40 text-slate-900 font-extrabold text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#8B0000]"
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

          <div className="text-xs text-[#8B0000] bg-white/90 px-3.5 py-2 rounded-2xl border border-[#D4AF37]/40 font-medium">
            <span className="font-bold">Verifiable Signatures:</span> Review your child's daily work planner PDF, check
            class work notes, and tap "Sign &amp; Mark as Read" to timestamp acknowledgment.
          </div>
        </div>
      )}

      {/* Class & Subject Filter Bar */}
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

        <div className="text-[11px] font-semibold text-slate-400">
          Showing {filteredDiary.length} entries for today
        </div>
      </div>

      {/* 4. Absent Student Syllabus Catch-up Tab */}
      {activeTab === 'absent_catchup' && (
        <div className="bg-amber-50 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-amber-900 text-sm sm:text-base font-['Outfit',sans-serif]">
                Absent Student Catch-Up Portal (Ghar Baithe Classwork &amp; Work Planner PDF)
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Jo bachay kisi wajah se school nahi aa sake, unka syllabus peeche na rahe. Neeche teachers ki share ki
                hui pure daily work planner PDF (CamScanner), class work derivations, aur daily homework dekh kar bachay
                ghar bethe register par kaam complete kar sakte hain.
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
              <p className="text-[10px] uppercase tracking-wider text-amber-700 font-extrabold">Planner &amp; Class Work Scans</p>
              <p className="text-base font-black text-emerald-600 mt-0.5">
                {filteredDiary.filter((d) => d.attachments && d.attachments.length > 0).length} Scans / Docs Available
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
          <h4 className="font-extrabold text-slate-800 text-sm font-['Outfit',sans-serif]">
            No Diary Entries For This Selection Yet
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Teachers haven't posted notes or work planner PDFs for this class/subject today.
          </p>
          {isTeacherOrAdmin && (
            <button
              onClick={() => setIsComposeOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000] transition shadow-xs"
            >
              <Upload className="w-4 h-4" />
              Upload Work Planner PDF or Class Work Notes
            </button>
          )}
          {/* Quick fix: load sample demo data */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
            <p className="w-full text-[11px] text-slate-400 mb-1">First time? Load sample entries or download test file:</p>
            <button
              onClick={handleLoadSampleData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#8B0000] bg-[#FAF8F2] border border-[#D4AF37]/50 hover:bg-[#F0E8D0] transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Load Sample Diary Data (3 Subjects)
            </button>
            <a
              href="/sample-daily-work-planner.pdf"
              download="sample-daily-work-planner.pdf"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              Download Test Sample PDF
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredDiary.map((entry) => {
            const hasParentRead = currentStudentObj
              ? entry.read_by_parents.some(
                  (r) => r.parent_id === currentUser?.id && r.student_id === currentStudentObj.id
                )
              : false;

            return (
              <article
                key={entry.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition hover:shadow-md"
              >
                {/* Entry Header */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FAF8F2] via-white to-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#8B0000]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                          {entry.subject}
                        </span>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-[#8B0000]/10 text-[#8B0000]">
                          {entry.class_id} (Sec {entry.section})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Recorded by {entry.teacher_name} • {entry.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Read Receipts count for teachers */}
                    {isTeacherOrAdmin && (
                      <button
                        onClick={() => setReadReceiptModalEntry(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition border border-purple-200 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{entry.read_by_parents.length} Parents Signed</span>
                      </button>
                    )}

                    {isTeacherOrAdmin && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this diary entry?')) {
                            deleteDiaryEntry(entry.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Attachments Section: Work Planner PDF & Class Work Photos */}
                  {entry.attachments && entry.attachments.length > 0 && (
                    <div className="space-y-3 bg-[#FAF8F2] p-4 sm:p-5 rounded-2xl border border-[#ECE5F4]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#8B0000] flex items-center gap-2 font-['Outfit',sans-serif]">
                          <FileText className="w-4 h-4 text-[#8B0000]" />
                          Work Planner PDFs &amp; Class Work Notes ({entry.attachments.length})
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Tap PDF to read multi-page planner or view notes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {entry.attachments.map((att) => {
                          const isPdf = isPdfAttachment(att);

                          if (isPdf) {
                            return (
                              <div
                                key={att.id}
                                className="group relative rounded-2xl border-2 border-rose-200/90 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#8B0000] transition flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                                      <FileText className="w-3 h-3 text-rose-700" />
                                      PDF Document
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">
                                      {att.fileSize || 'CamScanner Scan'}
                                    </span>
                                  </div>
                                  <h5 className="font-extrabold text-slate-900 text-xs line-clamp-2 leading-tight">
                                    {att.caption}
                                  </h5>
                                  <p className="text-[10px] text-slate-500 truncate mt-1">
                                    {att.fileName || 'Daily_Work_Planner.pdf'}
                                  </p>
                                </div>

                                <div className="pt-4 flex items-center gap-2 border-t border-slate-100 mt-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActivePdfModal({
                                        url: att.url,
                                        title: att.caption,
                                        fileName: att.fileName,
                                      })
                                    }
                                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition"
                                  >
                                    <Maximize2 className="w-3 h-3" />
                                    <span>Read Full PDF</span>
                                  </button>
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={att.fileName || 'Daily_Work_Planner.pdf'}
                                    className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                                    title="Open / Download"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </div>
                            );
                          }

                          // Class Work Photo
                          return (
                            <div
                              key={att.id}
                              className="group relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-2xs cursor-pointer"
                              onClick={() => setActiveImageModal({ url: att.url, caption: att.caption })}
                            >
                              <img
                                src={att.url}
                                alt={att.caption}
                                className="w-full h-44 object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex flex-col justify-end p-3 text-white">
                                <span className="text-xs font-bold line-clamp-1">{att.caption}</span>
                                <div className="mt-1 flex items-center justify-between text-[10px] text-purple-200 font-semibold">
                                  <span>Class Work Note</span>
                                  <span className="flex items-center gap-1 text-white underline">
                                    <Maximize2 className="w-3 h-3" /> Zoom
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                            Acknowledged by you (Diary &amp; Planner Viewed)
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">
                            Please review today's work planner PDF and class work notes.
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

      {/* 6. Compose Diary Entry Modal with PRIMARY PDF & CLASS WORK SCAN */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#8B0000] text-white flex items-center justify-center shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                    Post Class Diary &amp; Work Planner
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload your daily work planner PDF (CamScanner) or snap class work photos.
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
            <div className="flex items-center p-1.5 bg-[#FAF8F2] rounded-2xl border border-[#D4AF37]/40">
              <button
                type="button"
                onClick={() => setPrimaryInputMode('photo')}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition ${
                  primaryInputMode === 'photo'
                    ? 'bg-[#8B0000] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>PRIMARY: Upload Work Planner PDF / Snap Notes</span>
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

              {/* PRIMARY OPTION: WORK PLANNER PDF UPLOADER & CLASS WORK CAPTURE */}
              {primaryInputMode === 'photo' && (
                <div className="bg-[#FAF8F2] border-2 border-dashed border-[#8B0000]/40 rounded-3xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-['Outfit',sans-serif]">
                        <FileText className="w-4 h-4 text-[#8B0000]" />
                        Upload Daily Work Planner PDF or Class Work Photo
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Scan your daily work planner using CamScanner and upload the PDF directly, or snap a class work
                        photo.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-extrabold text-xs bg-[#8B0000] text-white hover:opacity-90 shadow-sm transition active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 text-white" />
                        <span>Upload PDF or Photo</span>
                      </button>

                      <a
                        href="/sample-daily-work-planner.pdf"
                        download="sample-daily-work-planner.pdf"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition"
                        title="Download test sample PDF to phone to test uploading"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span>Download Sample PDF</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setIsCameraActive(!isCameraActive)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition border ${
                          isCameraActive
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-[#8B0000]" />
                        <span>{isCameraActive ? 'Close Camera' : 'Snap Class Work'}</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,image/*,.pdf"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {/* Live Camera Viewfinder with CamScanner Magic Filter toggle */}
                  {isCameraActive && (
                    <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-[#8B0000] p-1 flex flex-col items-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full max-h-64 object-cover rounded-xl" />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-1.5">
                        <Camera className="w-3 h-3 text-red-400" />
                        <span>Live Viewfinder</span>
                      </div>

                      {/* CamScanner Magic Filter Toggle */}
                      <button
                        type="button"
                        onClick={() => setEnableMagicFilter(!enableMagicFilter)}
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-md transition ${
                          enableMagicFilter
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800/80 text-slate-300 border border-slate-600'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>CamScanner Enhance: {enableMagicFilter ? 'ON' : 'OFF'}</span>
                      </button>

                      <div className="absolute bottom-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={capturePhotoFromCamera}
                          className="px-5 py-2.5 rounded-full font-black text-xs text-white bg-[#8B0000] hover:bg-[#700000] shadow-lg flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Capture Class Work Now</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Category Picker & Caption */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Doc / File Type:</label>
                      <select
                        value={attachmentCategory}
                        onChange={(e) => setAttachmentCategory(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold focus:ring-2 focus:ring-[#8B0000]"
                      >
                        <option value="planner_pdf">Daily Work Planner (CamScanner PDF)</option>
                        <option value="classwork_photo">Class Work Notes</option>
                        <option value="worksheet">Practice Worksheet</option>
                        <option value="handwritten">Handwritten Notes</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Document Caption:</label>
                      <input
                        type="text"
                        value={attachmentCaption}
                        onChange={(e) => setAttachmentCaption(e.target.value)}
                        placeholder="e.g. Daily Work Planner Grade 10 or Chapter 5 Class Work notes"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium focus:ring-2 focus:ring-[#8B0000]"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons for Instant Testing */}
                  <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-bold text-slate-500">Quick Testing Samples:</span>
                    <button
                      type="button"
                      onClick={() => addPresetAttachment('planner_pdf')}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 font-extrabold hover:bg-rose-100 flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-rose-700" />
                      <span>+ Scanned Work Planner PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addPresetAttachment('classwork_photo')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#8B0000] font-bold hover:bg-[#FAF8F2]"
                    >
                      + Class Work Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => addPresetAttachment('worksheet')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-blue-700 font-bold hover:bg-blue-50"
                    >
                      + Worksheet Sample
                    </button>
                    <a
                      href="/sample-daily-work-planner.pdf"
                      download="sample-daily-work-planner.pdf"
                      className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-extrabold hover:bg-amber-100 flex items-center gap-1"
                      title="Download sample PDF file to your phone to test the real file upload"
                    >
                      <Download className="w-3 h-3 text-amber-700" />
                      <span>Download Test PDF</span>
                    </a>
                  </div>

                  {/* Attached Files & Gallery Preview */}
                  {uploadedAttachments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <p className="font-bold text-slate-700">Attached Documents &amp; Photos ({uploadedAttachments.length}):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {uploadedAttachments.map((att) => (
                          <div
                            key={att.id}
                            className="relative rounded-xl border border-slate-200 p-2.5 bg-white shadow-2xs flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  att.isPdf ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {att.isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{att.caption}</p>
                                <p className="text-[10px] text-slate-400 truncate">{att.fileName || (att.isPdf ? 'Planner.pdf' : 'Image.jpg')}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setUploadedAttachments((prev) => prev.filter((i) => i.id !== att.id))}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
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
                      {primaryInputMode === 'photo' ? 'Optional if PDF / photo attached' : 'Required'}
                    </span>
                  </div>
                  <textarea
                    id="modal-textarea-classwork"
                    rows={primaryInputMode === 'photo' ? 2 : 3}
                    value={formClasswork}
                    onChange={(e) => setFormClasswork(e.target.value)}
                    placeholder={
                      primaryInputMode === 'photo'
                        ? 'Brief remarks (e.g. As shown in scanned work planner and class work notes)...'
                        : 'Explain classwork lecture details here...'
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-[#8B0000]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Homework Assignment (Ghar Ka Kaam)</label>
                    <span className="text-[10px] text-slate-400">
                      {primaryInputMode === 'photo' ? 'Optional if PDF / photo attached' : 'Required'}
                    </span>
                  </div>
                  <textarea
                    id="modal-textarea-homework"
                    rows={primaryInputMode === 'photo' ? 2 : 3}
                    value={formHomework}
                    onChange={(e) => setFormHomework(e.target.value)}
                    placeholder={
                      primaryInputMode === 'photo'
                        ? 'Brief homework assignment instructions or reference page numbers...'
                        : 'List homework tasks, page numbers and exercise questions...'
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
                  className="px-6 py-2.5 rounded-2xl font-bold text-white bg-[#8B0000] hover:opacity-90 transition shadow-md shadow-[#8B0000]/20 flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish to Diary Feed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Full-Screen Interactive PDF Reader Modal */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* PDF Modal Header */}
            <div className="p-4 sm:p-5 bg-[#FAF8F2] border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-sm truncate font-['Outfit',sans-serif]">
                    {activePdfModal.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activePdfModal.fileName || 'Daily_Work_Planner.pdf'} • CamScanner Scanned Work Planner
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activePdfModal.url}
                  download={activePdfModal.fileName || 'Daily_Work_Planner.pdf'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-[#8B0000]" />
                  <span>Download</span>
                </a>
                <a
                  href={activePdfModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Tab</span>
                </a>
                <button
                  onClick={() => setActivePdfModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="flex-1 bg-slate-100 p-2 min-h-[60vh] max-h-[75vh] overflow-hidden">
              <iframe
                src={activePdfModal.url}
                className="w-full h-full rounded-2xl border border-slate-300 bg-white shadow-inner"
                title={activePdfModal.title}
              />
            </div>

            {/* PDF Modal Footer */}
            <div className="p-3.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Tip: You can scroll through all pages, zoom in/out, and print this work planner.</span>
              <button
                onClick={() => setActivePdfModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Full-Resolution Class Work Photo Modal */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xs cursor-pointer"
          onClick={() => setActiveImageModal(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeImageModal.url}
              alt={activeImageModal.caption}
              className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/20"
            />
            <div className="mt-3 bg-black/70 px-4 py-2 rounded-xl text-white text-xs font-bold max-w-xl text-center">
              {activeImageModal.caption}
            </div>
          </div>
        </div>
      )}

      {/* 9. Read Receipts Verifiable Audit Modal */}
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
                      className="p-3 rounded-2xl bg-[#FAF8F2] border border-[#D4AF37]/40 flex items-center justify-between text-xs"
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
