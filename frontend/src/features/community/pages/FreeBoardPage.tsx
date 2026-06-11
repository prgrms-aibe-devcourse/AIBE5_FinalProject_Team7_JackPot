// 자유게시판 페이지 — 카테고리 필터 + 페이지네이션을 갖춘 자유 게시글 목록
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
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
  { value: 'G', label: POST_CATEGORY_LABEL.G },
  { value: 'B', label: POST_CATEGORY_LABEL.B },
];

export default function FreeBoardPage() {
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState<PostCategory | undefined>(undefined);
  const { data, isLoading } = useFreePosts(page, category);

  // 카테고리를 변경하면 페이지를 0으로 초기화해야 이전 카테고리의 끝 페이지가 남지 않음
  function handleCategory(val: PostCategory | undefined) {
    setCategory(val);
    setPage(0);
  }

  return (
    <WireframePage scroll>
      <nav className="wf-community-nav">
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <Link to={PATHS.COMMUNITY_COLUMNS} className="wf-chip">칼럼</Link>
        <span className="wf-chip wf-chip--on">자유게시판</span>
        <Link to={PATHS.COMMUNITY_NOTICES} className="wf-chip">공지·FAQ</Link>
      </nav>
      <div className="wf-community-page-header">
        <h1 className="wf-title wf-community-page-title">자유게시판</h1>
        {/* 글쓰기 URL에 ?type=FREE를 붙여 PostFormPage가 postType을 구분하도록 함 */}
        <Link to={`${PATHS.COMMUNITY_POST_NEW}?type=FREE`} className="wf-chip wf-chip--on">글쓰기</Link>
      </div>
      <div className="wf-chips wf-community-filter-chips">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            className={`wf-chip wf-community-filter-btn${category === c.value ? ' wf-chip--on' : ''}`}
            onClick={() => handleCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <PostList posts={data?.content ?? []} isLoading={isLoading} />
      <Pagination page={data?.number ?? 0} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </WireframePage>
  );
}
