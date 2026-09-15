import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from './asyncHandler';

describe('asyncHandler', () => {
  it('forwards rejected promises to next', async () => {
    const err = new Error('nope');
    const next = vi.fn() as NextFunction;
    const handler = asyncHandler(async () => {
      throw err;
    });
    handler({} as Request, {} as Response, next);
    await vi.waitFor(() => {
      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
