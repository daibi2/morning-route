import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StatsPage } from './StatsPage';

describe('StatsPage', () => {
  it('renders last-7-day completion copy', async () => {
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
          habits: [{ id: 'h1', title: '晨跑', currentStreak: 4, todayCheckedIn: true }],
          last7Days: [{ localDate: '2026-09-15', completedCount: 1 }],
        }),
      }),
    );
    render(<StatsPage />);
    expect(await screen.findByText(/今日完成 1\/2/)).toBeInTheDocument();
    expect(screen.getByText('近 7 日完成数')).toBeInTheDocument();
    expect(screen.getByText('晨跑')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
