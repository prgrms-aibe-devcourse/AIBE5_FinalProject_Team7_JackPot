import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import { WishFolderModal } from '@/features/cabinet/components/WishFolderModal';
import { toast } from '@/shared/components/ui/Toast';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { Button } from '@/shared/components/ui/Button';
import { ReviewAttachedNote } from '@/features/review/components/ReviewAttachedNote';
import { useToggleReviewLike } from '@/features/review/hooks/useReviews';
import { fetchMyTastingNoteForWhiskey, type MyTastingNote } from '@/features/tasting-note/api/noteApi';
import { whiskeyApi } from '../api/whiskeyApi';
import { isLoggedIn } from '@/shared/lib/authSession';
import { RelatedColumns } from '../components/RelatedColumns';
import { RelatedWhiskeys } from '../components/RelatedWhiskeys';
import { TastingSummaryPanel } from '../components/TastingSummaryPanel';
import { TastingTagsBubble } from '../components/TastingTagsBubble';
import { WishPickActions } from '../components/WishPickActions';
import {
  useRelatedColumns,
  useSimilarWhiskeys,
  useWhiskeyDetail,
  useWhiskeyReviewsInfinite,
  useWhiskeyReviewStats,
} from '../hooks/useWhiskeyDetail';
import type { TastingAxisKey, TastingAxisView, TastingSummarySource, WhiskeyReview } from '../types';
import { resolveMediaUrl, resolveProfileImageUrl } from '@/shared/lib/mediaUrl';
import { UserProfileLink } from '@/shared/components/UserProfileLink';
import { buildTastingAxes, hasOfficialNote } from '../utils/tastingSummary';
import '../whiskey.css';

type DetailTab = 'info' | 'reviews';

function formatType(type: string): string {
  const map: Record<string, string> = {
    single_malt: '싱글몰트',
    blended: '블렌디드',
    bourbon: '버번',
    rye: '라이',
  };
  return map[type] ?? type;
}

function formatTenPointScore(score?: number): string {
  if (score == null) return '—';

  const normalized = score > 10 ? score / 10 : score;
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1);
}

function formatFivePointScore(score?: number | null): string {
  if (score == null) return '—';

  const normalized = score > 20 ? score / 20 : score > 5 ? score / 2 : score;
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1);
}

function formatReviewDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function getCurrentUserId(): number | null {
  const value = localStorage.getItem('userId');
  if (!value) return null;

  const userId = Number(value);
  return Number.isFinite(userId) ? userId : null;
}

const KEEP_NOTES_OPEN_KEY = 'wf-keep-review-notes-open';

function ReviewPreviewCard({
  review,
  defaultNoteOpen,
}: {
  review: WhiskeyReview;
  defaultNoteOpen: boolean;
}) {
  const currentUserId = getCurrentUserId();
  const likeMutation = useToggleReviewLike(currentUserId);
  const navigate = useNavigate();
  const avatarSrc = resolveProfileImageUrl(review.profileImageUrl, review.userId);
  const [avatarError, setAvatarError] = useState(false);

  const handleLikeClick = () => {
    if (currentUserId == null) {
      toast('로그인 후 리뷰에 좋아요를 누를 수 있습니다.', 'info');
      navigate(PATHS.LOGIN);
      return;
    }

    likeMutation.mutate({
      reviewId: review.id,
      liked: review.likedByMe,
    });
  };

  return (
    <li className="wf-detail-reviews__item">
      <div className="wf-detail-reviews__header">
        <UserProfileLink userId={review.userId} className="wf-detail-reviews__author-link">
          <span className="wf-detail-reviews__avatar-wrap">
            {!avatarError ? (
              <img
                src={avatarSrc}
                alt=""
                className="wf-detail-reviews__avatar"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="wf-detail-reviews__avatar wf-detail-reviews__avatar--fallback" aria-hidden />
            )}
          </span>
          <span className="wf-detail-reviews__meta-line">
            <strong className="wf-detail-reviews__nickname">{review.nickname}</strong>
            <span className="wf-detail-reviews__meta-sep" aria-hidden>·</span>
            <span className="wf-detail-reviews__date">{formatReviewDate(review.createdAt)}</span>
            <span className="wf-detail-reviews__meta-sep" aria-hidden>·</span>
            <span className="wf-detail-reviews__rating-inline" aria-label={`평점 ${Number(review.rating).toFixed(1)}`}>
              <span className="wf-stars" aria-hidden>★</span>
              {Number(review.rating).toFixed(1)}
            </span>
          </span>
        </UserProfileLink>
      </div>

      <p className="wf-detail-reviews__text">
        {review.publicText || '작성된 리뷰 내용이 없습니다.'}
      </p>

      <div className="wf-detail-reviews__footer">
        <button
          type="button"
          className={`wf-detail-reviews__action wf-review-like${review.likedByMe ? ' wf-review-like--on' : ''}`}
          onClick={handleLikeClick}
          disabled={likeMutation.isPending}
        >
          좋아요 {review.likeCount ?? 0}
        </button>
      </div>

      {review.hasAttachedNote && review.attachedNoteId ? (
        <ReviewAttachedNote noteId={review.attachedNoteId} defaultOpen={defaultNoteOpen} />
      ) : null}
    </li>
  );
}

