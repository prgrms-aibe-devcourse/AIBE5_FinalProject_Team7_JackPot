// 게시글 목록 컴포넌트 — 여러 게시판 페이지에서 공통으로 재사용되는 요약 목록 렌더러
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import type { PostCategory, PostSummaryResponse } from '../types';
import { formatPostFeedMeta } from '../utils/postFeedMeta';
import { getListPostCategoryLabel } from '../utils/postCategoryDisplay';

interface PostListProps {
  posts: PostSummaryResponse[];
  isLoading?: boolean;
  /** 공지 등 주제 구분이 불필요한 목록 */
  showCategory?: boolean;
  /** 자유게시판 URL 필터 — active와 같은 category 라벨은 카드에서 숨김 */
  activeCategoryFilter?: PostCategory;
  /** Q&A 등 게시판 전체가 한 주제일 때 해당 category 라벨 숨김 */
  boardCategory?: PostCategory;
}

function PostListItem({
  post,
  showCategory,
  activeCategoryFilter,
  boardCategory,
}: {
  post: PostSummaryResponse;
  showCategory: boolean;
  activeCategoryFilter?: PostCategory;
  boardCategory?: PostCategory;
}) {
  const [imgError, setImgError] = useState(false);
  const showThumb = Boolean(post.thumbnailUrl) && !imgError;
  const filter = activeCategoryFilter ?? boardCategory;
  const categoryLabel = showCategory
    ? getListPostCategoryLabel(post.category, filter)
    : null;

  return (
    <li>
      <Link
        to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
        className="wf-post-list-link"
      >
        <div className="wf-box wf-post-list-item">
          <div className="wf-post-list-item__body">
            <strong className="wf-post-list-item__title">{post.title}</strong>
            <p className="wf-post-feed-meta">
              {categoryLabel ? (
                <>
                  <span className="wf-post-feed-meta__topic">{categoryLabel}</span>
                  <span className="wf-post-feed-meta__sep" aria-hidden> · </span>
                </>
              ) : null}
              {formatPostFeedMeta(post)}
            </p>
          </div>
          <div className="wf-post-list-item__thumb" aria-hidden={!showThumb}>
            {showThumb ? (
              <img
                src={post.thumbnailUrl!}
                alt=""
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="wf-post-list-item__thumb-placeholder" />
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

export function PostList({
  posts,
  isLoading,
  showCategory = true,
  activeCategoryFilter,
  boardCategory,
}: PostListProps) {
  if (isLoading) {
    return (
      <ul className="wf-post-list" aria-label="게시글을 불러오는 중">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index}>
            <div className="wf-box wf-post-list-item" aria-hidden>
              <div className="wf-post-list-item__body">
                <Skeleton width="55%" height={15} />
                <Skeleton width="40%" height={11} radius={4} />
              </div>
              <div className="wf-post-list-item__thumb wf-post-list-item__thumb--skeleton" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (posts.length === 0) return <p className="wf-text-sm">게시글이 없습니다.</p>;

  return (
    <ul className="wf-post-list">
      {posts.map((post) => (
        <PostListItem
          key={post.id}
          post={post}
          showCategory={showCategory}
          activeCategoryFilter={activeCategoryFilter}
          boardCategory={boardCategory}
        />
      ))}
    </ul>
  );
}
