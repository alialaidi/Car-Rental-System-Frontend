import styles from './ui.module.css';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger';

const SUCCESS_STATUSES = new Set(['available', 'completed', 'confirmed', 'paid', 'active']);
const WARNING_STATUSES = new Set(['pending', 'reserved', 'maintenance', 'partial']);
const DANGER_STATUSES = new Set(['cancelled', 'canceled', 'rejected', 'overdue', 'failed']);

function statusTone(status: string): StatusTone {
  const value = status.toLowerCase();
  if (SUCCESS_STATUSES.has(value)) return 'success';
  if (WARNING_STATUSES.has(value)) return 'warning';
  if (DANGER_STATUSES.has(value)) return 'danger';
  return 'neutral';
}

export interface StatusBadgeProps {
  status: string;
  tone?: StatusTone;
  className?: string;
}

export function StatusBadge({
  status,
  tone = statusTone(status),
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={[styles.statusBadge, styles['status-' + tone], className]
        .filter(Boolean)
        .join(' ')}
    >
      {status}
    </span>
  );
}
