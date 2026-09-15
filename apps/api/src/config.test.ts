import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

describe('loadConfig', () => {
  it('reads jwt secret and cookie flags from the environment', () => {
    const prevSecret = process.env.JWT_SECRET;
    const prevEnv = process.env.NODE_ENV;
    process.env.JWT_SECRET = 'unit-secret';
    process.env.NODE_ENV = 'production';
    try {
      const config = loadConfig();
      expect(config.jwtSecret).toBe('unit-secret');
      expect(config.cookieSecure).toBe(true);
    } finally {
      process.env.JWT_SECRET = prevSecret;
      process.env.NODE_ENV = prevEnv;
    }
  });
});
