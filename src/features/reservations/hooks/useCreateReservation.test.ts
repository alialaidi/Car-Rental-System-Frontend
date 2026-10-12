import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createRequest } = vi.hoisted(() => ({ createRequest: vi.fn() }));
vi.mock('../api/reservationsApi', () => ({ reservationsApi: { create: createRequest } }));

import { useCreateReservation } from './useCreateReservation';

describe('useCreateReservation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('prevents a duplicate request while submission is in progress', async () => {
    let resolveRequest: (value: never) => void = () => undefined;
    createRequest.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const { result } = renderHook(() => useCreateReservation());
    const input = {
      vehicleId: 4,
      pickupBranchId: 1,
      returnBranchId: 1,
      pickupDateTime: '2030-03-12T09:00:00Z',
      expectedReturnDateTime: '2030-03-13T09:00:00Z',
    };
    let first: Promise<unknown> = Promise.resolve();
    await act(async () => {
      first = result.current.create(input);
      expect(await result.current.create(input)).toBeNull();
      resolveRequest({ reservationId: 4 } as never);
      await first;
    });
    expect(createRequest).toHaveBeenCalledTimes(1);
  });
});
