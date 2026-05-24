import { useSearchParams } from 'react-router-dom';
import { PATHS, type CabinetSection, type CabinetTab } from '@/app/router/paths';
import { CabinetPickItem } from '@/features/cabinet/components/CabinetPickItem';
import { CabinetPrimaryTabs } from '@/features/cabinet/components/CabinetPrimaryTabs';
import { CabinetProfileHeader } from '@/features/cabinet/components/CabinetProfileHeader';
import { CabinetStatsBar } from '@/features/cabinet/components/CabinetStatsBar';
import { CabinetSubTabs } from '@/features/cabinet/components/CabinetSubTabs';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

const PICKS = [
  { id: '1', name: '글렌피딕 12년', meta: '★ 92 · 맛있어서 추천', highlighted: true },
  { id: '2', name: '라프로익 10년', meta: '★ 88 · 피트 입문용' },
];

const COMMUNITY_POSTS = [
  { title: '라프로익 10 첫 피트 후기', meta: '#피트도전 · 게시글', likes: 42, ago: '2일 전' },
  { title: 'Glenfiddich 12 공개 리뷰', meta: '코 85 · 맛 88', likes: 18, ago: '1주 전' },
  { title: '싱글몰트 입문 칼럼', meta: '5분 읽기 · 칼럼', likes: 96, ago: '2주 전' },
];

function parseSection(v: string | null): CabinetSection {
  return v === 'community' ? 'community' : 'bar';
}

function parseTab(v: string | null): CabinetTab {
  if (v === 'wish' || v === 'pick' || v === 'note' || v === 'reviews') return v;
  return 'pick';
}

/** svg/pages/12-cabinet-me-bar.svg · 12-cabinet-me-community.svg */
export default function CabinetPage() {
  const [params] = useSearchParams();
  const section = parseSection(params.get('section'));
  const tab = parseTab(params.get('tab'));

  const barHref = `${PATHS.CABINET}?section=bar&tab=${tab}`;
  const communityHref = `${PATHS.CABINET}?section=community`;

  return (
    <WireframePage scroll>
      <CabinetProfileHeader
        name="위스키러버_kr (my)"
        subtitle="애호가 · 보틀 쉐어 공개"
        followers={128}
        following={94}
        isOwner
      />

      <CabinetPrimaryTabs section={section} barHref={barHref} communityHref={communityHref} />

      <p className="wf-text-sm wf-cabinet-hint">
        {section === 'bar'
          ? '선택한 메뉴: Bar — Pick·위시·노트·리뷰'
          : '선택한 메뉴: 커뮤니티 — 작성 글·리뷰·칼럼'}
      </p>

      <CabinetStatsBar pick={12} wish={8} reviews={24} notes={18} />

      {section === 'bar' ? (
        <>
          <CabinetSubTabs active={tab} basePath={`${PATHS.CABINET}?section=bar`} />
          <label className="wf-cabinet-share">
            <input type="checkbox" defaultChecked /> 보틀 쉐어 공개
          </label>
          {PICKS.map((p) => (
            <CabinetPickItem key={p.id} {...p} />
          ))}
        </>
      ) : (
        <>
          <Button style={{ width: 192, height: 46, marginTop: 8 }}>+ 글 작성</Button>
          {COMMUNITY_POSTS.map((post) => (
            <article key={post.title} className="wf-cabinet-post wf-box">
              <h3 className="wf-cabinet-post__title">{post.title}</h3>
              <p className="wf-text-sm">{post.meta}</p>
              <footer className="wf-cabinet-post__foot">
                <span className="wf-text-sm">♡ {post.likes} · {post.ago}</span>
                <span className="wf-link wf-text-sm">→ 글 상세</span>
              </footer>
            </article>
          ))}
        </>
      )}
    </WireframePage>
  );
}
