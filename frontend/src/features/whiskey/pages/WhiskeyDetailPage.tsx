import { useEffect, useMemo, useState } from 'react';
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
import { RelatedColumns } from '../components/RelatedColumns';
import { TastingSummaryPanel } from '../components/TastingSummaryPanel';
import { TastingTagsBubble } from '../components/TastingTagsBubble';
import { useRelatedColumns, useWhiskeyDetail, useWhiskeyReviews } from '../hooks/useWhiskeyDetail';
import type { TastingSummarySource, WhiskeyReview } from '../types';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { buildTastingAxes, hasOfficialNote } from '../utils/tastingSummary';

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

function formatReviewDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function ReviewPreviewCard({ review }: { review: WhiskeyReview }) {
  const [showNote, setShowNote] = useState(false);

  return (
    <li className="wf-detail-reviews__item wf-box">
      <div className="wf-detail-reviews__header">
        <div>
          <strong>{review.nickname}</strong>
          <span className="wf-text-xs"> · {formatReviewDate(review.createdAt)}</span>
        </div>
        <span className="wf-detail-reviews__rating">{Number(review.rating).toFixed(1)}</span>
      </div>
      <p className="wf-text-sm wf-detail-reviews__text">
        {review.publicText || '작성된 리뷰 내용이 없습니다.'}
      </p>
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

export default function WhiskeyDetailPage() {
  const { whiskeyId } = useParams();
  const navigate = useNavigate();
  const id = whiskeyId ?? '1';
  const reviewPath = PATHS.WHISKEY_REVIEWS.replace(':whiskeyId', id);
  const notePath = PATHS.TASTING_NOTE.replace(':whiskeyId', id);

  const { data: detail, isLoading, isError } = useWhiskeyDetail(id);
  const { data: relatedPosts = [], isLoading: columnsLoading } = useRelatedColumns(id);
  const { data: reviews, isLoading: reviewsLoading } = useWhiskeyReviews(id, 0, 5);

  const [summarySource, setSummarySource] = useState<TastingSummarySource>('official');

  // Pick 상태
  const [isPicked, setIsPicked] = useState(false);
  const [pickLoading, setPickLoading] = useState(false);

  // 위시 상태
  const [wishModalOpen, setWishModalOpen] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [wishedItemId, setWishedItemId] = useState<number | null>(null);

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
    const token = localStorage.getItem('accessToken');
    if (!token) {
      const goLogin = confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?');
      if (goLogin) navigate(PATHS.LOGIN);
      return;
    }

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
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // 확인 누르면 로그인 페이지로 이동
      const goLogin = confirm('로그인이 필요합니다. 로그인 페이지로 이동할까요?');
      if (goLogin) navigate(PATHS.LOGIN);
      return;
    }

    setPickLoading(true);
    try {
      if (isPicked) {
        // 이미 픽한 상태 → 제거
        await cabinetApi.deletePick(Number(id));
        setIsPicked(false);
      } else {
        // 픽 추가
        await cabinetApi.addPick(Number(id));
        setIsPicked(true);
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
        <p className="wf-text-sm">위스키 정보를 불러오지 못했습니다.</p>
      </WireframePage>
    );
  }

  const ageLabel = detail.ageYears > 0 ? `${detail.ageYears}년` : 'NAS';
  const metaLine = [
    formatType(detail.type),
    detail.country,
    `${detail.abv}%`,
    '700ml',
  ].join(' · ');
  const imageSrc = resolveMediaUrl(detail.imageUrl);

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
        <h1 className="wf-title wf-detail-hero__title">{detail.name}</h1>
        <p className="wf-text-sm">{metaLine}</p>
        <p className="wf-detail-hero__rating">
          종합 {formatTenPointScore(detail.noteSummary?.bodyScore)} / 10
          <span className="wf-text-sm"> · {detail.noteSummary?.noteCount ?? 0} 노트</span>
        </p>
      </header>

      <div className="wf-tabs">
        <span className="wf-tab-item wf-tab-item--on">정보</span>
        <Link to={reviewPath} className="wf-tab-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          리뷰
        </Link>
        <Link to={notePath} className="wf-tab-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          개인 노트
        </Link>
      </div>

      <div className="wf-layout-detail-v2">
        <aside className="wf-detail-sidebar">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={detail.name}
              className="wf-detail-sidebar__image"
              style={{ width: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="wf-placeholder wf-detail-sidebar__image" aria-hidden />
          )}
          <div className="wf-detail-sidebar__actions">
            <Button variant="ghost" style={{ width: '100%' }} onClick={handleWishToggle}>
              {isWished ? '♥ 위시리스트 취소' : '♡ 위시리스트'}
            </Button>
            <Button style={{ width: '100%' }} onClick={handlePickToggle} disabled={pickLoading}>
              {pickLoading ? '처리 중...' : isPicked ? '★ My Pick 취소' : '★ My Pick'}
            </Button>
            <Button variant="ghost" style={{ width: '100%' }} to={PATHS.WRITE_REVIEW.replace(':whiskeyId', id)}>
              리뷰 작성
            </Button>
            <Button variant="ghost" style={{ width: '100%' }} to={notePath}>
              📝 My Note 작성
            </Button>
          </div>
          <p className="wf-text-xs">위시=마시고 싶음 · My Pick=맛있어서 추천하는 술</p>
          <div className="wf-grid2">
            {[
              ['숙성', ageLabel],
              ['도수', `${detail.abv}%`],
              ['지역', detail.region],
              ['캐스크', detail.cask ?? '—'],
            ].map(([k, v]) => (
              <div key={k} className="wf-box wf-grid2__item">
                <div className="wf-text-xs">{k}</div>
                <div>{v}</div>
              </div>
            ))}
          </div>
        </aside>

        <main className="wf-detail-main">
          <section className="wf-detail-info">
            <h2 className="wf-section-title">제품 정보</h2>
            {detail.description && <p className="wf-text-sm">{detail.description}</p>}
            <p className="wf-text-sm wf-detail-info__meta">
              증류소 · {detail.distillery ?? detail.name} · {detail.region} · 캐스크 {detail.cask ?? '—'}
            </p>
          </section>

          <TastingSummaryPanel
            axes={tastingAxes}
            source={effectiveSource}
            hasOfficial={hasOfficialNote(detail)}
            onSourceChange={setSummarySource}
            reviewPath={reviewPath}
          />

          <section className="wf-detail-reviews" aria-label="리뷰">
            <div className="wf-detail-reviews__title-row">
              <h2 className="wf-section-title">리뷰</h2>
              <Link to={reviewPath} className="wf-detail-reviews__more">
                전체 보기 →
              </Link>
            </div>

            {reviewsLoading ? (
              <p className="wf-text-sm">리뷰를 불러오는 중입니다.</p>
            ) : reviews?.content.length ? (
              <ul className="wf-detail-reviews__list">
                {reviews.content.map((review) => (
                  <ReviewPreviewCard key={review.id} review={review} />
                ))}
              </ul>
            ) : (
              <p className="wf-text-sm">아직 등록된 리뷰가 없습니다.</p>
            )}
          </section>

          <RelatedColumns posts={relatedPosts} isLoading={columnsLoading} />
        </main>

        <aside className="wf-detail-aside">
          <TastingTagsBubble tags={detail.tastingTags} />
        </aside>
      </div>
    </WireframePage>
  );
}
