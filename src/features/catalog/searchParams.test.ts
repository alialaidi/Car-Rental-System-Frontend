import { describe, expect, it } from 'vitest';
import { formatDailyPrice, parseSearchParams, serializeSearchParams } from './searchParams';

describe('catalog search parameters', () => {
  it('ignores malformed values and caps page size at 100', () => {
    const criteria = parseSearchParams(
      new URLSearchParams('page=0&pageSize=500&categoryId=abc&minimumSeats=-2&sortBy=sql'),
    );
    expect(criteria.page).toBe(1);
    expect(criteria.pageSize).toBe(100);
    expect(criteria.categoryId).toBeUndefined();
    expect(criteria.minimumSeats).toBeUndefined();
    expect(criteria.sortBy).toBe('price');
  });

  it('preserves valid filters and formats the server price as currency', () => {
    const query = new URLSearchParams('categoryId=2&minimumDailyPrice=10.50&page=3');
    const criteria = parseSearchParams(query);
    expect(criteria.categoryId).toBe(2);
    expect(criteria.minimumDailyPrice).toBe(10.5);
    expect(parseSearchParams(serializeSearchParams(criteria))).toEqual(criteria);
    expect(formatDailyPrice(12.5, 'JOD')).toContain('12.50');
  });
});
