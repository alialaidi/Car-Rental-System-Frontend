import { useCallback, useEffect, useState } from 'react';
import { reservationsApi } from '../api/reservationsApi';
import type { ReservationPage } from '../model/reservation';

export function useMyReservations(page: number, pageSize: number) {
  const [data, setData] = useState<ReservationPage | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((current) => current + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void reservationsApi
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
  }, [page, pageSize, version]);
  return { data, error, loading, refresh };
}
