import { useParams, useSearchParams } from 'react-router-dom';
import { PATHS, type CabinetSection } from '@/app/router/paths';
import { CabinetPickItem } from '@/features/cabinet/components/CabinetPickItem';
import { CabinetPrimaryTabs } from '@/features/cabinet/components/CabinetPrimaryTabs';
import { CabinetProfileHeader } from '@/features/cabinet/components/CabinetProfileHeader';
import { CabinetStatsBar } from '@/features/cabinet/components/CabinetStatsBar';
import { CabinetSubTabs } from '@/features/cabinet/components/CabinetSubTabs';
import { WireframePage } from '@/shared/components/layout/WireframePage';

function parseSection(v: string | null): CabinetSection {
  return v === 'community' ? 'community' : 'bar';
}

/** svg/pages/13b-cabinet-other-bar.svg · 13b-cabinet-other-community.svg · 13b-cabinet-other-follow.svg */
export default function UserProfilePage() {
  const { userId } = useParams();
  const [params] = useSearchParams();
  const section = parseSection(params.get('section'));
  const handle = userId ?? 'user';
  const displayName = '위스키러버_kr';

  const base = `${PATHS.USER_PROFILE.replace(':userId', handle)}`;
  const barHref = `${base}?section=bar&tab=pick`;
  const communityHref = `${base}?section=community`;
  const followHref = `${base}?section=follow`;

  if (params.get('section') === 'follow') {
    return (
      <WireframePage scroll>
        <CabinetProfileHeader
          name={displayName}
          subtitle="애호가 · 보틀 쉐어 공개"
          followers={128}
          following={94}
          followHref={followHref}
          showFollowButton
        />
        <h2 className="wf-section-title">팔로잉 · 팔로워</h2>
        <p className="wf-text-sm">13b-cabinet-other-follow</p>
      </WireframePage>
    );
  }

  return (
    <WireframePage scroll>
      <CabinetProfileHeader
        name={displayName}
        subtitle="애호가 · 보틀 쉐어 공개"
        followers={128}
        following={94}
        followHref={followHref}
        showFollowButton
      />

      <CabinetPrimaryTabs
        section={section}
        ownerLabel={`${displayName}의`}
        barHref={barHref}
        communityHref={communityHref}
      />

      <p className="wf-text-sm wf-cabinet-hint">
        {section === 'bar'
          ? '선택한 메뉴: Bar — 공개 Pick·노트·리뷰 (♡ 위시 비공개)'
          : '선택한 메뉴: 커뮤니티 — 공개 글·리뷰'}
      </p>

      <CabinetStatsBar pick={12} reviews={24} notes={18} hideWish />

      {section === 'bar' ? (
        <>
          <CabinetSubTabs active="pick" basePath={`${base}?section=bar`} hideWish />
          <p className="wf-text-sm">♡ 위시리스트는 본인만 · 장바구니 개념</p>
          <CabinetPickItem id="1" name="글렌피딕 12년" meta="★ 92 · 공개 Pick" highlighted readonly />
          <CabinetPickItem id="2" name="라프로익 10년" meta="★ 88 · 공개 Pick" readonly />
          <p className="wf-text-xs">※ 제거·수정 불가 · 상세만 열람</p>
        </>
      ) : (
        <>
          <article className="wf-cabinet-post wf-box">
            <h3 className="wf-cabinet-post__title">스모키 위스키 입문 추천</h3>
            <p className="wf-text-sm">#입문 · 칼럼</p>
          </article>
          <p className="wf-text-sm">13b-cabinet-other-community</p>
        </>
      )}
    </WireframePage>
  );
}
