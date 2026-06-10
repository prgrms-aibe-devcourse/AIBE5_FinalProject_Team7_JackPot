// 위스키 칼럼 목록 페이지 — 전문가·운영자가 작성한 칼럼을 페이지네이션과 함께 표시
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { Pagination } from '../components/Pagination';
import { ColumnList } from '../components/ColumnList';
import { useWhiskeyColumns } from '../hooks/useCommunity';

export default function ColumnsPage() {
  // 서버 페이지는 0-based index — Pagination 컴포넌트에도 동일 규칙 적용
  const [page, setPage] = useState(0);
  const { data, isLoading } = useWhiskeyColumns(page);

  return (
    <WireframePage scroll>
      {/* 현재 탭(칼럼)은 wf-chip--on으로 강조, 나머지는 링크 */}
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <span className="wf-chip wf-chip--on">칼럼</span>
        <Link to={PATHS.COMMUNITY_FREE} className="wf-chip">자유게시판</Link>
        <Link to={PATHS.COMMUNITY_NOTICES} className="wf-chip">공지·FAQ</Link>
      </nav>
      <h1 className="wf-title" style={{ marginBottom: 8 }}>칼럼</h1>
      {/* data가 undefined인 로딩 구간에는 빈 배열 fallback으로 깜빡임 방지 */}
      <ColumnList columns={data?.content ?? []} isLoading={isLoading} />
      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
