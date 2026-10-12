import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  DateTimeField,
  ErrorState,
  LoadingState,
  PageHeader,
  TextField,
  Button,
} from '../../../shared/ui';
import { localDateTimeToUtc } from '../../../shared/lib/dateTime';
import { useVehicleDetails } from '../../catalog/hooks/useVehicleDetails';
import { formatDailyPrice } from '../../catalog/searchParams';
import type { CreateReservationInput } from '../model/reservation';
import styles from './reservations.module.css';

export function ReservationForm({
  loading,
  error,
  onSubmit,
}: {
  loading: boolean;
  error: unknown;
  onSubmit: (input: CreateReservationInput) => Promise<unknown>;
}) {
  const [params] = useSearchParams();
  const vehicleId = Number(params.get('vehicleId'));
  const validVehicleId = Number.isSafeInteger(vehicleId) && vehicleId > 0 ? vehicleId : -1;
  const vehicle = useVehicleDetails(validVehicleId);
  const [returnBranchId, setReturnBranchId] = useState('');
  const [pickup, setPickup] = useState('');
  const [returning, setReturning] = useState('');
  const [validation, setValidation] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidation('');
    const pickupDateTime = localDateTimeToUtc(pickup);
    const expectedReturnDateTime = localDateTimeToUtc(returning);
    if (
      !pickupDateTime ||
      !expectedReturnDateTime ||
      Date.parse(expectedReturnDateTime) <= Date.parse(pickupDateTime)
    ) {
      setValidation('Return time must be later than pickup time.');
      return;
    }
    if (!vehicle.data || Number(returnBranchId) <= 0) return;
    await onSubmit({
      vehicleId,
      pickupBranchId: vehicle.data.branchId,
      returnBranchId: Number(returnBranchId),
      pickupDateTime,
      expectedReturnDateTime,
    });
  };

  if (validVehicleId <= 0)
    return (
      <ErrorState
        error={new Error('Choose a vehicle from the catalog before starting a reservation.')}
        action={<Link to="/vehicles">Browse vehicles</Link>}
      />
    );
  if (vehicle.loading) return <LoadingState label="Loading selected vehicle" />;
  if (vehicle.error || !vehicle.data)
    return (
      <ErrorState
        error={vehicle.error ?? new Error('The selected vehicle could not be found.')}
        onRetry={vehicle.retry}
      />
    );
  const selected = vehicle.data;

  return (
    <>
      <PageHeader
        title="Reserve a vehicle"
        description={
          [selected.year, selected.make, selected.model].join(' ') +
          ' · ' +
          formatDailyPrice(selected.dailyPrice) +
          ' per day'
        }
      />
      <div className={styles.vehicleContext}>
        <span>Pickup branch</span>
        <strong>Branch #{selected.branchId}</strong>
        <small>The vehicle must be picked up from its current branch.</small>
      </div>
      {error ? <ErrorState error={error} /> : null}
      {validation ? (
        <div className={styles.inlineError} role="alert">
          {validation}
        </div>
      ) : null}
      <form className={styles.form} onSubmit={(event) => void submit(event)}>
        <TextField
          id="pickup-branch"
          label="Pickup branch"
          value={String(selected.branchId)}
          readOnly
        />
        <TextField
          id="return-branch"
          label="Return branch number"
          type="number"
          min="1"
          required
          value={returnBranchId}
          onChange={(event) => setReturnBranchId(event.currentTarget.value)}
        />
        <DateTimeField
          id="pickup-datetime"
          label="Pickup date and time"
          required
          value={pickup}
          onChange={(event) => setPickup(event.currentTarget.value)}
        />
        <DateTimeField
          id="return-datetime"
          label="Expected return date and time"
          required
          value={returning}
          onChange={(event) => setReturning(event.currentTarget.value)}
        />
        <Button disabled={loading} type="submit">
          {loading ? 'Submitting reservation…' : 'Submit reservation'}
        </Button>
      </form>
    </>
  );
}
