import { beforeEach, describe, expect, it, vi } from 'vitest';
const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../../shared/api/httpClient', () => ({ httpClient: { get } }));
import { paymentsApi } from './paymentsApi';

beforeEach(() => vi.clearAllMocks());

describe('payments API adapter', () => {
  it('loads customer payments and maps the UTC date', async () => {
    get.mockResolvedValueOnce([
      {
        paymentId: 8,
        contractId: 5,
        customerId: 2,
        method: 'Cash',
        amount: 12.5,
        transactionReference: null,
        status: 'Paid',
        paymentDateUtc: '2030-01-03T00:00:00Z',
      },
    ]);
    const result = await paymentsApi.listMine();
    expect(get).toHaveBeenCalledWith('/api/payments/my', expect.any(Object));
    expect(result[0].paymentDateUtc).toBeInstanceOf(Date);
  });

  it('reads the server computed contract balance', async () => {
    get.mockResolvedValueOnce({
      contractId: 5,
      totalAmount: 40,
      paidAmount: 30,
      refundedAmount: 0,
      balance: 10,
    });
    const result = await paymentsApi.getBalance(5);
    expect(get).toHaveBeenCalledWith('/api/contracts/5/balance', expect.any(Object));
    expect(result.balance).toBe(10);
  });
});
