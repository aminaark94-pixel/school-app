import React, { useState } from 'react';
import {
  Users,
  FileSpreadsheet,
  Palette,
  Database,
  Trash2,
  RotateCcw,
  Plus,
  Search,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Building2,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { CsvStudentImport } from './CsvStudentImport';
import { SchoolBrandingSettings } from './SchoolBrandingSettings';
import { SqlMigrationViewer } from './SqlMigrationViewer';
import { Student } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    students,
    fees,
    currentSchool,
    softDeleteStudent,
    restoreStudent,
    permanentDeleteStudent,
    updateFeeStatus,
  } = useSchoolData();

  const [activeTab, setActiveTab] = useState<'roster' | 'import' | 'branding' | 'sql'>('roster');
  const [showTrash, setShowTrash] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesTrash = showTrash ? s.is_deleted : !s.is_deleted;
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrash && matchesQuery;
  });

  const activeCount = students.filter((s) => !s.is_deleted).length;
  const deletedCount = students.filter((s) => s.is_deleted).length;

  return (
    <div className="space-y-6">
      {/* 1. School Administration & Governance Banner */}
      <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-[#EDE7C7] bg-[#200E01] text-[#EDE7C7]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200&auto=format&fit=crop&q=80"
            alt="School Heritage Campus Hall"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/85 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B0000]/80 border border-[#D4AF37]/60 text-[11px] font-black uppercase tracking-wider text-[#EDE7C7] font-['Cinzel',serif]">
              <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Registrar & Bursar Secretariat • Central Governance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic leading-tight">
              Administrative Command & Institutional Registry
            </h2>
            <p className="text-xs sm:text-sm text-[#EDE7C7]/80 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Manage student enrollment rosters, CSV batch admissions, campus identity branding, bursar fee locks, and institutional database governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="group relative rounded-2xl overflow-hidden border border-[#D4AF37]/40 w-28 h-20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&auto=format&fit=crop&q=80"
                alt="Collegiate Boardroom"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                <span className="text-[10px] font-bold text-[#EDE7C7] leading-tight">Registrar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Admin Navigation Tabs */}
      <div className="bg-white p-2.5 sm:p-3 rounded-[28px] shadow-sm border border-[#EDE7C7] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="tab-admin-roster"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
              activeTab === 'roster'
                ? 'bg-[#8B0000] text-[#EDE7C7] shadow-sm border border-[#D4AF37]/40 font-extrabold'
                : 'text-[#5B0202] hover:text-[#200E01] hover:bg-[#FAF8F2]'
            }`}
          >
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span>Scholar Management ({activeCount})</span>
          </button>

          <button
            id="tab-admin-import"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
              activeTab === 'import'
                ? 'bg-[#8B0000] text-[#EDE7C7] shadow-sm border border-[#D4AF37]/40 font-extrabold'
                : 'text-[#5B0202] hover:text-[#200E01] hover:bg-[#FAF8F2]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
            <span>CSV Batch Enrollment</span>
          </button>

          <button
            id="tab-admin-branding"
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
              activeTab === 'branding'
                ? 'bg-[#8B0000] text-[#EDE7C7] shadow-sm border border-[#D4AF37]/40 font-extrabold'
                : 'text-[#5B0202] hover:text-[#200E01] hover:bg-[#FAF8F2]'
            }`}
          >
            <Palette className="w-4 h-4 text-[#D4AF37]" />
            <span>Campus Crest & Branding</span>
          </button>

          <button
            id="tab-admin-sql"
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
              activeTab === 'sql'
                ? 'bg-[#8B0000] text-[#EDE7C7] shadow-sm border border-[#D4AF37]/40 font-extrabold'
                : 'text-[#5B0202] hover:text-[#200E01] hover:bg-[#FAF8F2]'
            }`}
          >
            <Database className="w-4 h-4 text-[#D4AF37]" />
            <span>Institutional Schema & Security</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: STUDENT ROSTER WITH SOFT DELETE */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-[32px] shadow-sm border border-[#EDE7C7] overflow-hidden">
          {/* Header & Filter Controls */}
          <div className="p-4 sm:p-5 border-b border-[#EDE7C7] bg-[#FAF8F2] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#5B0202]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search scholars by roll no, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#EDE7C7] rounded-xl text-xs font-medium text-[#200E01] focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
                />
              </div>

              {/* Toggle Active vs Deleted Students */}
              <button
                onClick={() => setShowTrash(!showTrash)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  showTrash
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-white text-[#5B0202] border-[#EDE7C7] hover:bg-[#FAF8F2]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5 text-[#8B0000]" />
                <span>
                  {showTrash ? `Viewing Archived (${deletedCount})` : `Archived (${deletedCount})`}
                </span>
              </button>
            </div>

            <div className="text-xs text-[#5B0202]/80 font-medium">
              Enrolled: <strong className="text-[#8B0000]">{filteredStudents.length}</strong> of {students.length} scholars
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
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
                      {showTrash
                        ? 'No archived scholars in trash.'
                        : 'No scholar records match your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const fee = fees.find((f) => f.student_id === student.id);
                    const isPaid = fee?.status === 'paid';

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-[#FAF8F2]/60 transition ${
                          student.is_deleted ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-[#8B0000]">
                          {student.roll_number}
                        </td>
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
                        </td>

                        {/* Fee Status with quick toggle for admin testing */}
                        <td className="py-3 px-4 text-center">
                          {fee ? (
                            <button
                              onClick={() =>
                                updateFeeStatus(fee.id, isPaid ? 'pending' : 'paid')
                              }
                              title="Click to toggle fee status and test conditional report card unlock"
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer hover:opacity-90 ${
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
                          ) : (
                            <span className="text-[#5B0202]/50 text-xs">No Fee Record</span>
                          )}
                        </td>

                        {/* Actions (Soft delete or Restore) */}
                        <td className="py-3 px-4 text-right">
                          {student.is_deleted ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => restoreStudent(student.id)}
                                title="Restore scholar to active roster"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold transition"
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
                                className="p-1 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => softDeleteStudent(student.id)}
                              title="Archive student safely"
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-[#EDE7C7] hover:border-rose-300 hover:bg-rose-50 text-[#5B0202] hover:text-rose-700 text-xs font-semibold transition"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Archive</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CSV IMPORT */}
      {activeTab === 'import' && <CsvStudentImport />}

      {/* TAB CONTENT: BRANDING */}
      {activeTab === 'branding' && <SchoolBrandingSettings />}

      {/* TAB CONTENT: SQL MIGRATION */}
      {activeTab === 'sql' && <SqlMigrationViewer />}
    </div>
  );
};
