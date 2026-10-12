export interface PagedRequest {
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export type QueryValue = string | number | boolean | Date | null | undefined;
export type QueryParameters = Record<string, QueryValue>;
