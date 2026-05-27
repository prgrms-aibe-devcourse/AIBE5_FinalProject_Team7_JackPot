import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { Pagination } from '../components/Pagination';
import { PostList } from '../components/PostList';
import { useQnaPosts } from '../hooks/useCommunity';

export default function QnaPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useQnaPosts(page);

  return (
    <WireframePage scroll>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <Link to={PATHS.COMMUNITY_COLUMNS} className="wf-chip">칼럼</Link>
        <Link to={PATHS.COMMUNITY_FREE} className="wf-chip">자유게시판</Link>
        <span className="wf-chip wf-chip--on">Q&A</span>
        <Link to={PATHS.COMMUNITY_NOTICES} className="wf-chip">공지</Link>
      </nav>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 className="wf-title" style={{ margin: 0 }}>Q&A</h1>
        <Link to={`${PATHS.COMMUNITY_POST_NEW}?type=QA`} className="wf-chip wf-chip--on">글쓰기</Link>
      </div>
      <PostList posts={data?.content ?? []} isLoading={isLoading} />
      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
