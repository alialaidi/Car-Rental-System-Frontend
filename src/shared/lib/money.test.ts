import { describe, expect, it } from 'vitest';
import { formatMoney } from './money';

describe('money formatting', () => {
  it('formats server values as two-digit currency without recalculating totals', () => {
    expect(formatMoney(125.5, 'JOD')).toContain('125.50');
  });
});
