import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../../shared/ui';
import { formatDateTime } from '../../../shared/lib/formatDateTime';
import { formatMoney } from '../../../shared/lib/money';
import { useMyPayments } from '../hooks/useMyPayments';
import styles from '../../rentals/components/rentals.module.css';

export function MyPaymentsPage() {
  const query = useMyPayments();
  return (
    <>
      <PageHeader
        title="My payments"
        description="See payments recorded against your rental contracts."
      />
      {query.loading ? <LoadingState label="Loading payments" /> : null}
      {!query.loading && query.error ? <ErrorState error={query.error} /> : null}
      {!query.loading && !query.error && query.data?.length === 0 ? (
        <EmptyState
          title="No payments recorded"
          description="Payments will appear here after they are recorded by the branch."
          action={<Link to="/rentals">View my rentals</Link>}
        />
      ) : null}
      {query.data?.length ? (
        <div className={styles.list}>
          {query.data.map((payment) => (
            <article className={styles.item} key={payment.paymentId}>
              <div className={styles.itemHeader}>
                <h2>{formatMoney(payment.amount)}</h2>
                <StatusBadge status={payment.status} />
              </div>
              <p>
                <Link to={'/rentals/' + payment.contractId}>Contract #{payment.contractId}</Link> ·{' '}
                {payment.method}
              </p>
              <p>
                {formatDateTime(payment.paymentDateUtc)} · Reference:{' '}
                {payment.transactionReference || '—'}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}
