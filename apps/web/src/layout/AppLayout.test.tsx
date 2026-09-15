import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppLayout } from './AppLayout';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'nav@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('AppLayout', () => {
  it('renders Chinese navigation', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<p>内容</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('今日')).toBeInTheDocument();
    expect(screen.getByText('习惯')).toBeInTheDocument();
    expect(screen.getByText('统计')).toBeInTheDocument();
    expect(screen.getByText('nav@example.com')).toBeInTheDocument();
  });
});
