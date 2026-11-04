-- Platform owners need a read-only, cross-tenant campus view.  Keep writes
-- restricted to the existing school staff policies; this policy only adds SELECT.
do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'students',
    'attendance',
    'fees',
    'results',
    'diary_entries',
    'diary_reads',
    'notices',
    'communication_queries',
    'communication_messages',
    'datesheets',
    'kids_progress',
    'teacher_progress',
    'parent_reports'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'Owners can view all data', target_table);
    execute format(
      'create policy %I on public.%I for select to authenticated using (get_current_user_role() = ''owner'')',
      'Owners can view all data',
      target_table
    );
  end loop;
end
$$;
