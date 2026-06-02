import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PATHS, type CabinetSection, type CabinetTab } from '@/app/router/paths';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import type { CabinetStatsResponse } from '@/features/cabinet/api/cabinetApi';
import { CabinetPickItem } from '@/features/cabinet/components/CabinetPickItem';
import { CabinetPrimaryTabs } from '@/features/cabinet/components/CabinetPrimaryTabs';
import { CabinetProfileHeader } from '@/features/cabinet/components/CabinetProfileHeader';
import { CabinetStatsBar } from '@/features/cabinet/components/CabinetStatsBar';
import { CabinetSubTabs } from '@/features/cabinet/components/CabinetSubTabs';
import { fetchMyReviews } from '@/features/review/api/reviewApi';
import type { WhiskeyReview } from '@/features/whiskey/types';
import { WireframePage } from '@/shared/components/layout/WireframePage';

function parseSection(v: string | null): CabinetSection {
  return v === 'community' ? 'community' : 'bar';
}

function parseTab(v: string | null): CabinetTab {
  if (v === 'wish' || v === 'pick' || v === 'note' || v === 'reviews') return v;
  return 'pick';
}

function toUserId(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function OtherReviewItem({ review }: { review: WhiskeyReview }) {
  const whiskeyLabel = review.whiskeyName ?? (review.whiskeyId ? `위스키 #${review.whiskeyId}` : `리뷰 #${review.id}`);

  return (
    <article className="wf-cabinet-post wf-box">
      <div className="wf-review-card__head">
        <div>
          <h3 className="wf-cabinet-post__title">{whiskeyLabel}</h3>
          <p className="wf-text-sm">별점 {Number(review.rating).toFixed(1)} · 공개 리뷰</p>
        </div>
        {review.whiskeyId && (
          <Link
            to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(review.whiskeyId))}
            className="wf-link wf-text-sm"
          >
            상세
          </Link>
        )}
      </div>
      <p className="wf-text-sm">{review.publicText || '작성된 리뷰 내용이 없습니다.'}</p>
    </article>
  );
}

/** svg/pages/13b-cabinet-other-bar.svg · 13b-cabinet-other-community.svg · 13b-cabinet-other-follow.svg */
export default function UserProfilePage() {
  const { userId } = useParams();
  const [params] = useSearchParams();
  const section = parseSection(params.get('section'));
  const tab = parseTab(params.get('tab'));
  const targetUserId = toUserId(userId);

  const [picks, setPicks] = useState<any[]>([]);
  const [picksLoading, setPicksLoading] = useState(false);
  const [cabinetStats, setCabinetStats] = useState<CabinetStatsResponse | null>(null);
  const [reviews, setReviews] = useState<{ content: WhiskeyReview[] } | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const displayName = useMemo(() => {
    if (reviews?.content?.length) return reviews.content[0].nickname;
    if (targetUserId != null) return `사용자 #${targetUserId}`;
    return '사용자';
  }, [reviews, targetUserId]);

  const profileImageUrl = useMemo(() => {
    if (reviews?.content?.length) return reviews.content[0].profileImageUrl;
    return null;
  }, [reviews]);

  const handle = userId ?? 'user';
  const base = `${PATHS.USER_PROFILE.replace(':userId', handle)}`;
  const barHref = `${base}?section=bar&tab=${tab}`;
  const communityHref = `${base}?section=community`;
  const followHref = `${base}?section=follow`;

  useEffect(() => {
    if (targetUserId == null) return;

    setPicksLoading(true);
    cabinetApi
      .getPickList(targetUserId)
      .then((res) => setPicks(res.data.data.content ?? []))
      .catch(() => setPicks([]))
      .finally(() => setPicksLoading(false));
  }, [targetUserId]);

  useEffect(() => {
    if (targetUserId == null) return;

    // 서버 정책에 따라 401이 날 수 있으므로 실패해도 화면을 막지 않는다.
    cabinetApi
      .getUserCabinetStats(targetUserId)
      .then((res) => setCabinetStats(res))
      .catch(() => setCabinetStats(null));
  }, [targetUserId]);

  useEffect(() => {
    if (targetUserId == null) return;

    setReviewsLoading(true);
    fetchMyReviews(targetUserId, 0, 20)
      .then((data) => setReviews(data))
      .catch(() => setReviews({ content: [] }))
      .finally(() => setReviewsLoading(false));
  }, [targetUserId]);

  if (params.get('section') === 'follow') {
    return (
      <WireframePage scroll>
        <CabinetProfileHeader
          name={displayName}
          subtitle="애호가 · 보틀 쉐어 공개"
          profileImageUrl={profileImageUrl}
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
        profileImageUrl={profileImageUrl}
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

      <CabinetStatsBar
        pick={cabinetStats?.pickCount ?? picks.length}
        reviews={cabinetStats?.reviewCount ?? (reviews?.content.length ?? 0)}
        notes={cabinetStats?.noteCount ?? 0}
        hideWish
      />

      {section === 'bar' ? (
        <>
          <CabinetSubTabs active={tab} basePath={`${base}?section=bar`} hideWish />
          <p className="wf-text-sm">♡ 위시리스트는 본인만 · 장바구니 개념</p>
          {tab === 'pick' ? (
            picksLoading ? (
              <p className="wf-text-sm">픽 목록을 불러오는 중입니다...</p>
            ) : picks.length === 0 ? (
              <p className="wf-text-sm">아직 공개된 Pick이 없습니다.</p>
            ) : (
              <>
                {picks.map((pick: any, index: number) => (
                  <CabinetPickItem
                    key={pick.pickId ?? index}
                    id={String(pick.whiskey?.id ?? '')}
                    name={pick.whiskey?.name ?? '위스키'}
                    meta={`${pick.whiskey?.type ?? ''} · ${pick.whiskey?.abv ?? '-'}%`}
                    readonly
                  />
                ))}
                <p className="wf-text-xs">※ 타인 캐비넷: 제거·수정 불가 · 상세만 열람</p>
              </>
            )
          ) : tab === 'reviews' ? (
            targetUserId == null ? (
              <p className="wf-text-sm">사용자 정보를 찾을 수 없습니다.</p>
            ) : reviewsLoading ? (
              <p className="wf-text-sm">리뷰를 불러오는 중입니다...</p>
            ) : reviews?.content.length ? (
              reviews.content.map((review) => <OtherReviewItem key={review.id} review={review} />)
            ) : (
              <p className="wf-text-sm">아직 작성한 리뷰가 없습니다.</p>
            )
          ) : tab === 'note' ? (
            <p className="wf-text-sm">노트 기능은 준비 중입니다.</p>
          ) : (
            <p className="wf-text-sm">위시리스트는 타인에게 공개되지 않습니다.</p>
          )}
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
