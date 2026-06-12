// Q&A 게시판 페이지 — 질문/답변 유형의 게시글을 페이지네이션과 함께 표시
import '../community.css';
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
      {/* QnaPage는 현재 라우트에 등록되어 있지 않으므로 nav 구조는 유지하되 향후 PATHS에 추가 필요 */}
      <nav className="wf-community-nav">
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <Link to={PATHS.COMMUNITY_COLUMNS} className="wf-chip">칼럼</Link>
        <Link to={PATHS.COMMUNITY_FREE} className="wf-chip">자유게시판</Link>
        <span className="wf-chip wf-chip--on">Q&A</span>
        <Link to={PATHS.COMMUNITY_NOTICES} className="wf-chip">공지·FAQ</Link>
      </nav>
      <h1 className="wf-title">Q&A</h1>
      <PostList posts={data?.content ?? []} isLoading={isLoading} />
      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
