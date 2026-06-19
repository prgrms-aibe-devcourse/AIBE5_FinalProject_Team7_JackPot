// 커뮤니티 진입점 페이지 — 각 게시판(칼럼·자유게시판·공지FAQ)으로 이동하는 허브 역할
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { useTopPosts } from '../hooks/useCommunity';
import '../community.css';

const BOARDS = [
  {
    path: PATHS.COMMUNITY_COLUMNS,
    label: '칼럼',
    desc: '위스키 칼럼 콘텐츠',
    img: 'https://images.unsplash.com/photo-1758961339803-2d5a43cb34d1?auto=format&fit=crop&w=800&q=80',
  },
  {
    path: PATHS.COMMUNITY_FREE,
    label: '자유게시판',
    desc: '잡담·리뷰·추천·나눔',
    img: 'https://images.unsplash.com/photo-1635449677939-8e4e77ecf36a?auto=format&fit=crop&w=800&q=80',
  },
  {
    path: PATHS.COMMUNITY_NOTICES,
    label: '공지·FAQ',
    desc: '운영 공지 및 자주 묻는 질문',
    img: 'https://images.unsplash.com/photo-1761138785588-7a3c2dc1e883?auto=format&fit=crop&w=800&q=80',
  },
];

export default function CommunityPage() {
  const { data: topPosts = [] } = useTopPosts(5);

  return (
    <WireframePage scroll>
      <h1 className="wf-title">커뮤니티</h1>

      <div className="wf-community-boards">
        {BOARDS.map((b) => (
          <Link key={b.path} to={b.path} className="wf-community-board-link">
            <div className="wf-box wf-box--solid wf-community-board-item">
              <div className="wf-community-board-item__bg" style={{ backgroundImage: `url(${b.img})` }} />
              <div className="wf-community-board-item__overlay" />
              <div className="wf-community-board-item__content">
                <strong className="wf-community-board-label">{b.label}</strong>
                <p className="wf-community-board-desc">{b.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {topPosts.length > 0 && (
        <section>
          <h2 className="wf-section-title"> 인기 게시글</h2>
          <div className="wf-community-top-list">
            {topPosts.map((post, i) => (
              <Link
                key={post.id}
                to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
                className="wf-community-top-link"
              >
                <div className="wf-box wf-community-top-item">
                  <span className={`wf-community-top-rank${i < 3 ? ' wf-community-top-rank--hi' : ''}`}>
                    {i + 1}
                  </span>
                  <div className="wf-community-top-body">
                    <span className="wf-community-top-title">{post.title}</span>
                  </div>
                  <span className="wf-community-top-views">조회 {post.viewCount ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </WireframePage>
  );
}