/** 내 시음 노트 점수를 레이더 축 데이터로 변환 */
function buildMyNoteAxes(note: MyTastingNote | null | undefined): TastingAxisView[] {
  if (!note) return [];
  const items: [TastingAxisKey, string, number | null | undefined][] = [
    ['body', '바디', note.bodyScore],
    ['finish', '피니시', note.finishScore],
    ['smoky', '스모키', note.smokyScore],
    ['spicy', '스파이시', note.spicyScore],
    ['sweet', '단맛', note.sweetScore],
  ];
  return items
    .filter(([, , score]) => typeof score === 'number')
    .map(([key, label, score]) => ({ key, label, score: score as number, tagLabels: [] }));
}

export default function WhiskeyDetailPage() {
  const { whiskeyId } = useParams();
  const navigate = useNavigate();
  const id = whiskeyId ?? '1';
  const notePath = PATHS.TASTING_NOTE.replace(':whiskeyId', id);
  const currentUserId = getCurrentUserId();
  const reviewSentinelRef = useRef<HTMLDivElement | null>(null);

  const { data: detail, isLoading, isError } = useWhiskeyDetail(id);
  const { data: relatedPosts = [], isLoading: columnsLoading } = useRelatedColumns(id);
  const { data: similarWhiskeys = [], isLoading: similarLoading } = useSimilarWhiskeys(id);
  const {
    data: reviewPages,
    isLoading: reviewsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWhiskeyReviewsInfinite(id, 10);
  const { data: reviewStats } = useWhiskeyReviewStats(id);
  const { data: myNote, isLoading: myNoteLoading } = useQuery({
    queryKey: ['tasting-note', 'my', currentUserId, id],
    queryFn: () => fetchMyTastingNoteForWhiskey(id),
    enabled: currentUserId != null,
  });

  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [summarySource, setSummarySource] = useState<TastingSummarySource>('official');
  const [keepNotesOpen, setKeepNotesOpen] = useState(
    () => localStorage.getItem(KEEP_NOTES_OPEN_KEY) === '1',
  );

  const reviewList = useMemo(
    () => reviewPages?.pages.flatMap((page) => page.content ?? []) ?? [],
    [reviewPages],
  );

  useEffect(() => {
    localStorage.setItem(KEEP_NOTES_OPEN_KEY, keepNotesOpen ? '1' : '0');
  }, [keepNotesOpen]);

  useEffect(() => {
    if (activeTab !== 'reviews') return;
    const el = reviewSentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '240px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeTab, hasNextPage, isFetchingNextPage, fetchNextPage, reviewList.length]);

  // Pick 상태
  const [isPicked, setIsPicked] = useState(false);
  const [pickLoading, setPickLoading] = useState(false);

  // 위시 상태
  const [wishModalOpen, setWishModalOpen] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // 위스키가 바뀌면 이미지 에러 상태 초기화
  useEffect(() => {
    setImgError(false);
    setActiveTab('info');
  }, [id]);

  // 로그인 유저가 10초 이상 머물면 조회 로그 1회 전송
  // (탭이 백그라운드면 타이머를 멈춰 실제 체류만 인정, 위스키가 바뀌면 리셋)
  useEffect(() => {
    if (!isLoggedIn()) return;

    let sent = false;
    let elapsedMs = 0;
    let startedAt: number | null = document.visibilityState === 'visible' ? Date.now() : null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const fire = () => {
      if (sent) return;
      sent = true;
      void whiskeyApi.recordWhiskeyView(id);
    };

    const schedule = (remainingMs: number) => {
      timer = setTimeout(fire, Math.max(0, remainingMs));
    };

    const handleVisibility = () => {
      if (sent) return;
      if (document.visibilityState === 'visible') {
        startedAt = Date.now();
        schedule(10_000 - elapsedMs);
      } else {
        if (timer) clearTimeout(timer);
        timer = null;
        if (startedAt != null) elapsedMs += Date.now() - startedAt;
        startedAt = null;
      }
    };

    if (startedAt != null) schedule(10_000);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [id]);

  // 페이지 진입 시 위시 여부 확인
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // 위시 목록에서 현재 위스키 포함 여부 확인
    cabinetApi
      .getWishFolders()
      .then(async (res) => {
        const folders = res.data.data ?? [];
        for (const folder of folders) {
          const itemRes = await cabinetApi.getWishItems(folder.folderId);
          const items = itemRes.data.data ?? [];
          const found = items.find((item: { whiskey: { id: number }; itemId: number }) => item.whiskey.id === Number(id));
          if (found) {
            setIsWished(true);
            return;
          }
        }
      })
      .catch(() => {});
  }, [id]);

  // 위시 버튼 클릭 핸들러
  const handleWishToggle = async () => {
    if (wishLoading) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast('로그인 후 위시리스트를 사용할 수 있습니다.', 'info');
      navigate(PATHS.LOGIN);
      return;
    }

    setWishLoading(true);
    try {
      if (isWished) {
        // 위시 삭제 — 등록된 모든 폴더에서 제거
        try {
          const folderRes = await cabinetApi.getWishedFolderIds(Number(id));
          const folderIds: number[] = folderRes.data.data ?? [];
          for (const folderId of folderIds) {
            const itemRes = await cabinetApi.getWishItems(folderId);
            const items = (itemRes.data.data ?? []) as { whiskey: { id: number }; itemId: number }[];
            const target = items.find((it) => it.whiskey.id === Number(id));
            if (target) await cabinetApi.removeWish(target.itemId, folderId);
          }
          setIsWished(false);
          toast('위시리스트에서 제거되었습니다.', 'info');
        } catch {
          toast('위시 제거에 실패했습니다.', 'error');
        }
      } else {
        // 위시 추가 → 폴더 선택 모달 열기
        setWishModalOpen(true);
      }
    } finally {
      setWishLoading(false);
    }
  };

  // 페이지 진입 시 픽 여부 확인
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;  // 미로그인이면 체크 안 함

    cabinetApi
      .getPickStatus(Number(id))
      .then((res) => setIsPicked(res.data.data.picked))
      .catch(() => {});  // 실패해도 버튼 동작에 영향 없게 조용히 처리
  }, [id]);

  // Pick 버튼 클릭 핸들러
  const handlePickToggle = async () => {
    if (pickLoading) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast('로그인 후 My Pick을 사용할 수 있습니다.', 'info');
      navigate(PATHS.LOGIN);
      return;
    }

    setPickLoading(true);
    try {
      if (isPicked) {
        await cabinetApi.deletePick(Number(id));
        setIsPicked(false);
        toast('My Pick에서 제거했습니다.', 'info');
      } else {
        await cabinetApi.addPick(Number(id));
        setIsPicked(true);
        toast('My Pick에 추가했습니다.', 'success');
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : '픽 처리에 실패했습니다.', 'error');
    } finally {
      setPickLoading(false);
    }
  };

  const effectiveSource = useMemo(() => {
    if (!detail) return summarySource;
    if (summarySource === 'official' && !hasOfficialNote(detail)) return 'userAvg';
    return summarySource;
  }, [detail, summarySource]);

  const tastingAxes = useMemo(
    () => (detail ? buildTastingAxes(detail) : []),
    [detail],
  );
  const myNoteAxes = useMemo(() => buildMyNoteAxes(myNote), [myNote]);
  const summaryAxes = effectiveSource === 'myNote' ? myNoteAxes : tastingAxes;

  if (isLoading) {
    return (
      <WireframePage scroll>
        <PageLoader label="위스키 정보 불러오는 중…" />
      </WireframePage>
    );
  }

  if (isError || !detail) {
    return (
      <WireframePage scroll>
        <div className="wf-box wf-detail-error">
          <p className="wf-card__title">위스키 정보를 불러오지 못했습니다.</p>
          <p className="wf-card__meta">잠시 후 다시 시도하거나 검색 페이지에서 다른 위스키를 찾아보세요.</p>
          <div className="wf-detail-error__actions">
            <Button variant="ghost" onClick={() => navigate(PATHS.SEARCH)}>
              검색으로 이동
            </Button>
            <Button onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </div>
      </WireframePage>
    );
  }

  const metaLine = [
    formatType(detail.type),
    detail.country,
    `${detail.abv}%`,
    detail.volume ? `${detail.volume}ml` : null,
  ].filter(Boolean).join(' · ');
  const imageSrc = resolveMediaUrl(detail.imageUrl);
  const displayRating = reviewStats?.avgRating ?? detail.avgRating;
  return (
    <WireframePage scroll>
      {wishModalOpen && (
        <WishFolderModal
          whiskeyId={Number(id)}
          onClose={() => setWishModalOpen(false)}
          onSuccess={() => { setIsWished(true); }}
        />
      )}
      <header className="wf-detail-hero">
        <div className="wf-detail-hero__copy">
          <h1 className="wf-title wf-detail-hero__title">{detail.name}</h1>
          <p className="wf-detail-hero__meta">{metaLine}</p>
        </div>
        <div className="wf-detail-hero__aside">
          <div className="wf-tabs" data-active={activeTab} role="tablist">
            <span className="wf-tabs__pill" aria-hidden="true" />
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'info'}
              className={`wf-tab-item${activeTab === 'info' ? ' wf-tab-item--on' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              정보
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'reviews'}
              className={`wf-tab-item${activeTab === 'reviews' ? ' wf-tab-item--on' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              리뷰
            </button>
          </div>
          <div className="wf-detail-hero__stats" aria-label="위스키 요약">
            <div className="wf-detail-hero__stat">
              <span>시음 점수</span>
              <strong>{formatTenPointScore(detail.noteSummary?.bodyScore)}</strong>
            </div>
            <div className="wf-detail-hero__stat">
              <span>리뷰 평점</span>
              <strong>{formatFivePointScore(displayRating)}</strong>
            </div>
            <div className="wf-detail-hero__stat">
              <span>노트</span>
              <strong>{detail.noteSummary?.noteCount ?? 0}</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="wf-layout-detail-v2">
        <aside className="wf-detail-sidebar">
          <div className="wf-detail-sidebar__image-frame">
            <span className="wf-detail-sidebar__image-kicker">Bottle profile</span>
            {imageSrc && !imgError ? (
              <img
                src={imageSrc}
                alt={detail.name}
                className="wf-detail-sidebar__image"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="wf-placeholder wf-detail-sidebar__image" aria-hidden />
            )}
            <span className="wf-detail-sidebar__image-shadow" aria-hidden />
          </div>
          {detail.price != null && (
            <div className="wf-box wf-detail-price">
              <span className="wf-text-xs">가격</span>
              <span className="wf-detail-price__value">
                {detail.price.toLocaleString()}원
                {detail.costUrl ? (
                  <span className="wf-detail-price__source">
                    {' - '}
                    <a href={detail.costUrl} target="_blank" rel="noopener noreferrer">
                      {detail.costUrlSource || '바로가기'}
                    </a>
                  </span>
                ) : detail.costUrlSource ? (
                  <span className="wf-detail-price__source"> - {detail.costUrlSource}</span>
                ) : null}
              </span>
            </div>
          )}
          <WishPickActions
            isWished={isWished}
            isPicked={isPicked}
            wishLoading={wishLoading}
            pickLoading={pickLoading}
            onWishToggle={handleWishToggle}
            onPickToggle={handlePickToggle}
          />
          <TastingTagsBubble tags={detail.tastingTags} />
        </aside>

        <main className="wf-detail-main wf-detail-main--wide">
          {activeTab === 'info' ? (
            <>
              <section className="wf-detail-info wf-detail-panel">
                <div className="wf-detail-section-head">
                  <h2 className="wf-section-title">제품 정보</h2>
                </div>
                {(() => {
                  const intro = Object.entries(detail.description?.introduction ?? {});
                  const feature = Object.entries(detail.description?.feature ?? {});
                  if (intro.length === 0 && feature.length === 0) {
                    return (
                      <p className="wf-text-sm wf-detail-info__empty">공식 설명이 아직 없습니다.</p>
                    );
                  }
                  const groups = ([
                    { title: '제품 소개', rows: intro },
                    { title: '핵심 특징', rows: feature },
                  ] as { title: string; rows: [string, string][] }[])
                    .filter((g) => g.rows.length > 0)
                    // 그룹 타이틀이 첫 행 라벨과 중복되면 숨김(예: 제품 소개), 아니면 표시(예: 핵심 특징)
                    .map((g) => ({ ...g, showTitle: g.rows[0]?.[0] !== g.title }));
                  return (
                    <div className="wf-detail-desc">
                      {groups.map((g) => (
                        <div key={g.title} className="wf-detail-desc__group">
                          {g.showTitle && (
                            <h3 className="wf-detail-desc__group-title">{g.title}</h3>
                          )}
                          {g.rows.map(([label, text]) => (
                            <div
                              key={label}
                              className={`wf-detail-desc__row${g.showTitle ? ' wf-detail-desc__row--sub' : ''}`}
                            >
                              <p className="wf-text-label">{label}</p>
                              <p className="wf-text-sm">{text}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </section>

              <TastingSummaryPanel
                axes={summaryAxes}
                source={effectiveSource}
                hasOfficial={hasOfficialNote(detail)}
                officialNote={detail.note?.note ?? null}
                onSourceChange={setSummarySource}
                isLoggedIn={currentUserId != null}
                myNoteLoading={myNoteLoading}
                hasMyNote={Boolean(myNote)}
                notePath={myNote ? `${notePath}?noteId=${myNote.id}` : notePath}
                loginPath={PATHS.LOGIN}
              />

              <RelatedWhiskeys items={similarWhiskeys} isLoading={similarLoading} />

              <RelatedColumns posts={relatedPosts} isLoading={columnsLoading} />
            </>
          ) : null}

          {activeTab === 'reviews' ? (
            <section className="wf-detail-reviews" aria-label="리뷰">
              <div className="wf-detail-reviews__title-row">
                <h2 className="wf-section-title">
                  리뷰
                  {reviewStats && reviewStats.reviewCount > 0 && (
                    <span className="wf-detail-reviews__stats">
                      <span className="wf-stars">★</span>{' '}
                      {formatFivePointScore(reviewStats.avgRating)}
                      {' · '}{reviewStats.reviewCount}개
                    </span>
                  )}
                </h2>
                <div className="wf-detail-reviews__actions">
                  <label className="wf-detail-reviews__note-pref">
                    <input
                      type="checkbox"
                      checked={keepNotesOpen}
                      onChange={(event) => setKeepNotesOpen(event.target.checked)}
                    />
                    <span>노트 열어두기</span>
                  </label>
                  <Button to={PATHS.WRITE_REVIEW.replace(':whiskeyId', id)} size="sm">
                    리뷰 작성
                  </Button>
                </div>
              </div>

              {reviewsLoading ? (
                <ul className="wf-detail-reviews__list" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <li key={i} className="wf-detail-reviews__item">
                      <div className="wf-skeleton-line" style={{ width: '42%', height: 13 }} />
                      <div className="wf-skeleton-line" style={{ width: '100%', marginTop: 12, height: 13 }} />
                      <div className="wf-skeleton-line" style={{ width: '68%', marginTop: 6, height: 13 }} />
                      <div className="wf-skeleton-line" style={{ width: '28%', marginTop: 14, height: 32, borderRadius: 999 }} />
                    </li>
                  ))}
                </ul>
              ) : reviewList.length ? (
                <>
                  <ul className="wf-detail-reviews__list">
                    {reviewList.map((review) => (
                      <ReviewPreviewCard
                        key={review.id}
                        review={review}
                        defaultNoteOpen={keepNotesOpen}
                      />
                    ))}
                  </ul>
                  {isFetchingNextPage ? (
                    <p className="wf-detail-reviews__loadmore">리뷰 불러오는 중…</p>
                  ) : null}
                  <div ref={reviewSentinelRef} className="wf-detail-reviews__sentinel" aria-hidden />
                </>
              ) : (
                <div className="wf-detail-reviews__empty">
                  <p className="wf-text-sm">아직 등록된 리뷰가 없습니다.</p>
                  <p className="wf-text-xs">첫 번째 리뷰를 남겨보세요.</p>
                  <Button variant="ghost" to={PATHS.WRITE_REVIEW.replace(':whiskeyId', id)} className="wf-detail-reviews__empty-cta">
                    리뷰 작성하기 →
                  </Button>
                </div>
              )}
            </section>
          ) : null}
        </main>

      </div>
    </WireframePage>
  );
}
