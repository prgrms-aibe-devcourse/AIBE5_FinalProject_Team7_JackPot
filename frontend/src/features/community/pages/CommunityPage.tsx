// 커뮤니티 진입점 페이지 — 각 게시판(칼럼·자유게시판·공지FAQ)으로 이동하는 허브 역할
import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';

// 게시판 목록을 데이터로 분리해 두면 나중에 항목 추가/제거 시 JSX를 건드리지 않아도 됨
const BOARDS = [
  { path: PATHS.COMMUNITY_COLUMNS, label: '칼럼', desc: '전문가·운영자 콘텐츠' },
  { path: PATHS.COMMUNITY_FREE, label: '자유게시판', desc: '잡담·리뷰·추천·나눔' },
  { path: PATHS.COMMUNITY_NOTICES, label: '공지·FAQ', desc: '운영 공지 및 자주 묻는 질문' },
];

export default function CommunityPage() {
  return (
    <WireframePage scroll>
      <h1 className="wf-title">커뮤니티</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {BOARDS.map((b) => (
          // Link 전체를 클릭 영역으로 쓰기 위해 textDecoration/color를 초기화
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
