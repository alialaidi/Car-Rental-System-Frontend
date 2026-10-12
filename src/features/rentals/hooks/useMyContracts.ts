import { useEffect, useState } from 'react';
import { contractsApi } from '../api/contractsApi';
import type { ContractPage } from '../model/contract';

export function useMyContracts(page: number, pageSize: number) {
  const [data, setData] = useState<ContractPage | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void contractsApi
      .listMine(page, pageSize, controller.signal)
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
  }, [page, pageSize]);
  return { data, error, loading };
}
