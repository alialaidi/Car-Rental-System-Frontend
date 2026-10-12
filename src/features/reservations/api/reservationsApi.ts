import { httpClient } from '../../../shared/api/httpClient';
import type { PagedResult } from '../../../shared/api/paging';
import type { CreateReservationInput, Reservation, ReservationPage } from '../model/reservation';

interface ReservationDto extends Omit<
  Reservation,
  'pickupDateTimeUtc' | 'expectedReturnDateTimeUtc' | 'createdAtUtc'
> {
  pickupDateTimeUtc: string;
  expectedReturnDateTimeUtc: string;
  createdAtUtc: string;
}
function mapReservation(dto: ReservationDto): Reservation {
  return {
    ...dto,
    pickupDateTimeUtc: new Date(dto.pickupDateTimeUtc),
    expectedReturnDateTimeUtc: new Date(dto.expectedReturnDateTimeUtc),
    createdAtUtc: new Date(dto.createdAtUtc),
  };
}

export const reservationsApi = {
  async create(input: CreateReservationInput): Promise<Reservation> {
    const result = await httpClient.post<ReservationDto>('/api/reservations', input);
    return mapReservation(result);
  },
  async listMine(page: number, pageSize: number, signal?: AbortSignal): Promise<ReservationPage> {
    const result = await httpClient.get<PagedResult<ReservationDto>>('/api/reservations', {
      query: { page, pageSize: Math.min(100, Math.max(1, pageSize)) },
      signal,
    });
    return { ...result, items: result.items.map(mapReservation) };
  },
  async getById(reservationId: number, signal?: AbortSignal): Promise<Reservation> {
    return mapReservation(
      await httpClient.get<ReservationDto>('/api/reservations/' + reservationId, { signal }),
    );
  },
  async cancel(reservationId: number): Promise<Reservation> {
    return mapReservation(
      await httpClient.post<ReservationDto>('/api/reservations/' + reservationId + '/cancel'),
    );
  },
};
