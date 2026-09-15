import { apiError, ERROR_CODES } from '@morning-route/shared';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/httpError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json(apiError(err.code, err.message));
    return;
  }

  console.error(err);
  res.status(500).json(apiError(ERROR_CODES.INTERNAL_ERROR, '服务器内部错误'));
}
