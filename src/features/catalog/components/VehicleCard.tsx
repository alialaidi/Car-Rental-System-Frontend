import { Link } from 'react-router-dom';
import type { VehicleListItem } from '../model/vehicle';
import { formatDailyPrice } from '../searchParams';
import { StatusBadge } from '../../../shared/ui';
import styles from './catalog.module.css';

export function VehicleCard({ vehicle }: { vehicle: VehicleListItem }) {
  const title = [vehicle.year, vehicle.make, vehicle.model].join(' ');
  return (
    <article className={styles.card}>
      <Link
        className={styles.imageLink}
        to={'/vehicles/' + vehicle.vehicleId}
        aria-label={'View details for ' + title}
      >
        {vehicle.primaryImageUrl ? (
          <img src={vehicle.primaryImageUrl} alt={title} loading="lazy" />
        ) : (
          <span className={styles.imageFallback}>Vehicle image unavailable</span>
        )}
      </Link>
      <div className={styles.cardBody}>
        <div className={styles.cardHeading}>
          <h2>
            <Link to={'/vehicles/' + vehicle.vehicleId}>{title}</Link>
          </h2>
          <StatusBadge status={vehicle.status} />
        </div>
        <p>
          {vehicle.categoryName} · {vehicle.transmissionTypeName} · {vehicle.seatsCount} seats
        </p>
        <p>{vehicle.fuelTypeName}</p>
        <strong>{formatDailyPrice(vehicle.dailyPrice)} / day</strong>
      </div>
    </article>
  );
}
