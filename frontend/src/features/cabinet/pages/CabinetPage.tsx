import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { fetchMyTastingNotes, type MyTastingNote, type TastingNoteTag } from '@/features/tasting-note/api/noteApi';
import type { WhiskeyReview } from '@/features/whiskey/types';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import type { CabinetStatsResponse } from '@/features/cabinet/api/cabinetApi';

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

function getCurrentNickname(): string {
  return localStorage.getItem('nickname') || '';
}

function getCurrentProfileImageUrl(): string | null {
  const value = localStorage.getItem('profileImageUrl') || '';
  return value.trim() ? value : null;
}

const CHART_SIZE = 220;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 70;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];
const SCORE_MAX = 10;

type NoteTagFilter = 'nose' | 'taste';

function axisPoint(index: number, total: number, ratio: number) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  return {
    x: CHART_CENTER + Math.cos(angle) * CHART_RADIUS * ratio,
    y: CHART_CENTER + Math.sin(angle) * CHART_RADIUS * ratio,
  };
}

function pointsToString(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function normalizeScore(score: number | null) {
  if (score == null) return 0;
  return Math.min(Math.max(score, 0), SCORE_MAX);
}

function buildNoteAxes(note: MyTastingNote) {
  return [
    { key: 'body', label: '바디', score: normalizeScore(note.bodyScore) },
    { key: 'finish', label: '피니시', score: normalizeScore(note.finishScore) },
    { key: 'smoky', label: '스모키', score: normalizeScore(note.smokyScore) },
    { key: 'spicy', label: '스파이시', score: normalizeScore(note.spicyScore) },
    { key: 'sweet', label: '단맛', score: normalizeScore(note.sweetScore) },
  ];
}

function noteTagCategoryLabel(category: NoteTagFilter) {
  return category === 'nose' ? '향 태그' : '맛 태그';
}

function CabinetNoteRadar({ note }: { note: MyTastingNote }) {
  const axes = buildNoteAxes(note);

  return (
    <svg className="wf-attached-note__radar" viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} role="img" aria-label="시음 노트 점수 그래프">
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={pointsToString(axes.map((_, index) => axisPoint(index, axes.length, level)))}
          className="wf-attached-note__radar-grid"
        />
      ))}
      {axes.map((_, index) => {
        const end = axisPoint(index, axes.length, 1);
        return (
          <line
            key={index}
            x1={CHART_CENTER}
            y1={CHART_CENTER}
            x2={end.x}
            y2={end.y}
            className="wf-attached-note__radar-axis"
          />
        );
      })}
      <polygon
        points={pointsToString(axes.map((axis, index) => axisPoint(index, axes.length, axis.score / SCORE_MAX)))}
        className="wf-attached-note__radar-fill"
      />
      {axes.map((axis, index) => {
        const labelPoint = axisPoint(index, axes.length, 1.28);
        return (
          <g key={axis.key}>
            <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" className="wf-attached-note__radar-label">
              {axis.label}
            </text>
            <text x={labelPoint.x} y={labelPoint.y + 14} textAnchor="middle" dominantBaseline="middle" className="wf-attached-note__radar-score">
              {axis.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CabinetNoteTags({ tags }: { tags: TastingNoteTag[] }) {
  const [filter, setFilter] = useState<NoteTagFilter>('nose');
  const filteredTags = useMemo(
    () => tags.filter((tag) => tag.category === filter),
    [filter, tags],
  );

  return (
    <div className="wf-attached-note__tags">
      <div className="wf-attached-note__tag-tabs" role="group" aria-label="시음 노트 태그 종류">
        {(['nose', 'taste'] as const).map((category) => (
          <button
            key={category}
            type="button"
            className={`wf-attached-note__tag-tab${filter === category ? ' wf-attached-note__tag-tab--on' : ''}`}
            onClick={() => setFilter(category)}
          >
            {noteTagCategoryLabel(category)}
          </button>
        ))}
      </div>
      {filteredTags.length ? (
        <div className="wf-attached-note__tag-list">
          {filteredTags.map((tag) => (
            <span key={tag.id} className="wf-attached-note__tag-chip">
              {tag.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="wf-text-sm wf-attached-note__empty">{noteTagCategoryLabel(filter)}가 없습니다.</p>
      )}
    </div>
  );
}

function CabinetNoteDetail({ note }: { note: MyTastingNote }) {
  return (
    <section className="wf-attached-note wf-box" aria-label="내 시음 노트 상세">
      <div className="wf-attached-note__body">
        <CabinetNoteRadar note={note} />
        <div className="wf-attached-note__content">
          <p className="wf-text-label">작성한 한줄평</p>
          <p className="wf-text-sm wf-attached-note__memo">
            {note.memo || '작성된 메모가 없습니다.'}
          </p>
          <CabinetNoteTags tags={note.tags ?? []} />
        </div>
      </div>
    </section>
  );
}

function MyNoteItem({ note }: { note: MyTastingNote }) {
  const [isOpen, setIsOpen] = useState(false);
  const editPath = PATHS.TASTING_NOTE.replace(':whiskeyId', String(note.whiskeyId));
  const isDraft = Boolean(note.isDraft ?? note.draft);
  const tagPreview = note.tags?.slice(0, 4) ?? [];

  return (
    <article className="wf-cabinet-post wf-box">
      <div className="wf-review-card__head">
        <div>
          <h3 className="wf-cabinet-post__title">{note.whiskeyName}</h3>
          <p className="wf-text-sm">
            {isDraft ? '임시저장' : '작성 완료'} · 수정일 {note.updatedAt?.slice(0, 10) ?? '-'}
          </p>
        </div>
        <Link to={editPath} className="wf-link wf-text-sm">
          수정
        </Link>
      </div>

      <p className="wf-text-sm">{note.memo || '작성된 메모가 없습니다.'}</p>

      {tagPreview.length > 0 ? (
        <footer className="wf-cabinet-post__foot">
          <span className="wf-text-sm">
            {tagPreview.map((tag) => tag.name).join(' · ')}
            {note.tags.length > tagPreview.length ? ` 외 ${note.tags.length - tagPreview.length}개` : ''}
          </span>
          <button type="button" className="wf-link wf-text-sm" onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? '접기' : '자세히'}
          </button>
        </footer>
      ) : (
        <footer className="wf-cabinet-post__foot">
          <span className="wf-text-sm">선택한 태그 없음</span>
          <button type="button" className="wf-link wf-text-sm" onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? '접기' : '자세히'}
          </button>
        </footer>
      )}
      {isOpen ? <CabinetNoteDetail note={note} /> : null}
    </article>
  );
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
  const currentNickname = getCurrentNickname();
  const currentProfileImageUrl = getCurrentProfileImageUrl();

  // Pick 목록 상태
  const [picks, setPicks] = useState<PickItem[]>([]);
  const [picksLoading, setPicksLoading] = useState(false);

  // Cabinet stats 상태 (Pick·Review 카운트)
  const [cabinetStats, setCabinetStats] = useState<CabinetStatsResponse | null>(null);

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

  // 자신의 캐비넷 통계 조회
  useEffect(() => {
    if (!currentUserId) return;

    cabinetApi
      .getCabinetStats()
      .then((res) => setCabinetStats(res))
      .catch(() => {
        // stats는 UI 보조 정보이므로 실패 시에도 페이지 로딩을 막지 않는다.
        setCabinetStats(null);
      });
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
  const { data: myNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['tasting-notes', 'my', 0, 20],
    queryFn: () => fetchMyTastingNotes(0, 20),
    enabled: currentUserId != null,
  });
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
        name={currentNickname ? `${currentNickname} (my)` : '내 캐비넷'}
        subtitle="애호가 · 보틀 쉐어 공개"
        profileImageUrl={currentProfileImageUrl}
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

      <CabinetStatsBar
        pick={cabinetStats?.pickCount ?? picks.length}
        wish={cabinetStats?.wishCount ?? 8}
        reviews={cabinetStats?.reviewCount ?? (myReviews?.content.length ?? 0)}
        notes={cabinetStats?.noteCount ?? (myNotes?.content.length ?? 0)}
      />

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
          ) : tab === 'pick' ? (
            // Pick 탭 — API 데이터 렌더링 (백엔드 연동)
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
          ) : tab === 'wish' ? (
            <p className="wf-text-sm">위시 기능은 준비 중입니다.</p>
          ) : tab === 'note' ? (
            <>
              {currentUserId == null ? (
                <p className="wf-text-sm">로그인 정보가 없습니다. 다시 로그인해주세요.</p>
              ) : notesLoading ? (
                <p className="wf-text-sm">내 시음 노트를 불러오는 중입니다.</p>
              ) : myNotes?.content.length ? (
                myNotes.content.map((note) => <MyNoteItem key={note.id} note={note} />)
              ) : (
                <p className="wf-text-sm">아직 작성한 시음 노트가 없습니다.</p>
              )}
            </>
          ) : (
            <p className="wf-text-sm">노트 기능은 준비 중입니다.</p>
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
