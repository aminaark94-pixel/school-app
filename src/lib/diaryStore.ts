/**
 * Cloud diary store
 * -----------------
 * One shared, realtime copy of the diary for the whole app (not one copy per component).
 *
 *  - Reads diary entries + parent signatures from Supabase (RLS decides who sees what).
 *  - Listens to Supabase Realtime, so a teacher's post shows up on every parent's phone within a second.
 *  - Uploads photos to the "diary-media" storage bucket (resized first) instead of stuffing base64
 *    pictures into the database row.
 *  - Optimistic updates: the post shows instantly and is rolled back with a message if the server refuses it.
 *
 * It is only used when a user is signed in. In local demo mode the app keeps using LocalStore.
 */
import { useSyncExternalStore } from 'react';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabase';
import type { DiaryEntry } from '../types';

type ReadReceipt = DiaryEntry['read_by_parents'][number];
type Attachment = NonNullable<DiaryEntry['attachments']>[number];

interface DiaryRow {
  id: string;
  school_id: string;
  teacher_id: string | null;
  teacher_name: string | null;
  class_id: string;
  section: string;
  subject: string;
  entry_date: string;
  classwork: string | null;
  homework: string | null;
  due_date: string | null;
  attachments: Attachment[] | null;
  created_at: string;
}

interface ReadRow {
  id: string;
  diary_id: string;
  school_id: string;
  parent_id: string;
  parent_name: string | null;
  student_id: string;
  student_name: string | null;
  read_at: string;
}

export interface DiaryState {
  entries: DiaryEntry[];
  loading: boolean;
  error: string | null;
  /** True while the realtime channel is connected. */
  live: boolean;
}

export interface NewDiaryInput {
  class_id: string;
  section: string;
  subject: string;
  date: string;
  classwork: string;
  homework: string;
  due_date?: string;
  attachments?: DiaryEntry['attachments'];
}

export interface DiaryAuthor {
  school_id: string;
  teacher_id: string;
  teacher_name: string;
}

export interface DiaryReader {
  school_id: string;
  parent_id: string;
  parent_name: string;
  student_id: string;
  student_name: string;
}

const BUCKET = 'diary-media';

// ---------------------------------------------------------------------------
// Tiny store
// ---------------------------------------------------------------------------
let state: DiaryState = { entries: [], loading: false, error: null, live: false };
const listeners = new Set<() => void>();

