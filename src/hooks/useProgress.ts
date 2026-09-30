import { useSyncExternalStore } from 'react';
import { topics } from '../data/roadmap';
const KEY = 'gata.progress.v1';
let cached = '';
let snapshot: string[] = [];
const empty: string[] = [];
function read() {
  try {
    const raw = localStorage.getItem(KEY) || '[]';
    if (raw !== cached) {
      const value: unknown = JSON.parse(raw);
      snapshot = Array.isArray(value)
        ? [...new Set(value.filter((x): x is string => typeof x === 'string'))]
        : [];
      cached = raw;
    }
  } catch {
    snapshot = empty;
  }
  return snapshot;
}
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('gata-progress', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('gata-progress', callback);
  };
}
export function useProgress() {
  const completed = useSyncExternalStore(subscribe, read, () => empty);
  const save = (value: string[]) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
      window.dispatchEvent(new Event('gata-progress'));
    } catch {
      window.dispatchEvent(
        new CustomEvent('gata-notice', {
          detail: 'Your browser could not save progress. Enable local storage and try again.',
        }),
      );
    }
  };
  return {
    completed,
    toggle: (id: string) =>
      save(completed.includes(id) ? completed.filter((x) => x !== id) : [...completed, id]),
    reset: () => save([]),
    topicTotal: topics.filter((t) => completed.includes(t.id)).length,
  };
}
