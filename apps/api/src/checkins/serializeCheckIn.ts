import type { CheckInDto } from '@morning-route/shared';
import type { CheckInRecord } from './checkInTypes';

export function serializeCheckIn(row: CheckInRecord): CheckInDto {
  return {
    id: row.id,
    habitId: row.habitId,
    userId: row.userId,
    localDate: row.localDate,
    createdAt: row.createdAt.toISOString(),
  };
}
