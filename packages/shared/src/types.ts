export type PublicUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type HabitDto = {
  id: string;
  userId: string;
  title: string;
  archivedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CheckInDto = {
  id: string;
  habitId: string;
  userId: string;
  localDate: string;
  createdAt: string;
};
