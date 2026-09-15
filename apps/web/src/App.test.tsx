import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the morning habit heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '晨间习惯' })).toBeInTheDocument();
  });
});
