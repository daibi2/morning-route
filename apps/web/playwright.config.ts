import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(webRoot, '../..');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  timeout: 120_000,
  webServer: [
    {
      command:
        'npx prisma migrate deploy --schema prisma/schema.prisma && npm run start -w apps/api',
      cwd: repoRoot,
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        PORT: '3001',
        JWT_SECRET: process.env.JWT_SECRET ?? 'playwright-secret',
        DATABASE_URL: process.env.DATABASE_URL ?? 'file:./e2e.db',
        WEB_ORIGIN: 'http://127.0.0.1:5173',
        BCRYPT_ROUNDS: '4',
      },
    },
    {
      command: 'npm run dev -w apps/web',
      cwd: repoRoot,
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
