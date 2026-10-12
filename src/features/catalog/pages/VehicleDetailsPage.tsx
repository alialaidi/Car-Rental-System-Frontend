import { Link, useParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../../shared/ui';
import { useVehicleDetails } from '../hooks/useVehicleDetails';
import { VehicleGallery } from '../components/VehicleGallery';
import { formatDailyPrice } from '../searchParams';
import styles from '../components/catalog.module.css';

export function VehicleDetailsPage() {
  const { vehicleId: rawId } = useParams();
  const vehicleId = Number(rawId);
  const query = useVehicleDetails(
    Number.isSafeInteger(vehicleId) && vehicleId > 0 ? vehicleId : -1,
  );
  if (!Number.isSafeInteger(vehicleId) || vehicleId <= 0)
    return <EmptyState title="Vehicle not found" description="The vehicle link is invalid." />;
  if (query.loading) return <LoadingState label="Loading vehicle details" />;
  if (query.error) return <ErrorState error={query.error} onRetry={query.retry} />;
  if (!query.data) return <EmptyState title="Vehicle not found" />;
  const vehicle = query.data;
  const title = [vehicle.year, vehicle.make, vehicle.model].join(' ');
  return (
    <>
      <PageHeader
        title={title}
        description={
          vehicle.categoryName + ' · ' + vehicle.fuelTypeName + ' · ' + vehicle.transmissionTypeName
        }
        action={<StatusBadge status={vehicle.status} />}
      />
      <VehicleGallery images={vehicle.images} title={title} />
      <dl className={styles.detailGrid}>
        <div>
          <dt>Daily price</dt>
          <dd>{formatDailyPrice(vehicle.dailyPrice)}</dd>
        </div>
        <div>
          <dt>Seats</dt>
          <dd>{vehicle.seatsCount}</dd>
        </div>
        <div>
          <dt>Branch number</dt>
          <dd>{vehicle.branchId}</dd>
        </div>
        <div>
          <dt>Current mileage</dt>
          <dd>{vehicle.currentMileage.toLocaleString()}</dd>
        </div>
      </dl>
      <p>
        <Link to={'/reservations/new?vehicleId=' + vehicle.vehicleId}>Reserve this vehicle</Link>
      </p>
    </>
  );
}
