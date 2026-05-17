/** Returns local YYYY-MM-DD for the given date (defaults to today) */
export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns the last 7 local date keys ending today (oldest first) */
export function last7Days(): string[] {
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(localDateKey(d));
  }
  return keys;
}

/** Returns short day label (M T W T F S S) for a YYYY-MM-DD key */
export function dayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(y, m - 1, d).getDay()];
}

/** Compute current streak for a habit given its sorted completion date keys */
export function calcStreak(completions: string[]): number {
  if (!completions.length) return 0;
  const sorted = [...completions].sort().reverse();
  const today = localDateKey();
  let streak = 0;
  let cursor = today;

  for (const key of sorted) {
    if (key === cursor) {
      streak++;
      const prev = new Date(cursor);
      prev.setDate(prev.getDate() - 1);
      cursor = localDateKey(prev);
    } else if (key < cursor) {
      break;
    }
  }
  return streak;
}
