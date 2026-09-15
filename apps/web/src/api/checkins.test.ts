import { describe, expect, it, vi } from 'vitest';
import { fetchHabitStats, putCheckIn } from './checkins';

describe('checkins api', () => {
  it('puts a check-in and loads stats', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ checkIn: { id: 'c1' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          habitId: 'h1',
          localDate: '2026-09-15',
          todayCheckedIn: true,
          currentStreak: 1,
          recent: [],
        }),
      });
    vi.stubGlobal('fetch', fetchMock);
    await putCheckIn('h1', '2026-09-15');
    const stats = await fetchHabitStats('h1', '2026-09-15');
    expect(stats.currentStreak).toBe(1);
    vi.unstubAllGlobals();
  });
});
