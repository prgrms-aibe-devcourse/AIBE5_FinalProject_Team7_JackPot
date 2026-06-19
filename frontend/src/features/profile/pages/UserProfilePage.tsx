import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PATHS, type CabinetSection, type CabinetTab } from '@/app/router/paths';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import type { CabinetStatsResponse } from '@/features/cabinet/api/cabinetApi';
import { CabinetPickItem } from '@/features/cabinet/components/CabinetPickItem';
import { CabinetPagination } from '@/features/cabinet/components/CabinetPagination';
import { CabinetProfileHeader } from '@/features/cabinet/components/CabinetProfileHeader';
import { CabinetStatsBar } from '@/features/cabinet/components/CabinetStatsBar';
import { CabinetFeedEmpty, CabinetFeedLoading, CabinetReviewFeedThumb } from '@/features/cabinet/components/CabinetFeedParts';
import { CabinetNoteExpandDetail } from '@/features/cabinet/components/CabinetNoteExpandDetail';
import { CabinetCommunitySection } from '@/features/cabinet/components/CabinetCommunitySection';
import { fetchMyReviews } from '@/features/review/api/reviewApi';
import { fetchUserTastingNotes } from '@/features/tasting-note/api/noteApi';
import type { MyTastingNote } from '@/features/tasting-note/api/noteApi';
import type { WhiskeyReview } from '@/features/whiskey/types';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { toast } from '@/shared/components/ui/Toast';
import { resolveProfileImageUrl } from '@/shared/lib/mediaUrl';
import { formatWhiskeySpec } from '@/shared/lib/whiskeyLabels';
import '@/features/cabinet/cabinet.css';
import '@/features/whiskey/whiskey.css';
import '@/features/search/search.css';

type FollowTab = 'followers' | 'followings';

function parseFollowTab(value: string | null): FollowTab {
  return value === 'followings' ? 'followings' : 'followers';
}

function parseSection(v: string | null): CabinetSection {
  return v === 'community' ? 'community' : 'bar';
}

function parseTab(v: string | null): CabinetTab {
  if (v === 'pick' || v === 'note' || v === 'reviews') return v;
  return 'pick';
}

