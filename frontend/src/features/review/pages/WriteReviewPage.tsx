import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { StarRatingInput } from '../components/StarRatingInput';
import { useCreateReview } from '../hooks/useReviews';
import { useWhiskeyDetail } from '@/features/whiskey/hooks/useWhiskeyDetail';

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
  const createReviewMutation = useCreateReview(currentUserId, id);
  const [rating, setRating] = useState(0);
  const [publicText, setPublicText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const reviewListPath = PATHS.WHISKEY_REVIEWS.replace(':whiskeyId', id);

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
      await createReviewMutation.mutateAsync({
        rating,
        publicText: publicText.trim(),
      });
      navigate(reviewListPath);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '리뷰 등록에 실패했습니다.');
    }
  };

  return (
    <WireframePage>
      <form className="wf-box wf-panel" style={{ maxWidth: 520, margin: '0 auto' }} onSubmit={handleSubmit}>
        <h2 className="wf-title">리뷰 작성</h2>
        <p className="wf-text-sm">{whiskey?.name ?? '위스키 정보를 불러오는 중입니다.'}</p>

        <div style={{ marginTop: 16 }}>
          <p className="wf-text-label">별점</p>
          <StarRatingInput value={rating} onChange={setRating} />
          <p className="wf-text-sm" style={{ margin: '8px 0 0' }}>{rating}점</p>
        </div>

        <label style={{ display: 'block', marginTop: 16 }}>
          <span className="wf-text-label">공개 한줄평</span>
          <textarea
            className="wf-review-textarea"
            value={publicText}
            onChange={(event) => setPublicText(event.target.value)}
            placeholder="다른 사람에게 보여줄 리뷰를 적어주세요."
            rows={5}
          />
        </label>

        {errorMessage && (
          <p className="wf-text-sm" style={{ color: '#ff8a8a', marginTop: 12 }}>
            {errorMessage}
          </p>
        )}

        <Button
          block
          type="submit"
          disabled={createReviewMutation.isPending}
          style={{ marginTop: 16 }}
        >
          {createReviewMutation.isPending ? '등록 중...' : '등록'}
        </Button>
      </form>
    </WireframePage>
  );
}
