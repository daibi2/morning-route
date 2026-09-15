import type { PublicUserRecord } from '../auth/userTypes';

declare global {
  namespace Express {
    interface Request {
      user: PublicUserRecord;
    }
  }
}

export {};
