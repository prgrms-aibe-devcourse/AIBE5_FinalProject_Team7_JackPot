import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { PostList } from '../components/PostList';
import { Pagination } from '../components/Pagination';
import { useColumns } from '../hooks/useCommunity';

export default function ColumnsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useColumns(page);

  return (
    <WireframePage scroll>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <span className="wf-chip wf-chip--on">칼럼</span>
        <Link to={PATHS.COMMUNITY_FREE} className="wf-chip">자유게시판</Link>
        <Link to={PATHS.COMMUNITY_QNA} className="wf-chip">Q&A</Link>
      </nav>

      <h1 className="wf-title">칼럼</h1>

      <PostList posts={data?.content ?? []} isLoading={isLoading} />
      <Pagination
        page={data?.number ?? 0}
        totalPages={data?.totalPages ?? 1}
        onPage={setPage}
      />
    </WireframePage>
  );
}
