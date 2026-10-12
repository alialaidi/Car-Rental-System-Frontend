import { describe, expect, it } from 'vitest';
import { localDateTimeToUtc, utcDateTimeToLocalInput } from './dateTime';

describe('date-time conversion', () => {
  it('converts local date-time input to an ISO UTC value', () => {
    expect(localDateTimeToUtc('2026-10-20T12:30')).toBe(new Date('2026-10-20T12:30').toISOString());
    expect(localDateTimeToUtc('')).toBeUndefined();
  });

  it('converts UTC wire dates to local date-time input', () => {
    expect(utcDateTimeToLocalInput('not-a-date')).toBe('');
    expect(utcDateTimeToLocalInput('2026-10-20T12:30:00Z')).toMatch(/^2026-10-20T/);
  });
});
