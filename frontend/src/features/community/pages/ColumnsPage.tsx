// 사용자 작성 칼럼 게시판 목록 페이지
// useColumns → GET /community/columns (PostType.COLUMN 기반 posts 테이블)
// useWhiskeyColumns(GET /columns, 크롤링 외부 콘텐츠)와 다른 API임에 주의
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { Pagination } from '../components/Pagination';
import { PostList } from '../components/PostList';
import { useColumns } from '../hooks/useCommunity';
import { isLoggedIn } from '@/shared/lib/authSession';

export default function ColumnsPage() {
  // 서버 페이지는 0-based index — Pagination 컴포넌트에도 동일 규칙 적용
  const [page, setPage] = useState(0);
  const { data, isLoading } = useColumns(page);

  return (
    <WireframePage scroll>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <span className="wf-chip wf-chip--on">칼럼</span>
        <Link to={PATHS.COMMUNITY_FREE} className="wf-chip">자유게시판</Link>
        <Link to={PATHS.COMMUNITY_NOTICES} className="wf-chip">공지·FAQ</Link>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 className="wf-title" style={{ margin: 0 }}>칼럼</h1>
        {/* 로그인 유저만 글쓰기 버튼 노출 */}
        {isLoggedIn() && (
          <Link
            to={`${PATHS.COMMUNITY_POST_NEW}?type=COLUMN`}
            className="wf-chip"
            style={{ background: 'var(--wf-accent)', color: '#fff', textDecoration: 'none' }}
          >
            + 글쓰기
          </Link>
        )}
      </div>

      {/* data가 undefined인 로딩 구간에는 빈 배열 fallback으로 깜빡임 방지 */}
      <PostList posts={data?.content ?? []} isLoading={isLoading} showCategory={false} />
      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
