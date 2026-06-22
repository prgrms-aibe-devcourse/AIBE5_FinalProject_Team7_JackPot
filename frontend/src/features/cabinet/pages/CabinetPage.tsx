import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { PATHS, type CabinetSection, type CabinetTab } from '@/app/router/paths';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import { userApi } from '@/features/my-page/api/userApi';
import { CabinetPickItem } from '@/features/cabinet/components/CabinetPickItem';
import { CabinetPagination } from '@/features/cabinet/components/CabinetPagination';
import { CabinetProfileHeader } from '@/features/cabinet/components/CabinetProfileHeader';
import { CabinetStatsBar } from '@/features/cabinet/components/CabinetStatsBar';
import { CabinetCommunitySection } from '@/features/cabinet/components/CabinetCommunitySection';
import { CabinetFeedEmpty, CabinetFeedLoading, CabinetFeedToolbar, CabinetReviewFeedThumb } from '@/features/cabinet/components/CabinetFeedParts';
import { CabinetNoteExpandDetail } from '@/features/cabinet/components/CabinetNoteExpandDetail';
import { CabinetWishFolderList, type WishFolderSummary } from '@/features/cabinet/components/CabinetWishFolderList';
import { useDeleteReview, useMyReviews } from '@/features/review/hooks/useReviews';
import { fetchMyTastingNotes, type MyTastingNote } from '@/features/tasting-note/api/noteApi';
import type { WhiskeyReview } from '@/features/whiskey/types';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PROFILE_UPDATED_EVENT } from '@/shared/components/layout/TopNav';
import { toast } from '@/shared/components/ui/Toast';
import { confirmToast } from '@/shared/components/ui/ConfirmToast';
import { formatWhiskeySpec } from '@/shared/lib/whiskeyLabels';
import type { CabinetStatsResponse, WishlistFolder, WishlistItem } from '@/features/cabinet/api/cabinetApi';
import '../cabinet.css';
import '@/features/whiskey/whiskey.css';
import '@/features/search/search.css';

function buildFolderSummary(items: WishlistItem[]): WishFolderSummary {
  return {
    count: items.length,
    thumbnails: items.slice(0, 3).map((item) => item.whiskey.imageUrl),
  };
}

async function fetchFolderSummaries(folders: WishlistFolder[]) {
  const summaries: Record<number, WishFolderSummary> = {};
  let total = 0;

  for (const folder of folders) {
    const itemRes = await cabinetApi.getWishItems(folder.folderId);
    const items: WishlistItem[] = itemRes.data.data ?? [];
    summaries[folder.folderId] = buildFolderSummary(items);
    total += items.length;
  }

  return { summaries, total };
}

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

function getCurrentIntroduction(): string {
  return localStorage.getItem('profileIntroduction') || '';
}

