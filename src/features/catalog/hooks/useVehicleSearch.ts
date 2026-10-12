import { useEffect, useState } from 'react';
import { catalogApi } from '../api/catalogApi';
import type { VehicleSearchCriteria, VehicleSearchResult } from '../model/vehicle';

export function useVehicleSearch(criteria: VehicleSearchCriteria) {
  const [data, setData] = useState<VehicleSearchResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify(criteria);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void catalogApi
      .search(JSON.parse(key) as VehicleSearchCriteria, controller.signal)
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
  }, [key, attempt]);
  return { data, error, loading, retry: () => setAttempt((value) => value + 1) };
}
