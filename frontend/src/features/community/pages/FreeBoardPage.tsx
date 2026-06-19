// 자유게시판 페이지 — 카테고리 필터 + 페이지네이션을 갖춘 자유 게시글 목록
import '../community.css';
import { Link, useSearchParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { CommunityBoardHeader } from '../components/CommunityBoardHeader';
import { Pagination } from '../components/Pagination';
import { PostList } from '../components/PostList';
import { useFreePosts } from '../hooks/useCommunity';
import type { PostCategory } from '../types';
import { POST_CATEGORY_LABEL } from '../types';

// value: undefined → "전체" 조회 (카테고리 파라미터 미전달)
const CATEGORIES: Array<{ value: PostCategory | undefined; label: string }> = [
  { value: undefined, label: '전체' },
  { value: 'F', label: POST_CATEGORY_LABEL.F },
  { value: 'R', label: POST_CATEGORY_LABEL.R },
  { value: 'L', label: POST_CATEGORY_LABEL.L },
  { value: 'Q', label: POST_CATEGORY_LABEL.Q },
  { value: 'B', label: POST_CATEGORY_LABEL.B },
];

export default function FreeBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '0');
  const category = (searchParams.get('category') as PostCategory | null) ?? undefined;
  const { data, isLoading } = useFreePosts(page, category);

  function setPage(n: number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(n));
      return next;
    }, { replace: true });
  }

  // 카테고리를 변경하면 페이지를 0으로 초기화해야 이전 카테고리의 끝 페이지가 남지 않음
  function handleCategory(val: PostCategory | undefined) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', '0');
      if (val === undefined) next.delete('category');
      else next.set('category', val);
      return next;
    }, { replace: true });
  }

  return (
    <WireframePage scroll>
      <nav className="wf-community-nav">
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <Link to={PATHS.COMMUNITY_COLUMNS} className="wf-chip">칼럼</Link>
        <span className="wf-chip wf-chip--on">자유게시판</span>
        <Link to={PATHS.COMMUNITY_NOTICES} className="wf-chip">공지·FAQ</Link>
      </nav>
      <CommunityBoardHeader
        title="자유게시판"
        writeTo={`${PATHS.COMMUNITY_POST_NEW}?type=FREE`}
        filters={CATEGORIES.map((c) => (
          <button
            key={c.label}
            type="button"
            className={`wf-chip wf-community-filter-btn${category === c.value ? ' wf-chip--on' : ''}`}
            onClick={() => handleCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      />
      <div className="wf-community-feed">
        <PostList
          posts={data?.content ?? []}
          isLoading={isLoading}
          activeCategoryFilter={category}
        />
      </div>
      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
