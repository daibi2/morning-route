import { todayLocalDate } from '@morning-route/shared';
import { apiRequest } from './client';

export type Overview = {
  localDate: string;
  todayCompleted: number;
  todayTotal: number;
  completionRate: number;
  habits: { id: string; title: string; currentStreak: number; todayCheckedIn: boolean }[];
  last7Days: { localDate: string; completedCount: number }[];
};

export function fetchOverview(localDate: string = todayLocalDate()): Promise<Overview> {
  return apiRequest<Overview>(`/api/stats/overview?localDate=${encodeURIComponent(localDate)}`);
}
