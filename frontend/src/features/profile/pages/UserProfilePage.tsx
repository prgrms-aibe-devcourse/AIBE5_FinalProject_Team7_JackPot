import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PATHS, type CabinetSection, type CabinetTab } from '@/app/router/paths';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import type { CabinetStatsResponse } from '@/features/cabinet/api/cabinetApi';
import { CabinetPickItem } from '@/features/cabinet/components/CabinetPickItem';
import { CabinetPagination } from '@/features/cabinet/components/CabinetPagination';
import { CabinetPrimaryTabs } from '@/features/cabinet/components/CabinetPrimaryTabs';
import { CabinetProfileHeader } from '@/features/cabinet/components/CabinetProfileHeader';
import { CabinetStatsBar } from '@/features/cabinet/components/CabinetStatsBar';
import { CabinetCommunitySection } from '@/features/cabinet/components/CabinetCommunitySection';
import { fetchMyReviews } from '@/features/review/api/reviewApi';
import { fetchUserTastingNotes } from '@/features/tasting-note/api/noteApi';
import type { MyTastingNote, TastingNoteTag } from '@/features/tasting-note/api/noteApi';
import type { WhiskeyReview } from '@/features/whiskey/types';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { toast } from '@/shared/components/ui/Toast';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import '@/features/cabinet/cabinet.css';
import '@/features/whiskey/whiskey.css';

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

function OtherFollowUserRow({ user, label }: { user: { userId: number; nickname: string; profileImageUrl: string | null }; label: string }) {
  const avatarSrc = resolveMediaUrl(user.profileImageUrl);
  const currentUserId = getCurrentUserId();
  const isSelf = currentUserId != null && currentUserId === user.userId;
  const href = isSelf ? PATHS.CABINET : PATHS.USER_PROFILE.replace(':userId', String(user.userId));

  return (
    <Link
      to={href}
      className="wf-follow-user-card"
    >
      <div className="wf-follow-user-card__avatar wf-placeholder">
        {avatarSrc ? <img src={avatarSrc} alt={user.nickname} /> : null}
      </div>
      <div className="wf-follow-user-card__info">
        <strong className="wf-follow-user-card__name">{user.nickname}</strong>
        <span className="wf-follow-user-card__label">{label}</span>
      </div>
      <span className="wf-follow-user-card__arrow">›</span>
    </Link>
  );
}

const FOLLOW_PAGE_SIZE = 15;

function OtherUserFollowSection({ targetUserId, displayName }: { targetUserId: number | null; displayName: string }) {
  const navigate = useNavigate();
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

  const totalPages = Math.max(1, Math.ceil((allUsers?.length ?? 0) / FOLLOW_PAGE_SIZE));
  const pagedUsers = allUsers?.slice(page * FOLLOW_PAGE_SIZE, (page + 1) * FOLLOW_PAGE_SIZE) ?? [];

  const setTab = (nextTab: FollowTab) => {
    const next = new URLSearchParams(params);
    next.set('followTab', nextTab);
    setParams(next);
    setPage(0);
  };

  return (
    <>
      <div className="wf-follow-page-header">
        <button
          type="button"
          className="wf-follow-back-btn"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          ← 뒤로
        </button>
        <h2 className="wf-follow-page-title">{displayName}의 팔로우</h2>
      </div>

      <div className="wf-follow-tabs" role="tablist" aria-label="팔로우 목록">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'followers'}
          className={`wf-follow-tab${tab === 'followers' ? ' wf-follow-tab--on' : ''}`}
          onClick={() => setTab('followers')}
        >
          팔로워
          {followersQuery.data && (
            <span className="wf-follow-tab__count">{followersQuery.data.length}</span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'followings'}
          className={`wf-follow-tab${tab === 'followings' ? ' wf-follow-tab--on' : ''}`}
          onClick={() => setTab('followings')}
        >
          팔로잉
          {followingsQuery.data && (
            <span className="wf-follow-tab__count">{followingsQuery.data.length}</span>
          )}
        </button>
      </div>

      <div className="wf-follow-list">
        {isLoading ? (
          <p className="wf-text-sm" style={{ padding: '20px 0' }}>목록을 불러오는 중입니다.</p>
        ) : isError ? (
          <p className="wf-text-sm" style={{ padding: '20px 0' }}>목록을 불러오지 못했습니다.</p>
        ) : pagedUsers.length ? (
          pagedUsers.map((user) => (
            <OtherFollowUserRow
              key={user.userId}
              user={user}
              label={tab === 'followers' ? '이 사람을 팔로우합니다' : '이 사람이 팔로우합니다'}
            />
          ))
        ) : (
          <p className="wf-text-sm" style={{ padding: '20px 0' }}>
            {tab === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로잉한 사용자가 없습니다.'}
          </p>
        )}
      </div>

      <CabinetPagination
        page={page}
        totalPages={totalPages}
        onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        disabled={isLoading}
      />
    </>
  );
}

function OtherReviewItem({ review }: { review: WhiskeyReview }) {
  const whiskeyLabel = review.whiskeyName ?? (review.whiskeyId ? `위스키 #${review.whiskeyId}` : `리뷰 #${review.id}`);

  return (
    <article className="wf-review-card-v2 wf-box">
      <div className="wf-review-card-v2__head">
        <h3 className="wf-review-card-v2__title">{whiskeyLabel}</h3>
        {review.whiskeyId && (
          <Link
            to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(review.whiskeyId))}
            className="wf-cabinet-action-btn wf-cabinet-action-btn--detail"
          >
            상세
          </Link>
        )}
      </div>
      <div className="wf-review-card-v2__meta">
        <span className="wf-review-card-v2__stars">
          {'★'.repeat(Math.round(Number(review.rating)))}{'☆'.repeat(5 - Math.round(Number(review.rating)))}
        </span>
        <span className="wf-review-card-v2__rating">{Number(review.rating).toFixed(1)}</span>
        <span className="wf-review-card-v2__badge">공개 리뷰</span>
      </div>
      <p className="wf-review-card-v2__body">{review.publicText || '작성된 리뷰 내용이 없습니다.'}</p>
    </article>
  );
}

