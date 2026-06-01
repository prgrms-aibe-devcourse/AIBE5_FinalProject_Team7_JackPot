import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PATHS, type CabinetSection, type CabinetTab } from '@/app/router/paths';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import { CabinetPickItem } from '@/features/cabinet/components/CabinetPickItem';
import { CabinetPrimaryTabs } from '@/features/cabinet/components/CabinetPrimaryTabs';
import { CabinetProfileHeader } from '@/features/cabinet/components/CabinetProfileHeader';
import { CabinetStatsBar } from '@/features/cabinet/components/CabinetStatsBar';
import { CabinetSubTabs } from '@/features/cabinet/components/CabinetSubTabs';
import { StarRatingInput } from '@/features/review/components/StarRatingInput';
import { useDeleteReview, useMyReviews, useUpdateReview } from '@/features/review/hooks/useReviews';
import type { WhiskeyReview } from '@/features/whiskey/types';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

// Pick API 응답 타입
interface PickItem {
  pickId: number;
  whiskey: {
    id: number;
    name: string;
    imageUrl: string | null;
    type: string;
    abv: number | null;
  };
  createdAt: string;
}

const COMMUNITY_POSTS = [
  { title: '라프로익 10 첫 피트 후기', meta: '#피트도전 · 게시글', likes: 42, ago: '2일 전' },
  { title: 'Glenfiddich 12 공개 리뷰', meta: '코 85 · 맛 88', likes: 18, ago: '1주 전' },
  { title: '싱글몰트 입문 칼럼', meta: '5분 읽기 · 칼럼', likes: 96, ago: '2주 전' },
];

function parseSection(v: string | null): CabinetSection {
  return v === 'community' ? 'community' : 'bar';
}

function parseTab(v: string | null): CabinetTab {
  if (v === 'wish' || v === 'pick' || v === 'note' || v === 'reviews') return v;
  return 'pick';
}

function getCurrentUserId(): number | null {
  const value = localStorage.getItem('userId');
  if (!value) return null;

  const userId = Number(value);
  return Number.isFinite(userId) ? userId : null;
}

function MyReviewItem({
  review,
  onUpdate,
  onDelete,
  isBusy,
}: {
  review: WhiskeyReview;
  onUpdate: (reviewId: number, rating: number, publicText: string) => void;
  onDelete: (reviewId: number) => void;
  isBusy: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(Number(review.rating));
  const [publicText, setPublicText] = useState(review.publicText ?? '');
  const whiskeyLabel = review.whiskeyName ?? (review.whiskeyId ? `위스키 #${review.whiskeyId}` : `리뷰 #${review.id}`);

  const handleUpdate = () => {
    if (rating < 0 || rating > 5) {
      alert('별점은 0점부터 5점 사이로 선택해주세요.');
      return;
    }

    onUpdate(review.id, rating, publicText.trim());
    setIsEditing(false);
  };

  return (
    <article className="wf-cabinet-post wf-box">
      <div className="wf-review-card__head">
        <div>
          <h3 className="wf-cabinet-post__title">{whiskeyLabel}</h3>
          <p className="wf-text-sm">별점 {Number(review.rating).toFixed(1)} · 공개 리뷰</p>
        </div>
        {review.whiskeyId && (
          <Link
            to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(review.whiskeyId))}
            className="wf-link wf-text-sm"
          >
            상세
          </Link>
        )}
      </div>

      {isEditing ? (
        <div className="wf-review-card__edit">
          <div>
            <p className="wf-text-label">별점</p>
            <StarRatingInput value={rating} onChange={setRating} />
            <p className="wf-text-sm" style={{ margin: '8px 0 0' }}>{rating}점</p>
          </div>
          <textarea
            className="wf-review-textarea"
            value={publicText}
            onChange={(event) => setPublicText(event.target.value)}
            rows={4}
          />
          <div className="wf-review-card__actions">
            <Button className="wf-review-card__action-button" onClick={handleUpdate} disabled={isBusy}>저장</Button>
            <Button className="wf-review-card__action-button" variant="ghost" onClick={() => setIsEditing(false)}>취소</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="wf-text-sm">{review.publicText || '작성된 리뷰 내용이 없습니다.'}</p>
          <footer className="wf-cabinet-post__foot">
            <button type="button" className="wf-link wf-text-sm" onClick={() => setIsEditing(true)}>
              수정
            </button>
            <button type="button" className="wf-link wf-text-sm" onClick={() => onDelete(review.id)} disabled={isBusy}>
              삭제
            </button>
          </footer>
        </>
      )}
    </article>
  );
}

