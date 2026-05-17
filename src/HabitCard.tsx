import type { Habit } from './types';
import { localDateKey, last7Days, dayLabel, calcStreak } from './dates';

interface Props {
  habit: Habit;
  completions: string[];
  note: string;
  onToggleToday: (id: string) => void;
  onDelete: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
}

export default function HabitCard({ habit, completions, note, onToggleToday, onDelete, onNoteChange }: Props) {
  const today = localDateKey();
  const doneToday = completions.includes(today);
  const streak = calcStreak(completions);
  const days = last7Days();
  const set = new Set(completions);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 flex flex-col gap-3">
      {/* Top row: name + delete */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-gray-700 font-medium text-base leading-snug flex-1">{habit.name}</span>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-gray-300 hover:text-rose-400 transition-colors text-lg leading-none mt-0.5 flex-shrink-0"
          aria-label="Delete habit"
        >
          ×
        </button>
      </div>

      {/* Week dots */}
      <div className="flex justify-between items-end gap-1">
        {days.map((key) => {
          const done = set.has(key);
          const isToday = key === today;
          return (
            <div key={key} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={[
                  'w-7 h-7 rounded-full transition-all duration-200',
                  done
                    ? 'bg-emerald-400 shadow-sm'
                    : isToday
                    ? 'bg-purple-100 border-2 border-purple-300'
                    : 'bg-gray-100',
                ].join(' ')}
              />
              <span className={`text-[10px] font-medium ${isToday ? 'text-purple-400' : 'text-gray-300'}`}>
                {dayLabel(key)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom row: streak + check button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🔥</span>
          <span className="text-sm font-semibold text-amber-500">{streak}</span>
          <span className="text-xs text-gray-400">day streak</span>
        </div>
        <button
          onClick={() => onToggleToday(habit.id)}
          className={[
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95',
            doneToday
              ? 'bg-emerald-400 text-white shadow-md shadow-emerald-200'
              : 'bg-purple-100 text-purple-600 hover:bg-purple-200',
          ].join(' ')}
          aria-label={doneToday ? 'Mark undone' : 'Mark done'}
        >
          {doneToday ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Done
            </>
          ) : (
            'Mark done'
          )}
        </button>
      </div>

      {/* Note input */}
      <input
        type="text"
        value={note}
        onChange={(e) => onNoteChange(habit.id, e.target.value)}
        placeholder="Add a note…"
        maxLength={120}
        className="w-full text-xs text-gray-500 placeholder-gray-300 bg-gray-50 rounded-lg px-3 py-2 border border-transparent focus:border-purple-200 focus:bg-white focus:outline-none transition-colors"
      />
    </div>
  );
}
