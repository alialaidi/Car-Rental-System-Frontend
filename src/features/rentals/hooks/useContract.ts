import { useEffect, useState } from 'react';
import { contractsApi } from '../api/contractsApi';
import type { RentalContract } from '../model/contract';

export function useContract(id: number) {
  const [data, setData] = useState<RentalContract | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id <= 0) {
      setLoading(false);
      setError(new Error('Contract id must be positive.'));
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void contractsApi
      .getById(id, controller.signal)
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
  }, [id]);
  return { data, error, loading };
}
