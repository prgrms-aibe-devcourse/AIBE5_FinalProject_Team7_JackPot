import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import type { PostSummaryResponse } from '../types';
import { POST_CATEGORY_LABEL } from '../types';

interface PostListProps {
  posts: PostSummaryResponse[];
  isLoading?: boolean;
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

export function PostList({ posts, isLoading }: PostListProps) {
  if (isLoading) return <p className="wf-text-sm">불러오는 중…</p>;
  if (posts.length === 0) return <p className="wf-text-sm">게시글이 없습니다.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="wf-box" style={{ padding: '12px 16px', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span className="wf-chip" style={{ fontSize: 11 }}>
                  {POST_CATEGORY_LABEL[post.category] ?? post.category}
                </span>
                <strong style={{ fontSize: 14 }}>{post.title}</strong>
              </div>
              <p className="wf-text-xs" style={{ margin: 0, color: '#888' }}>
                ♥ {post.likeCount} · 댓글 {post.commentCount} · {formatDate(post.createdAt)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
