export interface PageResp<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;      // tamaño de página
  number: number;    // índice de página (0-based)
  last?: boolean;
  first?: boolean;
}