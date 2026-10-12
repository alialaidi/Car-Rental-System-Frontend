import { httpClient } from '../../../shared/api/httpClient';
import type { ContractBalance, Payment } from '../model/payment';
type WirePayment = Omit<Payment, 'paymentDateUtc'> & { paymentDateUtc: string };
const mapPayment = (item: WirePayment): Payment => ({
  ...item,
  paymentDateUtc: new Date(item.paymentDateUtc),
});

export const paymentsApi = {
  async listMine(signal?: AbortSignal): Promise<Payment[]> {
    return (await httpClient.get<WirePayment[]>('/api/payments/my', { signal })).map(mapPayment);
  },
  async listByContract(id: number, signal?: AbortSignal): Promise<Payment[]> {
    return (
      await httpClient.get<WirePayment[]>('/api/contracts/' + id + '/payments', { signal })
    ).map(mapPayment);
  },
  getBalance(id: number, signal?: AbortSignal): Promise<ContractBalance> {
    return httpClient.get('/api/contracts/' + id + '/balance', { signal });
  },
};
