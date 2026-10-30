-- Cloud-only progress/report tables missing from the existing production schema.
-- IDs intentionally remain TEXT because the current React client generates
-- deterministic, human-readable IDs for these three report types.

CREATE TABLE IF NOT EXISTS public.kids_progress (
  id TEXT PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL DEFAULT '',
  class_id TEXT NOT NULL DEFAULT '',
  section TEXT NOT NULL DEFAULT 'A',
  month TEXT NOT NULL,
  year INT NOT NULL,
  language JSONB NOT NULL DEFAULT '{}'::jsonb,
  discipline JSONB NOT NULL DEFAULT '{}'::jsonb,
  writing JSONB NOT NULL DEFAULT '{}'::jsonb,
  reading JSONB NOT NULL DEFAULT '{}'::jsonb,
  cleaning JSONB NOT NULL DEFAULT '{}'::jsonb,
  teacher_id TEXT NOT NULL DEFAULT '',
  teacher_name TEXT NOT NULL DEFAULT '',
  teacher_remarks TEXT NOT NULL DEFAULT '',
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  overall_grade TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_kids_progress_student_period
  ON public.kids_progress(school_id, student_id, month, year);

CREATE TABLE IF NOT EXISTS public.teacher_progress (
  id TEXT PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL DEFAULT '',
  teacher_email TEXT NOT NULL DEFAULT '',
  subject_specialty TEXT NOT NULL DEFAULT '',
  assigned_grades TEXT[] NOT NULL DEFAULT '{}',
  month TEXT NOT NULL,
  year INT NOT NULL,
  language JSONB NOT NULL DEFAULT '{}'::jsonb,
  dressing JSONB NOT NULL DEFAULT '{}'::jsonb,
  working JSONB NOT NULL DEFAULT '{}'::jsonb,
  regularity JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  overall_grade TEXT NOT NULL DEFAULT '',
  incharge_remarks TEXT NOT NULL DEFAULT '',
  incharge_recommendation TEXT NOT NULL DEFAULT 'satisfactory',
  evaluated_by_id TEXT NOT NULL DEFAULT '',
  evaluated_by_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_teacher_progress_period
  ON public.teacher_progress(school_id, teacher_id, month, year);

CREATE TABLE IF NOT EXISTS public.parent_reports (
  id TEXT PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL,
  parent_code TEXT NOT NULL DEFAULT '',
  parent_name TEXT NOT NULL DEFAULT '',
  parent_phone TEXT NOT NULL DEFAULT '',
  parent_email TEXT NOT NULL DEFAULT '',
  children_count INT NOT NULL DEFAULT 0,
  children JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  engagement_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  vigilance_level TEXT NOT NULL DEFAULT 'proactive',
  extense_attention_needed BOOLEAN NOT NULL DEFAULT false,
  attention_reason TEXT NOT NULL DEFAULT '',
  teacher_notes TEXT NOT NULL DEFAULT '',
  last_contacted_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_parent_reports_parent
  ON public.parent_reports(school_id, parent_id);

ALTER TABLE public.kids_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kids progress read" ON public.kids_progress;
DROP POLICY IF EXISTS "kids progress staff write" ON public.kids_progress;
CREATE POLICY "kids progress read" ON public.kids_progress FOR SELECT TO authenticated
  USING (
    school_id = (SELECT public.get_current_user_school_id())
    AND (
      (SELECT public.get_current_user_role()) IN ('owner', 'admin', 'teacher')
      OR EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id::text = kids_progress.student_id
          AND s.parent_id = auth.uid()
      )
    )
  );
CREATE POLICY "kids progress staff write" ON public.kids_progress FOR ALL TO authenticated
  USING (
    school_id = (SELECT public.get_current_user_school_id())
    AND (SELECT public.get_current_user_role()) IN ('owner', 'admin', 'teacher')
  )
  WITH CHECK (
    school_id = (SELECT public.get_current_user_school_id())
    AND (SELECT public.get_current_user_role()) IN ('owner', 'admin', 'teacher')
  );

DROP POLICY IF EXISTS "teacher progress admin only" ON public.teacher_progress;
CREATE POLICY "teacher progress admin only" ON public.teacher_progress FOR ALL TO authenticated
  USING (
    school_id = (SELECT public.get_current_user_school_id())
    AND (SELECT public.get_current_user_role()) IN ('owner', 'admin')
  )
  WITH CHECK (
    school_id = (SELECT public.get_current_user_school_id())
    AND (SELECT public.get_current_user_role()) IN ('owner', 'admin')
  );

DROP POLICY IF EXISTS "parent reports staff only" ON public.parent_reports;
CREATE POLICY "parent reports staff only" ON public.parent_reports FOR ALL TO authenticated
  USING (
    school_id = (SELECT public.get_current_user_school_id())
    AND (SELECT public.get_current_user_role()) IN ('owner', 'admin', 'teacher')
  )
  WITH CHECK (
    school_id = (SELECT public.get_current_user_school_id())
    AND (SELECT public.get_current_user_role()) IN ('owner', 'admin', 'teacher')
  );
