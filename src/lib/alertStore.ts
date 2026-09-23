import { createCollectionStore, reportFailure } from './realtimeCollection';
import { getSupabase } from './supabase';
import type { AbsenceAlert } from '../types';

interface AlertRow {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string | null;
  roll_number: string | null;
  class_id: string | null;
  section: string | null;
  alert_date: string;
  parent_id: string | null;
  parent_name: string | null;
  parent_email: string | null;
  sent_at: string;
  status: AbsenceAlert['status'];
  acknowledged_at: string | null;
}

function rowToAlert(row: AlertRow): AbsenceAlert {
  return {
    id: row.id,
    school_id: row.school_id,
    student_id: row.student_id,
    student_name: row.student_name ?? '',
    roll_number: row.roll_number ?? '',
    class_id: row.class_id ?? '',
    section: row.section ?? '',
    date: row.alert_date,
    parent_id: row.parent_id ?? '',
    parent_name: row.parent_name ?? '',
    parent_email: row.parent_email ?? '',
    sent_at: row.sent_at,
    status: row.status,
    acknowledged_at: row.acknowledged_at ?? undefined,
  };
}

const store = createCollectionStore<AlertRow, AbsenceAlert>({
  table: 'absence_alerts',
  orderColumn: 'sent_at',
  mapRow: rowToAlert,
  getId: (a) => a.id,
});

export const useAlertStore = store.useStore;

export const alertActions = {
  attach: store.attach,
  refresh: store.refresh,

  /** Creates an alert for each newly-absent student that doesn't already have one today. Duplicates are ignored. */
  async sendForAbsentees(
    schoolId: string,
    students: Array<{
      id: string;
      name: string;
      roll_number: string;
      class_id: string;
      section: string;
      parent_id?: string;
      parent_name?: string;
      parent_email?: string;
    }>,
    date: string
  ) {
    if (students.length === 0) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('absence_alerts').upsert(
      students.map((s) => ({
        school_id: schoolId,
        student_id: s.id,
        student_name: s.name,
        roll_number: s.roll_number,
        class_id: s.class_id,
        section: s.section,
        alert_date: date,
        parent_id: s.parent_id || null,
        parent_name: s.parent_name || 'Guardian',
        parent_email: s.parent_email || '',
      })),
      { onConflict: 'student_id,alert_date', ignoreDuplicates: true }
    );
    if (error) reportFailure('Could not send absence alerts', error);
  },

  async acknowledge(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase
      .from('absence_alerts')
      .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
      .eq('id', id);
    if (error) reportFailure('Could not update the alert', error);
  },
};
