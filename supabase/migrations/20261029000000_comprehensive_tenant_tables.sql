-- ==============================================================================
-- COMPREHENSIVE MULTI-TENANT TABLES & RLS POLICIES
-- Features: Diary, Notices, Communication Tickets, Absence Alerts, Datesheets,
-- Kids Progress, Teacher Progress, and Parents Report Cards
-- ==============================================================================

-- 1. DIARY ENTRIES
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

CREATE INDEX IF NOT EXISTS idx_diary_school_class ON public.diary_entries(school_id, class_id, section, date);

-- DIARY READS
CREATE TABLE IF NOT EXISTS public.diary_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diary_id TEXT NOT NULL REFERENCES public.diary_entries(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL,
  parent_name TEXT NOT NULL DEFAULT 'Guardian',
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_diary_parent_student UNIQUE (diary_id, parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_diary_reads_school ON public.diary_reads(school_id);

-- 2. NOTICES / CIRCULARS
CREATE TABLE IF NOT EXISTS public.notices (
  id TEXT PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_audience TEXT NOT NULL DEFAULT 'all',
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'School Management',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notices_school ON public.notices(school_id, date);

-- 3. COMMUNICATION QUERIES / TICKETS
CREATE TABLE IF NOT EXISTS public.communication_queries (
  id TEXT PRIMARY KEY,
  ticket_number TEXT NOT NULL DEFAULT '',
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT DEFAULT '',
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to_id TEXT,
  assigned_to_name TEXT,
  assigned_to_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_comm_queries_school ON public.communication_queries(school_id, status);

CREATE TABLE IF NOT EXISTS public.communication_messages (
  id TEXT PRIMARY KEY,
  query_id TEXT NOT NULL REFERENCES public.communication_queries(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_comm_msgs_query ON public.communication_messages(query_id);

-- 4. ABSENCE ALERTS
CREATE TABLE IF NOT EXISTS public.absence_alerts (
  id TEXT PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  class_id TEXT NOT NULL,
  section TEXT NOT NULL,
  date DATE NOT NULL,
  parent_id TEXT,
  parent_name TEXT NOT NULL,
  parent_email TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  acknowledged_at TIMESTAMPTZ,
  parent_reason TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'acknowledged', 'excused', 'unexcused'))
);

CREATE INDEX IF NOT EXISTS idx_absence_alerts_school ON public.absence_alerts(school_id, date);

-- 5. DATESHEETS
CREATE TABLE IF NOT EXISTS public.datesheets (
  id TEXT PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'mid_term',
  class_id TEXT NOT NULL,
  schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT DEFAULT '',
  published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_datesheets_school ON public.datesheets(school_id, class_id);

-- 6. MONTHLY KIDS PROGRESS (KG to Class 10)
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

CREATE INDEX IF NOT EXISTS idx_kids_progress_school ON public.kids_progress(school_id, class_id, month, year);

-- 7. TEACHER PROGRESS & CONFIDENTIAL APPRAISALS
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

-- 8. PARENTS REPORT CARDS & TELEMETRY
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
CREATE INDEX IF NOT EXISTS idx_parent_reports_parent ON public.parent_reports(parent_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) FOR ALL NEW TABLES
-- ==============================================================================

ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absence_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_reports ENABLE ROW LEVEL SECURITY;

-- Diary Entries RLS
CREATE POLICY "Tenant isolation for diary"
  ON public.diary_entries FOR ALL
  USING (school_id = public.get_current_user_school_id());

-- Diary Reads RLS
CREATE POLICY "Tenant isolation for diary reads"
  ON public.diary_reads FOR ALL
  USING (school_id = public.get_current_user_school_id());

-- Notices RLS
CREATE POLICY "Tenant isolation for notices"
  ON public.notices FOR ALL
  USING (school_id = public.get_current_user_school_id());

-- Communication Queries RLS
CREATE POLICY "Tenant isolation for queries"
  ON public.communication_queries FOR ALL
  USING (school_id = public.get_current_user_school_id());

CREATE POLICY "Tenant isolation for messages"
  ON public.communication_messages FOR ALL
  USING (school_id = public.get_current_user_school_id());

-- Absence Alerts RLS
CREATE POLICY "Tenant isolation for alerts"
  ON public.absence_alerts FOR ALL
  USING (school_id = public.get_current_user_school_id());

-- Datesheets RLS
CREATE POLICY "Tenant isolation for datesheets"
  ON public.datesheets FOR ALL
  USING (school_id = public.get_current_user_school_id());

-- Kids Progress RLS
CREATE POLICY "Tenant isolation for kids progress"
  ON public.kids_progress FOR ALL
  USING (school_id = public.get_current_user_school_id());

-- Teacher Progress (Confidential: Admin & Management only)
CREATE POLICY "Admin only for teacher progress"
  ON public.teacher_progress FOR ALL
  USING (
    school_id = public.get_current_user_school_id()
    AND public.get_current_user_role() = 'admin'
  );

-- Parents Report Cards (Admin and Teachers only)
CREATE POLICY "Staff only for parents reports"
  ON public.parent_reports FOR ALL
  USING (
    school_id = public.get_current_user_school_id()
    AND public.get_current_user_role() IN ('admin', 'teacher')
  );