function MyNoteItem({ note }: { note: MyTastingNote }) {
  const [isOpen, setIsOpen] = useState(false);
  const editPath = `${PATHS.TASTING_NOTE.replace(':whiskeyId', String(note.whiskeyId))}?noteId=${note.id}&returnTo=cabinet-note`;
  const isDraft = Boolean(note.isDraft ?? note.draft);
  const tagPreview = note.tags?.slice(0, 4) ?? [];

  return (
    <li className={`wf-cabinet-feed__item wf-cabinet-feed__item--note${isOpen ? ' wf-cabinet-feed__item--open' : ''}`}>
      <div className="wf-cabinet-feed__row">
        <CabinetReviewFeedThumb
          whiskeyId={note.whiskeyId}
          whiskeyName={note.whiskeyName}
          imageUrl={note.whiskeyImageUrl}
        />
        <div className="wf-cabinet-feed__body">
          <div className="wf-cabinet-feed__head">
            <Link
              to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(note.whiskeyId))}
              className="wf-cabinet-feed__title wf-cabinet-feed__title--link"
            >
              {note.whiskeyName}
            </Link>
            <span className={`wf-cabinet-feed__badge${isDraft ? ' wf-cabinet-feed__badge--draft' : ''}`}>
              {isDraft ? '임시저장' : '작성 완료'}
            </span>
          </div>
          <p className="wf-cabinet-feed__meta">{note.updatedAt?.slice(0, 10) ?? '-'}</p>
          <p className="wf-cabinet-feed__text">{note.memo || '작성된 메모가 없습니다.'}</p>

          {!isOpen && tagPreview.length > 0 ? (
            <div className="wf-cabinet-feed__tags">
              {tagPreview.map((tag) => (
                <span key={tag.id} className="wf-cabinet-feed__tag">{tag.name}</span>
              ))}
              {note.tags && note.tags.length > tagPreview.length ? (
                <span className="wf-cabinet-feed__tag wf-cabinet-feed__tag--more">
                  +{note.tags.length - tagPreview.length}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="wf-cabinet-feed__actions">
            <Link to={editPath} className="wf-cabinet-feed__action">수정</Link>
            <button type="button" className="wf-cabinet-feed__action" onClick={() => setIsOpen((prev) => !prev)}>
              {isOpen ? '접기' : '상세 보기'}
            </button>
          </div>

          {isOpen ? <CabinetNoteExpandDetail note={note} /> : null}
        </div>
      </div>
    </li>
  );
}

function MyReviewItem({
  review,
  onDelete,
  isBusy,
}: {
  review: WhiskeyReview;
  onDelete: (reviewId: number) => void;
  isBusy: boolean;
}) {
  const whiskeyLabel = review.whiskeyName ?? (review.whiskeyId ? `위스키 #${review.whiskeyId}` : `리뷰 #${review.id}`);
  const editPath = review.whiskeyId
    ? `${PATHS.WRITE_REVIEW.replace(':whiskeyId', String(review.whiskeyId))}?returnTo=cabinet-reviews`
    : null;

  return (
    <li className="wf-cabinet-feed__item wf-cabinet-feed__item--review">
      <div className="wf-cabinet-feed__row">
        <CabinetReviewFeedThumb
          whiskeyId={review.whiskeyId}
          whiskeyName={whiskeyLabel}
          imageUrl={review.whiskeyImageUrl}
        />
        <div className="wf-cabinet-feed__body">
          <div className="wf-cabinet-feed__head">
            {review.whiskeyId ? (
              <Link
                to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(review.whiskeyId))}
                className="wf-cabinet-feed__title wf-cabinet-feed__title--link"
              >
                {whiskeyLabel}
              </Link>
            ) : (
              <strong className="wf-cabinet-feed__title">{whiskeyLabel}</strong>
            )}
            <span className="wf-cabinet-feed__rating" aria-label={`평점 ${Number(review.rating).toFixed(1)}`}>
              ★ {Number(review.rating).toFixed(1)}
            </span>
          </div>

          <p className="wf-cabinet-feed__text">{review.publicText || '작성된 리뷰 내용이 없습니다.'}</p>
          <div className="wf-cabinet-feed__actions">
            {review.whiskeyId ? (
              <Link
                to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(review.whiskeyId))}
                className="wf-cabinet-feed__action"
              >
                위스키 보기
              </Link>
            ) : null}
            {editPath ? (
              <Link to={editPath} className="wf-cabinet-feed__action">
                수정
              </Link>
            ) : null}
            <button
              type="button"
              className="wf-cabinet-feed__action wf-cabinet-feed__action--danger"
              onClick={() => onDelete(review.id)}
              disabled={isBusy}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </li>
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
  const [currentIntroduction, setCurrentIntroduction] = useState(getCurrentIntroduction);

  useEffect(() => {
    const refreshProfile = () => {
      setCurrentIntroduction(getCurrentIntroduction());
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, refreshProfile);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, refreshProfile);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    userApi
      .getMe()
      .then((data) => {
        if (data.introduction !== undefined) {
          const intro = data.introduction ?? '';
          localStorage.setItem('profileIntroduction', intro);
          setCurrentIntroduction(intro);
        }
      })
      .catch(() => {});
  }, [currentUserId]);

  // Pick 목록 상태
  const [picks, setPicks] = useState<PickItem[]>([]);
  const [picksLoading, setPicksLoading] = useState(false);
  const [pickPage, setPickPage] = useState(0);
  const [pickTotalPages, setPickTotalPages] = useState(1);
  const PICK_PAGE_SIZE = 12;

  // Cabinet stats 상태 (Pick·Review 카운트)
  const [cabinetStats, setCabinetStats] = useState<CabinetStatsResponse | null>(null);

  // Pick 목록 — 페이지 변경 시마다 호출
  useEffect(() => {
    if (!currentUserId) return;

    setPicksLoading(true);
    cabinetApi
      .getPickList(currentUserId, pickPage, PICK_PAGE_SIZE)
      .then((res) => {
        const pageData = res.data.data;
        setPicks(pageData.content ?? []);
        setPickTotalPages(pageData.totalPages ?? 1);
      })
      .catch(() => toast('픽 목록을 불러오지 못했습니다.', 'error'))
      .finally(() => setPicksLoading(false));
  }, [currentUserId, pickPage]);

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
      setCabinetStats((prev) => (
        prev ? { ...prev, pickCount: Math.max(0, prev.pickCount - 1) } : prev
      ));
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
  const [wishPage, setWishPage] = useState(0);
  const WISH_PAGE_SIZE = 12;
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);
  const [folderSummaries, setFolderSummaries] = useState<Record<number, WishFolderSummary>>({});

  // 위시 총 개수·위시리스트 미리보기 갱신
  const refreshTotalWishCount = async () => {
    try {
      const res = await cabinetApi.getWishFolders();
      const folders: WishlistFolder[] = res.data.data ?? [];
      const { summaries, total } = await fetchFolderSummaries(folders);
      setFolderSummaries(summaries);
      setTotalWishCount(total);
      setCabinetStats((prev) => (prev ? { ...prev, wishCount: total } : prev));
    } catch {
      // 위시 카운트는 보조 정보라 실패해도 화면 흐름은 유지합니다.
    }
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
        if (folders.length > 0 && selectedFolderId === null) {
          setSelectedFolderId(folders[0].folderId);
        }
        const { summaries, total } = await fetchFolderSummaries(folders);
        setFolderSummaries(summaries);
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
      .then((res) => {
        const items: WishlistItem[] = res.data.data ?? [];
        setWishItems(items);
        setFolderSummaries((prev) => ({
          ...prev,
          [selectedFolderId]: buildFolderSummary(items),
        }));
      })
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
  const [reviewPage, setReviewPage] = useState(0);
  const REVIEW_PAGE_SIZE = 10;
  const { data: myReviews, isLoading: reviewsLoading } = useMyReviews(currentUserId, reviewPage, REVIEW_PAGE_SIZE);

  const [notePage, setNotePage] = useState(0);
  const NOTE_PAGE_SIZE = 10;
  const { data: myNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['tasting-notes', 'my', notePage, NOTE_PAGE_SIZE],
    queryFn: () => fetchMyTastingNotes(notePage, NOTE_PAGE_SIZE),
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
  const deleteReviewMutation = useDeleteReview(currentUserId);

  const barHref = `${PATHS.CABINET}?section=bar&tab=${tab}`;
  const communityHref = `${PATHS.CABINET}?section=community`;

  const handleDeleteReview = async (reviewId: number) => {
    const ok = await confirmToast({ message: '리뷰를 삭제할까요?', danger: true });
    if (!ok) return;

    try {
      await deleteReviewMutation.mutateAsync(reviewId);
    } catch (error) {
      toast(error instanceof Error ? error.message : '리뷰 삭제에 실패했습니다.', 'error');
    }
  };

  return (
    <WireframePage scroll>
      <div className="wf-cabinet-page">
      <CabinetProfileHeader
        name={currentNickname || '내 캐비넷'}
        subtitle={currentNickname ? '내 캐비넷' : undefined}
        profileImageUrl={currentProfileImageUrl}
        introduction={currentIntroduction}
        avatarSeed={currentUserId ?? currentNickname}
        followers={followerCount?.count ?? 0}
        following={followingCount?.count ?? 0}
        followersHref={`${PATHS.CABINET_FOLLOW}?tab=followers`}
        followingHref={`${PATHS.CABINET_FOLLOW}?tab=followings`}
        isOwner
        section={section}
        barHref={barHref}
        communityHref={communityHref}
      />

      {section === 'bar' ? (
        <div className="wf-cabinet-body">
          <CabinetStatsBar
            pick={cabinetStats?.pickCount ?? picks.length}
            wish={cabinetStats?.wishCount ?? totalWishCount}
            reviews={cabinetStats?.reviewCount ?? (myReviews?.content.length ?? 0)}
            notes={cabinetStats?.noteCount ?? (myNotes?.content.length ?? 0)}
            active={tab}
            basePath={`${PATHS.CABINET}?section=bar`}
          />

          <section className={`wf-cabinet-panel${tab === 'pick' || tab === 'wish' ? ' wf-cabinet-panel--grid' : ' wf-cabinet-panel--feed'}`}>
            {tab === 'reviews' ? (
              <CabinetFeedToolbar>
                <Link to={PATHS.REVIEW_PICK} className="wf-cabinet-feed-toolbar__link">+ 리뷰 작성</Link>
              </CabinetFeedToolbar>
            ) : null}
            {tab === 'note' ? (
              <CabinetFeedToolbar>
                <Link to={PATHS.NOTE_PICK} className="wf-cabinet-feed-toolbar__link">+ 노트 작성</Link>
              </CabinetFeedToolbar>
            ) : null}
          {tab === 'reviews' ? (
            <>
              {currentUserId == null ? (
                <CabinetFeedLoading message="로그인 정보가 없습니다. 다시 로그인해주세요." />
              ) : reviewsLoading ? (
                <CabinetFeedLoading message="내 리뷰를 불러오는 중입니다." />
              ) : myReviews?.content.length ? (
                <>
                  <ul className="wf-cabinet-feed">
                  {myReviews.content.map((review) => (
                    <MyReviewItem
                      key={review.id}
                      review={review}
                      onDelete={handleDeleteReview}
                      isBusy={deleteReviewMutation.isPending}
                    />
                  ))}
                  </ul>
                  <CabinetPagination
                    page={reviewPage}
                    totalPages={myReviews.totalPages ?? 1}
                    onPage={(p) => { setReviewPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={reviewsLoading}
                  />
                </>
              ) : (
                <CabinetFeedEmpty
                  title="아직 작성한 리뷰가 없습니다."
                  meta="위스키 상세에서 한줄평을 남기면 여기에 모입니다."
                  actionLabel="리뷰 작성하기"
                  actionTo={PATHS.REVIEW_PICK}
                />
              )}
            </>
          ) : tab === 'pick' ? (
            // Pick 탭 — API 데이터 렌더링 (백엔드 연동)
            picksLoading ? (
              <CabinetFeedLoading message="픽 목록을 불러오는 중입니다..." />
            ) : picks.length === 0 ? (
              <CabinetFeedEmpty
                title="아직 픽한 위스키가 없습니다."
                meta="검색에서 마음에 든 보틀을 Pick 해보세요."
                actionLabel="위스키 검색하기"
                actionTo={PATHS.SEARCH}
              />
            ) : (
              <>
                <div className="wf-ig-grid">
                  {picks.map((pick) => (
                    <CabinetPickItem
                      key={pick.pickId}
                      id={String(pick.whiskey.id)}
                      name={pick.whiskey.name}
                      imageUrl={pick.whiskey.imageUrl}
                      meta={formatWhiskeySpec(pick.whiskey.type, pick.whiskey.abv)}
                      onRemove={() => handleDeletePick(pick.whiskey.id)}
                    />
                  ))}
                </div>
                <CabinetPagination
                  page={pickPage}
                  totalPages={pickTotalPages}
                  onPage={(p) => { setPickPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={picksLoading}
                />
              </>
            )
          ) : tab === 'wish' ? (
            // 위시 탭 — 왼쪽 폴더(고정) + 오른쪽 아이템(고정)
            <div className="wf-cabinet-wish-layout">
              <CabinetWishFolderList
                folders={wishFolders}
                summaries={folderSummaries}
                selectedFolderId={selectedFolderId}
                dragOverFolderId={dragOverFolderId}
                showFolderInput={showFolderInput}
                newFolderName={newFolderName}
                onToggleFolderInput={() => setShowFolderInput((value) => !value)}
                onNewFolderNameChange={setNewFolderName}
                onCreateFolder={handleCreateFolder}
                onSelectFolder={(folderId) => { setSelectedFolderId(folderId); setWishPage(0); }}
                onDeleteFolder={handleDeleteFolder}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragLeave={() => setDragOverFolderId(null)}
              />

              <div className="wf-cabinet-wish-content">
                {wishFolders.length === 0 ? (
                  <CabinetFeedEmpty
                    title="위시리스트가 없습니다."
                    meta="왼쪽에서 새 위시리스트를 만든 뒤 위스키를 저장해보세요."
                  />
                ) : selectedFolderId === null ? (
                  <CabinetFeedEmpty
                    title="위시리스트를 선택해주세요."
                    meta="저장한 위스키는 위시리스트별로 모아볼 수 있어요."
                  />
                ) : wishLoading ? (
                  <CabinetFeedLoading message="위시 목록을 불러오는 중입니다." />
                ) : wishItems.length === 0 ? (
                  <CabinetFeedEmpty
                    title="아직 담긴 위스키가 없어요."
                    meta="검색에서 마음에 드는 위스키를 이 위시리스트에 저장해보세요."
                    actionLabel="위스키 검색하기"
                    actionTo={PATHS.SEARCH}
                  />
                ) : (
                  <>
                    <div className="wf-ig-grid">
                      {wishItems
                        .slice(wishPage * WISH_PAGE_SIZE, (wishPage + 1) * WISH_PAGE_SIZE)
                        .map((item) => (
                          <CabinetPickItem
                            key={item.itemId}
                            id={String(item.whiskey.id)}
                            name={item.whiskey.name}
                            imageUrl={item.whiskey.imageUrl}
                            meta={formatWhiskeySpec(item.whiskey.type, item.whiskey.abv)}
                            onRemove={() => handleRemoveWish(item.itemId)}
                          />
                        ))}
                    </div>
                    <CabinetPagination
                      page={wishPage}
                      totalPages={Math.ceil(wishItems.length / WISH_PAGE_SIZE)}
                      onPage={(p) => { setWishPage(p); }}
                    />
                  </>
                )}
              </div>
            </div>
          ) : tab === 'note' ? (
            <>
              {currentUserId == null ? (
                <CabinetFeedLoading message="로그인 정보가 없습니다. 다시 로그인해주세요." />
              ) : notesLoading ? (
                <CabinetFeedLoading message="내 시음 노트를 불러오는 중입니다." />
              ) : myNotes?.content.length ? (
                <>
                  <ul className="wf-cabinet-feed">
                  {myNotes.content.map((note) => (
                    <MyNoteItem key={note.id} note={note} />
                  ))}
                  </ul>
                  <CabinetPagination
                    page={notePage}
                    totalPages={myNotes.totalPages ?? 1}
                    onPage={(p) => { setNotePage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={notesLoading}
                  />
                </>
              ) : (
                <CabinetFeedEmpty
                  title="아직 작성한 시음 노트가 없습니다."
                  meta="시음 후 노트를 작성하면 향·맛 태그와 함께 저장됩니다."
                  actionLabel="노트 작성하기"
                  actionTo={PATHS.NOTE_PICK}
                />
              )}
            </>
          ) : null}
          </section>
        </div>
      ) : (
        <div className="wf-cabinet-body">
          <section className="wf-cabinet-panel wf-cabinet-panel--feed">
            <CabinetCommunitySection authorId={currentUserId} showWriteButton />
          </section>
        </div>
      )}
      </div>
    </WireframePage>
  );
}
