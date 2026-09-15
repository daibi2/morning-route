import jwt from 'jsonwebtoken';
import { HttpError } from './httpError';

export type AccessTokenPayload = {
  sub: string;
};

export function signAccessToken(userId: string, secret: string): string {
  return jwt.sign({ sub: userId } satisfies AccessTokenPayload, secret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string, secret: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== 'object' || decoded === null || typeof decoded.sub !== 'string') {
      throw HttpError.unauthorized();
    }
    return { sub: decoded.sub };
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    }
    throw HttpError.unauthorized();
  }
}
