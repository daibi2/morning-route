import { Router } from 'express';
import type { AppDeps } from '../config';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/requireAuth';
import { createHabit, deleteHabit, listHabits, updateHabit } from './habitService';
import { serializeHabit } from './serializeHabit';

export function createHabitsRouter(deps: AppDeps): Router {
  const router = Router();
  router.use(requireAuth(deps));

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const includeArchived = req.query.includeArchived === 'true';
      const habits = await listHabits(deps.prisma, req.user.id, includeArchived);
      res.json({ habits: habits.map(serializeHabit) });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const habit = await createHabit(deps.prisma, req.user.id, req.body);
      res.status(201).json({ habit: serializeHabit(habit) });
    }),
  );

  router.patch(
    '/:id',
    asyncHandler(async (req, res) => {
      const habit = await updateHabit(deps.prisma, req.user.id, req.params.id, req.body);
      res.json({ habit: serializeHabit(habit) });
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      await deleteHabit(deps.prisma, req.user.id, req.params.id);
      res.status(204).send();
    }),
  );

  return router;
}
