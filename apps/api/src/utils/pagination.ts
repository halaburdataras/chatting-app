// Shared utility functions

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number = 1,
  pageSize: number = 10
) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
  };
}

/**
 * Validate and normalize pagination parameters
 */
export function normalizePagination(
  page?: number,
  pageSize?: number
): { page: number; pageSize: number } {
  const normalizedPage = Math.max(1, page || 1);
  const normalizedPageSize = Math.min(100, Math.max(1, pageSize || 10));
  return {
    page: normalizedPage,
    pageSize: normalizedPageSize,
  };
}
