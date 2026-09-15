import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { AppDeps } from '../config';
import { HttpError } from '../lib/httpError';
import { publicUserSelect, type PublicUserRecord, type UserWithPassword } from './userTypes';

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export function parseCredentials(body: unknown): Credentials {
  const parsed = credentialsSchema.safeParse(body);
  if (!parsed.success) {
    throw HttpError.validation('请提供有效邮箱，且密码至少 8 位');
  }
  return {
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  };
}

export async function registerUser(
  deps: Pick<AppDeps, 'prisma' | 'bcryptRounds'>,
  body: unknown,
): Promise<PublicUserRecord> {
  const creds = parseCredentials(body);
  const passwordHash = await bcrypt.hash(creds.password, deps.bcryptRounds);
  try {
    return await deps.prisma.user.create({
      data: { email: creds.email, passwordHash },
      select: publicUserSelect,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw HttpError.conflict('该邮箱已注册');
    }
    throw err;
  }
}

export async function authenticateUser(
  deps: Pick<AppDeps, 'prisma'>,
  body: unknown,
): Promise<PublicUserRecord> {
  const creds = parseCredentials(body);
  const user: UserWithPassword | null = await deps.prisma.user.findUnique({
    where: { email: creds.email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    throw HttpError.unauthorized('邮箱或密码错误');
  }
  const ok = await bcrypt.compare(creds.password, user.passwordHash);
  if (!ok) {
    throw HttpError.unauthorized('邮箱或密码错误');
  }
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
