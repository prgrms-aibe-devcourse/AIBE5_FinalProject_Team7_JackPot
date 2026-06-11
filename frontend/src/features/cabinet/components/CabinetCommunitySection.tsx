import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { fetchAuthorPosts } from '@/features/community/api/communityApi';
import { POST_CATEGORY_LABEL, type PostSummaryResponse } from '@/features/community/types';
import { Button } from '@/shared/components/ui/Button';

function formatPostDate(iso: string): string {
  return iso.slice(0, 10);
}

function postMeta(post: PostSummaryResponse): string {
  const category = POST_CATEGORY_LABEL[post.category] ?? post.category;
  return `#${category} · ${post.postType === 'COLUMN' ? '칼럼' : post.postType === 'QA' ? 'QnA' : '게시글'}`;
}

interface CabinetCommunitySectionProps {
  authorId: number | null;
  /** 내 캐비넷만 글 작성 버튼 표시 */
  showWriteButton?: boolean;
}

export function CabinetCommunitySection({ authorId, showWriteButton }: CabinetCommunitySectionProps) {
  const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authorId == null) return;

    setLoading(true);
    fetchAuthorPosts(authorId)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [authorId]);

  if (authorId == null) {
    return <p className="wf-text-sm">사용자 정보를 찾을 수 없습니다.</p>;
  }

  return (
    <>
      {showWriteButton ? (
        <Link to={PATHS.COMMUNITY_POST_NEW} className="wf-community-write-link">
          <Button className="wf-community-write-btn">+ 글 작성</Button>
        </Link>
      ) : null}
      {loading ? (
        <p className="wf-text-sm">게시글을 불러오는 중입니다...</p>
      ) : posts.length === 0 ? (
        <p className="wf-text-sm">아직 작성한 글이 없습니다.</p>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="wf-cabinet-post wf-box">
            <h3 className="wf-cabinet-post__title">{post.title}</h3>
            <p className="wf-text-sm">{postMeta(post)}</p>
            <footer className="wf-cabinet-post__foot">
              <span className="wf-text-sm">
                ♡ {post.likeCount} · 댓글 {post.commentCount} · {formatPostDate(post.createdAt)}
              </span>
              <Link
                to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
                className="wf-link wf-text-sm"
              >
                → 글 상세
              </Link>
            </footer>
          </article>
        ))
      )}
    </>
  );
}
