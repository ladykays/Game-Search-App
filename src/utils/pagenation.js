/**
 * Generates pagination data with sliding window
 * @param {number} currentPage - Current page number
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Items per page
 * @param {number} [maxVisiblePages=5] - Maximum visible page buttons
 * @returns {Object} Pagination data
 */
export const generatePagination = (
  currentPage,
  totalItems,
  itemsPerPage,
  maxVisiblePages = 5
) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const halfRange = Math.floor(maxVisiblePages / 2);
  
  let startPage, endPage;

  if (totalPages <= maxVisiblePages) {
    startPage = 1;
    endPage = totalPages;
  } else if (currentPage <= halfRange) {
    startPage = 1;
    endPage = maxVisiblePages;
  } else if (currentPage + halfRange >= totalPages) {
    startPage = totalPages - maxVisiblePages + 1;
    endPage = totalPages;
  } else {
    startPage = currentPage - halfRange;
    endPage = currentPage + halfRange;
  }

  return {
    currentPage,
    totalPages,
    startPage,
    endPage,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    previousPage: currentPage - 1,
    nextPage: currentPage + 1
  };
};