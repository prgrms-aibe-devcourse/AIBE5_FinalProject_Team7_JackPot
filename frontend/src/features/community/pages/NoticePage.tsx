// 공지·FAQ 페이지 — 운영 공지와 자주 묻는 질문을 하나의 목록으로 표시
import '../community.css';
import { Link, useSearchParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { CommunityBoardHeader } from '../components/CommunityBoardHeader';
import { Pagination } from '../components/Pagination';
import { PostList } from '../components/PostList';
import { useNotices } from '../hooks/useCommunity';

export default function NoticePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '0');
  function setPage(n: number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(n));
      return next;
    }, { replace: true });
  }
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
      <CommunityBoardHeader title="공지·FAQ" />
      <div className="wf-community-feed">
        <PostList posts={data?.content ?? []} isLoading={isLoading} showCategory={false} />
      </div>
      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
