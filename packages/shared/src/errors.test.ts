import { describe, expect, it } from 'vitest';
import { apiError, ERROR_CODES } from './errors';

describe('apiError', () => {
  it('wraps code and message in the locked error shape', () => {
    expect(apiError(ERROR_CODES.VALIDATION_ERROR, '无效邮箱')).toEqual({
      error: { code: 'VALIDATION_ERROR', message: '无效邮箱' },
    });
  });
});
