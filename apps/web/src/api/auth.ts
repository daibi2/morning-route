import type { PublicUser } from '@morning-route/shared';
import { apiRequest } from './client';

export type AuthResponse = { user: PublicUser };

export function fetchMe(): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/me');
}

export function register(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return apiRequest<void>('/api/auth/logout', { method: 'POST' });
}