function setState(patch: Partial<DiaryState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;

export function useDiaryStore(): DiaryState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function rowToEntry(row: DiaryRow, reads: ReadReceipt[] = []): DiaryEntry {
  return {
    id: row.id,
    school_id: row.school_id,
    class_id: row.class_id,
    section: row.section,
    subject: row.subject,
    date: row.entry_date,
    classwork: row.classwork ?? '',
    homework: row.homework ?? '',
    due_date: row.due_date ?? undefined,
    teacher_id: row.teacher_id ?? '',
    teacher_name: row.teacher_name ?? '',
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    read_by_parents: reads,
    created_at: row.created_at,
  };
}

function readRowToReceipt(row: ReadRow): ReadReceipt {
  return {
    parent_id: row.parent_id,
    parent_name: row.parent_name ?? '',
    student_id: row.student_id,
    student_name: row.student_name ?? '',
    read_at: row.read_at,
  };
}

function sortNewestFirst(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback (very old browsers): RFC4122-ish v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return 'Unknown error';
}

/** The diary screen has no error banner, so failures are shown with a plain alert (same style as its other messages). */
function reportFailure(title: string, err: unknown) {
  const message = errorMessage(err);
  setState({ error: `${title}: ${message}` });
  if (typeof window !== 'undefined') {
    window.alert(`${title}.\n\n${message}`);
  }
}

/** Entries created on this device that are still uploading. Realtime echoes for them are ignored until done. */
const pendingIds = new Set<string>();

// ---------------------------------------------------------------------------
// Loading + realtime
// ---------------------------------------------------------------------------
let attachedSchoolId: string | null = null;
let refCount = 0;
let channel: RealtimeChannel | null = null;
let teardownTimer: ReturnType<typeof setTimeout> | null = null;

async function fetchAll(schoolId: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  setState({ loading: true });

  const [entriesRes, readsRes] = await Promise.all([
    supabase
      .from('diary_entries')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(300),
    supabase.from('diary_reads').select('*').eq('school_id', schoolId).limit(5000),
  ]);

  // The user may have switched school / signed out while we were waiting.
  if (attachedSchoolId !== schoolId) return;

  const failure = entriesRes.error ?? readsRes.error;
  if (failure) {
    setState({ loading: false, error: failure.message });
    return;
  }

  const readsByDiary = new Map<string, ReadReceipt[]>();
  ((readsRes.data ?? []) as ReadRow[]).forEach((r) => {
    const list = readsByDiary.get(r.diary_id) ?? [];
    list.push(readRowToReceipt(r));
    readsByDiary.set(r.diary_id, list);
  });

  const fromServer = ((entriesRes.data ?? []) as DiaryRow[]).map((row) =>
    rowToEntry(row, readsByDiary.get(row.id) ?? [])
  );

  // Keep posts that are still uploading from this device.
  const stillPending = state.entries.filter(
    (e) => pendingIds.has(e.id) && !fromServer.some((s) => s.id === e.id)
  );

  setState({ entries: sortNewestFirst([...stillPending, ...fromServer]), loading: false, error: null });
}

function applyEntryRow(row: DiaryRow) {
  if (pendingIds.has(row.id)) return; // our own post is still finishing; it will be finalised locally
  const existing = state.entries.find((e) => e.id === row.id);
  const entry = rowToEntry(row, existing?.read_by_parents ?? []);
  setState({
    entries: existing
      ? state.entries.map((e) => (e.id === row.id ? entry : e))
      : sortNewestFirst([entry, ...state.entries]),
  });
}

function applyReceipt(row: ReadRow) {
  const receipt = readRowToReceipt(row);
  setState({
    entries: state.entries.map((e) => {
      if (e.id !== row.diary_id) return e;
      const already = e.read_by_parents.some(
        (r) => r.parent_id === receipt.parent_id && r.student_id === receipt.student_id
      );
      return already ? e : { ...e, read_by_parents: [...e.read_by_parents, receipt] };
    }),
  });
}

function openChannel(schoolId: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  channel = supabase
    .channel(`diary-${schoolId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'diary_entries', filter: `school_id=eq.${schoolId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id?: string }).id;
          if (id) setState({ entries: state.entries.filter((e) => e.id !== id) });
          return;
        }
        applyEntryRow(payload.new as unknown as DiaryRow);
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'diary_reads', filter: `school_id=eq.${schoolId}` },
      (payload) => applyReceipt(payload.new as unknown as ReadRow)
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setState({ live: true });
        // Catch anything that happened while we were connecting or offline.
        void fetchAll(schoolId);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        setState({ live: false });
      }
    });
}

function teardown() {
  const supabase = getSupabase();
  if (channel && supabase) {
    void supabase.removeChannel(channel);
  }
  channel = null;
  attachedSchoolId = null;
  setState({ entries: [], loading: false, error: null, live: false });
}

/**
 * Starts loading + listening for a school. Safe to call from many components:
 * the connection is shared and closed when the last one lets go.
 */
function attach(schoolId: string): () => void {
  if (teardownTimer) {
    clearTimeout(teardownTimer);
    teardownTimer = null;
  }

  refCount += 1;

  if (attachedSchoolId !== schoolId) {
    if (attachedSchoolId) teardown();
    attachedSchoolId = schoolId;
    void fetchAll(schoolId);
    openChannel(schoolId);
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    refCount = Math.max(0, refCount - 1);
    if (refCount === 0) {
      // Small delay so React StrictMode's mount/unmount/mount does not reconnect twice.
      teardownTimer = setTimeout(() => {
        if (refCount === 0) teardown();
        teardownTimer = null;
      }, 250);
    }
  };
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------
function compressToJpeg(dataUrl: string, maxSide = 1600, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('This browser cannot resize photos.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not compress the photo.'))),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Could not read the photo.'));
    img.src = dataUrl;
  });
}

async function uploadAttachments(
  supabase: SupabaseClient,
  schoolId: string,
  entryId: string,
  attachments: Attachment[]
): Promise<Attachment[]> {
  return Promise.all(
    attachments.map(async (att) => {
      // Sample/preset pictures are already normal web links; only device photos (data:) get uploaded.
      if (!att.url.startsWith('data:')) return att;

      const blob = await compressToJpeg(att.url);
      const path = `${schoolId}/${entryId}/${att.id}.jpg`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (error) throw new Error(`Photo upload failed: ${error.message}`);

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return { ...att, url: data.publicUrl };
    })
  );
}

function storagePathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return null;
  return decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
}

// ---------------------------------------------------------------------------
// Actions (all optimistic)
// ---------------------------------------------------------------------------

/** Posts a diary entry. Returns the optimistic entry immediately; the upload + save continue in the background. */
function addEntry(input: NewDiaryInput, author: DiaryAuthor): DiaryEntry {
  const id = newId();
  const optimistic: DiaryEntry = {
    id,
    school_id: author.school_id,
    class_id: input.class_id,
    section: input.section,
    subject: input.subject,
    date: input.date,
    classwork: input.classwork,
    homework: input.homework,
    due_date: input.due_date,
    teacher_id: author.teacher_id,
    teacher_name: author.teacher_name,
    attachments: input.attachments ?? [],
    read_by_parents: [],
    created_at: new Date().toISOString(),
  };

  pendingIds.add(id);
  setState({ entries: [optimistic, ...state.entries] });

  void (async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase is not configured.');

      const attachments = await uploadAttachments(supabase, author.school_id, id, optimistic.attachments ?? []);

      const { error } = await supabase.from('diary_entries').insert({
        id,
        school_id: author.school_id,
        teacher_id: author.teacher_id,
        teacher_name: author.teacher_name,
        class_id: input.class_id,
        section: input.section,
        subject: input.subject,
        entry_date: input.date,
        classwork: input.classwork,
        homework: input.homework,
        due_date: input.due_date || null,
        attachments,
      });
      if (error) throw error;

      pendingIds.delete(id);
      // Swap the on-device previews for the hosted photo links.
      setState({ entries: state.entries.map((e) => (e.id === id ? { ...e, attachments } : e)) });
    } catch (err) {
      pendingIds.delete(id);
      setState({ entries: state.entries.filter((e) => e.id !== id) });
      reportFailure('Diary post failed', err);
    }
  })();

  return optimistic;
}

/** Parent signature ("Mark Diary as Read"). */
function markRead(diaryId: string, reader: DiaryReader) {
  const receipt: ReadReceipt = {
    parent_id: reader.parent_id,
    parent_name: reader.parent_name,
    student_id: reader.student_id,
    student_name: reader.student_name,
    read_at: new Date().toISOString(),
  };

  const target = state.entries.find((e) => e.id === diaryId);
  if (!target) return;
  const already = target.read_by_parents.some(
    (r) => r.parent_id === receipt.parent_id && r.student_id === receipt.student_id
  );
  if (already) return;

  const before = state.entries;
  setState({
    entries: before.map((e) =>
      e.id === diaryId ? { ...e, read_by_parents: [...e.read_by_parents, receipt] } : e
    ),
  });

  void (async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('diary_reads').upsert(
      {
        diary_id: diaryId,
        school_id: reader.school_id,
        parent_id: reader.parent_id,
        parent_name: reader.parent_name,
        student_id: reader.student_id,
        student_name: reader.student_name,
      },
      { onConflict: 'diary_id,student_id,parent_id', ignoreDuplicates: true }
    );
    if (error) {
      setState({
        entries: state.entries.map((e) =>
          e.id === diaryId
            ? {
                ...e,
                read_by_parents: e.read_by_parents.filter(
                  (r) => !(r.parent_id === receipt.parent_id && r.student_id === receipt.student_id)
                ),
              }
            : e
        ),
      });
      reportFailure('Could not save your signature', error);
    }
  })();
}

function deleteEntry(id: string) {
  const previous = state.entries;
  const target = previous.find((e) => e.id === id);
  setState({ entries: previous.filter((e) => e.id !== id) });

  void (async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (error) {
      setState({ entries: sortNewestFirst([...state.entries, ...previous.filter((e) => e.id === id)]) });
      reportFailure('Could not delete the diary entry', error);
      return;
    }

    // Best effort: remove the photos from storage too.
    const paths = (target?.attachments ?? [])
      .map((a) => storagePathFromUrl(a.url))
      .filter((p): p is string => Boolean(p));
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths);
    }
  })();
}

function refresh() {
  if (attachedSchoolId) void fetchAll(attachedSchoolId);
}

export const diaryActions = { attach, addEntry, markRead, deleteEntry, refresh };
