import type { PrismaClient } from '@prisma/client';

export type AppConfig = {
  jwtSecret: string;
  cookieSecure: boolean;
  webOrigin: string;
  bcryptRounds: number;
};

export type AppDeps = AppConfig & {
  prisma: PrismaClient;
};

export function loadConfig(): AppConfig {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
  return {
    jwtSecret,
    cookieSecure: process.env.NODE_ENV === 'production',
    webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    bcryptRounds: Number.isFinite(rounds) ? rounds : 10,
  };
}
