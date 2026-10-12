import { useNavigate } from 'react-router-dom';
import { Alert } from '../../../shared/ui';
import { useCreateReservation } from '../hooks/useCreateReservation';
import { ReservationForm } from '../components/ReservationForm';

export function NewReservationPage() {
  const navigate = useNavigate();
  const mutation = useCreateReservation();
  const submit = async (input: Parameters<typeof mutation.create>[0]) => {
    const reservation = await mutation.create(input);
    if (reservation)
      navigate('/reservations/' + reservation.reservationId, { state: { created: true } });
  };
  return (
    <>
      <Alert title="Reservation details" variant="info">
        Availability and driving licence checks are confirmed by the rental service when you submit.
      </Alert>
      <ReservationForm error={mutation.error} loading={mutation.loading} onSubmit={submit} />
    </>
  );
}
