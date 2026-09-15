import { apiRequest } from './client';

export type HabitStats = {
  habitId: string;
  localDate: string;
  todayCheckedIn: boolean;
  currentStreak: number;
  recent: { localDate: string; checkedIn: boolean }[];
};

export function fetchHabitStats(habitId: string, localDate: string): Promise<HabitStats> {
  return apiRequest<HabitStats>(
    `/api/habits/${habitId}/stats?localDate=${encodeURIComponent(localDate)}`,
  );
}

export function putCheckIn(habitId: string, localDate: string): Promise<void> {
  return apiRequest<unknown>(`/api/habits/${habitId}/check-ins/${localDate}`, {
    method: 'PUT',
  }).then(() => undefined);
}

export function deleteCheckIn(habitId: string, localDate: string): Promise<void> {
  return apiRequest<void>(`/api/habits/${habitId}/check-ins/${localDate}`, { method: 'DELETE' });
}
