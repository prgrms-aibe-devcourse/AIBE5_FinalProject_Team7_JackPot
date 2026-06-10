// 게시글 목록 컴포넌트 — 여러 게시판 페이지에서 공통으로 재사용되는 요약 목록 렌더러
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import type { PostSummaryResponse } from '../types';
import { POST_CATEGORY_LABEL } from '../types';

interface PostListProps {
  posts: PostSummaryResponse[];
  isLoading?: boolean;
  // 공지·칼럼처럼 카테고리가 하나인 목록에서는 카테고리 칩을 숨겨 UI를 단순화
  showCategory?: boolean;
}

// 날짜는 일 단위까지만 표시해 목록 가독성 확보
function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

export function PostList({ posts, isLoading, showCategory = true }: PostListProps) {
  if (isLoading) return <p className="wf-text-sm">불러오는 중…</p>;
  if (posts.length === 0) return <p className="wf-text-sm">게시글이 없습니다.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {posts.map((post) => (
        <li key={post.id}>
          {/* PATHS 상수를 통해 URL을 생성해 경로 변경 시 한 곳만 수정하면 됨 */}
          <Link
            to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="wf-box" style={{ padding: '12px 16px', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                {showCategory && (
                  <span className="wf-chip" style={{ fontSize: 11 }}>
                    {/* 알 수 없는 카테고리 코드는 원본 그대로 표시해 데이터 손실을 방지 */}
                    {POST_CATEGORY_LABEL[post.category] ?? post.category}
                  </span>
                )}
                <strong style={{ fontSize: 14 }}>{post.title}</strong>
              </div>
              <p className="wf-text-xs" style={{ margin: 0, color: '#888' }}>
                ♥ {post.likeCount} · 댓글 {post.commentCount} · 조회 {post.viewCount} · {formatDate(post.createdAt)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
