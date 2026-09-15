import { describe, expect, it } from 'vitest';

describe('test setup', () => {
  it('provides ResizeObserver for Recharts', () => {
    expect(typeof ResizeObserver).toBe('function');
  });
});
