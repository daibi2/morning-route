import { describe, expect, it, vi } from 'vitest';
import { fetchOverview } from './stats';

describe('stats api', () => {
  it('requests overview for a local date', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          localDate: '2026-09-15',
          todayCompleted: 1,
          todayTotal: 2,
          completionRate: 0.5,
          habits: [],
          last7Days: [],
        }),
      }),
    );
    const overview = await fetchOverview('2026-09-15');
    expect(overview.completionRate).toBe(0.5);
    vi.unstubAllGlobals();
  });
});
