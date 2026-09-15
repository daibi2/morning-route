import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEMO_EMAIL, DEMO_HABIT_TITLES, DEMO_PASSWORD } from '../apps/api/src/seed/demoConstants';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, passwordHash },
  });
  for (const [index, title] of DEMO_HABIT_TITLES.entries()) {
    const existing = await prisma.habit.findFirst({
      where: { userId: user.id, title },
    });
    if (!existing) {
      await prisma.habit.create({
        data: { userId: user.id, title, sortOrder: index },
      });
    }
  }
  console.log(`Seeded ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
