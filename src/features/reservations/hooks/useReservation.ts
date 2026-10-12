import { useEffect, useState } from 'react';
import { reservationsApi } from '../api/reservationsApi';
import type { Reservation } from '../model/reservation';

export function useReservation(id: number) {
  const [data, setData] = useState<Reservation | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void reservationsApi
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
  }, [id, version]);
  return { data, error, loading, refresh: () => setVersion((current) => current + 1) };
}
