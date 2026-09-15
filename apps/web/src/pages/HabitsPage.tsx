import type { HabitDto } from '@morning-route/shared';
import { FormEvent, useEffect, useState } from 'react';
import { createHabit, deleteHabit, fetchHabits, patchHabit } from '../api/habits';
import { ApiClientError } from '../api/client';

export function HabitsPage() {
  const [habits, setHabits] = useState<HabitDto[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload(): Promise<void> {
    const res = await fetchHabits();
    setHabits(res.habits);
  }

  useEffect(() => {
    void reload()
      .catch((err: unknown) => {
        setError(err instanceof ApiClientError ? err.message : '加载失败');
      })
      .finally(() => setLoading(false));
  }, []);

  async function onCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createHabit(title);
      setTitle('');
      await reload();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : '创建失败');
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-stone-900">习惯</h1>
      <form className="mt-6 flex gap-2" onSubmit={(e) => void onCreate(e)}>
        <input
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2"
          placeholder="新习惯名称"
          aria-label="新习惯名称"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-sunrise-500 px-4 py-2 font-medium text-white"
        >
          添加
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="mt-6 text-stone-500">加载中…</p> : null}
      <ul className="mt-6 space-y-3">
        {habits.map((habit) => (
          <li
            key={habit.id}
            className="flex items-center justify-between rounded-xl border border-sunrise-100 bg-white px-4 py-3"
          >
            <span>{habit.title}</span>
            <span className="flex gap-2">
              <button
                type="button"
                className="text-sm text-stone-500"
                onClick={() => {
                  void patchHabit(habit.id, { archived: true }).then(reload);
                }}
              >
                归档
              </button>
              <button
                type="button"
                className="text-sm text-red-700"
                onClick={() => {
                  void deleteHabit(habit.id).then(reload);
                }}
              >
                删除
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
