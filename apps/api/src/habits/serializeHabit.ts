import type { HabitDto } from '@morning-route/shared';
import type { HabitRecord } from './habitTypes';

export function serializeHabit(habit: HabitRecord): HabitDto {
  return {
    id: habit.id,
    userId: habit.userId,
    title: habit.title,
    archivedAt: habit.archivedAt ? habit.archivedAt.toISOString() : null,
    sortOrder: habit.sortOrder,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
  };
}
