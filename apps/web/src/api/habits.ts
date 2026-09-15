import type { HabitDto } from '@morning-route/shared';
import { apiRequest } from './client';

export function fetchHabits(includeArchived = false): Promise<{ habits: HabitDto[] }> {
  const query = includeArchived ? '?includeArchived=true' : '';
  return apiRequest<{ habits: HabitDto[] }>(`/api/habits${query}`);
}

export function createHabit(title: string): Promise<{ habit: HabitDto }> {
  return apiRequest<{ habit: HabitDto }>('/api/habits', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export function patchHabit(
  id: string,
  body: { title?: string; sortOrder?: number; archived?: boolean },
): Promise<{ habit: HabitDto }> {
  return apiRequest<{ habit: HabitDto }>(`/api/habits/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteHabit(id: string): Promise<void> {
  return apiRequest<void>(`/api/habits/${id}`, { method: 'DELETE' });
}
