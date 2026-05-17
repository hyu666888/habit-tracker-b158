import { useState, useEffect, useRef } from 'react';
import { load, save } from './storage';
import type { HabitStore, Habit } from './types';
import { localDateKey, calcStreak } from './dates';
import HabitCard from './HabitCard';

function formatDate(key: string): { weekday: string; rest: string } {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const rest = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return { weekday, rest };
}

const MAX_HABITS = 5;

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function App() {
  const [store, setStore] = useState<HabitStore>(() => load());
  const [input, setInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    save(store);
  }, [store]);

  useEffect(() => {
    if (showForm) inputRef.current?.focus();
  }, [showForm]);

  const today = localDateKey();

  const completedToday = store.habits.filter((h) =>
    (store.completions[h.id] ?? []).includes(today)
  ).length;

  const totalStreaks = store.habits.reduce(
    (sum, h) => sum + calcStreak(store.completions[h.id] ?? []),
    0
  );

  function addHabit(e: React.FormEvent) {
    e.preventDefault();
    const name = input.trim();
    if (!name || store.habits.length >= MAX_HABITS) return;
    const habit: Habit = { id: genId(), name, createdAt: Date.now() };
    setStore((s) => ({ ...s, habits: [...s.habits, habit] }));
    setInput('');
    setShowForm(false);
  }

  function toggleToday(id: string) {
    setStore((s) => {
      const existing = s.completions[id] ?? [];
      const updated = existing.includes(today)
        ? existing.filter((d) => d !== today)
        : [...existing, today];
      return { ...s, completions: { ...s.completions, [id]: updated } };
    });
  }

  function deleteHabit(id: string) {
    setStore((s) => {
      const completions = { ...s.completions };
      delete completions[id];
      return { ...s, habits: s.habits.filter((h) => h.id !== id), completions };
    });
  }

  function resetToday() {
    setStore((s) => {
      const completions = { ...s.completions };
      for (const id of Object.keys(completions)) {
        completions[id] = completions[id].filter((d) => d !== today);
      }
      return { ...s, completions };
    });
  }

  const { weekday, rest } = formatDate(today);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">

      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="leading-tight">
            <div className="text-2xl font-bold text-gray-800 tracking-tight">{weekday}</div>
            <div className="text-sm text-gray-400">{rest}</div>
          </div>
          {completedToday > 0 && (
            <button
              onClick={resetToday}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 bg-rose-50 hover:bg-rose-100 active:scale-95 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset today
            </button>
          )}
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">

        {/* Stats banner */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 mb-6 flex divide-x divide-purple-100">
          <div className="flex-1 flex flex-col items-center gap-0.5 pr-4">
            <span className="text-2xl font-bold text-purple-500">{completedToday}</span>
            <span className="text-xs text-gray-400 text-center">done today</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5 px-4">
            <span className="text-2xl font-bold text-emerald-500">{store.habits.length}</span>
            <span className="text-xs text-gray-400 text-center">habits</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5 pl-4">
            <span className="text-2xl font-bold text-amber-500">{totalStreaks}</span>
            <span className="text-xs text-gray-400 text-center">total streak days</span>
          </div>
        </div>

        {/* Habit list */}
        <div className="flex flex-col gap-3 mb-5">
          {store.habits.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-sm">No habits yet — add your first one below!</p>
            </div>
          )}
          {store.habits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              completions={store.completions[h.id] ?? []}
              onToggleToday={toggleToday}
              onDelete={deleteHabit}
            />
          ))}
        </div>

        {/* Add habit */}
        {store.habits.length < MAX_HABITS ? (
          showForm ? (
            <form onSubmit={addHabit} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
              <p className="text-xs text-gray-400 mb-2">
                {MAX_HABITS - store.habits.length} slot{MAX_HABITS - store.habits.length !== 1 ? 's' : ''} remaining
              </p>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. Drink water, Read 10 pages…"
                  maxLength={50}
                  className="flex-1 rounded-xl border border-purple-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-purple-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-purple-500 disabled:bg-purple-200 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-purple-600 active:scale-95"
                >
                  Add
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setShowForm(false); setInput(''); }}
                className="mt-2 text-xs text-gray-400 hover:text-gray-500 w-full text-center"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-purple-200 text-purple-400 hover:border-purple-400 hover:text-purple-500 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add habit
            </button>
          )
        ) : (
          <p className="text-center text-xs text-gray-400 py-2">
            You've got {MAX_HABITS} habits — delete one to add another.
          </p>
        )}
      </div>
    </div>
  );
}
