import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ error: { code: 'UNAUTHORIZED', message: '未登录' } }),
  }),
);

describe('App', () => {
  it('renders the login heading for guests', async () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(await screen.findByRole('heading', { name: '登录' })).toBeInTheDocument();
  });
});
