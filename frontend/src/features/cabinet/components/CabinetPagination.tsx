/** 캐비넷 탭용 페이지네이션 — 페이지 번호 선택 + 이전/다음
 *  0-based 페이지(서버 기준)를 받아 1-based로 표시
 */

interface CabinetPaginationProps {
  page: number;        // 0-based 현재 페이지
  totalPages: number;
  onPage: (page: number) => void;
  disabled?: boolean;
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const cur = current + 1; // 1-based

  if (cur <= 4) {
    const pages: (number | 'ellipsis')[] = [1, 2, 3, 4, 5];
    if (total > 6) pages.push('ellipsis');
    pages.push(total);
    return pages;
  }

  if (cur >= total - 3) {
    return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, 'ellipsis', cur - 1, cur, cur + 1, 'ellipsis', total];
}

export function CabinetPagination({ page, totalPages, onPage, disabled = false }: CabinetPaginationProps) {
  if (totalPages <= 1) return null;

  const visible = getVisiblePages(page, totalPages);

  return (
    <nav className="wf-cabinet-pagination" aria-label="페이지 탐색">
      <button
        type="button"
        className="wf-cabinet-pagination__btn"
        onClick={() => onPage(page - 1)}
        disabled={disabled || page === 0}
        aria-label="이전 페이지"
      >
        ‹
      </button>

      {visible.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e${idx}`} className="wf-cabinet-pagination__ellipsis" aria-hidden>…</span>
        ) : (
          <button
            key={item}
            type="button"
            className={`wf-cabinet-pagination__page${page + 1 === item ? ' wf-cabinet-pagination__page--on' : ''}`}
            onClick={() => onPage(item - 1)}
            disabled={disabled}
            aria-current={page + 1 === item ? 'page' : undefined}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="wf-cabinet-pagination__btn"
        onClick={() => onPage(page + 1)}
        disabled={disabled || page >= totalPages - 1}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </nav>
  );
}
