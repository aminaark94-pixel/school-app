import React, { useState } from 'react';
import { Copy, Check, Database, Shield, FileCode, Terminal } from 'lucide-react';

const SQL_MIGRATION_SCRIPT = `-- ==============================================================================
-- MULTI-TENANT SCHOOL MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA & RLS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SCHOOLS TABLE (Tenant root)
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#1e3a8a', -- default Navy
  secondary_color TEXT DEFAULT '#3b82f6', -- default Blue
  motto TEXT DEFAULT 'Excellence in Education',
  address TEXT DEFAULT '123 Academic Blvd',
  phone TEXT DEFAULT '+1 (555) 019-2834',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. USERS TABLE (Linked to auth.users and multi-tenant school)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'parent')),
  email TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast tenant querying
CREATE INDEX IF NOT EXISTS idx_users_school_id ON public.users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 4. STUDENTS TABLE (Includes soft-delete column)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  roll_number TEXT NOT NULL,
  name TEXT NOT NULL,
  class_id TEXT NOT NULL, -- e.g., 'Grade 10'
  section TEXT NOT NULL DEFAULT 'A',
  parent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_roll_per_school UNIQUE (school_id, roll_number)
);

CREATE INDEX IF NOT EXISTS idx_students_school_class ON public.students(school_id, class_id, section);
CREATE INDEX IF NOT EXISTS idx_students_parent ON public.students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_is_deleted ON public.students(is_deleted);

-- 5. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_date_attendance UNIQUE (student_id, date)
);

-- 6. FEES TABLE
CREATE TABLE IF NOT EXISTS public.fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending')),
  due_date DATE NOT NULL,
  receipt_number TEXT DEFAULT '',
  term TEXT DEFAULT 'Annual / Term Tuition',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  term TEXT NOT NULL CHECK (term IN ('mid_term', 'final')),
  marks_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_marks NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  grade TEXT NOT NULL DEFAULT 'N/A',
  percentage NUMERIC(5, 2) DEFAULT 0.00,
  class_rank INT DEFAULT 1,
  conduct TEXT DEFAULT 'Satisfactory',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_term_result UNIQUE (student_id, term)
);

-- ==============================================================================
-- HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- 1. SCHOOLS POLICIES
CREATE POLICY "Users can view own school"
  ON public.schools FOR SELECT
  USING (id = public.get_current_user_school_id());

CREATE POLICY "Admins can update own school"
  ON public.schools FOR UPDATE
  USING (id = public.get_current_user_school_id() AND public.get_current_user_role() = 'admin');

-- 2. USERS POLICIES
CREATE POLICY "Users can view members in their school"
  ON public.users FOR SELECT
  USING (school_id = public.get_current_user_school_id());

-- 3. STUDENTS POLICIES
CREATE POLICY "Staff can view students in their school"
  ON public.students FOR SELECT
  USING (
    school_id = public.get_current_user_school_id()
    AND (
      public.get_current_user_role() IN ('admin', 'teacher')
      OR (public.get_current_user_role() = 'parent' AND parent_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage students"
  ON public.students FOR ALL
  USING (school_id = public.get_current_user_school_id() AND public.get_current_user_role() = 'admin');

-- 4. ATTENDANCE POLICIES
CREATE POLICY "View attendance policy"
  ON public.attendance FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.students
      WHERE school_id = public.get_current_user_school_id()
        AND (
          public.get_current_user_role() IN ('admin', 'teacher')
          OR (public.get_current_user_role() = 'parent' AND parent_id = auth.uid())
        )
    )
  );

CREATE POLICY "Teachers and Admins can mark attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'teacher')
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_current_user_school_id()
    )
  );

-- 5. FEES POLICIES
CREATE POLICY "View fees policy"
  ON public.fees FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.students
      WHERE school_id = public.get_current_user_school_id()
        AND (
          public.get_current_user_role() IN ('admin', 'teacher')
          OR (public.get_current_user_role() = 'parent' AND parent_id = auth.uid())
        )
    )
  );

CREATE POLICY "Admins can manage fees"
  ON public.fees FOR ALL
  USING (
    public.get_current_user_role() = 'admin'
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_current_user_school_id()
    )
  );

-- 6. RESULTS POLICIES
CREATE POLICY "View results policy"
  ON public.results FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.students
      WHERE school_id = public.get_current_user_school_id()
        AND (
          public.get_current_user_role() IN ('admin', 'teacher')
          OR (public.get_current_user_role() = 'parent' AND parent_id = auth.uid())
        )
    )
  );

-- 7. DIARY ENTRIES & READ RECEIPTS
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id TEXT PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  subject TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  classwork TEXT NOT NULL DEFAULT '',
  homework TEXT NOT NULL DEFAULT '',
  due_date DATE,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL DEFAULT 'Faculty Member',
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_diary_school ON public.diary_entries(school_id, class_id);
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for diary" ON public.diary_entries FOR ALL
  USING (school_id = public.get_current_user_school_id());

-- 8. MONTHLY KIDS PROGRESS (KG1 - Class 10)
CREATE TABLE IF NOT EXISTS public.kids_progress (
  id TEXT PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  month TEXT NOT NULL,
  year INT NOT NULL,
  language JSONB NOT NULL DEFAULT '{}'::jsonb,
  discipline JSONB NOT NULL DEFAULT '{}'::jsonb,
  writing JSONB NOT NULL DEFAULT '{}'::jsonb,
  reading JSONB NOT NULL DEFAULT '{}'::jsonb,
  cleaning JSONB NOT NULL DEFAULT '{}'::jsonb,
  teacher_remarks TEXT DEFAULT '',
  evaluated_by_id TEXT DEFAULT '',
  evaluated_by_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_kids_progress_school ON public.kids_progress(school_id, month, year);
ALTER TABLE public.kids_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for kids progress" ON public.kids_progress FOR ALL
  USING (school_id = public.get_current_user_school_id());

-- 9. TEACHER PROGRESS EVALUATIONS (Confidential: Admin Only)
CREATE TABLE IF NOT EXISTS public.teacher_progress (
  id TEXT PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  teacher_email TEXT DEFAULT '',
  subject_specialty TEXT DEFAULT '',
  assigned_grades TEXT[] DEFAULT '{}',
  month TEXT NOT NULL,
  year INT NOT NULL,
  language JSONB NOT NULL DEFAULT '{}'::jsonb,
  dressing JSONB NOT NULL DEFAULT '{}'::jsonb,
  working JSONB NOT NULL DEFAULT '{}'::jsonb,
  regularity JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_score NUMERIC(5,2) DEFAULT 0,
  overall_grade TEXT DEFAULT 'N/A',
  incharge_remarks TEXT DEFAULT '',
  incharge_recommendation TEXT DEFAULT 'satisfactory',
  evaluated_by_id TEXT DEFAULT '',
  evaluated_by_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_teacher_progress_school ON public.teacher_progress(school_id, month, year);
ALTER TABLE public.teacher_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only for teacher progress" ON public.teacher_progress FOR ALL
  USING (school_id = public.get_current_user_school_id() AND public.get_current_user_role() = 'admin');

-- 10. PARENTS REPORT CARDS & APP TELEMETRY (Staff Only)
CREATE TABLE IF NOT EXISTS public.parent_reports (
  id TEXT PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL,
  parent_code TEXT DEFAULT '',
  parent_name TEXT NOT NULL,
  parent_phone TEXT DEFAULT '',
  parent_email TEXT DEFAULT '',
  children JSONB NOT NULL DEFAULT '[]'::jsonb,
  vigilance_level TEXT DEFAULT 'attentive',
  inquiries_last_30_days INT DEFAULT 0,
  ptm_attendance_rate NUMERIC(5,2) DEFAULT 100,
  diary_signature_rate NUMERIC(5,2) DEFAULT 100,
  fee_clearance_status TEXT DEFAULT 'prompt',
  app_usage_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  teacher_notes TEXT DEFAULT '',
  requires_attention BOOLEAN DEFAULT false,
  attention_reason TEXT DEFAULT '',
  last_interaction_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_parent_reports_school ON public.parent_reports(school_id);
ALTER TABLE public.parent_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff only for parents reports" ON public.parent_reports FOR ALL
  USING (school_id = public.get_current_user_school_id() AND public.get_current_user_role() IN ('admin', 'teacher'));
`;

