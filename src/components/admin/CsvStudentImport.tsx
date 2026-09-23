import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Download, ArrowRight, Table } from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';

interface ParsedRow {
  roll_number?: string;
  name?: string;
  class_id?: string;
  section?: string;
  parent_email?: string;
  parent_name?: string;
  [key: string]: unknown;
}

export const CsvStudentImport: React.FC = () => {
  const { bulkImportStudents, currentSchool } = useSchoolData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [parseError, setParseError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<number | null>(null);
  const [unmatchedParentEmails, setUnmatchedParentEmails] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Sample CSV Download with Pakistani student profiles
  const handleDownloadSample = () => {
    const csvContent =
      'roll_number,name,class_id,section,parent_email,parent_name\n' +
      'LGS-101,Hamza Tariq,Grade 10,A,tariq.mahmood@example.com,Tariq Mahmood\n' +
      'LGS-102,Ayesha Farooq,Grade 10,A,farooq.azam@example.com,Farooq Azam\n' +
      'LGS-103,Bilal Hassan,Grade 10,B,hassan.raza@example.com,Hassan Raza\n' +
      'LGS-104,Zainab Malik,Grade 9,A,malik.kamran@example.com,Malik Kamran\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentSchool?.name || 'school'}_student_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setParseError('');
    setImportSuccess(null);

    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setParseError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }

        const valid = results.data.filter((r) => r.roll_number && r.name);
        if (valid.length === 0) {
          setParseError('No valid rows found. Check that columns include roll_number and name.');
          return;
        }

        setParsedRows(valid);
      },
      error: (error) => {
        setParseError(`Failed to read CSV: ${error.message}`);
      },
    });
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;

    const formatted = parsedRows.map((row) => ({
      roll_number: String(row.roll_number || '').trim(),
      name: String(row.name || '').trim(),
      class_id: String(row.class_id || 'Grade 10').trim(),
      section: String(row.section || 'A').toUpperCase().trim(),
      parent_email: String(row.parent_email || '').trim(),
      parent_name: String(row.parent_name || '').trim(),
    }));

    setIsImporting(true);
    try {
      const result = await bulkImportStudents(formatted);
      setImportSuccess(result.count);
      setUnmatchedParentEmails(result.unmatchedParentEmails);
      setParsedRows([]);
      setFileName('');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#EDE7C7]">
        <div>
          <h3 className="text-base font-bold text-[#200E01] font-['Cormorant_Garamond',serif] italic text-xl">
            Batch Scholar Admissions & CSV Import
          </h3>
          <p className="text-xs text-[#5B0202]/70 mt-0.5">
            Upload student rosters via CSV to enroll scholars, instantiate ledger balances, and generate terminal exam sheets.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#FAF8F2] hover:bg-[#EDE7C7] text-[#8B0000] border border-[#D4AF37]/50 transition font-['Cinzel',serif]"
        >
          <Download className="w-4 h-4 text-[#8B0000]" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#D4AF37]/50 hover:border-[#8B0000] bg-[#FAF8F2]/60 hover:bg-[#FAF8F2] rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-[#8B0000] text-[#EDE7C7] flex items-center justify-center mb-3 shadow-md border border-[#D4AF37]/40">
          <UploadCloud className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <p className="text-sm font-bold text-[#200E01] font-['Cinzel',serif]">
          {fileName ? fileName : 'Click to select or drag CSV spreadsheet here'}
        </p>
        <p className="text-xs text-[#5B0202]/70 mt-1">
          Supported headers: roll_number, name, class_id, section, parent_email, parent_name
        </p>
      </div>

      {/* Parse Error Notification */}
      {parseError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Import Success Banner */}
      {importSuccess !== null && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Successfully registered {importSuccess} scholar records into {currentSchool?.name}!</span>
          </div>
        </div>
      )}

      {/* Unmatched Parent Emails Warning */}
      {unmatchedParentEmails.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold space-y-1.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              {unmatchedParentEmails.length} student{unmatchedParentEmails.length > 1 ? 's were' : ' was'} enrolled
              without being linked to a parent — no parent account exists yet for:
            </span>
          </div>
          <div className="pl-6 font-mono text-[11px] text-amber-700 break-all">
            {unmatchedParentEmails.join(', ')}
          </div>
          <p className="pl-6 font-normal text-amber-700">
            Once that parent signs up, use "Link Parent" on the roster to connect them to their child.
          </p>
        </div>
      )}

      {/* CSV Data Preview Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-[#EDE7C7] overflow-hidden">
          <div className="p-4 bg-[#FAF8F2] border-b border-[#EDE7C7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-[#8B0000]" />
              <span className="text-xs font-bold text-[#200E01] uppercase tracking-wider font-['Cinzel',serif]">
                Previewing {parsedRows.length} Valid Scholar Entries
              </span>
            </div>

            <button
              id="confirm-import-csv-btn"
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#8B0000] hover:bg-[#700000] text-[#EDE7C7] shadow-sm transition active:scale-95 border border-[#D4AF37]/50 disabled:opacity-60"
            >
              <span>{isImporting ? 'Enrolling…' : `Confirm Enrollment to ${currentSchool?.name}`}</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F2] text-[#200E01] sticky top-0 font-['Cinzel',serif] border-b border-[#EDE7C7]">
                <tr>
                  <th className="py-2.5 px-4 font-bold">#</th>
                  <th className="py-2.5 px-4 font-bold">Roll No</th>
                  <th className="py-2.5 px-4 font-bold">Scholar Name</th>
                  <th className="py-2.5 px-4 font-bold">Class & Sec</th>
                  <th className="py-2.5 px-4 font-bold">Parent / Guardian</th>
                  <th className="py-2.5 px-4 font-bold">Parent Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE7C7]">
                {parsedRows.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAF8F2]/60 transition">
                    <td className="py-2.5 px-4 text-[#5B0202]/50 font-mono">{i + 1}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#8B0000]">{row.roll_number}</td>
                    <td className="py-2.5 px-4 font-bold text-[#200E01]">{row.name}</td>
                    <td className="py-2.5 px-4 text-[#5B0202]">
                      {row.class_id || 'Grade 10'} – {row.section || 'A'}
                    </td>
                    <td className="py-2.5 px-4 text-[#200E01]/80">{row.parent_name || 'Guardian'}</td>
                    <td className="py-2.5 px-4 text-[#5B0202]/60 font-mono text-[11px]">{row.parent_email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