/** svg/pages/12-cabinet-me-bar.svg · 12-cabinet-me-community.svg */
export default function CabinetPage() {
  const [params] = useSearchParams();
  const section = parseSection(params.get('section'));
  const tab = parseTab(params.get('tab'));
  const currentUserId = getCurrentUserId();

  // Pick 목록 상태
  const [picks, setPicks] = useState<PickItem[]>([]);
  const [picksLoading, setPicksLoading] = useState(false);

  // tab이 'pick'으로 바뀔 때마다 API 호출
  useEffect(() => {
    if (!currentUserId) return;

    // Pick 탭이 아니어도 개수 표시를 위해 항상 호출
    setPicksLoading(true);
    cabinetApi
      .getPickList(currentUserId)
      .then((res) => setPicks(res.data.data.content ?? []))
      .catch(() => alert('픽 목록을 불러오지 못했습니다.'))
      .finally(() => setPicksLoading(false));
  }, [currentUserId]);

  // 픽 삭제 핸들러
  const handleDeletePick = async (whiskeyId: number) => {
    if (!confirm('픽 목록에서 제거할까요?')) return;
    try {
      await cabinetApi.deletePick(whiskeyId);
      // 삭제 후 목록에서 제거
      setPicks((prev) => prev.filter((p) => p.whiskey.id !== whiskeyId));
    } catch {
      alert('픽 제거에 실패했습니다.');
    }
  };
  const { data: myReviews, isLoading: reviewsLoading } = useMyReviews(currentUserId, 0, 20);
  const updateReviewMutation = useUpdateReview(currentUserId);
  const deleteReviewMutation = useDeleteReview(currentUserId);

  const barHref = `${PATHS.CABINET}?section=bar&tab=${tab}`;
  const communityHref = `${PATHS.CABINET}?section=community`;

  const handleUpdateReview = async (reviewId: number, rating: number, publicText: string) => {
    try {
      await updateReviewMutation.mutateAsync({
        reviewId,
        body: { rating, publicText },
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : '리뷰 수정에 실패했습니다.');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('리뷰를 삭제할까요?')) return;

    try {
      await deleteReviewMutation.mutateAsync(reviewId);
    } catch (error) {
      alert(error instanceof Error ? error.message : '리뷰 삭제에 실패했습니다.');
    }
  };

  return (
    <WireframePage scroll>
      <CabinetProfileHeader
        name="위스키러버_kr (my)"
        subtitle="애호가 · 보틀 쉐어 공개"
        followers={128}
        following={94}
        isOwner
      />

      <CabinetPrimaryTabs section={section} barHref={barHref} communityHref={communityHref} />

      <p className="wf-text-sm wf-cabinet-hint">
        {section === 'bar'
          ? '선택한 메뉴: Bar — Pick·위시·노트·리뷰'
          : '선택한 메뉴: 커뮤니티 — 작성 글·리뷰·칼럼'}
      </p>

      <CabinetStatsBar pick={picks.length} wish={8} reviews={24} notes={18} />

      {section === 'bar' ? (
        <>
          <CabinetSubTabs active={tab} basePath={`${PATHS.CABINET}?section=bar`} />
          <label className="wf-cabinet-share">
            <input type="checkbox" defaultChecked /> 보틀 쉐어 공개
          </label>
          {tab === 'reviews' ? (
            <>
              {currentUserId == null ? (
                <p className="wf-text-sm">로그인 정보가 없습니다. 다시 로그인해주세요.</p>
              ) : reviewsLoading ? (
                <p className="wf-text-sm">내 리뷰를 불러오는 중입니다.</p>
              ) : myReviews?.content.length ? (
                myReviews.content.map((review) => (
                  <MyReviewItem
                    key={review.id}
                    review={review}
                    onUpdate={handleUpdateReview}
                    onDelete={handleDeleteReview}
                    isBusy={updateReviewMutation.isPending || deleteReviewMutation.isPending}
                  />
                ))
              ) : (
                <p className="wf-text-sm">아직 작성한 리뷰가 없습니다.</p>
              )}
            </>
          ) : (
            // Pick 탭 — API 데이터 렌더링
            picksLoading ? (
              <p className="wf-text-sm">픽 목록을 불러오는 중입니다...</p>
            ) : picks.length === 0 ? (
              <p className="wf-text-sm">아직 픽한 위스키가 없습니다.</p>
            ) : (
              picks.map((pick) => (
                <CabinetPickItem
                  key={pick.pickId}
                  id={String(pick.whiskey.id)}
                  name={pick.whiskey.name}
                  meta={`${pick.whiskey.type} · ${pick.whiskey.abv ?? '-'}%`}
                  onRemove={() => handleDeletePick(pick.whiskey.id)}
                />
              ))
            )
          )}
        </>
      ) : (
        <>
          <Button style={{ width: 192, height: 46, marginTop: 8 }}>+ 글 작성</Button>
          {COMMUNITY_POSTS.map((post) => (
            <article key={post.title} className="wf-cabinet-post wf-box">
              <h3 className="wf-cabinet-post__title">{post.title}</h3>
              <p className="wf-text-sm">{post.meta}</p>
              <footer className="wf-cabinet-post__foot">
                <span className="wf-text-sm">♡ {post.likes} · {post.ago}</span>
                <span className="wf-link wf-text-sm">→ 글 상세</span>
              </footer>
            </article>
          ))}
        </>
      )}
    </WireframePage>
  );
}
