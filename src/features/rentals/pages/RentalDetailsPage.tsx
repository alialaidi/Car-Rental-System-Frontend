import { Link, useParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../../shared/ui';
import { ApiError } from '../../../shared/api/apiError';
import { formatDateTime } from '../../../shared/lib/formatDateTime';
import { formatMoney } from '../../../shared/lib/money';
import { useContract } from '../hooks/useContract';
import { useContractBalance } from '../../payments/hooks/useContractBalance';
import styles from '../components/rentals.module.css';

export function RentalDetailsPage() {
  const { contractId: rawId } = useParams();
  const parsed = Number(rawId);
  const id = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : -1;
  const query = useContract(id);
  const finances = useContractBalance(id);
  if (id <= 0)
    return <EmptyState title="Rental not found" description="This contract link is invalid." />;
  if (query.loading) return <LoadingState label="Loading contract" />;
  if (query.error) {
    if (query.error instanceof ApiError && query.error.status === 404)
      return (
        <EmptyState
          title="Rental not found"
          description="This contract is unavailable or does not belong to your account."
        />
      );
    return <ErrorState error={query.error} />;
  }
  if (!query.data) return <EmptyState title="Rental not found" />;
  const contract = query.data;
  return (
    <>
      <PageHeader
        title={contract.contractNumber}
        description={'Vehicle #' + contract.vehicleId}
        action={<StatusBadge status={contract.status} />}
      />
      <dl className={styles.details}>
        <div>
          <dt>Pickup date</dt>
          <dd>{formatDateTime(contract.actualPickupDateUtc)}</dd>
        </div>
        <div>
          <dt>Pickup mileage</dt>
          <dd>{contract.pickupMileage.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Pickup fuel</dt>
          <dd>{contract.pickupFuelLevel}</dd>
        </div>
        <div>
          <dt>Return date</dt>
          <dd>
            {contract.actualReturnDateUtc
              ? formatDateTime(contract.actualReturnDateUtc)
              : 'Not returned yet'}
          </dd>
        </div>
        <div>
          <dt>Return mileage</dt>
          <dd>{contract.returnMileage?.toLocaleString() ?? '—'}</dd>
        </div>
        <div>
          <dt>Return fuel</dt>
          <dd>{contract.returnFuelLevel ?? '—'}</dd>
        </div>
        <div>
          <dt>Rental days</dt>
          <dd>{contract.rentalDays}</dd>
        </div>
        <div>
          <dt>Basic rental</dt>
          <dd>{formatMoney(contract.basicRentalPrice)}</dd>
        </div>
        <div>
          <dt>Discount</dt>
          <dd>{formatMoney(contract.discountAmount)}</dd>
        </div>
        <div>
          <dt>Additional fees</dt>
          <dd>{formatMoney(contract.additionalFees)}</dd>
        </div>
        <div>
          <dt>Fuel charges</dt>
          <dd>{formatMoney(contract.fuelCharges)}</dd>
        </div>
        <div>
          <dt>Damage charges</dt>
          <dd>{formatMoney(contract.damageCharges)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatMoney(contract.totalAmount)}</dd>
        </div>
      </dl>
      {contract.conditionNotes ? <p>{contract.conditionNotes}</p> : null}
      <section aria-labelledby="balance-heading">
        <h2 id="balance-heading">Payments and balance</h2>
        {finances.loading ? <LoadingState label="Loading payments and balance" /> : null}
        {!finances.loading && finances.error ? <ErrorState error={finances.error} /> : null}
        {!finances.loading && finances.balance ? (
          <dl className={styles.details}>
            <div>
              <dt>Total</dt>
              <dd>{formatMoney(finances.balance.totalAmount)}</dd>
            </div>
            <div>
              <dt>Paid</dt>
              <dd>{formatMoney(finances.balance.paidAmount)}</dd>
            </div>
            <div>
              <dt>Refunded</dt>
              <dd>{formatMoney(finances.balance.refundedAmount)}</dd>
            </div>
            <div>
              <dt>Outstanding balance</dt>
              <dd>{formatMoney(finances.balance.balance)}</dd>
            </div>
          </dl>
        ) : null}
        {!finances.loading && finances.payments?.length === 0 ? (
          <p>No payments have been recorded for this contract.</p>
        ) : null}
        {finances.payments?.length ? (
          <table className={styles.payments}>
            <caption>Contract payments</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {finances.payments.map((payment) => (
                <tr key={payment.paymentId}>
                  <td>{formatDateTime(payment.paymentDateUtc)}</td>
                  <td>{payment.method}</td>
                  <td>{formatMoney(payment.amount)}</td>
                  <td>
                    <StatusBadge status={payment.status} />
                  </td>
                  <td>{payment.transactionReference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
      {contract.status === 'Completed' ? (
        <p>
          <Link to={'/vehicles/' + contract.vehicleId + '#reviews'}>Write a vehicle review</Link>
        </p>
      ) : null}
      <p>
        <Link to="/rentals">Back to my rentals</Link>
      </p>
    </>
  );
}
