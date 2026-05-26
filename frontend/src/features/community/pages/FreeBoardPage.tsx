import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { Pagination } from '../components/Pagination';
import { PostList } from '../components/PostList';
import { useFreePosts } from '../hooks/useCommunity';
import type { PostCategory } from '../types';
import { POST_CATEGORY_LABEL } from '../types';

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

  function handleCategory(val: PostCategory | undefined) {
    setCategory(val);
    setPage(0);
  }

  return (
    <WireframePage scroll>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <Link to={PATHS.COMMUNITY_COLUMNS} className="wf-chip">칼럼</Link>
        <span className="wf-chip wf-chip--on">자유게시판</span>
        <Link to={PATHS.COMMUNITY_QNA} className="wf-chip">Q&A</Link>
        <Link to={PATHS.COMMUNITY_NOTICES} className="wf-chip">공지</Link>
      </nav>
      <h1 className="wf-title">자유게시판</h1>
      <div className="wf-chips" style={{ marginBottom: 12 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            className={`wf-chip${category === c.value ? ' wf-chip--on' : ''}`}
            style={{ cursor: 'pointer', border: 'none', background: 'none' }}
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
