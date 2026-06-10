// 사용자 작성 칼럼 게시판 목록 페이지
// useColumns → GET /community/columns (PostType.COLUMN 기반 posts 테이블)
// useWhiskeyColumns(GET /columns, 크롤링 외부 콘텐츠)와 다른 API임에 주의
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { Pagination } from '../components/Pagination';
import { useColumns } from '../hooks/useCommunity';
import { isLoggedIn } from '@/shared/lib/authSession';
import type { PostSummaryResponse } from '../types';

function formatDate(iso: string) {
  return iso.slice(0, 10);
}

function ColumnCard({ post }: { post: PostSummaryResponse }) {
  return (
    <Link
      to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div className="wf-box" style={{
        display: 'flex', gap: 16, padding: '16px',
        marginBottom: 12, alignItems: 'center',
      }}>
        {/* 썸네일 — 없으면 회색 placeholder */}
        <div style={{
          width: 90, height: 68, flexShrink: 0,
          borderRadius: 8, overflow: 'hidden',
          background: 'var(--wf-surface-2)',
        }}>
          {post.thumbnailUrl ? (
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.background = 'var(--wf-surface-2)'; (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📄</div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: 15, display: 'block', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.title}
          </strong>
          <p className="wf-text-xs" style={{ margin: 0, color: '#888' }}>
            ♥ {post.likeCount} · 댓글 {post.commentCount} · 조회 {post.viewCount} · {formatDate(post.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}

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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 className="wf-title" style={{ margin: 0 }}>칼럼</h1>
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

      {isLoading ? (
        <p className="wf-text-sm">불러오는 중…</p>
      ) : (data?.content ?? []).length === 0 ? (
        <p className="wf-text-sm">칼럼이 없습니다.</p>
      ) : (
        (data?.content ?? []).map(post => <ColumnCard key={post.id} post={post} />)
      )}

      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
