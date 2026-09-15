import 'dotenv/config';
import { createApp } from './app';
import { prisma } from './lib/prisma';

const port = Number(process.env.PORT ?? 3001);

async function main(): Promise<void> {
  const app = createApp();
  app.listen(port, () => {
    console.log(`api listening on http://localhost:${port}`);
  });
}

main().catch(async (err: unknown) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
