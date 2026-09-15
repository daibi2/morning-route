import type { HabitDto } from '@morning-route/shared';
import { todayLocalDate } from '@morning-route/shared';
import { useCallback, useEffect, useState } from 'react';
import { deleteCheckIn, fetchHabitStats, putCheckIn, type HabitStats } from '../api/checkins';
import { fetchHabits } from '../api/habits';
import { ApiClientError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

type HabitRow = HabitDto & Pick<HabitStats, 'todayCheckedIn' | 'currentStreak'>;

export function HomePage() {
  const { user, logout } = useAuth();
  const localDate = todayLocalDate();
  const [rows, setRows] = useState<HabitRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { habits } = await fetchHabits();
    const stats = await Promise.all(habits.map((habit) => fetchHabitStats(habit.id, localDate)));
    setRows(
      habits.map((habit, index) => ({
        ...habit,
        todayCheckedIn: stats[index]?.todayCheckedIn ?? false,
        currentStreak: stats[index]?.currentStreak ?? 0,
      })),
    );
  }, [localDate]);

  useEffect(() => {
    void reload()
      .catch((err: unknown) => {
        setError(err instanceof ApiClientError ? err.message : '加载失败');
      })
      .finally(() => setLoading(false));
  }, [reload]);

  async function toggle(row: HabitRow): Promise<void> {
    if (row.todayCheckedIn) {
      await deleteCheckIn(row.id, localDate);
    } else {
      await putCheckIn(row.id, localDate);
    }
    await reload();
  }

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">今日</h1>
          <p className="mt-2 text-stone-600">
            你好，{user?.email}。{localDate}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
        >
          登出
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="mt-6 text-stone-500">加载中…</p> : null}
      {rows.length === 0 && !loading ? (
        <p className="mt-6 text-stone-500">还没有习惯，去「习惯」页添加一个吧。</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between rounded-xl border border-sunrise-100 bg-white px-4 py-3"
            >
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={row.todayCheckedIn}
                  onChange={() => {
                    void toggle(row);
                  }}
                  aria-label={`打卡 ${row.title}`}
                />
                <span>{row.title}</span>
              </label>
              <span className="text-sm text-sunrise-700">连续 {row.currentStreak} 天</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
