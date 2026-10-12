import { Link, useSearchParams } from 'react-router-dom';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
  StatusBadge,
} from '../../../shared/ui';
import { formatDateTime } from '../../../shared/lib/formatDateTime';
import { useMyContracts } from '../hooks/useMyContracts';
import styles from '../components/rentals.module.css';

export function MyRentalsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize')) || 10));
  const query = useMyContracts(page, pageSize);
  const active = query.data?.items.filter((contract) => contract.status === 'Active') ?? [];
  const other = query.data?.items.filter((contract) => contract.status !== 'Active') ?? [];
  return (
    <>
      <PageHeader title="My rentals" description="View current and previous rental contracts." />
      {query.loading ? <LoadingState label="Loading rentals" /> : null}
      {!query.loading && query.error ? <ErrorState error={query.error} /> : null}
      {!query.loading && !query.error && query.data?.items.length === 0 ? (
        <EmptyState
          title="No rentals yet"
          description="Confirmed reservations become rentals when the branch prepares your contract."
          action={<Link to="/reservations">View reservations</Link>}
        />
      ) : null}
      {!query.loading && !query.error && query.data?.items.length ? (
        <>
          <div className={styles.list}>
            {active.map((contract) => (
              <RentalCard contract={contract} key={contract.contractId} current />
            ))}
            {other.map((contract) => (
              <RentalCard contract={contract} key={contract.contractId} />
            ))}
          </div>
          <Pagination
            page={query.data.page}
            pageSize={query.data.pageSize}
            totalCount={query.data.totalCount}
            onPageChange={(next) => setParams({ page: String(next), pageSize: String(pageSize) })}
            onPageSizeChange={(size) =>
              setParams({ page: '1', pageSize: String(Math.min(100, size)) })
            }
          />
        </>
      ) : null}
    </>
  );
}

function RentalCard({
  contract,
  current = false,
}: {
  contract: import('../model/contract').RentalContract;
  current?: boolean;
}) {
  return (
    <article className={[styles.item, current ? styles.active : ''].join(' ')}>
      {current ? <div className={styles.current}>Current rental</div> : null}
      <div className={styles.itemHeader}>
        <h2>
          <Link to={'/rentals/' + contract.contractId}>{contract.contractNumber}</Link>
        </h2>
        <StatusBadge status={contract.status} />
      </div>
      <p>
        Vehicle #{contract.vehicleId} · Pickup branch #{contract.pickupBranchId}
      </p>
      <p>
        Picked up {formatDateTime(contract.actualPickupDateUtc)} · {contract.rentalDays} rental days
      </p>
    </article>
  );
}
