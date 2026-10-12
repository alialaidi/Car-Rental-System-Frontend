import { useEffect, useState } from 'react';
import { paymentsApi } from '../api/paymentsApi';
import type { ContractBalance, Payment } from '../model/payment';

export function useContractBalance(contractId: number) {
  const [balance, setBalance] = useState<ContractBalance | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (contractId <= 0) {
      setLoading(false);
      setError(new Error('Contract id must be positive.'));
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void Promise.all([
      paymentsApi.getBalance(contractId, controller.signal),
      paymentsApi.listByContract(contractId, controller.signal),
    ])
      .then(([nextBalance, nextPayments]) => {
        if (!controller.signal.aborted) {
          setBalance(nextBalance);
          setPayments(nextPayments);
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [contractId]);
  return { balance, payments, error, loading };
}
