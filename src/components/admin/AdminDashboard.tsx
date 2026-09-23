import React, { useState } from 'react';
import {
  Users,
  FileSpreadsheet,
  Palette,
  Database,
  Trash2,
  RotateCcw,
  Search,
  CheckCircle2,
  Lock,
  Building2,
  Link2,
  AlertTriangle,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { CsvStudentImport } from './CsvStudentImport';
import { SchoolBrandingSettings } from './SchoolBrandingSettings';
import { SqlMigrationViewer } from './SqlMigrationViewer';
import { Student } from '../../types';

type AdminTab = 'roster' | 'import' | 'branding' | 'sql';

const TABS = [
  { id: 'roster', domId: 'tab-admin-roster', Icon: Users, full: 'Scholar Management', short: 'Roster' },
  { id: 'import', domId: 'tab-admin-import', Icon: FileSpreadsheet, full: 'CSV Batch Enrollment', short: 'Import' },
  { id: 'branding', domId: 'tab-admin-branding', Icon: Palette, full: 'Campus Crest & Branding', short: 'Branding' },
  { id: 'sql', domId: 'tab-admin-sql', Icon: Database, full: 'Institutional Schema & Security', short: 'Schema' },
] as const;

export const AdminDashboard: React.FC = () => {
  const {
    students,
    fees,
    softDeleteStudent,
    restoreStudent,
    permanentDeleteStudent,
    updateFeeStatus,
    linkParentToStudent,
  } = useSchoolData();

  const [activeTab, setActiveTab] = useState<AdminTab>('roster');
  const [showTrash, setShowTrash] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkingStudentId, setLinkingStudentId] = useState<string | null>(null);
  const [linkEmailInput, setLinkEmailInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkParent = async (studentId: string) => {
    setLinkError(null);
    setIsLinking(true);
    const result = await linkParentToStudent(studentId, linkEmailInput);
    setIsLinking(false);
    if (result.success) {
      setLinkingStudentId(null);
      setLinkEmailInput('');
    } else {
      setLinkError(result.error || 'Could not link parent.');
    }
  };

  // Shared "Link Parent" control shown when a student has no parent_id yet -
  // this is what makes the student actually visible on that parent's login.
  const renderLinkParent = (student: Student) => {
    if (student.parent_id) return null;
    const isOpen = linkingStudentId === student.id;
    if (!isOpen) {
      return (
        <button
          onClick={() => {
            setLinkingStudentId(student.id);
            setLinkEmailInput(student.parent_email || '');
            setLinkError(null);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8B0000] hover:underline"
        >
          <Link2 className="w-3 h-3" />
          <span>No parent linked — Link Parent</span>
        </button>
      );
    }
    return (
      <div className="mt-1.5 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <input
            type="email"
            autoFocus
            placeholder="parent@example.com"
            value={linkEmailInput}
            onChange={(e) => setLinkEmailInput(e.target.value)}
            className="min-w-0 flex-1 px-2 py-1.5 text-[11px] border border-[#EDE7C7] rounded-lg focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
          />
          <button
            onClick={() => handleLinkParent(student.id)}
            disabled={isLinking}
            className="shrink-0 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-[#8B0000] text-[#EDE7C7] disabled:opacity-60"
          >
            {isLinking ? 'Linking…' : 'Link'}
          </button>
          <button
            onClick={() => {
              setLinkingStudentId(null);
              setLinkError(null);
            }}
            className="shrink-0 px-2 py-1.5 text-[11px] font-semibold text-[#5B0202]"
          >
            Cancel
          </button>
        </div>
        {linkError && (
          <div className="flex items-start gap-1 text-[11px] text-rose-700">
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{linkError}</span>
          </div>
        )}
      </div>
    );
  };

  const filteredStudents = students.filter((s) => {
    const matchesTrash = showTrash ? s.is_deleted : !s.is_deleted;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      s.name.toLowerCase().includes(q) ||
      s.roll_number.toLowerCase().includes(q) ||
      s.class_id.toLowerCase().includes(q);
    return matchesTrash && matchesQuery;
  });

  const activeCount = students.filter((s) => !s.is_deleted).length;
  const deletedCount = students.filter((s) => s.is_deleted).length;

  const emptyMessage = showTrash
    ? 'No archived scholars in trash.'
    : 'No scholar records match your search criteria.';

  // Fee toggle (shared by the desktop table and the phone cards)
  const renderFee = (studentId: string, block = false) => {
    const fee = fees.find((f) => f.student_id === studentId);
    if (!fee) return <span className="text-[#5B0202]/50 text-xs">No Fee Record</span>;
    const isPaid = fee.status === 'paid';
    return (
      <button
        onClick={() => updateFeeStatus(fee.id, isPaid ? 'pending' : 'paid')}
        title="Click to toggle fee status and test conditional report card unlock"
        className={`inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-bold border transition cursor-pointer hover:opacity-90 active:scale-95 ${
          block ? 'flex-1 min-h-[44px] px-3' : 'px-3 py-1'
        } ${
          isPaid
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-rose-50 text-rose-800 border-rose-300'
        }`}
      >
        {isPaid ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Paid (Rs. {(fee.amount * 280).toLocaleString()})</span>
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>Due: Rs. {(fee.amount * 280).toLocaleString()}</span>
          </>
        )}
      </button>
    );
  };

  // Archive / restore / delete (shared). `touch` = big tap targets for phones.
  const renderActions = (student: Student, touch = false) => {
    const size = touch ? 'min-h-[44px] px-3.5' : 'px-2.5 py-1';
    if (student.is_deleted) {
      return (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => restoreStudent(student.id)}
            title="Restore scholar to active roster"
            className={`flex items-center gap-1 ${size} rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold transition`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore</span>
          </button>
          <button
            onClick={() => {
              if (confirm(`Permanently delete ${student.name}? This cannot be undone.`)) {
                permanentDeleteStudent(student.id);
              }
            }}
            title="Permanent Delete"
            aria-label={`Permanently delete ${student.name}`}
            className={`rounded-xl text-rose-600 hover:bg-rose-50 transition ${
              touch ? 'min-h-[44px] min-w-[44px] flex items-center justify-center' : 'p-1'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => softDeleteStudent(student.id)}
        title="Archive student safely"
        className={`flex items-center justify-center gap-1 ${size} rounded-xl border border-[#EDE7C7] hover:border-rose-300 hover:bg-rose-50 text-[#5B0202] hover:text-rose-700 text-xs font-semibold transition`}
      >
        <Trash2 className="w-3 h-3" />
        <span>Archive</span>
      </button>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Governance banner (photo only from md up) */}
      <div className="relative rounded-3xl sm:rounded-[32px] overflow-hidden shadow-lg border border-[#EDE7C7] bg-[#200E01] text-[#EDE7C7]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200&auto=format&fit=crop&q=80"
            alt="School Heritage Campus Hall"
            loading="lazy"
            className="hidden md:block w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/85 to-transparent" />
        </div>

        <div className="relative p-5 sm:p-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
              <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Registrar &amp; Bursar Secretariat</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
              Administrative Command &amp; Institutional Registry
            </h2>
            <p className="hidden sm:block text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Manage student enrollment rosters, CSV batch admissions, campus identity branding, bursar fee locks, and institutional database governance.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 w-28 h-20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&auto=format&fit=crop&q=80"
                alt="Collegiate Boardroom"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                <span className="text-[10px] font-bold text-[#EDE7C7] leading-tight">Registrar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tabs: one horizontally scrollable strip with short labels on phones */}
      <div className="bg-white p-2 sm:p-3 rounded-3xl shadow-sm border border-[#EDE7C7] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {TABS.map(({ id, domId, Icon, full, short }) => (
            <button
              key={id}
              id={domId}
              onClick={() => setActiveTab(id)}
              aria-pressed={activeTab === id}
              className={`flex items-center gap-2 min-h-[44px] px-4 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === id
                  ? 'bg-[#8B0000] text-[#EDE7C7] shadow-sm border border-[#D4AF37]/40 font-extrabold'
                  : 'text-[#5B0202] hover:text-[#200E01] hover:bg-[#FAF8F2]'
              }`}
            >
              <Icon className="w-4 h-4 text-[#D4AF37]" />
              <span className="sm:hidden">
                {short}
                {id === 'roster' ? ` (${activeCount})` : ''}
              </span>
              <span className="hidden sm:inline">
                {full}
                {id === 'roster' ? ` (${activeCount})` : ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB: ROSTER */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-3xl sm:rounded-[32px] shadow-sm border border-[#EDE7C7] overflow-hidden">
          {/* Filters */}
          <div className="p-3 sm:p-5 border-b border-[#EDE7C7] bg-[#FAF8F2] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <Search className="w-4 h-4 text-[#5B0202]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  placeholder="Search by roll no, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-white border border-[#EDE7C7] rounded-xl text-xs font-medium text-[#200E01] focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setShowTrash(!showTrash)}
                className={`shrink-0 flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl text-xs font-bold border transition ${
                  showTrash
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-white text-[#5B0202] border-[#EDE7C7] hover:bg-[#FAF8F2]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5 text-[#8B0000]" />
                <span>{showTrash ? `Archived (${deletedCount})` : `Archived (${deletedCount})`}</span>
              </button>
            </div>

            <div className="text-xs text-[#5B0202]/80 font-medium">
              Showing <strong className="text-[#8B0000]">{filteredStudents.length}</strong> of {students.length} scholars
              {showTrash ? ' (archived view)' : ''}
            </div>
          </div>

          {/* Phones: one card per scholar, everything reachable without sideways scrolling */}
          <div className="md:hidden divide-y divide-[#EDE7C7]">
            {filteredStudents.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-[#5B0202]/60">{emptyMessage}</div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 space-y-3 ${student.is_deleted ? 'bg-rose-50/30' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#200E01] break-words">{student.name}</div>
                      <div className="text-[11px] text-[#5B0202] mt-0.5">
                        <span className="font-mono font-bold text-[#8B0000]">{student.roll_number}</span>
                        {' · '}
                        {student.class_id} – Sec {student.section}
                      </div>
                      {(student.parent_name || student.parent_email) && (
                        <div className="text-[11px] text-[#5B0202]/70 mt-0.5 break-all">
                          {student.parent_name || 'Guardian'}
                          {student.parent_email ? ` · ${student.parent_email}` : ''}
                        </div>
                      )}
                      {renderLinkParent(student)}
                    </div>
                    {student.is_deleted && (
                      <span className="shrink-0 text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                        Archived
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {renderFee(student.id, true)}
                    {renderActions(student, true)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* md+: full table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F2] text-[#200E01] border-b border-[#EDE7C7] uppercase font-bold text-[11px] font-['Cinzel',serif]">
                <tr>
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Scholar Name</th>
                  <th className="py-3.5 px-4">Academic Stream</th>
                  <th className="py-3.5 px-4">Guardian / Parent Contact</th>
                  <th className="py-3.5 px-4 text-center">Bursar Fee Clearance</th>
                  <th className="py-3.5 px-4 text-right">Registry Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE7C7]">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#5B0202]/60">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className={`hover:bg-[#FAF8F2]/60 transition ${
                        student.is_deleted ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#8B0000]">{student.roll_number}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#200E01]">{student.name}</div>
                        {student.is_deleted && (
                          <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                            (Archived)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#5B0202]">
                        {student.class_id} – Sec {student.section}
                      </td>
                      <td className="py-3 px-4 text-[#200E01]/80">
                        <div className="font-medium">{student.parent_name || 'Guardian'}</div>
                        <div className="text-[11px] text-[#5B0202]/60 font-mono">
                          {student.parent_email || '—'}
                        </div>
                        {renderLinkParent(student)}
                      </td>
                      <td className="py-3 px-4 text-center">{renderFee(student.id)}</td>
                      <td className="py-3 px-4 text-right">{renderActions(student)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'import' && <CsvStudentImport />}
      {activeTab === 'branding' && <SchoolBrandingSettings />}
      {activeTab === 'sql' && <SqlMigrationViewer />}
    </div>
  );
};
