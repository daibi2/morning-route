import { afterEach, describe, expect, it } from 'vitest';
import { HttpError } from '../lib/httpError';
import { authenticateUser, parseCredentials, registerUser } from './authService';
import { createTestDeps } from '../test/createTestApp';
import type { AppDeps } from '../config';

describe('parseCredentials', () => {
  it('normalizes email and rejects short passwords', () => {
    expect(parseCredentials({ email: '  A@Example.COM ', password: 'password1' })).toEqual({
      email: 'a@example.com',
      password: 'password1',
    });
    expect(() => parseCredentials({ email: 'nope', password: 'password1' })).toThrow(HttpError);
    expect(() => parseCredentials({ email: 'a@example.com', password: 'short' })).toThrow(
      HttpError,
    );
  });
});

describe('registerUser / authenticateUser', () => {
  let deps: (AppDeps & { cleanup: () => Promise<void> }) | undefined;

  afterEach(async () => {
    await deps?.cleanup();
    deps = undefined;
  });

  it('hashes passwords and authenticates against Prisma User rows', async () => {
    deps = await createTestDeps();
    const created = await registerUser(deps, {
      email: 'unit@example.com',
      password: 'password1',
    });
    expect(created.email).toBe('unit@example.com');
    const authed = await authenticateUser(deps, {
      email: 'unit@example.com',
      password: 'password1',
    });
    expect(authed.id).toBe(created.id);
    await expect(
      authenticateUser(deps, { email: 'unit@example.com', password: 'wrongpass' }),
    ).rejects.toBeInstanceOf(HttpError);
  });
});
