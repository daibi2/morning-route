import { describe, expect, it, vi } from 'vitest';
import { createHabit, fetchHabits } from './habits';

describe('habits api', () => {
  it('requests the habits collection', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ habits: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await fetchHabits();
    await createHabit('晨跑');
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/habits',
      expect.objectContaining({ credentials: 'include' }),
    );
    vi.unstubAllGlobals();
  });
});
