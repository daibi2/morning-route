import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/httpError';
import { errorHandler } from './errorHandler';

function mockRes(): Response {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response;
}

describe('errorHandler', () => {
  it('serializes HttpError into the locked error envelope', () => {
    const res = mockRes();
    errorHandler(HttpError.notFound('习惯不存在'), {} as Request, res, vi.fn() as NextFunction);
    expect(res.statusCode).toBe(404);
    expect((res as unknown as { body: unknown }).body).toEqual({
      error: { code: 'NOT_FOUND', message: '习惯不存在' },
    });
  });

  it('maps unexpected errors to INTERNAL_ERROR', () => {
    const res = mockRes();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    errorHandler(new Error('boom'), {} as Request, res, vi.fn() as NextFunction);
    expect(res.statusCode).toBe(500);
    expect((res as unknown as { body: unknown }).body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' },
    });
    spy.mockRestore();
  });
});
