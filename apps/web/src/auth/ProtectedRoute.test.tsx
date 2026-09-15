import type { PublicUser } from '@morning-route/shared';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute';

const authState: {
  user: PublicUser | null;
  loading: boolean;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
} = {
  user: null,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

vi.mock('./AuthContext', () => ({
  useAuth: () => authState,
}));

const sampleUser: PublicUser = {
  id: '1',
  email: 'a@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('route gates', () => {
  it('sends guests to login', () => {
    authState.user = null;
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>首页秘密</p>} />
          </Route>
          <Route path="/login" element={<p>登录页</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('登录页')).toBeInTheDocument();
  });

  it('sends signed-in users away from guest pages', () => {
    authState.user = sampleUser;
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<p>登录页</p>} />
          </Route>
          <Route path="/" element={<p>首页</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('首页')).toBeInTheDocument();
  });
});
