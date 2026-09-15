import type { ApiErrorBody, ErrorCode } from '@morning-route/shared';

export class ApiClientError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) {
    return false;
  }
  const error = value.error;
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  return (
    'code' in error &&
    'message' in error &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  );
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const json: unknown = await res.json();
  if (!res.ok) {
    if (isApiErrorBody(json)) {
      throw new ApiClientError(json.error.code, json.error.message);
    }
    throw new ApiClientError('INTERNAL_ERROR', '请求失败');
  }
  return json as T;
}
