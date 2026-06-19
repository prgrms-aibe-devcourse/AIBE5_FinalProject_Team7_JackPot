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

  const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.commentCount, 0);

  return (
    <>
      <div className="wf-cabinet-stats wf-box wf-box--solid">
        <div className="wf-cabinet-stats__item">
          <span className="wf-cabinet-stats__num">{posts.length}</span>
          <span className="wf-cabinet-stats__label">게시글</span>
        </div>
        <div className="wf-cabinet-stats__item">
          <span className="wf-cabinet-stats__num">{totalLikes}</span>
          <span className="wf-cabinet-stats__label">좋아요</span>
        </div>
        <div className="wf-cabinet-stats__item">
          <span className="wf-cabinet-stats__num">{totalComments}</span>
          <span className="wf-cabinet-stats__label">댓글</span>
        </div>
      </div>

      {showWriteButton ? (
        <div className="wf-cabinet-subtabs-row wf-cabinet-subtabs-row--write-only">
          <Link to={PATHS.COMMUNITY_POST_NEW} className="wf-community-write-link">
            <Button className="wf-community-write-btn">+ 글 작성</Button>
          </Link>
        </div>
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
                className="wf-cabinet-action-btn wf-cabinet-action-btn--detail"
              >
                글 상세
              </Link>
            </footer>
          </article>
        ))
      )}
    </>
  );
}
