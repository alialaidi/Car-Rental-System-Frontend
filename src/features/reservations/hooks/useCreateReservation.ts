import { useRef, useState } from 'react';
import { reservationsApi } from '../api/reservationsApi';
import type { CreateReservationInput, Reservation } from '../model/reservation';

export function useCreateReservation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const inFlight = useRef(false);
  const create = async (input: CreateReservationInput) => {
    if (inFlight.current) return null;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const result = await reservationsApi.create(input);
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
  return { create, loading, error, reservation };
}
