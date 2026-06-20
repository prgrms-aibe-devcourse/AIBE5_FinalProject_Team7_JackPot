import type { PostCategory, PostType } from '../types';
import { POST_CATEGORY_LABEL } from '../types';

export function getPostCategoryLabel(category: PostCategory): string {
  return POST_CATEGORY_LABEL[category] ?? category;
}

/** 목록 — 전체 탭에서는 주제 모두 표시, 필터 active와 같을 때만 숨김 */
export function getListPostCategoryLabel(
  category: PostCategory,
  activeCategoryFilter?: PostCategory,
): string | null {
  if (activeCategoryFilter != null && category === activeCategoryFilter) return null;
  return getPostCategoryLabel(category);
}

/** 상세 — 칼럼은 '칼럼', 자유게시판은 주제(자유·리뷰 등) 표시 */
export function getPostDetailTopicLabel(
  postType: PostType,
  category: PostCategory,
): string | null {
  if (postType === 'COLUMN') return '칼럼';
  if (postType === 'FREE' || postType === 'QA') return getPostCategoryLabel(category);
  if (postType === 'NOTICE') return '공지';
  return null;
}
