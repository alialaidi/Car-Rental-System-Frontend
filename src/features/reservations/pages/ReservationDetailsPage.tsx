import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from '../../../shared/ui';
import { ApiError } from '../../../shared/api/apiError';
import { formatDateTime } from '../../../shared/lib/formatDateTime';
import { useCancelReservation } from '../hooks/useCancelReservation';
import { useReservation } from '../hooks/useReservation';
import styles from '../components/reservations.module.css';

export function ReservationDetailsPage() {
  const { reservationId: rawId } = useParams();
  const id = Number(rawId);
  const validId = Number.isSafeInteger(id) && id > 0 ? id : -1;
  const query = useReservation(validId);
  const cancel = useCancelReservation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const location = useLocation();
  if (validId <= 0)
    return (
      <EmptyState title="Reservation not found" description="This reservation link is invalid." />
    );
  if (query.loading) return <LoadingState label="Loading reservation" />;
  if (query.error) {
    if (query.error instanceof ApiError && query.error.status === 404)
      return (
        <EmptyState
          title="Reservation not found"
          description="It may have been removed or does not belong to your account."
        />
      );
    return <ErrorState error={query.error} onRetry={query.refresh} />;
  }
  if (!query.data) return <EmptyState title="Reservation not found" />;
  const reservation = query.data;
  const cancelErrorMessage =
    cancel.error instanceof ApiError && cancel.error.status === 409
      ? 'This reservation can no longer be cancelled online. Please contact the branch.'
      : undefined;
  const confirmCancel = async () => {
    const result = await cancel.cancel(reservation.reservationId);
    setConfirmOpen(false);
    if (result) query.refresh();
  };
  return (
    <>
      <PageHeader
        title={'Reservation #' + reservation.reservationId}
        action={<StatusBadge status={reservation.status} />}
      />
      {(location.state as { created?: boolean } | null)?.created ? (
        <Alert title="Reservation submitted" variant="success">
          Your reservation request has been created and is pending branch review.
        </Alert>
      ) : null}
      {cancelErrorMessage ? (
        <Alert title="Cancellation unavailable" variant="error">
          {cancelErrorMessage}
        </Alert>
      ) : cancel.error ? (
        <ErrorState error={cancel.error} />
      ) : null}
      <dl className={styles.details}>
        <div>
          <dt>Vehicle</dt>
          <dd>
            <Link to={'/vehicles/' + reservation.vehicleId}>Vehicle #{reservation.vehicleId}</Link>
          </dd>
        </div>
        <div>
          <dt>Pickup branch</dt>
          <dd>Branch #{reservation.pickupBranchId}</dd>
        </div>
        <div>
          <dt>Return branch</dt>
          <dd>Branch #{reservation.returnBranchId}</dd>
        </div>
        <div>
          <dt>Pickup time</dt>
          <dd>{formatDateTime(reservation.pickupDateTimeUtc)}</dd>
        </div>
        <div>
          <dt>Expected return</dt>
          <dd>{formatDateTime(reservation.expectedReturnDateTimeUtc)}</dd>
        </div>
        <div>
          <dt>Submitted</dt>
          <dd>{formatDateTime(reservation.createdAtUtc)}</dd>
        </div>
      </dl>
      {reservation.status === 'Pending' ? (
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Cancel reservation
        </Button>
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        title="Cancel reservation?"
        description="This will cancel your pending reservation request."
        confirmLabel="Cancel reservation"
        confirming={cancel.loading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmCancel()}
      />
      <p>
        <Link to="/reservations">Back to my reservations</Link>
      </p>
    </>
  );
}
