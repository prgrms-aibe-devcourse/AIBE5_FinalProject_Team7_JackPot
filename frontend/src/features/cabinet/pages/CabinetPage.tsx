import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { PATHS, type CabinetSection, type CabinetTab } from '@/app/router/paths';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import { CabinetPickItem } from '@/features/cabinet/components/CabinetPickItem';
import { CabinetPrimaryTabs } from '@/features/cabinet/components/CabinetPrimaryTabs';
import { CabinetProfileHeader } from '@/features/cabinet/components/CabinetProfileHeader';
import { CabinetStatsBar } from '@/features/cabinet/components/CabinetStatsBar';
import { CabinetCommunitySection } from '@/features/cabinet/components/CabinetCommunitySection';
import { CabinetSubTabs } from '@/features/cabinet/components/CabinetSubTabs';
import { StarRatingInput } from '@/features/review/components/StarRatingInput';
import { useDeleteReview, useMyReviews, useUpdateReview } from '@/features/review/hooks/useReviews';
import { fetchMyTastingNotes, type MyTastingNote, type TastingNoteTag } from '@/features/tasting-note/api/noteApi';
import type { WhiskeyReview } from '@/features/whiskey/types';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { toast } from '@/shared/components/ui/Toast';
import { confirmToast } from '@/shared/components/ui/ConfirmToast';
import type { CabinetStatsResponse, WishlistFolder, WishlistItem } from '@/features/cabinet/api/cabinetApi';

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
      .catch(() => toast('픽 목록을 불러오지 못했습니다.', 'error'))
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
    const ok = await confirmToast({ message: '픽 목록에서 제거할까요?', confirmLabel: '제거', danger: true });
    if (!ok) return;
    try {
      await cabinetApi.deletePick(whiskeyId);
      setPicks((prev) => prev.filter((p) => p.whiskey.id !== whiskeyId));
    } catch {
      toast('픽 제거에 실패했습니다.', 'error');
    }
  };

  // 위시 상태
  const [wishFolders, setWishFolders] = useState<WishlistFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [wishItems, setWishItems] = useState<WishlistItem[]>([]);
  const [wishLoading, setWishLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [totalWishCount, setTotalWishCount] = useState(0);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);

  // 위시 총 개수 갱신 함수 (공통)
  const refreshTotalWishCount = async () => {
    try {
      const res = await cabinetApi.getWishFolders();
      const folders = res.data.data ?? [];
      let total = 0;
      for (const folder of folders) {
        const itemRes = await cabinetApi.getWishItems(folder.folderId);
        total += (itemRes.data.data ?? []).length;
      }
      setTotalWishCount(total);
    } catch {}
  };

  // 위시 총 개수 — 페이지 진입 시 바로 계산
  useEffect(() => {
    if (!currentUserId) return;
    refreshTotalWishCount();
  }, [currentUserId]);

  // 위시 탭 진입 시 폴더 목록 조회
  useEffect(() => {
    if (!currentUserId || tab !== 'wish') return;

    cabinetApi
      .getWishFolders()
      .then(async (res) => {
        const folders: WishlistFolder[] = res.data.data ?? [];
        setWishFolders(folders);
        // 첫 폴더 자동 선택
        if (folders.length > 0 && selectedFolderId === null) {
          setSelectedFolderId(folders[0].folderId);
        }
        // 위시 총 개수 계산 (모든 폴더 아이템 합산)
        let total = 0;
        for (const folder of folders) {
          const itemRes = await cabinetApi.getWishItems(folder.folderId);
          total += (itemRes.data.data ?? []).length;
        }
        setTotalWishCount(total);
      })
      .catch(() => toast('위시 폴더를 불러오지 못했습니다.', 'error'));
  }, [currentUserId, tab]);

  // 선택된 폴더의 아이템 목록 조회
  useEffect(() => {
    if (selectedFolderId === null) return;

    setWishLoading(true);
    cabinetApi
      .getWishItems(selectedFolderId)
      .then((res) => setWishItems(res.data.data ?? []))
      .catch(() => toast('위시 목록을 불러오지 못했습니다.', 'error'))
      .finally(() => setWishLoading(false));
  }, [selectedFolderId]);

  // 폴더 드래그 순서 변경 핸들러
  const dragFolderIdRef = useRef<number | null>(null);

  const handleDragStart = (folderId: number) => {
    dragFolderIdRef.current = folderId;
  };

  const handleDragOver = (e: React.DragEvent, folderId: number) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };

  const handleDrop = async (targetFolderId: number) => {
    setDragOverFolderId(null);
    const dragId = dragFolderIdRef.current;
    if (dragId === null || dragId === targetFolderId) return;

    // 로컬 순서 즉시 변경 (UI 반응성)
    const newOrder = [...wishFolders];
    const fromIdx = newOrder.findIndex((f) => f.folderId === dragId);
    const toIdx = newOrder.findIndex((f) => f.folderId === targetFolderId);
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    setWishFolders(newOrder);

    // 서버에 순서 저장
    try {
      const res = await cabinetApi.reorderWishFolders(newOrder.map((f) => f.folderId));
      setWishFolders(res.data.data ?? newOrder);
      toast('폴더 순서가 변경되었습니다.', 'success');
    } catch {
      toast('순서 변경에 실패했습니다.', 'error');
      // 실패 시 원래 순서로 복구
      const revert = await cabinetApi.getWishFolders();
      setWishFolders(revert.data.data ?? wishFolders);
    }
  };

  // 폴더 생성
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast('폴더 이름을 입력해주세요.', 'warning');
      return;
    }
    try {
      const res = await cabinetApi.createWishFolder(newFolderName.trim());
      setWishFolders(res.data.data ?? []);
      setNewFolderName('');
      setShowFolderInput(false);
      toast('폴더가 생성되었습니다.', 'success');
      await refreshTotalWishCount();
    } catch {
      toast('폴더 생성에 실패했습니다.', 'error');
    }
  };

  // 폴더 삭제
  const handleDeleteFolder = async (folderId: number) => {
    const ok = await confirmToast({
      message: '폴더를 삭제하면 안에 있는 모든 위시가 함께 삭제됩니다.\n계속할까요?',
      confirmLabel: '삭제',
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await cabinetApi.deleteWishFolder(folderId);
      const folders: WishlistFolder[] = res.data.data ?? [];
      setWishFolders(folders);
      if (selectedFolderId === folderId) {
        setSelectedFolderId(folders.length > 0 ? folders[0].folderId : null);
        setWishItems([]);
      }
      await refreshTotalWishCount();
    } catch {
      toast('폴더 삭제에 실패했습니다.', 'error');
    }
  };

  // 위시 아이템 삭제
  const handleRemoveWish = async (itemId: number) => {
    if (selectedFolderId === null) return;
    const ok = await confirmToast({ message: '위시 목록에서 제거할까요?', confirmLabel: '제거', danger: true });
    if (!ok) return;

    try {
      await cabinetApi.removeWish(itemId, selectedFolderId);
      setWishItems((prev) => prev.filter((item) => item.itemId !== itemId));
      await refreshTotalWishCount();
    } catch {
      toast('위시 제거에 실패했습니다.', 'error');
    }
  };
  const { data: myReviews, isLoading: reviewsLoading } = useMyReviews(currentUserId, 0, 20);
  const { data: myNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['tasting-notes', 'my', 0, 20],
    queryFn: () => fetchMyTastingNotes(0, 20),
    enabled: currentUserId != null,
  });
  const { data: followerCount } = useQuery({
    queryKey: ['follows', 'followers', currentUserId],
    queryFn: () => cabinetApi.getFollowerCount(),
    enabled: currentUserId != null,
    staleTime: 30_000,
  });
  const { data: followingCount } = useQuery({
    queryKey: ['follows', 'followings', currentUserId],
    queryFn: () => cabinetApi.getFollowingCount(),
    enabled: currentUserId != null,
    staleTime: 30_000,
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
        followers={followerCount?.count ?? 0}
        following={followingCount?.count ?? 0}
        isOwner
      />

      <CabinetPrimaryTabs section={section} barHref={barHref} communityHref={communityHref} />

      <p className="wf-text-sm wf-cabinet-hint">
        {section === 'bar'
          ? '선택한 메뉴: Bar — Pick·위시·노트·리뷰'
          : '선택한 메뉴: 커뮤니티 — 작성 글·리뷰·칼럼'}
      </p>

      {section === 'bar' ? (
        <CabinetStatsBar
          pick={cabinetStats?.pickCount ?? picks.length}
          wish={cabinetStats?.wishCount ?? totalWishCount}
          reviews={cabinetStats?.reviewCount ?? (myReviews?.content.length ?? 0)}
          notes={cabinetStats?.noteCount ?? (myNotes?.content.length ?? 0)}
        />
      ) : null}

      {section === 'bar' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CabinetSubTabs active={tab} basePath={`${PATHS.CABINET}?section=bar`} />
            {tab === 'note' && (
              <Button to={PATHS.NOTE_PICK} style={{ fontSize: 13, padding: '6px 14px', flexShrink: 0 }}>+ Note 작성</Button>
            )}
            {tab === 'reviews' && (
              <Button to={PATHS.REVIEW_PICK} style={{ fontSize: 13, padding: '6px 14px', flexShrink: 0 }}>+ 리뷰 작성</Button>
            )}
          </div>
          {tab === 'pick' && (
            <label className="wf-cabinet-share">
              <input type="checkbox" defaultChecked /> 보틀 쉐어 공개
            </label>
          )}
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
                  imageUrl={pick.whiskey.imageUrl}
                  meta={`${pick.whiskey.type} · ${pick.whiskey.abv ?? '-'}%`}
                  onRemove={() => handleDeletePick(pick.whiskey.id)}
                />
              ))
            )
          ) : tab === 'wish' ? (
            // 위시 탭 — 왼쪽 폴더(고정) + 오른쪽 아이템(고정)
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', minHeight: 400 }}>

              {/* 왼쪽: 폴더 목록 — 너비 고정, 높이 독립 */}
              <aside className="wf-box" style={{
                width: 200,
                minWidth: 200,
                flexShrink: 0,
                padding: 16,
                alignSelf: 'flex-start',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <strong className="wf-text-sm">📁 플레이리스트</strong>
                  <button type="button" className="wf-link wf-text-xs" onClick={() => setShowFolderInput((v) => !v)}>
                    {showFolderInput ? '취소' : '+ 추가'}
                  </button>
                </div>

                {/* 폴더 이름 입력 */}
                {showFolderInput && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <input
                      type="text"
                      placeholder="폴더 이름"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                      autoFocus
                      style={{
                        flex: 1,
                        minWidth: 0,
                        background: '#16161c',
                        border: '1px solid #2e2e38',
                        borderRadius: 8,
                        padding: '6px 10px',
                        color: '#ececf0',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCreateFolder}
                      style={{
                        background: '#c9a227',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 10px',
                        color: '#0c0c0f',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      추가
                    </button>
                  </div>
                )}

                {/* 폴더 목록 */}
                {wishFolders.length === 0 ? (
                  <p className="wf-text-xs" style={{ margin: 0 }}>폴더가 없습니다.</p>
                ) : (
                  wishFolders.map((folder) => (
                    <div
                      key={folder.folderId}
                      draggable
                      onDragStart={() => handleDragStart(folder.folderId)}
                      onDragOver={(e) => handleDragOver(e, folder.folderId)}
                      onDrop={() => handleDrop(folder.folderId)}
                      onDragLeave={() => setDragOverFolderId(null)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 4px',
                        borderRadius: 6,
                        background: dragOverFolderId === folder.folderId ? 'rgba(201,162,39,0.1)' : 'transparent',
                        borderTop: dragOverFolderId === folder.folderId ? '2px solid #c9a227' : '2px solid transparent',
                        cursor: 'grab',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* 드래그 핸들 */}
                      <span style={{ color: '#8b8b96', fontSize: 12, marginRight: 4, cursor: 'grab', userSelect: 'none' }}>⠿</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFolderId(folder.folderId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: selectedFolderId === folder.folderId ? '#c9a227' : '#ececf0',
                          fontWeight: selectedFolderId === folder.folderId ? 700 : 400,
                          cursor: 'pointer',
                          fontSize: 13,
                          padding: 0,
                          textAlign: 'left',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {folder.name}
                      </button>
                      <button
                        type="button"
                        className="wf-link wf-text-xs"
                        onClick={() => handleDeleteFolder(folder.folderId)}
                        style={{ flexShrink: 0, marginLeft: 4 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </aside>

              {/* 오른쪽: 위시 아이템 — 나머지 공간 차지, 높이 독립 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {selectedFolderId === null ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                  }}>
                    <p style={{ color: '#8b8b96', fontSize: 15, margin: 0 }}>
                      폴더를 선택하거나 새로 만들어주세요.
                    </p>
                  </div>
                ) : wishLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                    <p style={{ color: '#8b8b96', fontSize: 15, margin: 0 }}>불러오는 중...</p>
                  </div>
                ) : wishItems.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                    <p style={{ color: '#8b8b96', fontSize: 15, margin: 0 }}>
                      이 폴더에 위시한 위스키가 없습니다.
                    </p>
                  </div>
                ) : (
                  wishItems.map((item) => (
                    <CabinetPickItem
                      key={item.itemId}
                      id={String(item.whiskey.id)}
                      name={item.whiskey.name}
                      imageUrl={item.whiskey.imageUrl}
                      meta={`${item.whiskey.type} · ${item.whiskey.abv ?? '-'}%`}
                      onRemove={() => handleRemoveWish(item.itemId)}
                    />
                  ))
                )}
              </div>
            </div>
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
          ) : null}
        </>
      ) : (
        <CabinetCommunitySection authorId={currentUserId} showWriteButton />
      )}
    </WireframePage>
  );
}
