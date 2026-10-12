import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('../../../shared/api/httpClient', () => ({ httpClient: { get, post } }));

import { reservationsApi } from './reservationsApi';

const dto = {
  reservationId: 31,
  customerId: 9,
  vehicleId: 7,
  pickupBranchId: 2,
  returnBranchId: 3,
  pickupDateTimeUtc: '2030-03-12T09:00:00Z',
  expectedReturnDateTimeUtc: '2030-03-14T09:00:00Z',
  status: 'Pending' as const,
  createdAtUtc: '2030-03-01T10:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('reservations API adapter', () => {
  it('maps server UTC date strings to Date values', async () => {
    get.mockResolvedValueOnce({ items: [dto], page: 1, pageSize: 10, totalCount: 1 });
    const result = await reservationsApi.listMine(1, 10);
    expect(result.items[0].pickupDateTimeUtc).toBeInstanceOf(Date);
    expect(get).toHaveBeenCalledWith(
      '/api/reservations',
      expect.objectContaining({ query: { page: 1, pageSize: 10 } }),
    );
  });

  it('sends only the reservation fields and never a customer id', async () => {
    post.mockResolvedValueOnce(dto);
    const input = {
      vehicleId: 7,
      pickupBranchId: 2,
      returnBranchId: 3,
      pickupDateTime: dto.pickupDateTimeUtc,
      expectedReturnDateTime: dto.expectedReturnDateTimeUtc,
    };
    const created = await reservationsApi.create(input);
    expect(post).toHaveBeenCalledWith('/api/reservations', input);
    expect(post.mock.calls[0][1]).not.toHaveProperty('customerId');
    expect(created.status).toBe('Pending');
  });
});
