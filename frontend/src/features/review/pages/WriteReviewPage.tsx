import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { StarRatingInput } from '../components/StarRatingInput';
import { useCreateReview, useMyReviews, useUpdateReview } from '../hooks/useReviews';
import { useWhiskeyDetail } from '@/features/whiskey/hooks/useWhiskeyDetail';
import { fetchMyTastingNoteForWhiskey } from '@/features/tasting-note/api/noteApi';
import '@/features/whiskey/whiskey.css';
import '../review.css';

function getCurrentUserId(): number | null {
  const value = localStorage.getItem('userId');
  if (!value) return null;

  const userId = Number(value);
  return Number.isFinite(userId) ? userId : null;
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    single_malt: '싱글몰트',
    blended: '블렌디드',
    bourbon: '버번',
    rye: '라이',
  };
  return map[type] ?? type;
}

export default function WriteReviewPage() {
  const { whiskeyId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = whiskeyId ?? '1';
  const currentUserId = getCurrentUserId();
  const { data: whiskey } = useWhiskeyDetail(id);
  const { data: myReviews, isLoading: myReviewsLoading } = useMyReviews(currentUserId, 0, 100);
  const { data: myNote, isLoading: noteLoading } = useQuery({
    queryKey: ['tasting-note', 'my', currentUserId, id],
    queryFn: () => fetchMyTastingNoteForWhiskey(id),
    enabled: currentUserId != null,
  });
  const createReviewMutation = useCreateReview(currentUserId, id);
  const updateReviewMutation = useUpdateReview(currentUserId);
  const [rating, setRating] = useState(0);
  const [publicText, setPublicText] = useState('');
  const [attachNote, setAttachNote] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imgError, setImgError] = useState(false);

  const detailPath = PATHS.WHISKEY_DETAIL.replace(':whiskeyId', id);
  const cabinetReviewsPath = `${PATHS.CABINET}?section=bar&tab=reviews`;
  const returnTo = searchParams.get('returnTo');
  const exitPath = returnTo === 'cabinet-reviews' ? cabinetReviewsPath : detailPath;
  const noteWritePath = (() => {
    const params = new URLSearchParams({ returnTo: 'write-review' });
    if (returnTo) params.set('reviewReturnTo', returnTo);
    return `${PATHS.TASTING_NOTE.replace(':whiskeyId', id)}?${params}`;
  })();
  const attachNoteFromUrl = searchParams.get('attachNote') === '1';
  const existingReview = myReviews?.content.find((review) => Number(review.whiskeyId) === Number(id));
  const isEditMode = Boolean(existingReview);
  const isSaving = createReviewMutation.isPending || updateReviewMutation.isPending;

  useEffect(() => {
    setImgError(false);
  }, [id]);

  useEffect(() => {
    if (!existingReview) return;

    setRating(Number(existingReview.rating ?? 0));
    setPublicText(existingReview.publicText ?? '');
    setAttachNote(Boolean(existingReview.attachedNoteId));
  }, [existingReview]);

  useEffect(() => {
    if (attachNoteFromUrl && myNote) {
      setAttachNote(true);
    }
  }, [attachNoteFromUrl, myNote]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (currentUserId == null) {
      setErrorMessage('로그인 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    if (rating < 0 || rating > 5) {
      setErrorMessage('별점은 0점부터 5점 사이로 선택해주세요.');
      return;
    }

    try {
      const body = {
        rating,
        publicText: publicText.trim(),
        attachedNoteId: attachNote && myNote ? myNote.id : null,
      };

      if (existingReview) {
        await updateReviewMutation.mutateAsync({
          reviewId: existingReview.id,
          body,
        });
      } else {
        await createReviewMutation.mutateAsync(body);
      }

      navigate(exitPath);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '리뷰 저장에 실패했습니다.');
    }
  };

  const metaLine = whiskey
    ? [
        formatType(whiskey.type),
        whiskey.country,
        whiskey.abv != null ? `${whiskey.abv}%` : null,
        whiskey.volume ? `${whiskey.volume}ml` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : null;
  const imageSrc = resolveMediaUrl(whiskey?.imageUrl);
  const pageTitle = myReviewsLoading ? '리뷰 확인 중' : isEditMode ? '리뷰 수정' : '리뷰 작성';

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">
        홈 / <Link to={detailPath}>{whiskey?.name ?? '위스키'}</Link> / <strong>{pageTitle}</strong>
      </p>

      <div className="wf-layout-detail-v2 wf-write-review-layout">
        <aside className="wf-detail-sidebar wf-write-review-sidebar">
          <div className="wf-detail-sidebar__image-frame wf-write-review-image-frame">
            <div className="wf-write-review-product">
              <p className="wf-write-review-product__name">{whiskey?.name ?? '위스키 정보를 불러오는 중입니다.'}</p>
              {metaLine ? <p className="wf-write-review-product__meta">{metaLine}</p> : null}
            </div>
            {imageSrc && !imgError ? (
              <img
                src={imageSrc}
                alt={whiskey?.name ?? '위스키'}
                className="wf-detail-sidebar__image wf-write-review-image-frame__image"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="wf-placeholder wf-detail-sidebar__image wf-write-review-image-frame__image" aria-hidden />
            )}
            <span className="wf-detail-sidebar__image-shadow" aria-hidden />
          </div>
        </aside>

        <main className="wf-detail-main wf-write-review-main">
          <form className="wf-detail-reviews wf-write-review-form" onSubmit={handleSubmit}>
            <div className="wf-detail-reviews__title-row wf-write-review-form__intro">
              <div>
                <h1 className="wf-section-title">{pageTitle}</h1>
                {isEditMode ? (
                  <p className="wf-text-sm wf-write-review-edit-hint">
                    이미 작성한 리뷰가 있어 수정 화면으로 열었습니다.
                  </p>
                ) : null}
              </div>
            </div>

            <section className="wf-write-review-block">
              <div className="wf-detail-reviews__title-row wf-write-review-block__head">
                <h2 className="wf-section-title">별점</h2>
                <span className="wf-detail-reviews__rating" aria-live="polite">
                  <span className="wf-stars" aria-hidden>★</span>
                  {rating.toFixed(1)}
                </span>
              </div>
              <StarRatingInput value={rating} onChange={setRating} />
            </section>

            <section className="wf-write-review-block">
              <div className="wf-detail-reviews__title-row wf-write-review-block__head">
                <h2 className="wf-section-title">공개 리뷰</h2>
              </div>
              <label className="wf-write-review-label">
                <span className="wf-text-sm wf-write-review-label__hint">다른 사람에게 보여줄 리뷰를 적어주세요.</span>
                <textarea
                  className="wf-review-textarea"
                  value={publicText}
                  onChange={(event) => setPublicText(event.target.value)}
                  placeholder="향, 맛, 전체적인 인상을 자유롭게 적어주세요."
                  rows={7}
                />
              </label>
            </section>

            <section className="wf-write-review-block wf-review-note-attach">
              <div className="wf-review-note-attach__head">
                <div>
                  <h2 className="wf-section-title">노트 첨부</h2>
                  <p className="wf-text-sm wf-write-review-note-hint">
                    이 위스키에 작성한 시음 노트를 리뷰에 함께 표시할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  className={`wf-review-note-attach__toggle${attachNote ? ' wf-review-note-attach__toggle--on' : ''}`}
                  disabled={!myNote}
                  onClick={() => setAttachNote((prev) => !prev)}
                >
                  {attachNote ? '첨부됨' : '첨부'}
                </button>
              </div>

              {noteLoading ? (
                <p className="wf-text-sm wf-review-note-attach__message">시음 노트를 확인하는 중입니다.</p>
              ) : myNote ? (
                <div className="wf-review-note-attach__preview">
                  <p className="wf-text-sm">
                    바디 {myNote.bodyScore ?? '-'} · 피니시 {myNote.finishScore ?? '-'} ·
                    스모키 {myNote.smokyScore ?? '-'} · 스파이시 {myNote.spicyScore ?? '-'} ·
                    단맛 {myNote.sweetScore ?? '-'}
                  </p>
                  <p className="wf-text-sm wf-review-note-attach__memo">
                    {myNote.memo || '작성된 메모가 없습니다.'}
                  </p>
                </div>
              ) : (
                <div className="wf-review-note-attach__empty">
                  <p className="wf-text-sm wf-review-note-attach__message">
                    이 위스키에 작성한 시음 노트가 없습니다. 노트를 작성하면 리뷰에 함께 첨부할 수 있습니다.
                  </p>
                  <Button to={noteWritePath} size="sm">
                    노트 작성하기
                  </Button>
                </div>
              )}
            </section>

            {errorMessage ? (
              <p className="wf-text-sm wf-write-review-error">{errorMessage}</p>
            ) : null}

            <div className="wf-detail-reviews__actions wf-write-review-actions">
              <Button type="button" variant="ghost" onClick={() => navigate(exitPath)} disabled={isSaving}>
                취소
              </Button>
              <Button type="submit" disabled={isSaving || myReviewsLoading} className="wf-write-review-submit">
                {isSaving ? '저장 중...' : isEditMode ? '수정 저장' : '등록'}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </WireframePage>
  );
}
