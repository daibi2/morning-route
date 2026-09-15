import type { PublicUser } from '@morning-route/shared';
import type { PublicUserRecord } from './userTypes';

export function serializeUser(user: PublicUserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
