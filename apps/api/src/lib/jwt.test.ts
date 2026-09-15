import { describe, expect, it } from 'vitest';
import { HttpError } from './httpError';
import { signAccessToken, verifyAccessToken } from './jwt';

describe('jwt helpers', () => {
  const secret = 'jwt-test-secret';

  it('round-trips a user id', () => {
    const token = signAccessToken('user_1', secret);
    expect(verifyAccessToken(token, secret)).toEqual({ sub: 'user_1' });
  });

  it('rejects tokens signed with the wrong secret', () => {
    const token = signAccessToken('user_1', secret);
    expect(() => verifyAccessToken(token, 'other')).toThrow(HttpError);
  });
});
