import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import { createAuthRouter } from './auth/authRouter';
import { createCheckInsRouter } from './checkins/checkInsRouter';
import { createHabitsRouter } from './habits/habitsRouter';
import { createStatsRouter } from './stats/statsRouter';
import type { AppDeps } from './config';
import { errorHandler } from './middleware/errorHandler';

export function createApp(deps: AppDeps): Express {
  const app = express();

  app.use(
    cors({
      origin: deps.webOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true as const });
  });

  app.use('/api/auth', createAuthRouter(deps));
  app.use('/api/habits', createCheckInsRouter(deps));
  app.use('/api/habits', createHabitsRouter(deps));
  app.use('/api/stats', createStatsRouter(deps));

  app.use(errorHandler);
  return app;
}
