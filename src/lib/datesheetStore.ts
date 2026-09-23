import { createCollectionStore, reportFailure } from './realtimeCollection';
import { getSupabase } from './supabase';
import type { Datesheet } from '../types';

interface DatesheetRow {
  id: string;
  school_id: string;
  title: string;
  class_id: string;
  term: Datesheet['term'];
  academic_year: string;
  instructions: string[] | null;
  schedule: Datesheet['schedule'] | null;
  created_at: string;
}

function rowToDatesheet(row: DatesheetRow): Datesheet {
  return {
    id: row.id,
    school_id: row.school_id,
    title: row.title,
    class_id: row.class_id,
    term: row.term,
    academic_year: row.academic_year,
    instructions: row.instructions ?? [],
    schedule: row.schedule ?? [],
    created_at: row.created_at,
  };
}

const store = createCollectionStore<DatesheetRow, Datesheet>({
  table: 'datesheets',
  mapRow: rowToDatesheet,
  getId: (d) => d.id,
});

export const useDatesheetStore = store.useStore;

export const datesheetActions = {
  attach: store.attach,
  refresh: store.refresh,

  async save(schoolId: string, datesheet: Datesheet) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('datesheets').upsert({
      id: datesheet.id,
      school_id: schoolId,
      title: datesheet.title,
      class_id: datesheet.class_id,
      term: datesheet.term,
      academic_year: datesheet.academic_year,
      instructions: datesheet.instructions,
      schedule: datesheet.schedule,
    });
    if (error) reportFailure('Could not save the datesheet', error);
  },
};
