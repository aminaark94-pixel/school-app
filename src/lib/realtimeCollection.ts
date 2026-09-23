/**
 * Generic realtime collection store.
 * ------------------------------------------------------------------
 * Same pattern as diaryStore.ts, factored out so notices, absence alerts and
 * datesheets don't each need their own copy of "load once + subscribe + share
 * across every component". One store instance per Supabase table.
 */
import { useSyncExternalStore } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

export interface CollectionState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  live: boolean;
}

export interface CollectionStore<T> {
  useStore: () => CollectionState<T>;
  /** Starts loading + listening for a school. Call the returned function to release. */
  attach: (schoolId: string) => () => void;
  refresh: () => void;
  getState: () => CollectionState<T>;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return 'Unknown error';
}

export function reportFailure(title: string, err: unknown) {
  const message = errorMessage(err);
  if (typeof window !== 'undefined') {
    window.alert(`${title}.\n\n${message}`);
  }
}

interface Options<Row, T> {
  table: string;
  schoolColumn?: string; // defaults to 'school_id'
  orderColumn?: string; // defaults to 'created_at'
  ascending?: boolean;
  limit?: number;
  mapRow: (row: Row) => T;
  getId: (item: T) => string;
}

export function createCollectionStore<Row extends Record<string, unknown>, T>(
  opts: Options<Row, T>
): CollectionStore<T> {
  const schoolColumn = opts.schoolColumn ?? 'school_id';
  const orderColumn = opts.orderColumn ?? 'created_at';
  const ascending = opts.ascending ?? false;

  let state: CollectionState<T> = { items: [], loading: false, error: null, live: false };
  const listeners = new Set<() => void>();

  function setState(patch: Partial<CollectionState<T>>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  const getSnapshot = () => state;

  function useStore(): CollectionState<T> {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  let attachedSchoolId: string | null = null;
  let refCount = 0;
  let channel: RealtimeChannel | null = null;
  let teardownTimer: ReturnType<typeof setTimeout> | null = null;

  async function fetchAll(schoolId: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    setState({ loading: true });

    const { data, error } = await supabase
      .from(opts.table)
      .select('*')
      .eq(schoolColumn, schoolId)
      .order(orderColumn, { ascending })
      .limit(opts.limit ?? 500);

    if (attachedSchoolId !== schoolId) return;

    if (error) {
      setState({ loading: false, error: error.message });
      return;
    }

    const items = ((data ?? []) as Row[]).map(opts.mapRow);
    setState({ items, loading: false, error: null });
  }

  function upsertLocal(row: Row) {
    const item = opts.mapRow(row);
    const id = opts.getId(item);
    const exists = state.items.some((i) => opts.getId(i) === id);
    setState({
      items: exists
        ? state.items.map((i) => (opts.getId(i) === id ? item : i))
        : [item, ...state.items],
    });
  }

  function removeLocal(id: string) {
    setState({ items: state.items.filter((i) => opts.getId(i) !== id) });
  }

  function openChannel(schoolId: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    channel = supabase
      .channel(`${opts.table}-${schoolId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: opts.table, filter: `${schoolColumn}=eq.${schoolId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as Record<string, unknown>;
            const id = typeof oldRow.id === 'string' ? oldRow.id : null;
            if (id) removeLocal(id);
            return;
          }
          upsertLocal(payload.new as Row);
        }
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
    setState({ items: [], loading: false, error: null, live: false });
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

  return { useStore, attach, refresh, getState: () => state };
}
