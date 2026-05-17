export interface Habit {
  id: string;
  name: string;
  createdAt: number;
}

export interface HabitStore {
  habits: Habit[];
  completions: Record<string, string[]>; // habitId -> array of YYYY-MM-DD datekeys
}
