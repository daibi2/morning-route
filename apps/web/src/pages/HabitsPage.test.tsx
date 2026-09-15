import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HabitsPage } from './HabitsPage';

describe('HabitsPage', () => {
  it('lists habits and can add one', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          habits: [
            {
              id: 'h1',
              userId: 'u1',
              title: '晨跑',
              archivedAt: null,
              sortOrder: 0,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          habit: {
            id: 'h2',
            userId: 'u1',
            title: '冥想',
            archivedAt: null,
            sortOrder: 1,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          habits: [
            {
              id: 'h1',
              userId: 'u1',
              title: '晨跑',
              archivedAt: null,
              sortOrder: 0,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
            {
              id: 'h2',
              userId: 'u1',
              title: '冥想',
              archivedAt: null,
              sortOrder: 1,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        }),
      });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<HabitsPage />);
    expect(await screen.findByText('晨跑')).toBeInTheDocument();
    await user.type(screen.getByLabelText('新习惯名称'), '冥想');
    await user.click(screen.getByRole('button', { name: '添加' }));
    await waitFor(() => {
      expect(screen.getByText('冥想')).toBeInTheDocument();
    });
    vi.unstubAllGlobals();
  });
});
