import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app';

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const prisma = new PrismaClient();
    const res = await request(
      createApp({
        prisma,
        jwtSecret: 'health-test',
        cookieSecure: false,
        webOrigin: 'http://localhost:5173',
        bcryptRounds: 4,
      }),
    ).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    await prisma.$disconnect();
  });
});
