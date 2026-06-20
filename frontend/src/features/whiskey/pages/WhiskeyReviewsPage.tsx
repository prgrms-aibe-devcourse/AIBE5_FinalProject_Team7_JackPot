import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { toast } from '@/shared/components/ui/Toast';
import { AttachedNotePanel } from '@/features/review/components/AttachedNotePanel';
import { useToggleReviewLike } from '@/features/review/hooks/useReviews';
import type { WhiskeyReview } from '../types';
import { UserProfileLink } from '@/shared/components/UserProfileLink';
import { useWhiskeyReviews } from '../hooks/useWhiskeyDetail';
import '../whiskey.css';

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

function ReviewCard({ review }: { review: WhiskeyReview }) {
  const [showNote, setShowNote] = useState(false);
  const currentUserId = getCurrentUserId();
  const likeMutation = useToggleReviewLike(currentUserId);

  const handleLikeClick = () => {
    if (currentUserId == null) {
      toast('로그인 후 리뷰에 좋아요를 누를 수 있습니다.', 'warning');
      return;
    }

    likeMutation.mutate({
      reviewId: review.id,
      liked: review.likedByMe,
    });
  };

  return (
    <div className="wf-box wf-review-card">
      <div className="wf-review-card__header">
        <div>
          <UserProfileLink userId={review.userId}>
            <strong>{review.nickname}</strong>
          </UserProfileLink>
          <span className="wf-text-xs"> · {formatReviewDate(review.createdAt)}</span>
        </div>
        <span className="wf-review-card__rating">{Number(review.rating).toFixed(1)}점</span>
      </div>
      <p className="wf-text-sm wf-review-card__text">
        {review.publicText || '작성된 리뷰 내용이 없습니다.'}
      </p>
      <button
        type="button"
        className={`wf-review-like${review.likedByMe ? ' wf-review-like--on' : ''}`}
        onClick={handleLikeClick}
        disabled={likeMutation.isPending}
      >
        <span className="wf-review-like__icon" aria-hidden>👍</span>
        {review.likeCount ?? 0}
      </button>
      {review.hasAttachedNote && review.attachedNoteId && (
        <>
          <button
            type="button"
            className={`wf-detail-reviews__note-button${showNote ? ' wf-detail-reviews__note-button--open' : ''}`}
            onClick={() => setShowNote((prev) => !prev)}
            aria-expanded={showNote}
            aria-label={showNote ? '첨부 노트 접기' : '첨부 노트 보기'}
            title={showNote ? '노트 접기' : '노트 보기'}
          >
            <span className="wf-detail-reviews__note-icon" aria-hidden>
              {showNote ? '📖' : '📕'}
            </span>
          </button>
          {showNote && <AttachedNotePanel noteId={review.attachedNoteId} />}
        </>
      )}
    </div>
  );
}

export default function WhiskeyReviewsPage() {
  const { whiskeyId } = useParams();
  const id = whiskeyId ?? '1';
  const detailPath = PATHS.WHISKEY_DETAIL.replace(':whiskeyId', id);
  const { data: reviews, isLoading } = useWhiskeyReviews(id, 0, 5);

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb"><Link to={detailPath}>위스키 상세</Link> / <strong>리뷰</strong></p>
      <div className="wf-box wf-panel wf-review-page-header">
        <div>
          <span className="wf-text-label">리뷰</span>
          <strong> {reviews?.totalElements ?? 0}개</strong>
        </div>
        <Button to={PATHS.WRITE_REVIEW.replace(':whiskeyId', id)}>리뷰 쓰기</Button>
      </div>

      {isLoading ? (
        <p className="wf-text-sm">리뷰를 불러오는 중입니다.</p>
      ) : reviews?.content.length ? (
        reviews.content.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))
      ) : (
        <p className="wf-text-sm">아직 등록된 리뷰가 없습니다.</p>
      )}
    </WireframePage>
  );
}
