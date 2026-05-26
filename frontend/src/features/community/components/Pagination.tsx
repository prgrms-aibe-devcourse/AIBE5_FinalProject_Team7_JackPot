interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
      <button
        className="wf-chip"
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        style={{ cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}
      >
        이전
      </button>
      <span className="wf-text-sm" style={{ lineHeight: '28px' }}>
        {page + 1} / {totalPages}
      </span>
      <button
        className="wf-chip"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages - 1}
        style={{
          cursor: page >= totalPages - 1 ? 'default' : 'pointer',
          opacity: page >= totalPages - 1 ? 0.4 : 1,
        }}
      >
        다음
      </button>
    </div>
  );
}
