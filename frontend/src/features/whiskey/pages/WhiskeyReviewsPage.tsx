import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { AttachedNotePanel } from '@/features/review/components/AttachedNotePanel';
import type { WhiskeyReview } from '../types';
import { useWhiskeyReviews } from '../hooks/useWhiskeyDetail';

function formatReviewDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function ReviewCard({ review }: { review: WhiskeyReview }) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div className="wf-box" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <strong>{review.nickname}</strong>
          <span className="wf-text-xs"> · {formatReviewDate(review.createdAt)}</span>
        </div>
        <span style={{ color: 'var(--wf-accent)' }}>{Number(review.rating).toFixed(1)}점</span>
      </div>
      <p className="wf-text-sm" style={{ marginTop: 8 }}>
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
      <div className="wf-box wf-panel" style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
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