function toUserId(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getCurrentUserId(): number | null {
  const value = localStorage.getItem('userId');
  if (!value) return null;

  const userId = Number(value);
  return Number.isFinite(userId) ? userId : null;
}

function OtherFollowUserRow({ user }: { user: { userId: number; nickname: string; profileImageUrl: string | null } }) {
  const avatarSrc = resolveProfileImageUrl(user.profileImageUrl, user.userId);
  const currentUserId = getCurrentUserId();
  const isSelf = currentUserId != null && currentUserId === user.userId;
  const href = isSelf ? PATHS.CABINET : PATHS.USER_PROFILE.replace(':userId', String(user.userId));

  return (
    <li>
      <Link to={href} className="wf-cabinet-follow-row">
        <div className="wf-cabinet-follow-row__avatar">
          <img src={avatarSrc} alt="" />
        </div>
        <span className="wf-cabinet-follow-row__name">{user.nickname}</span>
        <span className="wf-cabinet-follow-row__chevron" aria-hidden>
          ›
        </span>
      </Link>
    </li>
  );
}

const FOLLOW_PAGE_SIZE = 15;

function OtherUserFollowSection({ targetUserId }: { targetUserId: number | null; displayName: string }) {
  const [params, setParams] = useSearchParams();
  const tab = parseFollowTab(params.get('followTab'));
  const [page, setPage] = useState(0);

  const followersQuery = useQuery({
    queryKey: ['follows', 'followers', 'list', targetUserId],
    queryFn: () => cabinetApi.getFollowers(targetUserId ?? undefined),
    enabled: targetUserId != null && tab === 'followers',
  });

  const followingsQuery = useQuery({
    queryKey: ['follows', 'followings', 'list', targetUserId],
    queryFn: () => cabinetApi.getFollowings(targetUserId ?? undefined),
    enabled: targetUserId != null && tab === 'followings',
  });

  const allUsers = tab === 'followers' ? followersQuery.data : followingsQuery.data;
  const isLoading = tab === 'followers' ? followersQuery.isLoading : followingsQuery.isLoading;
  const isError = tab === 'followers' ? followersQuery.isError : followingsQuery.isError;
  const followerTotal = followersQuery.data?.length ?? 0;
  const followingTotal = followingsQuery.data?.length ?? 0;

  const totalPages = Math.max(1, Math.ceil((allUsers?.length ?? 0) / FOLLOW_PAGE_SIZE));
  const pagedUsers = allUsers?.slice(page * FOLLOW_PAGE_SIZE, (page + 1) * FOLLOW_PAGE_SIZE) ?? [];

  const setTab = (nextTab: FollowTab) => {
    const next = new URLSearchParams(params);
    next.set('followTab', nextTab);
    setParams(next);
    setPage(0);
  };

  return (
    <div className="wf-cabinet-body">
      <nav className="wf-ig-tabs" role="tablist" aria-label="팔로우 목록">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'followers'}
          className={`wf-ig-tabs__item${tab === 'followers' ? ' wf-ig-tabs__item--on' : ''}`}
          onClick={() => setTab('followers')}
        >
          팔로워 {followerTotal}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'followings'}
          className={`wf-ig-tabs__item${tab === 'followings' ? ' wf-ig-tabs__item--on' : ''}`}
          onClick={() => setTab('followings')}
        >
          팔로우 {followingTotal}
        </button>
      </nav>

      <section className="wf-cabinet-panel wf-cabinet-panel--feed">
        {isLoading ? (
          <CabinetFeedLoading message="목록을 불러오는 중입니다." />
        ) : isError ? (
          <CabinetFeedEmpty title="목록을 불러오지 못했습니다." />
        ) : pagedUsers.length ? (
          <ul className="wf-cabinet-follow-list">
            {pagedUsers.map((user) => (
              <OtherFollowUserRow key={user.userId} user={user} />
            ))}
          </ul>
        ) : (
          <CabinetFeedEmpty
            title={tab === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로우한 사용자가 없습니다.'}
          />
        )}

        <CabinetPagination
          page={page}
          totalPages={totalPages}
          onPage={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={isLoading}
        />
      </section>
    </div>
  );
}

function OtherReviewItem({ review }: { review: WhiskeyReview }) {
  const whiskeyLabel = review.whiskeyName ?? (review.whiskeyId ? `위스키 #${review.whiskeyId}` : `리뷰 #${review.id}`);

  return (
    <li className="wf-cabinet-feed__item wf-cabinet-feed__item--review">
      <div className="wf-cabinet-feed__row">
        <CabinetReviewFeedThumb
          whiskeyId={review.whiskeyId}
          whiskeyName={whiskeyLabel}
          imageUrl={review.whiskeyImageUrl}
        />
        <div className="wf-cabinet-feed__body">
          <div className="wf-cabinet-feed__head">
            {review.whiskeyId ? (
              <Link
                to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(review.whiskeyId))}
                className="wf-cabinet-feed__title wf-cabinet-feed__title--link"
              >
                {whiskeyLabel}
              </Link>
            ) : (
              <strong className="wf-cabinet-feed__title">{whiskeyLabel}</strong>
            )}
            <span className="wf-cabinet-feed__rating">★ {Number(review.rating).toFixed(1)}</span>
          </div>
          <p className="wf-cabinet-feed__text">{review.publicText || '작성된 리뷰 내용이 없습니다.'}</p>
          {review.whiskeyId ? (
            <div className="wf-cabinet-feed__actions">
              <Link
                to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(review.whiskeyId))}
                className="wf-cabinet-feed__action"
              >
                위스키 보기
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function OtherNoteItem({ note }: { note: MyTastingNote }) {
  const [isOpen, setIsOpen] = useState(false);
  const tagPreview = note.tags?.slice(0, 4) ?? [];

  return (
    <li className={`wf-cabinet-feed__item${isOpen ? ' wf-cabinet-feed__item--open' : ''}`}>
      <div className="wf-cabinet-feed__head">
        <strong className="wf-cabinet-feed__title">{note.whiskeyName}</strong>
        <span className="wf-cabinet-feed__badge">작성 완료</span>
      </div>
      <p className="wf-cabinet-feed__meta">{note.updatedAt?.slice(0, 10) ?? '-'}</p>
      <p className="wf-cabinet-feed__text">{note.memo || '작성된 메모가 없습니다.'}</p>

      {!isOpen && tagPreview.length > 0 ? (
        <div className="wf-cabinet-feed__tags">
          {tagPreview.map((tag) => (
            <span key={tag.id} className="wf-cabinet-feed__tag">{tag.name}</span>
          ))}
          {note.tags && note.tags.length > tagPreview.length ? (
            <span className="wf-cabinet-feed__tag wf-cabinet-feed__tag--more">
              +{note.tags.length - tagPreview.length}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="wf-cabinet-feed__actions">
        <button type="button" className="wf-cabinet-feed__action" onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? '접기' : '상세 보기'}
        </button>
      </div>

      {isOpen ? <CabinetNoteExpandDetail note={note} /> : null}
    </li>
  );
}

/** svg/pages/13b-cabinet-other-bar.svg · 13b-cabinet-other-community.svg · 13b-cabinet-other-follow.svg */
export default function UserProfilePage() {
  const { userId } = useParams();
  const [params] = useSearchParams();
  const section = parseSection(params.get('section'));
  const tab = parseTab(params.get('tab'));
  const targetUserId = toUserId(userId);
  const currentUserId = getCurrentUserId();
  const isSelf = currentUserId != null && targetUserId != null && currentUserId === targetUserId;

  const [picks, setPicks] = useState<any[]>([]);
  const [picksLoading, setPicksLoading] = useState(false);
  const [pickPage, setPickPage] = useState(0);
  const [pickTotalPages, setPickTotalPages] = useState(1);
  const PICK_PAGE_SIZE = 12;

  const [cabinetStats, setCabinetStats] = useState<CabinetStatsResponse | null>(null);
  const [reviews, setReviews] = useState<{ content: WhiskeyReview[]; totalPages?: number } | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const REVIEW_PAGE_SIZE = 10;

  const [userNotes, setUserNotes] = useState<{ content: MyTastingNote[]; totalPages?: number } | null>(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notePage, setNotePage] = useState(0);
  const NOTE_PAGE_SIZE = 10;
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const queryClient = useQueryClient();
  const [publicProfile, setPublicProfile] = useState<{
    nickname: string;
    profileImageUrl: string | null;
    introduction: string | null;
  } | null>(null);

  const displayName = useMemo(() => {
    if (publicProfile) return publicProfile.nickname;
    if (targetUserId != null) return `사용자 #${targetUserId}`;
    return '사용자';
  }, [publicProfile, targetUserId]);

  const profileImageUrl = useMemo(() => publicProfile?.profileImageUrl ?? null, [publicProfile]);
  const profileIntroduction = useMemo(() => publicProfile?.introduction ?? null, [publicProfile]);

  const handle = userId ?? 'user';
  const base = `${PATHS.USER_PROFILE.replace(':userId', handle)}`;
  const barHref = `${base}?section=bar&tab=${tab}`;
  const communityHref = `${base}?section=community`;
  const followHref = `${base}?section=follow`;

  useEffect(() => {
    if (targetUserId == null) return;

    setPicksLoading(true);
    cabinetApi
      .getPickList(targetUserId, pickPage, PICK_PAGE_SIZE)
      .then((res) => {
        const pageData = res.data.data;
        setPicks(pageData.content ?? []);
        setPickTotalPages(pageData.totalPages ?? 1);
      })
      .catch(() => { setPicks([]); })
      .finally(() => setPicksLoading(false));
  }, [targetUserId, pickPage]);

  // 닉네임·프로필 이미지 — 리뷰/픽 유무와 무관하게 항상 조회
  useEffect(() => {
    if (targetUserId == null) return;

    cabinetApi
      .getPublicProfile(targetUserId)
      .then((res) =>
        setPublicProfile({
          nickname: res.nickname,
          profileImageUrl: res.profileImageUrl,
          introduction: res.introduction,
        })
      )
      .catch(() => setPublicProfile(null));
  }, [targetUserId]);

  useEffect(() => {
    if (targetUserId == null) return;

    cabinetApi
      .getFollowerCount(targetUserId)
      .then((res) => setFollowerCount(res.count))
      .catch(() => setFollowerCount(0));

    cabinetApi
      .getFollowingCount(targetUserId)
      .then((res) => setFollowingCount(res.count))
      .catch(() => setFollowingCount(0));
  }, [targetUserId]);

  useEffect(() => {
    if (targetUserId == null || isSelf) {
      setIsFollowing(false);
      return;
    }

    cabinetApi
      .getFollowStatus(targetUserId)
      .then((res) => setIsFollowing(res.following))
      .catch(() => setIsFollowing(false));
  }, [targetUserId, isSelf]);

  const handleFollowClick = async () => {
    if (targetUserId == null || isSelf || followBusy) return;

    setFollowBusy(true);
    try {
      if (isFollowing) {
        await cabinetApi.unfollowUser(targetUserId);
        setIsFollowing(false);
        setFollowerCount((count) => Math.max(0, count - 1));
        toast('팔로우를 취소했습니다.', 'info');
      } else {
        await cabinetApi.followUser(targetUserId);
        setIsFollowing(true);
        setFollowerCount((count) => count + 1);
        toast('팔로우했습니다.', 'success');
      }
      // 팔로우 관련 모든 캐시 무효화 (목록 및 카운트)
      await queryClient.invalidateQueries({ queryKey: ['follows'] });
    } catch (error) {
      toast(error instanceof Error ? error.message : '팔로우 처리에 실패했습니다.', 'error');
    } finally {
      setFollowBusy(false);
    }
  };

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
    fetchMyReviews(targetUserId, reviewPage, REVIEW_PAGE_SIZE)
      .then((data) => setReviews(data))
      .catch(() => setReviews({ content: [] }))
      .finally(() => setReviewsLoading(false));
  }, [targetUserId, reviewPage]);

  useEffect(() => {
    if (targetUserId == null) return;

    setNotesLoading(true);
    fetchUserTastingNotes(targetUserId, notePage, NOTE_PAGE_SIZE)
      .then((data) => setUserNotes({ content: data.content, totalPages: data.totalPages }))
      .catch(() => setUserNotes({ content: [] }))
      .finally(() => setNotesLoading(false));
  }, [targetUserId, notePage]);

  if (params.get('section') === 'follow') {
    return (
      <WireframePage scroll>
        <div className="wf-cabinet-page">
          <CabinetProfileHeader
            name={displayName}
            profileImageUrl={profileImageUrl}
            introduction={profileIntroduction}
            followers={followerCount}
            following={followingCount}
            followersHref={`${followHref}&followTab=followers`}
            followingHref={`${followHref}&followTab=followings`}
            avatarSeed={targetUserId ?? displayName}
            showFollowButton={!isSelf}
            isFollowing={isFollowing}
            followBusy={followBusy}
            onFollowClick={handleFollowClick}
            section={section}
            barHref={barHref}
            communityHref={communityHref}
          />
          <OtherUserFollowSection targetUserId={targetUserId} displayName={displayName} />
        </div>
      </WireframePage>
    );
  }

  return (
    <WireframePage scroll>
      <div className="wf-cabinet-page">
        <CabinetProfileHeader
          name={displayName}
          profileImageUrl={profileImageUrl}
          introduction={profileIntroduction}
          followers={followerCount}
          following={followingCount}
          followersHref={`${followHref}&followTab=followers`}
          followingHref={`${followHref}&followTab=followings`}
          avatarSeed={targetUserId ?? displayName}
          showFollowButton={!isSelf}
          isFollowing={isFollowing}
          followBusy={followBusy}
          onFollowClick={handleFollowClick}
          section={section}
          barHref={barHref}
          communityHref={communityHref}
        />

        {section === 'bar' ? (
          <div className="wf-cabinet-body">
            <CabinetStatsBar
              pick={cabinetStats?.pickCount ?? picks.length}
              reviews={cabinetStats?.reviewCount ?? (reviews?.content.length ?? 0)}
              notes={cabinetStats?.noteCount ?? 0}
              hideWish
              active={tab}
              basePath={`${base}?section=bar`}
            />

            <section className={`wf-cabinet-panel${tab === 'pick' ? ' wf-cabinet-panel--grid' : ' wf-cabinet-panel--feed'}`}>
              {tab === 'pick' ? (
                picksLoading ? (
                  <CabinetFeedLoading message="픽 목록을 불러오는 중입니다..." />
                ) : picks.length === 0 ? (
                  <CabinetFeedEmpty title="아직 공개된 Pick이 없습니다." meta="이 사용자가 공개한 Pick이 없어요." />
                ) : (
                  <>
                    <div className="wf-ig-grid">
                      {picks.map((pick: { pickId?: number; whiskey?: { id?: number; name?: string; imageUrl?: string | null; type?: string; abv?: number | null } }, index: number) => (
                        <CabinetPickItem
                          key={pick.pickId ?? index}
                          id={String(pick.whiskey?.id ?? '')}
                          name={pick.whiskey?.name ?? '위스키'}
                          imageUrl={pick.whiskey?.imageUrl ?? null}
                          meta={formatWhiskeySpec(pick.whiskey?.type, pick.whiskey?.abv)}
                          readonly
                        />
                      ))}
                    </div>
                    <CabinetPagination
                      page={pickPage}
                      totalPages={pickTotalPages}
                      onPage={(p) => { setPickPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={picksLoading}
                    />
                  </>
                )
              ) : tab === 'reviews' ? (
                targetUserId == null ? (
                  <CabinetFeedLoading message="사용자 정보를 찾을 수 없습니다." />
                ) : reviewsLoading ? (
                  <CabinetFeedLoading message="리뷰를 불러오는 중입니다..." />
                ) : reviews?.content.length ? (
                  <>
                    <ul className="wf-cabinet-feed">
                      {reviews.content.map((review) => <OtherReviewItem key={review.id} review={review} />)}
                    </ul>
                    <CabinetPagination
                      page={reviewPage}
                      totalPages={reviews.totalPages ?? 1}
                      onPage={(p) => { setReviewPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={reviewsLoading}
                    />
                  </>
                ) : (
                  <CabinetFeedEmpty title="아직 작성한 리뷰가 없습니다." meta="공개된 리뷰가 없어요." />
                )
              ) : tab === 'note' ? (
                notesLoading ? (
                  <CabinetFeedLoading message="노트를 불러오는 중입니다..." />
                ) : userNotes?.content.length ? (
                  <>
                    <ul className="wf-cabinet-feed">
                      {userNotes.content.map((note) => <OtherNoteItem key={note.id} note={note} />)}
                    </ul>
                    <CabinetPagination
                      page={notePage}
                      totalPages={userNotes.totalPages ?? 1}
                      onPage={(p) => { setNotePage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={notesLoading}
                    />
                  </>
                ) : (
                  <CabinetFeedEmpty title="아직 작성한 노트가 없습니다." meta="공개된 시음 노트가 없어요." />
                )
              ) : null}
            </section>
          </div>
        ) : (
          <div className="wf-cabinet-body">
            <section className="wf-cabinet-panel wf-cabinet-panel--feed">
              <CabinetCommunitySection authorId={targetUserId} />
            </section>
          </div>
        )}
      </div>
    </WireframePage>
  );
}
