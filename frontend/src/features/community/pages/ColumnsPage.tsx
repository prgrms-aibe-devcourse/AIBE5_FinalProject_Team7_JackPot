// 사용자 작성 칼럼 게시판 목록 페이지
// useColumns → GET /community/columns (PostType.COLUMN 기반 posts 테이블)
// useWhiskeyColumns(GET /columns, 크롤링 외부 콘텐츠)와 다른 API임에 주의
import { useState } from 'react';
import '../community.css';
import { Link, useSearchParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { CommunityBoardHeader } from '../components/CommunityBoardHeader';
import { Pagination } from '../components/Pagination';
import { useColumns } from '../hooks/useCommunity';
import { isLoggedIn } from '@/shared/lib/authSession';
import type { PostSummaryResponse } from '../types';
import { formatPostFeedMeta } from '../utils/postFeedMeta';

function ColumnCard({ post }: { post: PostSummaryResponse }) {
  const [imgError, setImgError] = useState(false);
  const showThumb = Boolean(post.thumbnailUrl) && !imgError;

  return (
    <Link
      to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
      className="wf-column-card-link"
    >
      <div className="wf-box wf-column-card">
        <div className="wf-column-card__body">
          <strong className="wf-column-card__title">{post.title}</strong>
          <p className="wf-post-feed-meta">{formatPostFeedMeta(post)}</p>
        </div>
        <div className="wf-column-card__thumb" aria-hidden={!showThumb}>
          {showThumb ? (
            <img
              src={post.thumbnailUrl!}
              alt=""
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="wf-column-card__thumb-placeholder" />
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ColumnsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '0');
  function setPage(n: number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(n));
      return next;
    }, { replace: true });
  }
  const { data, isLoading } = useColumns(page);

  return (
    <WireframePage scroll>
      <nav className="wf-community-nav">
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <span className="wf-chip wf-chip--on">칼럼</span>
        <Link to={PATHS.COMMUNITY_FREE} className="wf-chip">자유게시판</Link>
        <Link to={PATHS.COMMUNITY_NOTICES} className="wf-chip">공지·FAQ</Link>
      </nav>

      <CommunityBoardHeader
        title="칼럼"
        writeTo={isLoggedIn() ? `${PATHS.COMMUNITY_POST_NEW}?type=COLUMN` : undefined}
      />

      <div className="wf-community-feed">
        {isLoading ? (
          <p className="wf-text-sm">불러오는 중…</p>
        ) : (data?.content ?? []).length === 0 ? (
          <p className="wf-text-sm">칼럼이 없습니다.</p>
        ) : (
          (data?.content ?? []).map(post => <ColumnCard key={post.id} post={post} />)
        )}
      </div>

      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
