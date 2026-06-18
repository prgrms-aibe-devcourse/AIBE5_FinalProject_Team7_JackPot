import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import { WishFolderModal } from '@/features/cabinet/components/WishFolderModal';
import { toast } from '@/shared/components/ui/Toast';
import { Link, useParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { Button } from '@/shared/components/ui/Button';
import { AttachedNotePanel } from '@/features/review/components/AttachedNotePanel';
import { useToggleReviewLike } from '@/features/review/hooks/useReviews';
import { fetchMyTastingNoteForWhiskey, type MyTastingNote } from '@/features/tasting-note/api/noteApi';
import { whiskeyApi } from '../api/whiskeyApi';
import { isLoggedIn } from '@/shared/lib/authSession';
import { RelatedColumns } from '../components/RelatedColumns';
import { RelatedWhiskeys } from '../components/RelatedWhiskeys';
import { TastingSummaryPanel } from '../components/TastingSummaryPanel';
import { TastingTagsBubble } from '../components/TastingTagsBubble';
import {
  useRelatedColumns,
  useSimilarWhiskeys,
  useWhiskeyDetail,
  useWhiskeyReviews,
  useWhiskeyReviewStats,
} from '../hooks/useWhiskeyDetail';
import type { TastingSummarySource, WhiskeyReview } from '../types';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { UserProfileLink } from '@/shared/components/UserProfileLink';
import { buildTastingAxes, hasOfficialNote } from '../utils/tastingSummary';
import '../whiskey.css';

type DetailTab = 'info' | 'reviews' | 'note';

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

function ReviewPreviewCard({ review }: { review: WhiskeyReview }) {
  const [showNote, setShowNote] = useState(false);
  const currentUserId = getCurrentUserId();
  const likeMutation = useToggleReviewLike(currentUserId);
  const navigate = useNavigate();

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
    <li className="wf-detail-reviews__item wf-box">
      <div className="wf-detail-reviews__header">
        <div>
          <UserProfileLink userId={review.userId}>
            <strong>{review.nickname}</strong>
          </UserProfileLink>
          <span className="wf-text-xs"> · {formatReviewDate(review.createdAt)}</span>
        </div>
        <span className="wf-detail-reviews__rating">{Number(review.rating).toFixed(1)}</span>
      </div>
      <p className="wf-text-sm wf-detail-reviews__text">
        {review.publicText || '작성된 리뷰 내용이 없습니다.'}
      </p>
      <button
        type="button"
        className={`wf-review-like${review.likedByMe ? ' wf-review-like--on' : ''}`}
        onClick={handleLikeClick}
        disabled={likeMutation.isPending}
      >
        {review.likedByMe ? '♥' : '♡'} {review.likeCount ?? 0}
      </button>
      {review.hasAttachedNote && review.attachedNoteId && (
        <>
          <button
            type="button"
            className="wf-detail-reviews__note-button"
            onClick={() => setShowNote((prev) => !prev)}
          >
            {showNote ? 'My Note 접기' : 'My Note 자세히'}
          </button>
          {showNote && <AttachedNotePanel noteId={review.attachedNoteId} />}
        </>
      )}
    </li>
  );
}

function PersonalNotePanel({
  note,
  isLoading,
  notePath,
  currentUserId,
}: {
  note: MyTastingNote | null | undefined;
  isLoading: boolean;
  notePath: string;
  currentUserId: number | null;
}) {
  if (currentUserId == null) {
    return (
      <section className="wf-detail-panel wf-detail-personal-note" aria-label="개인 노트">
        <div className="wf-detail-section-head">
          <h2 className="wf-section-title">개인 노트</h2>
        </div>
        <p className="wf-text-sm">로그인 후 이 위스키에 대한 개인 시음 노트를 남길 수 있습니다.</p>
        <Button to={PATHS.LOGIN} className="wf-detail-personal-note__cta">로그인하기</Button>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="wf-detail-panel wf-detail-personal-note" aria-label="개인 노트">
        <div className="wf-detail-section-head">
          <h2 className="wf-section-title">개인 노트</h2>
        </div>
        <div className="wf-skeleton-line" style={{ width: '45%', height: 14 }} />
        <div className="wf-skeleton-line" style={{ width: '88%', height: 14, marginTop: 12 }} />
      </section>
    );
  }

  if (!note) {
    return (
      <section className="wf-detail-panel wf-detail-personal-note" aria-label="개인 노트">
        <div className="wf-detail-section-head">
          <h2 className="wf-section-title">개인 노트</h2>
          <span className="wf-detail-section-head__count">미작성</span>
        </div>
        <p className="wf-text-sm">아직 작성한 시음 노트가 없습니다. 향, 맛, 피니시를 기록해두면 다음 선택이 더 쉬워집니다.</p>
        <Button to={notePath} className="wf-detail-personal-note__cta">My Note 작성</Button>
      </section>
    );
  }

  const scoreItems = [
    ['바디', note.bodyScore],
    ['피니시', note.finishScore],
    ['스모키', note.smokyScore],
    ['스파이시', note.spicyScore],
    ['단맛', note.sweetScore],
  ];

  return (
    <section className="wf-detail-panel wf-detail-personal-note" aria-label="개인 노트">
      <div className="wf-detail-section-head">
        <h2 className="wf-section-title">개인 노트</h2>
        <span className="wf-detail-section-head__count">
          {note.isDraft ?? note.draft ? '임시저장' : '작성 완료'}
        </span>
      </div>
      <div className="wf-detail-personal-note__scores">
        {scoreItems.map(([label, score]) => (
          <span key={label}>
            <strong>{label}</strong>
            {formatTenPointScore(typeof score === 'number' ? score : undefined)}
          </span>
        ))}
      </div>
      <p className="wf-text-sm wf-detail-personal-note__memo">
        {note.memo || '작성된 메모가 없습니다.'}
      </p>
      {note.tags?.length ? (
        <div className="wf-detail-personal-note__tags">
          {note.tags.slice(0, 8).map((tag) => (
            <span key={tag.id}>{tag.name}</span>
          ))}
        </div>
      ) : null}
      <Button to={`${notePath}?noteId=${note.id}`} className="wf-detail-personal-note__cta">
        My Note 수정
      </Button>
    </section>
  );
}

