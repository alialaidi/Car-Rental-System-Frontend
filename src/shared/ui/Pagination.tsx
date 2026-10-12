import { useId } from 'react';
import { Button } from './Button';
import { SelectField } from './SelectField';
import styles from './ui.module.css';

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = '',
}: PaginationProps) {
  const pageSizeId = useId();
  const safePageSize = Math.min(Math.max(1, pageSize), 100);
  const pageCount = Math.max(1, Math.ceil(Math.max(0, totalCount) / safePageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const options = [...new Set(pageSizeOptions.filter((size) => size > 0 && size <= 100))].sort(
    (left, right) => left - right,
  );

  return (
    <nav
      aria-label="Pagination"
      className={[styles.pagination, className].filter(Boolean).join(' ')}
    >
      {onPageSizeChange ? (
        <SelectField
          className={styles.pageSizeSelect}
          id={pageSizeId}
          label="Rows per page"
          onChange={(event) => onPageSizeChange(Number(event.currentTarget.value))}
          options={options.map((size) => ({ value: String(size), label: String(size) }))}
          value={String(safePageSize)}
        />
      ) : null}
      <span aria-live="polite" className={styles.pageStatus}>
        Page {safePage} of {pageCount}
      </span>
      <div className={styles.paginationButtons}>
        <Button
          aria-label="Go to previous page"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          variant="secondary"
        >
          Previous
        </Button>
        <Button
          aria-label="Go to next page"
          disabled={safePage >= pageCount}
          onClick={() => onPageChange(safePage + 1)}
          variant="secondary"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
