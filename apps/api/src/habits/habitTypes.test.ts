import { describe, expect, it } from 'vitest';
import { habitSelect } from './habitTypes';

describe('habitSelect', () => {
  it('selects the fields used by Prisma.HabitGetPayload', () => {
    expect(habitSelect.title).toBe(true);
    expect(habitSelect.archivedAt).toBe(true);
  });
});
