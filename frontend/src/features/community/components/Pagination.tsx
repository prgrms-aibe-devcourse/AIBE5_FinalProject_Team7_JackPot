// 페이지네이션 컴포넌트 — 0-based 서버 페이지를 받아 이전/다음 버튼과 현재 위치를 표시
interface PaginationProps {
  page: number;       // 0-based 현재 페이지 (서버 응답의 number 필드)
  totalPages: number;
  onPage: (page: number) => void;
}

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  // 페이지가 1개뿐이면 컴포넌트 자체를 렌더링하지 않아 불필요한 UI 제거
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
      <button
        className="wf-chip"
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        // opacity와 cursor로 비활성 상태를 시각적으로 표현 — disabled 속성만으로는 스타일 변경이 안 됨
        style={{ cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}
      >
        이전
      </button>
      {/* 사용자에게는 1-based로 표시 */}
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
