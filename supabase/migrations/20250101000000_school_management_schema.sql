-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);

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

CREATE INDEX IF NOT EXISTS idx_fees_student ON public.fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON public.fees(status);

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

CREATE INDEX IF NOT EXISTS idx_results_student_term ON public.results(student_id, term);

-- ==============================================================================
-- HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Returns current user's school_id
CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Returns current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Auto-update updated_at on fees table
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_fees_updated_at ON public.fees;
CREATE TRIGGER set_fees_updated_at
BEFORE UPDATE ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-insert public.users record when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_school_id UUID;
  v_role TEXT;
  v_full_name TEXT;
BEGIN
  v_school_id := (NEW.raw_user_meta_data->>'school_id')::UUID;
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'teacher');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  IF v_school_id IS NOT NULL THEN
    INSERT INTO public.users (id, school_id, full_name, role, email)
    VALUES (NEW.id, v_school_id, v_full_name, v_role, NEW.email)
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

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
-- Anyone authenticated can view their own school
CREATE POLICY "Users can view own school"
  ON public.schools FOR SELECT
  USING (id = public.get_current_user_school_id());

-- Only admins can update their school branding
CREATE POLICY "Admins can update own school"
  ON public.schools FOR UPDATE
  USING (id = public.get_current_user_school_id() AND public.get_current_user_role() = 'admin');

-- 2. USERS POLICIES
-- Users can view fellow users in their school
CREATE POLICY "Users can view members in their school"
  ON public.users FOR SELECT
  USING (school_id = public.get_current_user_school_id());

-- Admins can insert/update/delete users in their school
CREATE POLICY "Admins can manage users in their school"
  ON public.users FOR ALL
  USING (school_id = public.get_current_user_school_id() AND public.get_current_user_role() = 'admin');

-- 3. STUDENTS POLICIES
-- Teachers and Admins can view all non-deleted students (or all if admin)
CREATE POLICY "Staff can view students in their school"
  ON public.students FOR SELECT
  USING (
    school_id = public.get_current_user_school_id()
    AND (
      public.get_current_user_role() IN ('admin', 'teacher')
      OR (public.get_current_user_role() = 'parent' AND parent_id = auth.uid())
    )
  );

-- Admins can insert/update/soft-delete students
CREATE POLICY "Admins can manage students"
  ON public.students FOR ALL
  USING (school_id = public.get_current_user_school_id() AND public.get_current_user_role() = 'admin');

-- 4. ATTENDANCE POLICIES
-- Staff can view attendance for their school; parents can view for their children
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

-- Teachers and Admins can insert/update attendance
CREATE POLICY "Teachers and Admins can mark attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'teacher')
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_current_user_school_id()
    )
  );

CREATE POLICY "Teachers and Admins can update attendance"
  ON public.attendance FOR UPDATE
  USING (
    public.get_current_user_role() IN ('admin', 'teacher')
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_current_user_school_id()
    )
  );

-- 5. FEES POLICIES
-- Staff can view all fees; parents can only view their student's fees
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

-- Only Admins can manage fee records
CREATE POLICY "Admins can manage fees"
  ON public.fees FOR ALL
  USING (
    public.get_current_user_role() = 'admin'
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_current_user_school_id()
    )
  );

-- 6. RESULTS POLICIES
-- Staff can view all results; parents can view results of their children
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

-- Teachers and Admins can insert/update exam results
CREATE POLICY "Teachers and Admins can manage results"
  ON public.results FOR ALL
  USING (
    public.get_current_user_role() IN ('admin', 'teacher')
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_current_user_school_id()
    )
  );

-- ==============================================================================
-- OPTIONAL SEED DATA TEMPLATE
-- ==============================================================================
-- INSERT INTO public.schools (id, name, primary_color, secondary_color)
-- VALUES ('a0000000-0000-0000-0000-000000000001', 'Apex International Academy', '#1e3a8a', '#3b82f6')
-- ON CONFLICT (id) DO NOTHING;
