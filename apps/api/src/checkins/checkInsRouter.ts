import { Router } from 'express';
import type { AppDeps } from '../config';
import { asyncHandler } from '../lib/asyncHandler';
import { HttpError } from '../lib/httpError';
import { requireAuth } from '../middleware/requireAuth';
import { getHabitStats, removeCheckIn, upsertCheckIn } from './checkInService';
import { serializeCheckIn } from './serializeCheckIn';

export function createCheckInsRouter(deps: AppDeps): Router {
  const router = Router();
  router.use(requireAuth(deps));

  router.put(
    '/:id/check-ins/:localDate',
    asyncHandler(async (req, res) => {
      const row = await upsertCheckIn(
        deps.prisma,
        req.user.id,
        req.params.id,
        req.params.localDate,
      );
      res.json({ checkIn: serializeCheckIn(row) });
    }),
  );

  router.delete(
    '/:id/check-ins/:localDate',
    asyncHandler(async (req, res) => {
      await removeCheckIn(deps.prisma, req.user.id, req.params.id, req.params.localDate);
      res.status(204).send();
    }),
  );

  router.get(
    '/:id/stats',
    asyncHandler(async (req, res) => {
      const localDate = req.query.localDate;
      if (typeof localDate !== 'string') {
        throw HttpError.validation('请提供 localDate');
      }
      const stats = await getHabitStats(deps.prisma, req.user.id, req.params.id, localDate);
      res.json(stats);
    }),
  );

  return router;
}
