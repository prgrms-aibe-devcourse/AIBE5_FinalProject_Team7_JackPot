import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { fetchAuthorPosts } from '@/features/community/api/communityApi';
import { POST_CATEGORY_LABEL, type PostSummaryResponse } from '@/features/community/types';
import { CabinetCommunityTabs, type CommunityTab } from '@/features/cabinet/components/CabinetCommunityTabs';
import { CabinetFeedEmpty, CabinetFeedLoading, CabinetFeedToolbar } from '@/features/cabinet/components/CabinetFeedParts';

function formatPostDate(iso: string): string {
  return iso.slice(0, 10);
}

function postMeta(post: PostSummaryResponse): string {
  const category = POST_CATEGORY_LABEL[post.category] ?? post.category;
  return `#${category}`;
}

interface CabinetCommunitySectionProps {
  authorId: number | null;
  /** 내 캐비넷만 글 작성 버튼 표시 */
  showWriteButton?: boolean;
}

export function CabinetCommunitySection({ authorId, showWriteButton }: CabinetCommunitySectionProps) {
  const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<CommunityTab>('column');

  useEffect(() => {
    if (authorId == null) return;

    setLoading(true);
    fetchAuthorPosts(authorId)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [authorId]);

  const columnPosts = useMemo(
    () => posts.filter((post) => post.postType === 'COLUMN'),
    [posts],
  );
  const freePosts = useMemo(
    () => posts.filter((post) => post.postType === 'FREE'),
    [posts],
  );
  const visiblePosts = activeTab === 'column' ? columnPosts : freePosts;
  const writePostPath =
    activeTab === 'column'
      ? `${PATHS.COMMUNITY_POST_NEW}?type=COLUMN`
      : `${PATHS.COMMUNITY_POST_NEW}?type=FREE`;

  if (authorId == null) {
    return <CabinetFeedEmpty title="사용자 정보를 찾을 수 없습니다." />;
  }

  return (
    <>
      <CabinetCommunityTabs
        column={columnPosts.length}
        free={freePosts.length}
        active={activeTab}
        onChange={setActiveTab}
      />

      {showWriteButton ? (
        <CabinetFeedToolbar>
          <Link to={writePostPath} className="wf-cabinet-feed-toolbar__link">
            + 글 작성
          </Link>
        </CabinetFeedToolbar>
      ) : null}

      {loading ? (
        <CabinetFeedLoading message="게시글을 불러오는 중입니다." />
      ) : visiblePosts.length === 0 ? (
        <CabinetFeedEmpty
          title={
            activeTab === 'column'
              ? '아직 작성한 칼럼이 없습니다.'
              : '아직 작성한 자유 게시글이 없습니다.'
          }
          meta={
            activeTab === 'column'
              ? '칼럼 게시판에 작성한 글이 여기에 표시됩니다.'
              : '자유 게시판에 작성한 글이 여기에 표시됩니다.'
          }
          actionLabel={showWriteButton ? '+ 글 작성' : undefined}
          actionTo={showWriteButton ? writePostPath : undefined}
        />
      ) : (
        <ul className="wf-cabinet-feed">
          {visiblePosts.map((post) => (
            <li key={post.id} className="wf-cabinet-feed__item">
              <div className="wf-cabinet-feed__head">
                <Link
                  to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
                  className="wf-cabinet-feed__title wf-cabinet-feed__title--link"
                >
                  {post.title}
                </Link>
              </div>
              <p className="wf-cabinet-feed__meta">{postMeta(post)}</p>
              <div className="wf-cabinet-feed__actions">
                <span className="wf-cabinet-feed__meta wf-cabinet-feed__meta--inline">
                  좋아요 {post.likeCount} · 댓글 {post.commentCount} · {formatPostDate(post.createdAt)}
                </span>
                <Link
                  to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
                  className="wf-cabinet-feed__action wf-cabinet-feed__action--primary"
                >
                  글 상세
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
