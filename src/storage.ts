import type { HabitStore } from './types';

const KEY = 'habit-tracker-v1';

const empty: HabitStore = { habits: [], completions: {} };

export function load(): HabitStore {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HabitStore) : empty;
  } catch {
    return empty;
  }
}

export function save(store: HabitStore): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}
