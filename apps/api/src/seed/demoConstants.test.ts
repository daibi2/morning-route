import { describe, expect, it } from 'vitest';
import { DEMO_EMAIL, DEMO_HABIT_TITLES, DEMO_PASSWORD } from './demoConstants';

describe('demo seed constants', () => {
  it('defines a demo login and three morning habits', () => {
    expect(DEMO_EMAIL).toContain('@');
    expect(DEMO_PASSWORD.length).toBeGreaterThanOrEqual(8);
    expect(DEMO_HABIT_TITLES).toHaveLength(3);
  });
});
