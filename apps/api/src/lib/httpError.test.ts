import { describe, expect, it } from 'vitest';
import { ERROR_CODES } from '@morning-route/shared';
import { HttpError } from './httpError';

describe('HttpError', () => {
  it('stores status, code, and message', () => {
    const err = HttpError.validation('标题不能为空');
    expect(err.status).toBe(400);
    expect(err.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(err.message).toBe('标题不能为空');
  });
});
