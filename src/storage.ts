import type { HabitStore } from './types';

const KEY = 'habit-tracker-v1';

const empty: HabitStore = { habits: [], completions: {}, notes: {} };

export function load(): HabitStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<HabitStore> & Pick<HabitStore, 'habits' | 'completions'>;
    // migrate older saves that predate the notes field
    return { habits: parsed.habits, completions: parsed.completions, notes: parsed.notes ?? {} };
  } catch {
    return empty;
  }
}

export function save(store: HabitStore): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}
