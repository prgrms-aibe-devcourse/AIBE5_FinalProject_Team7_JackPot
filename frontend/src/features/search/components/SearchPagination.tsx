const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

interface SearchPaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  disabled?: boolean;
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 0) return [];
  if (total === 1) return [1];
  if (total <= 10) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const currentPage = current + 1;

  if (currentPage <= 6) {
    const pages: (number | 'ellipsis')[] = Array.from({ length: 10 }, (_, index) => index + 1);
    if (total > 12) {
      pages.push('ellipsis', total - 1, total);
    } else {
      for (let page = 11; page <= total; page += 1) {
        pages.push(page);
      }
    }
    return pages;
  }

  if (currentPage >= total - 5) {
    return [1, 'ellipsis', ...Array.from({ length: 10 }, (_, index) => total - 9 + index)];
  }

  return [
    1,
    'ellipsis',
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
    'ellipsis',
    total,
  ];
}

export function SearchPagination({
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: SearchPaginationProps) {
  if (totalElements === 0) return null;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="wf-search-pagination">
      <label className="wf-search-pagination__size">
        <span className="wf-text-sm">페이지당 항목</span>
        <select
          className="wf-search-pagination__select"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          aria-label="페이지당 항목 수"
          disabled={disabled}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {totalPages > 1 ? (
        <nav className="wf-search-pagination__pages" aria-label="검색 결과 페이지">
          {visiblePages.map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="wf-search-pagination__ellipsis" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`wf-search-pagination__page${page + 1 === item ? ' wf-search-pagination__page--active' : ''}`}
                onClick={() => onPageChange(item - 1)}
                disabled={disabled}
                aria-current={page + 1 === item ? 'page' : undefined}
              >
                {item}
              </button>
            ),
          )}
        </nav>
      ) : null}
    </div>
  );
}
