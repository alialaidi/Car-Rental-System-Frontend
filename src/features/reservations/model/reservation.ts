import type { PagedResult } from '../../../shared/api/paging';

export type ReservationStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled' | 'Completed';
export interface Reservation {
  reservationId: number;
  customerId: number;
  vehicleId: number;
  pickupBranchId: number;
  returnBranchId: number;
  pickupDateTimeUtc: Date;
  expectedReturnDateTimeUtc: Date;
  status: ReservationStatus;
  createdAtUtc: Date;
}
export interface CreateReservationInput {
  vehicleId: number;
  pickupBranchId: number;
  returnBranchId: number;
  pickupDateTime: string;
  expectedReturnDateTime: string;
}
export type ReservationPage = PagedResult<Reservation>;
