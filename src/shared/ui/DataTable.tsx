import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import styles from './ui.module.css';

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  className?: string;
}

export interface DataTableProps<Row> {
  caption: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowKey: (row: Row) => string | number;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<Row>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyMessage = 'There are no records to show.',
  className = '',
}: DataTableProps<Row>) {
  return (
    <div className={[styles.tableContainer, className].filter(Boolean).join(' ')}>
      <table className={styles.table}>
        <caption className={styles.visuallyHidden}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th className={column.className} key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td className={column.className} key={column.key}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={Math.max(columns.length, 1)}>
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
