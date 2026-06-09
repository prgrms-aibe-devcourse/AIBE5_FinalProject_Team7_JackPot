import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { Pagination } from '../components/Pagination';
import { ColumnList } from '../components/ColumnList';
import { useWhiskeyColumns } from '../hooks/useCommunity';

export default function ColumnsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useWhiskeyColumns(page);

  return (
    <WireframePage scroll>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <span className="wf-chip wf-chip--on">칼럼</span>
        <Link to={PATHS.COMMUNITY_FREE} className="wf-chip">자유게시판</Link>
        <Link to={PATHS.COMMUNITY_NOTICES} className="wf-chip">공지·FAQ</Link>
      </nav>
      <h1 className="wf-title" style={{ marginBottom: 8 }}>칼럼</h1>
      <ColumnList columns={data?.content ?? []} isLoading={isLoading} />
      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
