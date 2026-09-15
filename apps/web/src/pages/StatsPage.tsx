import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchOverview, type Overview } from '../api/stats';
import { ApiClientError } from '../api/client';

export function StatsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchOverview()
      .then(setOverview)
      .catch((err: unknown) => {
        setError(err instanceof ApiClientError ? err.message : '加载失败');
      });
  }, []);

  const percent = overview ? Math.round(overview.completionRate * 100) : 0;

  return (
    <section>
      <h1 className="text-2xl font-semibold text-stone-900">统计</h1>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {overview ? (
        <>
          <p className="mt-4 text-stone-600">
            今日完成 {overview.todayCompleted}/{overview.todayTotal}（{percent}%）
          </p>
          <div className="mt-8 h-64 rounded-xl border border-sunrise-100 bg-white p-4">
            <h2 className="mb-2 text-sm font-medium text-stone-600">近 7 日完成数</h2>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={overview.last7Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="localDate" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="completedCount" fill="#f97316" name="完成数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-6 space-y-2">
            {overview.habits.map((habit) => (
              <li key={habit.id} className="flex justify-between text-sm">
                <span>{habit.title}</span>
                <span>连续 {habit.currentStreak} 天</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-6 text-stone-500">加载中…</p>
      )}
    </section>
  );
}
