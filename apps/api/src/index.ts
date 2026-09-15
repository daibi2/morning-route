import 'dotenv/config';
import { createApp } from './app';
import { loadConfig } from './config';
import { prisma } from './lib/prisma';

const port = Number(process.env.PORT ?? 3001);

async function main(): Promise<void> {
  const app = createApp({ ...loadConfig(), prisma });
  app.listen(port, '127.0.0.1', () => {
    console.log(`api listening on http://127.0.0.1:${port}`);
  });
}

main().catch(async (err: unknown) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
