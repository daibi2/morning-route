import { Router } from 'express';
import type { AppDeps } from '../config';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { requireAuth } from '../middleware/requireAuth';
import { getOverview } from './statsService';

export function createStatsRouter(deps: AppDeps): Router {
  const router = Router();
  router.use(requireAuth(deps));

  router.get(
    '/overview',
    asyncHandler(async (req, res) => {
      const localDate = req.query.localDate;
      if (typeof localDate !== 'string') {
        throw HttpError.validation('请提供 localDate');
      }
      const overview = await getOverview(deps.prisma, req.user.id, localDate);
      res.json(overview);
    }),
  );

  return router;
}
