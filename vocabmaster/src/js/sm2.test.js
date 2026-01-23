import { describe, it, expect } from 'vitest';
import { calculateEasiness, calculateInterval } from './sm2.js';

describe('sm2', () => {
  it('clamps easiness factor to minimum', () => {
    const result = calculateEasiness(1.3, 0);
    expect(result).toBeGreaterThanOrEqual(1.3);
  });

  it('calculates interval progression for successful reviews', () => {
    expect(calculateInterval(2, 0, 0, 2.5)).toBe(1);
    expect(calculateInterval(2, 1, 1, 2.5)).toBe(6);
    expect(calculateInterval(2, 2, 6, 2.5)).toBe(Math.round(6 * 2.5));
  });

  it('resets interval for failed reviews', () => {
    expect(calculateInterval(1, 0, 10, 2.5)).toBe(1);
  });
});
