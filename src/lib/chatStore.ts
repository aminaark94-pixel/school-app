/**
 * Realtime parent-teacher chat store (communication_queries + communication_messages).
 * Same shared-store pattern as diaryStore.ts.
 */
import { useSyncExternalStore } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from './supabase';
import type { CommunicationQuery, UserRole } from '../types';

type Message = CommunicationQuery['messages'][number];

interface QueryRow {
  id: string;
  school_id: string;
  student_id: string | null;
  student_name: string | null;
  student_class: string | null;
  parent_id: string;
  parent_name: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  subject: string;
  status: CommunicationQuery['status'];
  category: CommunicationQuery['category'];
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  query_id: string;
  school_id: string;
  sender_id: string;
  sender_name: string | null;
  sender_role: UserRole;
  text: string;
  sent_at: string;
}

export interface ChatState {
  queries: CommunicationQuery[];
  loading: boolean;
  error: string | null;
  live: boolean;
}

let state: ChatState = { queries: [], loading: false, error: null, live: false };
const listeners = new Set<() => void>();

function setState(patch: Partial<ChatState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

export function useChatStore(): ChatState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return 'Unknown error';
}

function reportFailure(title: string, err: unknown) {
  if (typeof window !== 'undefined') window.alert(`${title}.\n\n${errorMessage(err)}`);
}

export function newChatId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function rowToQuery(row: QueryRow, messages: Message[] = []): CommunicationQuery {
  return {
    id: row.id,
    school_id: row.school_id,
    student_id: row.student_id ?? '',
    student_name: row.student_name ?? '',
    student_class: row.student_class ?? '',
    parent_id: row.parent_id,
    parent_name: row.parent_name ?? '',
    teacher_id: row.teacher_id ?? undefined,
    teacher_name: row.teacher_name ?? undefined,
    subject: row.subject,
    status: row.status,
    category: row.category,
    created_at: row.created_at,
    updated_at: row.updated_at,
    messages,
  };
}

function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    sender_id: row.sender_id,
    sender_name: row.sender_name ?? '',
    sender_role: row.sender_role,
    text: row.text,
    sent_at: row.sent_at,
  };
}

function sortNewest(items: CommunicationQuery[]): CommunicationQuery[] {
  return [...items].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
}

let attachedSchoolId: string | null = null;
let refCount = 0;
let channel: RealtimeChannel | null = null;
let teardownTimer: ReturnType<typeof setTimeout> | null = null;

async function fetchAll(schoolId: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  setState({ loading: true });

  const [queriesRes, messagesRes] = await Promise.all([
    supabase.from('communication_queries').select('*').eq('school_id', schoolId).limit(500),
    supabase.from('communication_messages').select('*').eq('school_id', schoolId).order('sent_at').limit(5000),
  ]);

  if (attachedSchoolId !== schoolId) return;

  const failure = queriesRes.error ?? messagesRes.error;
  if (failure) {
    setState({ loading: false, error: failure.message });
    return;
  }

  const byQuery = new Map<string, Message[]>();
  ((messagesRes.data ?? []) as MessageRow[]).forEach((m) => {
    const list = byQuery.get(m.query_id) ?? [];
    list.push(rowToMessage(m));
    byQuery.set(m.query_id, list);
  });

  const queries = ((queriesRes.data ?? []) as QueryRow[]).map((row) =>
    rowToQuery(row, byQuery.get(row.id) ?? [])
  );

  setState({ queries: sortNewest(queries), loading: false, error: null });
}

function applyQueryRow(row: QueryRow) {
  const existing = state.queries.find((q) => q.id === row.id);
  const updated = rowToQuery(row, existing?.messages ?? []);
  setState({
    queries: sortNewest(
      existing ? state.queries.map((q) => (q.id === row.id ? updated : q)) : [updated, ...state.queries]
    ),
  });
}

function applyMessageRow(row: MessageRow) {
  const message = rowToMessage(row);
  setState({
    queries: sortNewest(
      state.queries.map((q) => {
        if (q.id !== row.query_id) return q;
        if (q.messages.some((m) => m.id === message.id)) return q;
        return { ...q, messages: [...q.messages, message], updated_at: row.sent_at };
      })
    ),
  });
}

function openChannel(schoolId: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  channel = supabase
    .channel(`chat-${schoolId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'communication_queries', filter: `school_id=eq.${schoolId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') return;
        applyQueryRow(payload.new as unknown as QueryRow);
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'communication_messages', filter: `school_id=eq.${schoolId}` },
      (payload) => applyMessageRow(payload.new as unknown as MessageRow)
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setState({ live: true });
        void fetchAll(schoolId);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        setState({ live: false });
      }
    });
}

function teardown() {
  const supabase = getSupabase();
  if (channel && supabase) void supabase.removeChannel(channel);
  channel = null;
  attachedSchoolId = null;
  setState({ queries: [], loading: false, error: null, live: false });
}

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
      teardownTimer = setTimeout(() => {
        if (refCount === 0) teardown();
        teardownTimer = null;
      }, 250);
    }
  };
}

function refresh() {
  if (attachedSchoolId) void fetchAll(attachedSchoolId);
}

/**
 * Creates the query (with the given id, generated by the caller via newChatId() so
 * it can be selected immediately) and inserts the first message. Fire-and-forget:
 * failures are reported via alert, same as the rest of this store.
 */
function createQuery(
  id: string,
  data: {
    student_id: string;
    student_name: string;
    student_class: string;
    subject: string;
    category: CommunicationQuery['category'];
    initial_message: string;
  },
  author: { school_id: string; parent_id: string; parent_name: string }
) {
  void (async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('communication_queries').insert({
      id,
      school_id: author.school_id,
      student_id: data.student_id,
      student_name: data.student_name,
      student_class: data.student_class,
      parent_id: author.parent_id,
      parent_name: author.parent_name,
      subject: data.subject,
      category: data.category,
      status: 'open',
    });

    if (error) {
      reportFailure('Could not start the conversation', error);
      return;
    }

    const { error: msgError } = await supabase.from('communication_messages').insert({
      query_id: id,
      school_id: author.school_id,
      sender_id: author.parent_id,
      sender_name: author.parent_name,
      sender_role: 'parent',
      text: data.initial_message,
    });
    if (msgError) reportFailure('Could not send your message', msgError);
  })();
}

async function reply(
  queryId: string,
  text: string,
  sender: { school_id: string; sender_id: string; sender_name: string; sender_role: UserRole }
) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('communication_messages').insert({
    query_id: queryId,
    school_id: sender.school_id,
    sender_id: sender.sender_id,
    sender_name: sender.sender_name,
    sender_role: sender.sender_role,
    text,
  });
  if (error) {
    reportFailure('Could not send your message', error);
    return;
  }
  await supabase.from('communication_queries').update({ updated_at: new Date().toISOString() }).eq('id', queryId);
}

async function updateStatus(queryId: string, status: 'open' | 'in_progress' | 'resolved') {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('communication_queries').update({ status }).eq('id', queryId);
  if (error) reportFailure('Could not update the conversation', error);
}

export const chatActions = { attach, refresh, createQuery, reply, updateStatus };