export default function WhiskeyDetailPage() {
  const { whiskeyId } = useParams();
  const navigate = useNavigate();
  const id = whiskeyId ?? '1';
  const reviewPath = PATHS.WHISKEY_REVIEWS.replace(':whiskeyId', id);
  const notePath = PATHS.TASTING_NOTE.replace(':whiskeyId', id);
  const currentUserId = getCurrentUserId();

  const { data: detail, isLoading, isError } = useWhiskeyDetail(id);
  const { data: relatedPosts = [], isLoading: columnsLoading } = useRelatedColumns(id);
  const { data: similarWhiskeys = [], isLoading: similarLoading } = useSimilarWhiskeys(id);
  const { data: reviews, isLoading: reviewsLoading } = useWhiskeyReviews(id, 0, 5);
  const { data: reviewStats } = useWhiskeyReviewStats(id);
  const { data: myNote, isLoading: myNoteLoading } = useQuery({
    queryKey: ['tasting-note', 'my', currentUserId, id],
    queryFn: () => fetchMyTastingNoteForWhiskey(id),
    enabled: currentUserId != null,
  });

  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [summarySource, setSummarySource] = useState<TastingSummarySource>('official');

  // Pick 상태
  const [isPicked, setIsPicked] = useState(false);
  const [pickLoading, setPickLoading] = useState(false);

  // 위시 상태
  const [wishModalOpen, setWishModalOpen] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [wishedItemId, setWishedItemId] = useState<number | null>(null);
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
            setWishedItemId(found.itemId);
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
      if (isWished && wishedItemId !== null) {
        // 위시 삭제
        try {
          await cabinetApi.removeWish(wishedItemId, 0);
          setIsWished(false);
          setWishedItemId(null);
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

  const ageLabel = detail.ageYears > 0 ? `${detail.ageYears}년` : 'NAS';
  const metaLine = [
    formatType(detail.type),
    detail.country,
    `${detail.abv}%`,
    detail.volume ? `${detail.volume}ml` : null,
  ].filter(Boolean).join(' · ');
  const imageSrc = resolveMediaUrl(detail.imageUrl);
  const displayRating = reviewStats?.avgRating ?? detail.avgRating;
  const reviewCount = reviewStats?.reviewCount ?? detail.reviewCount ?? 0;
  const heroChips = [
    formatType(detail.type),
    detail.country,
    ageLabel,
    `${detail.abv}% ABV`,
  ].filter(Boolean);

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
          <p className="wf-detail-hero__eyebrow">{detail.brand ?? detail.distillery ?? detail.country}</p>
          <h1 className="wf-title wf-detail-hero__title">{detail.name}</h1>
          {detail.nameEng && (
            <p className="wf-detail-hero__name-eng wf-text-sm">{detail.nameEng}</p>
          )}
          <p className="wf-detail-hero__meta">{metaLine}</p>
          <div className="wf-detail-hero__chips" aria-label="위스키 주요 정보">
            {heroChips.map((chip, index) => (
              <span key={`${chip}-${index}`}>{chip}</span>
            ))}
          </div>
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
      </header>

      <div className="wf-tabs">
        <button
          type="button"
          className={`wf-tab-item${activeTab === 'info' ? ' wf-tab-item--on' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          정보
        </button>
        <button
          type="button"
          className={`wf-tab-item${activeTab === 'reviews' ? ' wf-tab-item--on' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          리뷰
        </button>
        <button
          type="button"
          className={`wf-tab-item${activeTab === 'note' ? ' wf-tab-item--on' : ''}`}
          onClick={() => setActiveTab('note')}
        >
          개인 노트
        </button>
      </div>

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
          <div className="wf-detail-sidebar__actions">
            <div className="wf-detail-sidebar__actions-head">
              <span>Save to cabinet</span>
              <strong>내 취향 보관</strong>
            </div>
            <Button
              variant={isWished ? 'primary' : 'ghost'}
              className={`wf-detail-action ${isWished ? 'wf-detail-action--on' : ''}`}
              onClick={handleWishToggle}
              disabled={wishLoading}
            >
              {isWished ? '♥ 위시리스트 취소' : '♡ 위시리스트'}
            </Button>
            <Button
              className={`wf-detail-action ${isPicked ? 'wf-detail-action--on' : ''}`}
              onClick={handlePickToggle}
              disabled={pickLoading}
            >
              {pickLoading ? '처리 중...' : isPicked ? '★ My Pick 취소' : '★ My Pick'}
            </Button>
          </div>
          <p className="wf-detail-sidebar__hint">위시는 마시고 싶은 술, My Pick은 추천하고 싶은 술로 저장돼요.</p>
          <div className="wf-grid2">
            {([
              ['숙성', ageLabel],
              ['도수', `${detail.abv}%`],
              detail.cask ? ['캐스크', detail.cask] : null,
              detail.volume ? ['용량', `${detail.volume}ml`] : null,
            ].filter(Boolean) as [string, string][]).map(([k, v]) => (
              <div key={k} className="wf-box wf-grid2__item">
                <div className="wf-text-xs">{k}</div>
                <div>{v}</div>
              </div>
            ))}
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
          <TastingTagsBubble tags={detail.tastingTags} />
        </aside>

        <main className="wf-detail-main wf-detail-main--wide">
          {activeTab === 'info' ? (
            <>
              <section className="wf-detail-info wf-detail-panel">
                <div className="wf-detail-section-head">
                  <h2 className="wf-section-title">제품 정보</h2>
                  <span className="wf-detail-section-head__count">리뷰 {reviewCount}개</span>
                </div>
                {(() => {
                  const intro = Object.entries(detail.description?.introduction ?? {});
                  const feature = Object.entries(detail.description?.feature ?? {});
                  if (intro.length === 0 && feature.length === 0) {
                    return (
                      <p className="wf-text-sm wf-detail-info__empty">공식 설명이 아직 없습니다.</p>
                    );
                  }
                  const groups: { title: string; rows: [string, string][] }[] = [
                    { title: '제품 소개', rows: intro },
                    { title: '핵심 특징', rows: feature },
                  ].filter((g) => g.rows.length > 0);
                  return (
                    <div className="wf-detail-desc">
                      {groups.map((g) => (
                        <div key={g.title} className="wf-detail-desc__group">
                          <h3 className="wf-detail-desc__group-title">{g.title}</h3>
                          {g.rows.map(([label, text]) => (
                            <div key={label} className="wf-detail-desc__row">
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
                axes={tastingAxes}
                source={effectiveSource}
                hasOfficial={hasOfficialNote(detail)}
                officialNote={detail.note?.note ?? null}
                onSourceChange={setSummarySource}
                reviewPath={reviewPath}
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
                  <Link to={reviewPath} className="wf-detail-reviews__more">
                    전체 보기 →
                  </Link>
                  <Button to={PATHS.WRITE_REVIEW.replace(':whiskeyId', id)} size="sm">
                    리뷰 작성
                  </Button>
                </div>
              </div>

              {reviewsLoading ? (
                <ul className="wf-detail-reviews__list" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <li key={i} className="wf-detail-reviews__item wf-box">
                      <div className="wf-skeleton-line" style={{ width: '42%', height: 13 }} />
                      <div className="wf-skeleton-line" style={{ width: '100%', marginTop: 12, height: 13 }} />
                      <div className="wf-skeleton-line" style={{ width: '68%', marginTop: 6, height: 13 }} />
                      <div className="wf-skeleton-line" style={{ width: '28%', marginTop: 14, height: 32, borderRadius: 999 }} />
                    </li>
                  ))}
                </ul>
              ) : reviews?.content.length ? (
                <ul className="wf-detail-reviews__list">
                  {reviews.content.map((review) => (
                    <ReviewPreviewCard key={review.id} review={review} />
                  ))}
                </ul>
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

          {activeTab === 'note' ? (
            <PersonalNotePanel
              note={myNote}
              isLoading={myNoteLoading}
              notePath={notePath}
              currentUserId={currentUserId}
            />
          ) : null}
        </main>

      </div>
    </WireframePage>
  );
}
