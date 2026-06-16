import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { StarRatingInput } from '../components/StarRatingInput';
import { useCreateReview, useMyReviews, useUpdateReview } from '../hooks/useReviews';
import { useWhiskeyDetail } from '@/features/whiskey/hooks/useWhiskeyDetail';
import { fetchMyTastingNoteForWhiskey } from '@/features/tasting-note/api/noteApi';
import '../review.css';

function getCurrentUserId(): number | null {
  const value = localStorage.getItem('userId');
  if (!value) return null;

  const userId = Number(value);
  return Number.isFinite(userId) ? userId : null;
}

export default function WriteReviewPage() {
  const { whiskeyId } = useParams();
  const navigate = useNavigate();
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

  const detailPath = PATHS.WHISKEY_DETAIL.replace(':whiskeyId', id);
  const existingReview = myReviews?.content.find((review) => Number(review.whiskeyId) === Number(id));
  const isEditMode = Boolean(existingReview);
  const isSaving = createReviewMutation.isPending || updateReviewMutation.isPending;

  useEffect(() => {
    if (!existingReview) return;

    setRating(Number(existingReview.rating ?? 0));
    setPublicText(existingReview.publicText ?? '');
    setAttachNote(Boolean(existingReview.attachedNoteId));
  }, [existingReview]);

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

      navigate(detailPath);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '리뷰 저장에 실패했습니다.');
    }
  };

  return (
    <WireframePage>
      <form className="wf-write-review-form" onSubmit={handleSubmit}>
        <header className="wf-write-review-hero wf-box">
          <div>
            <p className="wf-text-label">Whiskey review</p>
            <h2 className="wf-title">{myReviewsLoading ? '리뷰 확인 중' : isEditMode ? '리뷰 수정' : '리뷰 작성'}</h2>
            <p className="wf-text-sm">{whiskey?.name ?? '위스키 정보를 불러오는 중입니다.'}</p>
          </div>
          <span className="wf-write-review-hero__badge">{isEditMode ? '수정 모드' : '새 리뷰'}</span>
        </header>

        <div className="wf-write-review-layout">
          <aside className="wf-write-review-guide wf-box" aria-label="리뷰 작성 안내">
            <p className="wf-text-label">Review flow</p>
            <ol>
              <li>
                <strong>별점</strong>
                <span>첫인상에 가까운 점수를 선택하세요.</span>
              </li>
              <li>
                <strong>공개 리뷰</strong>
                <span>다른 사람이 읽을 한 줄 이상의 감상을 남깁니다.</span>
              </li>
              <li>
                <strong>My Note</strong>
                <span>개인 시음 노트가 있으면 함께 공개할 수 있습니다.</span>
              </li>
            </ol>
            {isEditMode ? (
              <p className="wf-text-sm wf-write-review-edit-hint">
                이미 작성한 리뷰가 있어 수정 화면으로 열었습니다.
              </p>
            ) : null}
          </aside>

          <div className="wf-write-review-editor">
            <section className="wf-write-review-section wf-box">
              <div className="wf-write-review-section__head">
                <div>
                  <p className="wf-text-label">Rating</p>
                  <h3>별점</h3>
                </div>
                <span>{rating}점</span>
              </div>
              <StarRatingInput value={rating} onChange={setRating} />
            </section>

            <section className="wf-write-review-section wf-box">
              <label className="wf-write-review-label">
                <span className="wf-text-label">공개 리뷰</span>
                <textarea
                  className="wf-review-textarea"
                  value={publicText}
                  onChange={(event) => setPublicText(event.target.value)}
                  placeholder="다른 사람에게 보여줄 리뷰를 적어주세요."
                  rows={7}
                />
              </label>
            </section>

            <section className="wf-review-note-attach wf-box">
              <div className="wf-review-note-attach__head">
                <div>
                  <p className="wf-text-label">My Note 첨부</p>
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
                <p className="wf-text-sm wf-review-note-attach__message">
                  이 위스키에 작성한 시음 노트가 없습니다.
                </p>
              )}
            </section>

            {errorMessage && (
              <p className="wf-text-sm wf-write-review-error">
                {errorMessage}
              </p>
            )}

            <div className="wf-write-review-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(detailPath)}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSaving || myReviewsLoading}
                className="wf-write-review-submit"
              >
                {isSaving ? '저장 중...' : isEditMode ? '수정 저장' : '등록'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </WireframePage>
  );
}
