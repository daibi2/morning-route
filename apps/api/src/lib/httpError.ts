import { ERROR_CODES, type ErrorCode } from '@morning-route/shared';

export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;

  constructor(status: number, code: ErrorCode, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }

  static validation(message: string): HttpError {
    return new HttpError(400, ERROR_CODES.VALIDATION_ERROR, message);
  }

  static unauthorized(message = '未登录'): HttpError {
    return new HttpError(401, ERROR_CODES.UNAUTHORIZED, message);
  }

  static conflict(message: string): HttpError {
    return new HttpError(409, ERROR_CODES.CONFLICT, message);
  }

  static notFound(message: string): HttpError {
    return new HttpError(404, ERROR_CODES.NOT_FOUND, message);
  }
}
