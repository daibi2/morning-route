import { Router, type Response } from 'express';
import type { AppDeps } from '../config';
import { asyncHandler } from '../lib/asyncHandler';
import { signAccessToken } from '../lib/jwt';
import { requireAuth } from '../middleware/requireAuth';
import { authenticateUser, registerUser } from './authService';
import { serializeUser } from './serializeUser';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function setAuthCookie(res: Response, token: string, deps: AppDeps): void {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: deps.cookieSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_MS,
  });
}

export function createAuthRouter(deps: AppDeps): Router {
  const router = Router();

  router.post(
    '/register',
    asyncHandler(async (req, res) => {
      const user = await registerUser(deps, req.body);
      const token = signAccessToken(user.id, deps.jwtSecret);
      setAuthCookie(res, token, deps);
      res.status(201).json({ user: serializeUser(user) });
    }),
  );

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const user = await authenticateUser(deps, req.body);
      const token = signAccessToken(user.id, deps.jwtSecret);
      setAuthCookie(res, token, deps);
      res.json({ user: serializeUser(user) });
    }),
  );

  router.post('/logout', (_req, res) => {
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure: deps.cookieSecure,
      sameSite: 'lax',
      path: '/',
    });
    res.status(204).send();
  });

  router.get(
    '/me',
    requireAuth(deps),
    asyncHandler(async (req, res) => {
      res.json({ user: serializeUser(req.user) });
    }),
  );

  return router;
}