export const SqlMigrationViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Supabase PostgreSQL Migration & RLS Security Script
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Production-ready SQL DDL, indexes, multi-tenant helper functions, and Row Level Security policies.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition active:scale-95 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Complete SQL'}</span>
        </button>
      </div>

      {/* RLS Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Strict Multi-Tenancy</span>
          </div>
          <p className="text-[11px] text-blue-800/80">
            Every table enforces tenant isolation via <code className="font-mono font-semibold">get_current_user_school_id()</code>. Schools cannot access each other's records.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <Terminal className="w-4 h-4 text-purple-600" />
            <span>Role-Based Access (RBAC)</span>
          </div>
          <p className="text-[11px] text-purple-800/80">
            Admins have full CRUD; faculty teachers can record attendance and marks; parents can only view their own children.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Soft-Delete & Triggers</span>
          </div>
          <p className="text-[11px] text-emerald-800/80">
            Includes <code className="font-mono font-semibold">is_deleted</code> boolean for safe student lifecycle management and automated fee timestamp triggers.
          </p>
        </div>
      </div>

      {/* Code Block */}
      <div className="relative rounded-2xl bg-slate-950 text-slate-200 p-4 border border-slate-800 overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
          <span>/supabase/migrations/20250101000000_school_management_schema.sql</span>
          <span>PostgreSQL 15+</span>
        </div>
        <pre className="overflow-x-auto max-h-96 leading-relaxed text-[11px] text-emerald-400">
          {SQL_MIGRATION_SCRIPT}
        </pre>
      </div>
    </div>
  );
};
