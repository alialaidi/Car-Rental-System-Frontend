import { Link, useSearchParams } from 'react-router-dom';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
  StatusBadge,
} from '../../../shared/ui';
import { useMyReservations } from '../hooks/useMyReservations';
import { formatDateTime } from '../../../shared/lib/formatDateTime';
import styles from '../components/reservations.module.css';

export function MyReservationsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize')) || 10));
  const query = useMyReservations(page, pageSize);
  return (
    <>
      <PageHeader
        title="My reservations"
        description="Review the status and schedule of your vehicle reservations."
      />
      {query.loading ? <LoadingState label="Loading reservations" /> : null}
      {!query.loading && query.error ? (
        <ErrorState error={query.error} onRetry={query.refresh} />
      ) : null}
      {!query.loading && !query.error && query.data?.items.length === 0 ? (
        <EmptyState
          title="You have no reservations yet"
          description="Browse the catalog to choose a vehicle."
          action={<Link to="/vehicles">Browse vehicles</Link>}
        />
      ) : null}
      {!query.loading && !query.error && query.data?.items.length ? (
        <>
          <div className={styles.list}>
            {query.data.items.map((reservation) => (
              <article className={styles.item} key={reservation.reservationId}>
                <div className={styles.itemHeader}>
                  <h2>
                    <Link to={'/reservations/' + reservation.reservationId}>
                      Reservation #{reservation.reservationId}
                    </Link>
                  </h2>
                  <StatusBadge status={reservation.status} />
                </div>
                <p>
                  Vehicle #{reservation.vehicleId} · Pickup branch #{reservation.pickupBranchId} ·
                  Return branch #{reservation.returnBranchId}
                </p>
                <p>
                  {formatDateTime(reservation.pickupDateTimeUtc)} –{' '}
                  {formatDateTime(reservation.expectedReturnDateTimeUtc)}
                </p>
              </article>
            ))}
          </div>
          <Pagination
            page={query.data.page}
            pageSize={query.data.pageSize}
            totalCount={query.data.totalCount}
            onPageChange={(next) => setParams({ page: String(next), pageSize: String(pageSize) })}
            onPageSizeChange={(size) =>
              setParams({ page: '1', pageSize: String(Math.min(size, 100)) })
            }
          />
        </>
      ) : null}
    </>
  );
}
