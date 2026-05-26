import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';

const BOARDS = [
  { path: PATHS.COMMUNITY_COLUMNS, label: '칼럼', desc: '전문가·운영자 콘텐츠' },
  { path: PATHS.COMMUNITY_FREE, label: '자유게시판', desc: '잡담·리뷰·추천·나눔' },
  { path: PATHS.COMMUNITY_QNA, label: 'Q&A', desc: '위스키 궁금증을 해결해요' },
  { path: PATHS.COMMUNITY_NOTICES, label: '공지·가이드', desc: '운영 공지 및 입문 콘텐츠' },
];

export default function CommunityPage() {
  return (
    <WireframePage scroll>
      <h1 className="wf-title">커뮤니티</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {BOARDS.map((b) => (
          <Link key={b.path} to={b.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="wf-box wf-box--solid" style={{ padding: '16px 20px' }}>
              <strong style={{ fontSize: 16 }}>{b.label}</strong>
              <p className="wf-text-sm" style={{ margin: '4px 0 0', color: '#888' }}>{b.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </WireframePage>
  );
}
