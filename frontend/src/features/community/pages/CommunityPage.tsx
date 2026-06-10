// 커뮤니티 진입점 페이지 — 각 게시판(칼럼·자유게시판·공지FAQ)으로 이동하는 허브 역할
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { useTopPosts } from '../hooks/useCommunity';
import { POST_CATEGORY_LABEL } from '../types';

const BOARDS = [
  { path: PATHS.COMMUNITY_COLUMNS, label: '칼럼', desc: '위스키 칼럼 콘텐츠' },
  { path: PATHS.COMMUNITY_FREE, label: '자유게시판', desc: '잡담·리뷰·추천·나눔' },
  { path: PATHS.COMMUNITY_NOTICES, label: '공지·FAQ', desc: '운영 공지 및 자주 묻는 질문' },
];

export default function CommunityPage() {
  const { data: topPosts = [] } = useTopPosts(5);

  return (
    <WireframePage scroll>
      <h1 className="wf-title">커뮤니티</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, marginBottom: 28 }}>
        {BOARDS.map((b) => (
          <Link key={b.path} to={b.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="wf-box wf-box--solid" style={{ padding: '16px 20px' }}>
              <strong style={{ fontSize: 16 }}>{b.label}</strong>
              <p className="wf-text-sm" style={{ margin: '4px 0 0', color: '#888' }}>{b.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {topPosts.length > 0 && (
        <section>
          <h2 className="wf-section-title" style={{ marginBottom: 10 }}>🔥 인기 게시글</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topPosts.map((post, i) => (
              <Link
                key={post.id}
                to={PATHS.COMMUNITY_POST.replace(':postId', String(post.id))}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="wf-box" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: i < 3 ? 'var(--wf-accent)' : '#888', minWidth: 24, textAlign: 'center' }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {post.postType !== 'COLUMN' && (
                      <span className="wf-chip" style={{ fontSize: 10, marginRight: 6 }}>
                        {POST_CATEGORY_LABEL[post.category] ?? post.category}
                      </span>
                    )}
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{post.title}</span>
                  </div>
                  <span className="wf-text-xs" style={{ color: '#888', flexShrink: 0 }}>조회 {post.viewCount ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </WireframePage>
  );
}
