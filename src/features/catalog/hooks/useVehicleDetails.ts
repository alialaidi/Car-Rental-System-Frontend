import { useEffect, useState } from 'react';
import { catalogApi } from '../api/catalogApi';
import type { VehicleDetails } from '../model/vehicle';

export function useVehicleDetails(vehicleId: number) {
  const [data, setData] = useState<VehicleDetails | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (vehicleId <= 0) {
      setLoading(false);
      setError(new Error('Vehicle id must be positive.'));
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void catalogApi
      .getById(vehicleId, controller.signal)
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
  }, [vehicleId, attempt]);
  return { data, error, loading, retry: () => setAttempt((value) => value + 1) };
}
