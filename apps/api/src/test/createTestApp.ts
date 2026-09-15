import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { createApp } from '../app';
import type { AppDeps } from '../config';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

export async function createTestDeps(): Promise<AppDeps & { cleanup: () => Promise<void> }> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'morning-route-'));
  const dbPath = path.join(dir, 'test.db');
  const databaseUrl = `file:${dbPath}`;
  execFileSync('npx', ['prisma', 'migrate', 'deploy', '--schema', 'prisma/schema.prisma'], {
    cwd: repoRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  return {
    prisma,
    jwtSecret: 'test-jwt-secret',
    cookieSecure: false,
    webOrigin: 'http://localhost:5173',
    bcryptRounds: 4,
    cleanup: async () => {
      await prisma.$disconnect();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

export async function createTestClient(): Promise<{
  agent: ReturnType<typeof request.agent>;
  deps: AppDeps;
  cleanup: () => Promise<void>;
}> {
  const deps = await createTestDeps();
  const agent = request.agent(createApp(deps));
  return { agent, deps, cleanup: deps.cleanup };
}
