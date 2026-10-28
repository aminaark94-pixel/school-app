import React, { useRef, useState } from 'react';
import {
  Database,
  Upload,
  Download,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileJson,
  RefreshCw,
  School as SchoolIcon,
  BookOpen,
  Users,
  CreditCard,
  Award,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { FullSchoolDataset } from '../../lib/storage';

export const DemoDataManager: React.FC = () => {
  const {
    students,
    attendance,
    fees,
    results,
    diary,
    notices,
    datesheets,
    queries,
    alerts,
    importFullDataset,
    exportFullDataset,
    clearAllDemoData,
    resetToDefaults,
  } = useSchoolData();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Upload & Import Custom Demo JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as Partial<FullSchoolDataset>;

        importFullDataset(parsed);

        const count = parsed.students?.length ?? 0;
        const diaryCount = parsed.diary?.length ?? 0;
        setSuccessMsg(
          `Demo data package successfully imported! (${count} students, ${diaryCount} diary entries, ${parsed.fees?.length ?? 0} fee challans loaded).`
        );
      } catch (err) {
        console.error('Failed to parse demo json:', err);
        setErrorMsg('Invalid JSON file format. Please upload a valid school-app demo data JSON file.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading uploaded file.');
      setIsProcessing(false);
    };
    reader.readAsText(file);

    if (e.target) e.target.value = '';
  };

  // 2. Load 1-Click Built-in Realistic Demo Data
  const handleLoadRealisticBuiltin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      const res = await fetch('/demo-school-data.json');
      if (res.ok) {
        const data = await res.json();
        importFullDataset(data);
        setSuccessMsg(
          `Official realistic demonstration dataset loaded! (${data.students?.length || 0} scholars, Cambridge O-Levels, CamScanner planners & PKR fee vouchers).`
        );
      } else {
        // Fallback to defaults
        resetToDefaults();
        setSuccessMsg('Default demonstration data loaded successfully.');
      }
    } catch {
      resetToDefaults();
      setSuccessMsg('Default demonstration data loaded successfully.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Export Live App Data as JSON
  const handleExportLiveJson = () => {
    try {
      const liveData = exportFullDataset();
      const blob = new Blob([JSON.stringify(liveData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `school-app-demo-dataset-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setErrorMsg('Failed to export current dataset.');
    }
  };

  // 4. Purge / Wipe All Demo Data
  const handlePurgeDemoData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to remove all demonstration data? This will clear students, attendance, diary entries, fees, and results to leave the app completely clean for real school onboarding.'
    );
    if (!confirmed) return;

    clearAllDemoData(true);
    setSuccessMsg('All demo data has been purged. The school is now in a clean, blank production state.');
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#200E01] via-[#5B0202] to-[#8B0000] text-[#EDE7C7] p-6 sm:p-7 rounded-3xl border border-[#D4AF37]/40 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 border border-[#D4AF37]/50 text-[10px] font-black uppercase tracking-wider text-[#D4AF37] font-['Cinzel',serif]">
              <Database className="w-3.5 h-3.5" />
              <span>Owner &amp; Admin Demonstration Center</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Cormorant_Garamond',serif] italic text-[#EDE7C7]">
              Demo Data Manager: Upload, Test &amp; Purge
            </h3>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Upload realistic mock data to show clients and parents how the digital diary, CamScanner work planner,
              attendance, fee-lock, and report cards work in real-time — and purge it with 1 click when onboarding begins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-[#D4AF37]/40 text-xs font-bold text-[#EDE7C7]">
              {students.length} Active Scholars
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Data Footprint Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#EDE7C7] shadow-2xs text-center">
          <Users className="w-5 h-5 text-[#8B0000] mx-auto mb-1" />
          <p className="text-[10px] uppercase font-bold text-slate-500">Students</p>
          <p className="text-lg font-black text-slate-900">{students.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#EDE7C7] shadow-2xs text-center">
          <BookOpen className="w-5 h-5 text-[#8B0000] mx-auto mb-1" />
          <p className="text-[10px] uppercase font-bold text-slate-500">Diary Lessons</p>
          <p className="text-lg font-black text-slate-900">{diary.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#EDE7C7] shadow-2xs text-center">
          <CreditCard className="w-5 h-5 text-[#8B0000] mx-auto mb-1" />
          <p className="text-[10px] uppercase font-bold text-slate-500">Fee Vouchers</p>
          <p className="text-lg font-black text-slate-900">{fees.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#EDE7C7] shadow-2xs text-center">
          <Award className="w-5 h-5 text-[#8B0000] mx-auto mb-1" />
          <p className="text-[10px] uppercase font-bold text-slate-500">Result Cards</p>
          <p className="text-lg font-black text-slate-900">{results.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#EDE7C7] shadow-2xs text-center">
          <CheckCircle2 className="w-5 h-5 text-[#8B0000] mx-auto mb-1" />
          <p className="text-[10px] uppercase font-bold text-slate-500">Attendance</p>
          <p className="text-lg font-black text-slate-900">{attendance.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#EDE7C7] shadow-2xs text-center">
          <FileJson className="w-5 h-5 text-[#8B0000] mx-auto mb-1" />
          <p className="text-[10px] uppercase font-bold text-slate-500">Datesheets &amp; Alerts</p>
          <p className="text-lg font-black text-slate-900">{datesheets.length + alerts.length}</p>
        </div>
      </div>

      {/* Main Operations Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Import / Upload Demo Data */}
        <div className="bg-white p-6 rounded-3xl border border-[#EDE7C7] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base font-['Outfit',sans-serif]">
              <Upload className="w-5 h-5 text-[#8B0000]" />
              <h4>Upload Demo Data File (.json)</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload any customized or exported JSON dataset to instantly stage student rosters, Pakistani Cambridge &amp;
              Matric syllabi, fee challans, and diary logs.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#8B0000] hover:opacity-90 text-white font-extrabold text-xs shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Choose &amp; Upload Demo JSON File</span>
            </button>

            <button
              onClick={handleLoadRealisticBuiltin}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#FAF8F2] hover:bg-[#F0E8D0] text-[#8B0000] font-extrabold text-xs border border-[#D4AF37]/50 shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>1-Click Load Realistic Demonstration Data</span>
            </button>
          </div>
        </div>

        {/* Card 2: Download Package & Purge Slate */}
        <div className="bg-white p-6 rounded-3xl border border-[#EDE7C7] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base font-['Outfit',sans-serif]">
              <Download className="w-5 h-5 text-amber-700" />
              <h4>Download Sample Data or Purge Slate</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download the official realistic Pakistani school dataset to review or edit offline, or completely remove all
              test records before onboarding real students.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/demo-school-data.json"
                download="demo-school-data.json"
                className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs shadow-2xs transition active:scale-95 text-center"
              >
                <Download className="w-3.5 h-3.5 text-amber-800" />
                <span>Sample .json</span>
              </a>

              <button
                onClick={handleExportLiveJson}
                className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-slate-700" />
                <span>Export Current</span>
              </button>
            </div>

            <button
              onClick={handlePurgeDemoData}
              disabled={students.length === 0 && diary.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold text-xs border border-rose-300 shadow-xs transition active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Purge &amp; Remove All Demo Data (Clean Slate)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
