import { createCollectionStore, reportFailure } from './realtimeCollection';
import { getSupabase } from './supabase';
import type { Notice } from '../types';

interface NoticeRow {
  id: string;
  school_id: string;
  title: string;
  content: string | null;
  category: Notice['category'];
  target_audience: Notice['target_audience'];
  target_class: string | null;
  priority: Notice['priority'];
  publish_date: string;
  expiry_date: string | null;
  author_name: string | null;
  author_role: string | null;
  attachments: string[] | null;
  created_at: string;
}

function rowToNotice(row: NoticeRow): Notice {
  return {
    id: row.id,
    school_id: row.school_id,
    title: row.title,
    content: row.content ?? '',
    category: row.category,
    target_audience: row.target_audience,
    target_class: row.target_class ?? undefined,
    priority: row.priority,
    publish_date: row.publish_date,
    expiry_date: row.expiry_date ?? undefined,
    author_name: row.author_name ?? '',
    author_role: row.author_role ?? '',
    attachments: row.attachments ?? [],
    created_at: row.created_at,
  };
}

const store = createCollectionStore<NoticeRow, Notice>({
  table: 'notices',
  mapRow: rowToNotice,
  getId: (n) => n.id,
});

export const useNoticeStore = store.useStore;

export interface NoticeAuthor {
  school_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
}

export const noticeActions = {
  attach: store.attach,
  refresh: store.refresh,

  async add(
    input: Omit<Notice, 'id' | 'school_id' | 'author_name' | 'author_role' | 'created_at'>,
    author: NoticeAuthor
  ) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('notices').insert({
      school_id: author.school_id,
      title: input.title,
      content: input.content,
      category: input.category,
      target_audience: input.target_audience,
      target_class: input.target_class || null,
      priority: input.priority,
      publish_date: input.publish_date,
      expiry_date: input.expiry_date || null,
      author_id: author.author_id,
      author_name: author.author_name,
      author_role: author.author_role,
      attachments: input.attachments ?? [],
    });
    if (error) reportFailure('Could not publish the notice', error);
  },

  async remove(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (error) reportFailure('Could not delete the notice', error);
  },
};
