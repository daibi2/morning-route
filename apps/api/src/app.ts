import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173';

  app.use(
    cors({
      origin: webOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true as const });
  });

  app.use(errorHandler);
  return app;
}
