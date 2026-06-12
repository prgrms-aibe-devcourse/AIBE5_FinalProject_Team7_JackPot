// 공지·FAQ 페이지 — 운영 공지와 자주 묻는 질문을 하나의 목록으로 표시
import '../community.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { Pagination } from '../components/Pagination';
import { PostList } from '../components/PostList';
import { useNotices } from '../hooks/useCommunity';

export default function NoticePage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useNotices(page);

  return (
    <WireframePage scroll>
      {/* 공지·FAQ는 글쓰기 버튼을 노출하지 않음 — 관리자만 작성 가능하기 때문 */}
      <nav className="wf-community-nav">
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <Link to={PATHS.COMMUNITY_COLUMNS} className="wf-chip">칼럼</Link>
        <Link to={PATHS.COMMUNITY_FREE} className="wf-chip">자유게시판</Link>
        <span className="wf-chip wf-chip--on">공지·FAQ</span>
      </nav>
      <h1 className="wf-title">공지·FAQ</h1>
      <PostList posts={data?.content ?? []} isLoading={isLoading} />
      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
