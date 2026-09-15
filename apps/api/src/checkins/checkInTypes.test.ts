import { describe, expect, it } from 'vitest';
import { checkInSelect } from './checkInTypes';

describe('checkInSelect', () => {
  it('includes localDate for Prisma.CheckInGetPayload', () => {
    expect(checkInSelect.localDate).toBe(true);
  });
});
