import { useRef, useState } from 'react';
import { reservationsApi } from '../api/reservationsApi';
import type { Reservation } from '../model/reservation';

export function useCancelReservation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const inFlight = useRef(false);
  const cancel = async (id: number) => {
    if (inFlight.current) return null;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const result = await reservationsApi.cancel(id);
      setReservation(result);
      return result;
    } catch (reason) {
      setError(reason);
      return null;
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };
  return { cancel, loading, error, reservation };
}
