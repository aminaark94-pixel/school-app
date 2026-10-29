-- Align the cloud schema with the fields actually used by the React client.
-- This is additive and safe to run after 20261029000000_comprehensive_tenant_tables.sql.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Client-created rows need identifiers when a store does not explicitly supply one.
ALTER TABLE public.notices ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.communication_messages ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.absence_alerts ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Notices
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general';
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS target_class TEXT;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS publish_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS author_role TEXT NOT NULL DEFAULT '';
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Communication store uses student_class and text, while the original migration
-- used older class_id/message names. Keep legacy fields for compatibility.
ALTER TABLE public.communication_queries ADD COLUMN IF NOT EXISTS student_class TEXT NOT NULL DEFAULT '';
ALTER TABLE public.communication_queries ADD COLUMN IF NOT EXISTS teacher_id TEXT;
ALTER TABLE public.communication_queries ADD COLUMN IF NOT EXISTS teacher_name TEXT;
ALTER TABLE public.communication_queries ALTER COLUMN message SET DEFAULT '';
ALTER TABLE public.communication_messages ADD COLUMN IF NOT EXISTS text TEXT NOT NULL DEFAULT '';
ALTER TABLE public.communication_messages ALTER COLUMN message SET DEFAULT '';

-- Alert store uses alert_date and requires an upsert conflict target.
ALTER TABLE public.absence_alerts ADD COLUMN IF NOT EXISTS alert_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.absence_alerts ALTER COLUMN date SET DEFAULT CURRENT_DATE;
ALTER TABLE public.absence_alerts DROP CONSTRAINT IF EXISTS absence_alerts_status_check;
ALTER TABLE public.absence_alerts ADD CONSTRAINT absence_alerts_status_check
  CHECK (status IN ('sent', 'delivered', 'acknowledged', 'excused', 'unexcused'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_absence_alerts_student_alert_date
  ON public.absence_alerts(student_id, alert_date);

-- Datesheet client contract.
ALTER TABLE public.datesheets ADD COLUMN IF NOT EXISTS term TEXT NOT NULL DEFAULT 'mid_term';
ALTER TABLE public.datesheets ADD COLUMN IF NOT EXISTS academic_year TEXT NOT NULL DEFAULT '';
ALTER TABLE public.datesheets ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.datesheets ALTER COLUMN instructions TYPE JSONB USING to_jsonb(instructions);

-- Monthly progress client contract.
ALTER TABLE public.kids_progress ADD COLUMN IF NOT EXISTS teacher_id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.kids_progress ADD COLUMN IF NOT EXISTS teacher_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.kids_progress ADD COLUMN IF NOT EXISTS badges JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.kids_progress ADD COLUMN IF NOT EXISTS overall_score NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.kids_progress ADD COLUMN IF NOT EXISTS overall_grade TEXT NOT NULL DEFAULT '';

-- Parent report client contract.
ALTER TABLE public.parent_reports ADD COLUMN IF NOT EXISTS children_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.parent_reports ADD COLUMN IF NOT EXISTS metrics JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.parent_reports ADD COLUMN IF NOT EXISTS engagement_score NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.parent_reports ADD COLUMN IF NOT EXISTS extense_attention_needed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.parent_reports ADD COLUMN IF NOT EXISTS last_contacted_date DATE;

-- Make policy intent explicit for inserts/updates as well as reads.
DROP POLICY IF EXISTS "Tenant isolation for diary" ON public.diary_entries;
CREATE POLICY "Tenant isolation for diary" ON public.diary_entries FOR ALL
  USING (school_id = public.get_current_user_school_id())
  WITH CHECK (school_id = public.get_current_user_school_id());
DROP POLICY IF EXISTS "Tenant isolation for diary reads" ON public.diary_reads;
CREATE POLICY "Tenant isolation for diary reads" ON public.diary_reads FOR ALL
  USING (school_id = public.get_current_user_school_id())
  WITH CHECK (school_id = public.get_current_user_school_id());
DROP POLICY IF EXISTS "Tenant isolation for notices" ON public.notices;
CREATE POLICY "Tenant isolation for notices" ON public.notices FOR ALL
  USING (school_id = public.get_current_user_school_id())
  WITH CHECK (school_id = public.get_current_user_school_id());
DROP POLICY IF EXISTS "Tenant isolation for queries" ON public.communication_queries;
CREATE POLICY "Tenant isolation for queries" ON public.communication_queries FOR ALL
  USING (school_id = public.get_current_user_school_id())
  WITH CHECK (school_id = public.get_current_user_school_id());
DROP POLICY IF EXISTS "Tenant isolation for messages" ON public.communication_messages;
CREATE POLICY "Tenant isolation for messages" ON public.communication_messages FOR ALL
  USING (school_id = public.get_current_user_school_id())
  WITH CHECK (school_id = public.get_current_user_school_id());
DROP POLICY IF EXISTS "Tenant isolation for alerts" ON public.absence_alerts;
CREATE POLICY "Tenant isolation for alerts" ON public.absence_alerts FOR ALL
  USING (school_id = public.get_current_user_school_id())
  WITH CHECK (school_id = public.get_current_user_school_id());
DROP POLICY IF EXISTS "Tenant isolation for datesheets" ON public.datesheets;
CREATE POLICY "Tenant isolation for datesheets" ON public.datesheets FOR ALL
  USING (school_id = public.get_current_user_school_id())
  WITH CHECK (school_id = public.get_current_user_school_id());
