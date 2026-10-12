import { useEffect, useState } from 'react';
import { paymentsApi } from '../api/paymentsApi';
import type { Payment } from '../model/payment';

export function useMyPayments() {
  const [data, setData] = useState<Payment[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    void paymentsApi
      .listMine(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);
  return { data, error, loading };
}
