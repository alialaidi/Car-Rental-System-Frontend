import { beforeEach, describe, expect, it, vi } from 'vitest';
const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../../shared/api/httpClient', () => ({ httpClient: { get } }));
import { contractsApi } from './contractsApi';

beforeEach(() => vi.clearAllMocks());

describe('contracts API adapter', () => {
  it('uses the customer contract endpoint and maps UTC dates', async () => {
    get.mockResolvedValueOnce({
      items: [
        {
          contractId: 5,
          contractNumber: 'CR-5',
          customerId: 2,
          vehicleId: 3,
          employeeId: 1,
          actualPickupDateUtc: '2030-01-01T00:00:00Z',
          pickupMileage: 10,
          pickupFuelLevel: 'Full',
          conditionNotes: null,
          rentalDays: 2,
          basicRentalPrice: 10,
          discountAmount: 0,
          additionalFees: 0,
          fuelCharges: 0,
          damageCharges: 0,
          totalAmount: 10,
          status: 'Active',
          pickupBranchId: 1,
          actualReturnDateUtc: null,
          returnMileage: null,
          returnFuelLevel: null,
          reservationId: 4,
        },
      ],
      page: 1,
      pageSize: 10,
      totalCount: 1,
    });
    const result = await contractsApi.listMine(1, 10);
    expect(get).toHaveBeenCalledWith(
      '/api/contracts/my',
      expect.objectContaining({ query: { page: 1, pageSize: 10 } }),
    );
    expect(result.items[0].actualPickupDateUtc).toBeInstanceOf(Date);
    expect(result.items[0].actualReturnDateUtc).toBeNull();
  });
});
