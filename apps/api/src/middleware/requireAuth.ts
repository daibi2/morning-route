import type { RequestHandler } from 'express';
import type { AppDeps } from '../config';
import { publicUserSelect } from '../auth/userTypes';
import { HttpError } from '../lib/httpError';
import { verifyAccessToken } from '../lib/jwt';

export function requireAuth(deps: Pick<AppDeps, 'prisma' | 'jwtSecret'>): RequestHandler {
  return (req, _res, next) => {
    const token = req.cookies?.accessToken;
    if (typeof token !== 'string' || token.length === 0) {
      next(HttpError.unauthorized());
      return;
    }

    void (async () => {
      try {
        const payload = verifyAccessToken(token, deps.jwtSecret);
        const user = await deps.prisma.user.findUnique({
          where: { id: payload.sub },
          select: publicUserSelect,
        });
        if (!user) {
          throw HttpError.unauthorized();
        }
        req.user = user;
        next();
      } catch (err) {
        next(err instanceof HttpError ? err : HttpError.unauthorized());
      }
    })();
  };
}