function OtherNoteTagList({ tags }: { tags: TastingNoteTag[] }) {
  const [filter, setFilter] = useState<'nose' | 'taste' | 'finish'>('nose');
  const filtered = tags.filter((t) => t.category === filter);
  const labelMap = { nose: '노즈', taste: '팔레트', finish: '피니시' };

  return (
    <div className="wf-attached-note__tags">
      <div className="wf-attached-note__tag-tabs" role="group">
        {(['nose', 'taste'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            data-category={cat}
            className={`wf-attached-note__tag-tab${filter === cat ? ' wf-attached-note__tag-tab--on' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {labelMap[cat]}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className={`wf-attached-note__tag-list wf-attached-note__tag-list--${filter}`}>
          {filtered.map((tag) => (
            <span key={tag.id} className="wf-attached-note__tag-chip">{tag.name}</span>
          ))}
        </div>
      ) : (
        <p className="wf-text-sm wf-attached-note__empty">{labelMap[filter]}가 없습니다.</p>
      )}
    </div>
  );
}

function OtherNoteItem({ note }: { note: MyTastingNote }) {
  const [isOpen, setIsOpen] = useState(false);
  const tagPreview = note.tags?.slice(0, 4) ?? [];

  return (
    <article className={`wf-note-card-v2 wf-box${isOpen ? ' wf-note-card-v2--open' : ''}`}>
      <div className="wf-note-card-v2__head">
        <div className="wf-note-card-v2__head-body">
          <h3 className="wf-note-card-v2__title">{note.whiskeyName}</h3>
          <div className="wf-note-card-v2__meta">
            <span className="wf-note-card-v2__status">✓ 작성 완료</span>
            <span className="wf-note-card-v2__date">{note.updatedAt?.slice(0, 10) ?? '-'}</span>
          </div>
        </div>
      </div>

      <p className="wf-note-card-v2__body">{note.memo || '작성된 메모가 없습니다.'}</p>

      <footer className="wf-note-card-v2__footer">
        <div className="wf-note-card-v2__tags">
          {tagPreview.length > 0 ? (
            <>
              {tagPreview.map((tag) => (
                <span key={tag.id} className="wf-note-card-v2__tag">{tag.name}</span>
              ))}
              {note.tags.length > tagPreview.length && (
                <span className="wf-note-card-v2__tag wf-note-card-v2__tag--more">
                  +{note.tags.length - tagPreview.length}
                </span>
              )}
            </>
          ) : (
            <span className="wf-note-card-v2__no-tags">태그 없음</span>
          )}
        </div>
        <button
          type="button"
          className="wf-cabinet-action-btn wf-cabinet-action-btn--neutral"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? '접기' : '상세'}
        </button>
      </footer>

      {isOpen && (
        <section className="wf-attached-note wf-box" aria-label="시음 노트 상세">
          <div className="wf-attached-note__body">
            <div className="wf-attached-note__content">
              <p className="wf-text-label">작성한 한줄평</p>
              <p className="wf-text-sm wf-attached-note__memo">{note.memo || '작성된 메모가 없습니다.'}</p>
              <OtherNoteTagList tags={note.tags ?? []} />
            </div>
          </div>
        </section>
      )}
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
  const [publicProfile, setPublicProfile] = useState<{ nickname: string; profileImageUrl: string | null } | null>(null);

  const displayName = useMemo(() => {
    if (publicProfile) return publicProfile.nickname;
    if (targetUserId != null) return `사용자 #${targetUserId}`;
    return '사용자';
  }, [publicProfile, targetUserId]);

  const profileImageUrl = useMemo(() => publicProfile?.profileImageUrl ?? null, [publicProfile]);

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
      .then((res) => setPublicProfile({ nickname: res.nickname, profileImageUrl: res.profileImageUrl }))
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
        <CabinetProfileHeader
          name={displayName}
          profileImageUrl={profileImageUrl}
          followers={followerCount}
          following={followingCount}
          followersHref={`${followHref}&followTab=followers`}
          followingHref={`${followHref}&followTab=followings`}
          showFollowButton={!isSelf}
          isFollowing={isFollowing}
          followBusy={followBusy}
          onFollowClick={handleFollowClick}
        />
        <OtherUserFollowSection targetUserId={targetUserId} displayName={displayName} />
      </WireframePage>
    );
  }

  return (
    <WireframePage scroll>
      <CabinetProfileHeader
        name={displayName}
        profileImageUrl={profileImageUrl}
        followers={followerCount}
        following={followingCount}
        followersHref={`${followHref}&followTab=followers`}
        followingHref={`${followHref}&followTab=followings`}
        showFollowButton={!isSelf}
        isFollowing={isFollowing}
        followBusy={followBusy}
        onFollowClick={handleFollowClick}
      />

      <CabinetPrimaryTabs
        section={section}
        barHref={barHref}
        communityHref={communityHref}
      />

      <p className="wf-text-sm wf-cabinet-hint" style={{ display: 'none' }}>
        {section === 'bar'
          ? '선택한 메뉴: Bar — 공개 Pick·노트·리뷰'
          : '선택한 메뉴: 커뮤니티 — 공개 글·리뷰'}
      </p>

      {section === 'bar' ? (
        <CabinetStatsBar
          pick={cabinetStats?.pickCount ?? picks.length}
          reviews={cabinetStats?.reviewCount ?? (reviews?.content.length ?? 0)}
          notes={cabinetStats?.noteCount ?? 0}
          hideWish
          active={tab}
          basePath={`${base}?section=bar`}
        />
      ) : null}

      {section === 'bar' ? (
        <>
          {tab === 'pick' ? (
            picksLoading ? (
              <p className="wf-text-sm">픽 목록을 불러오는 중입니다...</p>
            ) : picks.length === 0 ? (
              <p className="wf-text-sm">아직 공개된 Pick이 없습니다.</p>
            ) : (
              <>
                <div className="wf-cabinet-pick-grid">
                  {picks.map((pick: any, index: number) => (
                    <CabinetPickItem
                      key={pick.pickId ?? index}
                      id={String(pick.whiskey?.id ?? '')}
                      name={pick.whiskey?.name ?? '위스키'}
                      imageUrl={pick.whiskey?.imageUrl ?? null}
                      meta={`${pick.whiskey?.type ?? ''} · ${pick.whiskey?.abv ?? '-'}%`}
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
              <p className="wf-text-sm">사용자 정보를 찾을 수 없습니다.</p>
            ) : reviewsLoading ? (
              <p className="wf-text-sm">리뷰를 불러오는 중입니다...</p>
            ) : reviews?.content.length ? (
              <>
                {reviews.content.map((review) => <OtherReviewItem key={review.id} review={review} />)}
                <CabinetPagination
                  page={reviewPage}
                  totalPages={reviews.totalPages ?? 1}
                  onPage={(p) => { setReviewPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={reviewsLoading}
                />
              </>
            ) : (
              <p className="wf-text-sm">아직 작성한 리뷰가 없습니다.</p>
            )
          ) : tab === 'note' ? (
            notesLoading ? (
              <p className="wf-text-sm">노트를 불러오는 중입니다...</p>
            ) : userNotes?.content.length ? (
              <>
                {userNotes.content.map((note) => <OtherNoteItem key={note.id} note={note} />)}
                <CabinetPagination
                  page={notePage}
                  totalPages={userNotes.totalPages ?? 1}
                  onPage={(p) => { setNotePage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={notesLoading}
                />
              </>
            ) : (
              <p className="wf-text-sm">아직 작성한 노트가 없습니다.</p>
            )
          ) : null}
        </>
      ) : (
        <CabinetCommunitySection authorId={targetUserId} />
      )}
    </WireframePage>
  );
}
