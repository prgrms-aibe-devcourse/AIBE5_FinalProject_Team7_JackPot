import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { PATHS } from '@/app/router/paths';
import { homeApi, type LoungePost, type LoungeTrendingWhiskey, type LoungeFeedTab, type LoungeSuggestedUser, type LoungeRecommendedWhiskey } from '@/features/home/api/homeApi';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import { tasteMatchApi } from '@/features/discover/api/tasteMatchApi';
import { resolveMediaUrl, resolveProfileImageUrl } from '@/shared/lib/mediaUrl';
import { isLoggedIn } from '@/shared/lib/authSession';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { toast } from '@/shared/components/ui/Toast';
import '../lounge.css';

function stripContentPreview(content: string) {
  const doc = new DOMParser().parseFromString(content, 'text/html');
  const text = doc.body.textContent || content;

  return text
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[>\-*+]\s+/gm, '')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// 라운지 피드에는 썸네일 필드가 없어 본문(HTML/마크다운)에서 첫 이미지를 추출한다.
function extractFirstImage(content: string): string | null {
  const htmlImg = new DOMParser()
    .parseFromString(content, 'text/html')
    .querySelector('img')
    ?.getAttribute('src');
  if (htmlImg) return htmlImg;

  const mdImg = content.match(/!\[[^\]]*\]\(([^)\s]+)/);
  return mdImg ? mdImg[1] : null;
}


function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1).replace('.0', '')}만`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace('.0', '')}천`;
  return String(value);
}

function FeedCard({ post }: { post: LoungePost }) {
  const [thumbError, setThumbError] = useState(false);
  const detailPath = PATHS.COMMUNITY_POST.replace(':postId', String(post.postId));
  const contentPreview = stripContentPreview(post.context);
  const authorName = post.authorNickname || `사용자 #${post.authorId}`;
  const authorImage = resolveProfileImageUrl(post.authorProfileImageUrl, post.authorId);
  const thumbnail = resolveMediaUrl(extractFirstImage(post.context));
  const visibleWhiskeys = post.whiskeyNames.slice(0, 2);
  const hiddenWhiskeyCount = Math.max(post.whiskeyNames.length - visibleWhiskeys.length, 0);

  const whiskeyLabel = visibleWhiskeys.length > 0
    ? visibleWhiskeys.join(' · ') + (hiddenWhiskeyCount > 0 ? ` · 외 ${hiddenWhiskeyCount}개` : '')
    : null;

  return (
    <article className="wf-feed-card wf-box wf-box--solid">
      <div className="wf-feed-card__head">
        <span className="wf-feed-card__avatar-wrap">
          <img
            src={authorImage}
            alt={authorName}
            className="wf-feed-card__avatar"
          />
        </span>
        <div className="wf-feed-card__author">
          <div className="wf-feed-card__author-row">
            <strong className="wf-feed-card__author-name">{authorName}</strong>
          </div>
          <span className="wf-feed-card__date">{post.createdAt.slice(0, 10)}</span>
        </div>
      </div>

      <Link to={detailPath} className="wf-feed-card__body">
        <div className="wf-feed-card__text">
          <h3 className="wf-feed-card__title">{post.title}</h3>
          {contentPreview ? <p className="wf-feed-card__excerpt">{contentPreview}</p> : null}
        </div>
        {thumbnail && !thumbError ? (
          <img
            src={thumbnail}
            alt=""
            className="wf-feed-card__thumb"
            loading="lazy"
            onError={() => setThumbError(true)}
          />
        ) : null}
      </Link>

      <p className="wf-feed-card__meta">
        {`좋아요 ${post.likeCount} · 댓글 ${post.commentCount} · 조회 ${post.viewCount}`}
      </p>

      {whiskeyLabel ? (
        <p className="wf-feed-card__whiskeys">{whiskeyLabel}</p>
      ) : null}
    </article>
  );
}

function FeedCardSkeleton() {
  return (
    <article className="wf-feed-card wf-box wf-box--solid" aria-hidden>
      <div className="wf-feed-card__head">
        <Skeleton className="wf-feed-card__avatar-wrap" width={44} height={44} circle />
        <div className="wf-feed-card__skeleton-lines">
          <Skeleton width="35%" height={13} />
          <Skeleton width="20%" height={11} />
        </div>
      </div>
      <div className="wf-feed-card__body">
        <div className="wf-feed-card__text">
          <Skeleton width="70%" height={17} radius={6} />
          <Skeleton width="95%" height={12} radius={4} />
          <Skeleton width="80%" height={12} radius={4} />
        </div>
        <Skeleton className="wf-feed-card__thumb" radius={10} />
      </div>
      <div className="wf-feed-card__foot">
        <Skeleton width="72%" height={12} radius={4} />
        <Skeleton width="48%" height={11} radius={4} />
      </div>
    </article>
  );
}

const RECO_TYPE_LABEL: Record<string, string> = {
  single_malt: '싱글몰트',
  blended: '블렌디드',
  bourbon: '버번',
  rye: '라이',
};
const RECO_AUTOPLAY_MS = 10000;

// 캐러셀 항목: 추천 위스키 + 광고 여부 플래그
type RecoCarouselItem = LoungeRecommendedWhiskey & { isAd?: boolean };

function RecoSlide({ whiskey, onClick }: { whiskey: RecoCarouselItem; onClick?: (e: React.MouseEvent) => void }) {
  const image = resolveMediaUrl(whiskey.imageUrl);
  const meta = [
    RECO_TYPE_LABEL[whiskey.type] ?? whiskey.type,
    whiskey.country,
    whiskey.ageYears > 0 ? `${whiskey.ageYears}년` : 'NAS',
  ].filter(Boolean).join(' · ');

  return (
    <Link to={`/whiskey/${whiskey.id}`} className="wf-reco-slide" draggable={false} onClick={onClick}>
      <div className="wf-reco-slide__thumb-wrap">
        {whiskey.isAd && <span className="wf-reco-slide__ad">광고</span>}
        {image ? (
          <img src={image} alt={whiskey.name} className="wf-reco-slide__thumb" draggable={false} loading="lazy" />
        ) : (
          <div className="wf-reco-slide__thumb wf-placeholder" aria-hidden />
        )}
      </div>
      <div className="wf-reco-slide__body">
        <p className="wf-reco-slide__name">{whiskey.name}</p>
        <p className="wf-text-xs wf-reco-slide__meta">{meta}</p>
        {whiskey.avgRating > 0 && (
          <p className="wf-reco-slide__rating"><span className="wf-stars">★</span> {whiskey.avgRating.toFixed(1)}</p>
        )}
        {whiskey.reason ? <p className="wf-text-sm wf-reco-slide__reason">{whiskey.reason}</p> : null}
      </div>
    </Link>
  );
}

// 자동 순환 + 드래그/스와이프 캐러셀
function RecoCarousel({ items }: { items: RecoCarouselItem[] }) {
  const [index, setIndex] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const deltaRef = useRef(0);
  const movedRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const n = items.length;

  // 자동 순환 (드래그 중에는 멈춤)
  useEffect(() => {
    if (n <= 1 || dragging) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % n), RECO_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [n, dragging]);

  // 드래그 중에는 전역 리스너로 추적(요소 밖으로 나가도 됨). 포인터 캡처는 쓰지 않음 → 클릭 정상 동작
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startXRef.current;
      if (Math.abs(dx) > 5) movedRef.current = true;
      deltaRef.current = dx;
      setDragDelta(dx);
    };
    const onUp = () => {
      const threshold = (viewportRef.current?.offsetWidth ?? 300) * 0.2;
      if (deltaRef.current < -threshold) setIndex((i) => (i + 1) % n);
      else if (deltaRef.current > threshold) setIndex((i) => (i - 1 + n) % n);
      deltaRef.current = 0;
      setDragDelta(0);
      setDragging(false);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, n]);

  const onPointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    deltaRef.current = 0;
    movedRef.current = false;
    setDragging(true);
  };

  // 드래그한 경우에만 Link 이동 막기 (단순 클릭이면 통과 → 상세로 이동)
  const onSlideClick = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      movedRef.current = false;
    }
  };

  return (
    <div className="wf-reco-carousel__viewport" ref={viewportRef}>
      <div
        className="wf-reco-carousel__track"
        style={{
          transform: `translateX(calc(${-index * 100}% + ${dragDelta}px))`,
          transition: dragging ? 'none' : 'transform 0.4s ease',
        }}
        onPointerDown={onPointerDown}
      >
        {items.map((w) => (
          <div key={w.id} className="wf-reco-carousel__cell">
            <RecoSlide whiskey={w} onClick={onSlideClick} />
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="wf-reco-carousel__dots">
          {items.map((w, i) => (
            <button
              key={w.id}
              type="button"
              className={`wf-reco-carousel__dot${i === index ? ' is-active' : ''}`}
              aria-label={`${i + 1}번째 추천`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendedWhiskeys() {
  const loggedIn = isLoggedIn();
  const { data: recs = [], isLoading } = useQuery({
    queryKey: ['lounge', 'recommended-whiskeys'],
    queryFn: homeApi.getRecommendedWhiskeys,
    enabled: loggedIn,
  });
  const recIds = recs.map((r) => r.id);
  // 추천이 로드된 뒤에 광고 조회 (추천 id를 excludes로 전달 → 서버 재계산/동시쓰기 방지)
  const { data: ads = [] } = useQuery({
    queryKey: ['lounge', 'ad-whiskeys', recIds],
    queryFn: () => homeApi.getAdWhiskeys(recIds),
    enabled: loggedIn && recs.length > 0,
  });

  const header = (
    <div className="wf-reco__head">
      <p className="wf-text-label">FOR YOU</p>
      <h2 className="wf-feed-promo__title">당신에게 추천하는 위스키</h2>
    </div>
  );

  // 비로그인 — 로그인 유도
  if (!loggedIn) {
    return (
      <section className="wf-box wf-box--accent wf-reco wf-reco--prompt">
        {header}
        <p className="wf-text-sm">로그인하면 취향에 맞는 위스키를 추천해드려요.</p>
        <Button to={PATHS.LOGIN} variant="ghost">로그인</Button>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="wf-box wf-reco">
        {header}
        <Skeleton width="100%" height={140} radius={10} />
      </section>
    );
  }

  // 로그인했으나 추천 내역 없음 — 활동 유도
  if (recs.length === 0) {
    return (
      <section className="wf-box wf-reco wf-reco--prompt">
        {header}
        <p className="wf-text-sm">위스키를 둘러보고 노트를 남기면 더 정확한 추천을 받을 수 있어요.</p>
        <Button to={PATHS.SEARCH} variant="ghost">위스키 둘러보기</Button>
      </section>
    );
  }

  // 추천 뒤에 광고 최대 2개 append (광고 플래그 표시)
  const items: RecoCarouselItem[] = [
    ...recs,
    ...ads.slice(0, 2).map((w) => ({ ...w, isAd: true })),
  ];

  return (
    <section className="wf-box wf-reco">
      {header}
      <RecoCarousel items={items} />
    </section>
  );
}

function PromoTasteMatch() {
  const {
    data: matches = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['taste-match', 'list'],
    queryFn: tasteMatchApi.getList,
    retry: false,
  });

  // 목록(최대 10명) 중 1명 랜덤. 리렌더마다 안 바뀌게 useMemo로 고정.
  const match = useMemo(
    () => (matches.length ? matches[Math.floor(Math.random() * matches.length)] : null),
    [matches],
  );

  return (
    <section className="wf-feed-promo wf-box wf-feed-promo--match">
      <div>
        <p className="wf-text-label">MATCH</p>
        <h2 className="wf-feed-promo__title">취향 비슷한 유저</h2>
        {isLoading ? (
          <Skeleton width="70%" height={13} />
        ) : isError || !match ? (
          <p className="wf-text-sm">설문을 완료하면 매칭 결과를 볼 수 있어요.</p>
        ) : (
          <p className="wf-text-sm">{match.nickname} · {(match.similarity * 100).toFixed(2)}% 일치</p>
        )}
      </div>
      <Button to={PATHS.TASTE_MATCH} variant="ghost">
        더보기
      </Button>
    </section>
  );
}

function LoungeHero() {
  return (
    <section className="wf-lounge-hero">
      <div className="wf-lounge-hero__copy">
        <h1 className="wf-lounge-hero__title">취향이 오가는 라운지</h1>
        <p className="wf-lounge-hero__desc">
          팔로우한 유저의 글을 모아 보고, 오늘 마실 위스키와 다음 대화 주제를 가볍게 발견해보세요.
        </p>
        <div className="wf-lounge-hero__actions">
          <Button to={PATHS.COMMUNITY} variant="primary">커뮤니티 보기</Button>
          <Button to={PATHS.SEARCH} variant="ghost">위스키 검색</Button>
        </div>
      </div>
    </section>
  );
}

function LoungeQuickLinks() {
  return (
    <section className="wf-lounge-quick wf-box wf-box--solid">
      <h2 className="wf-lounge-rail__title">바로가기</h2>
      <Link to={PATHS.COMMUNITY} className="wf-lounge-quick__item">
        <strong>커뮤니티</strong>
        <span>게시글</span>
      </Link>
      <Link to={PATHS.SEARCH} className="wf-lounge-quick__item">
        <strong>검색</strong>
        <span>위스키</span>
      </Link>
      <Link to={PATHS.SURVEY} className="wf-lounge-quick__item">
        <strong>설문조사</strong>
        <span>취향</span>
      </Link>
    </section>
  );
}

function LoungeSuggestedUsers({ users }: { users: LoungeSuggestedUser[] }) {
  // 팔로우/처리 중인 유저는 목록에서 즉시 제거(낙관적), 실패 시 토스트
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [pending, setPending] = useState<Set<number>>(new Set());

  const visible = users.filter((u) => !hidden.has(u.userId));
  if (!visible.length) return null;

  const handleFollow = async (userId: number) => {
    if (pending.has(userId)) return;
    setPending((prev) => new Set(prev).add(userId));
    try {
      await cabinetApi.followUser(userId);
      setHidden((prev) => new Set(prev).add(userId));
      toast('팔로우했습니다.', 'success');
    } catch {
      toast('팔로우에 실패했습니다.', 'error');
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <section className="wf-lounge-suggest wf-box wf-box--solid">
      <h2 className="wf-lounge-rail__title">팔로우 추천</h2>
      <div className="wf-lounge-suggest__list">
        {visible.map((user) => {
          const name = user.nickname || `사용자 #${user.userId}`;
          const image = resolveProfileImageUrl(user.profileImageUrl, user.userId);
          return (
            <div key={user.userId} className="wf-lounge-suggest__item">
              <Link to={PATHS.USER_PROFILE.replace(':userId', String(user.userId))} className="wf-lounge-suggest__user">
                <span className="wf-lounge-suggest__avatar-wrap">
                  <img src={image} alt={name} className="wf-lounge-suggest__avatar" />
                </span>
                <strong className="wf-lounge-suggest__name">{name}</strong>
              </Link>
              <button
                type="button"
                className="wf-lounge-suggest__follow"
                onClick={() => handleFollow(user.userId)}
                disabled={pending.has(user.userId)}
              >
                {pending.has(user.userId) ? '처리 중' : '팔로우'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LoungeTrendingWhiskeys({ whiskeys }: { whiskeys: LoungeTrendingWhiskey[] }) {
  if (!whiskeys.length) return null;

  return (
    <section className="wf-lounge-discovery wf-box wf-box--solid">
      <div className="wf-lounge-discovery__head">
        <h2 className="wf-lounge-rail__title">많이 언급된 위스키</h2>
        <Link to={PATHS.SEARCH} className="wf-lounge-discovery__more">검색</Link>
      </div>
      <div className="wf-lounge-bottle-list">
        {whiskeys.slice(0, 5).map((whiskey, index) => (
          <Link
            key={whiskey.whiskeyId}
            to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(whiskey.whiskeyId))}
            className="wf-lounge-bottle-item"
          >
            <span className="wf-lounge-bottle-item__mark">{index + 1}</span>
            <span className="wf-lounge-bottle-item__name">{whiskey.whiskeyName}</span>
            <span className="wf-lounge-bottle-item__count">{formatCount(whiskey.mentionCount)}회</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** svg/pages/06-home.svg — 라운지 타임라인 */
const FEED_TABS: { key: LoungeFeedTab; label: string }[] = [
  { key: 'following', label: '팔로잉' },
  { key: 'popular', label: '인기' },
  { key: 'latest', label: '최신' },
];

const TAB_EMPTY: Record<LoungeFeedTab, { title: string; desc: string }> = {
  following: {
    title: '팔로잉 글이 없습니다',
    desc: '유저를 팔로우하거나 팔로우한 유저가 글을 작성하면 여기에 표시됩니다.',
  },
  popular: { title: '아직 인기 게시글이 없습니다', desc: '글이 쌓이면 조회수 높은 글이 여기에 표시됩니다.' },
  latest: { title: '아직 게시글이 없습니다', desc: '커뮤니티에 글이 올라오면 최신순으로 표시됩니다.' },
};

const LOUNGE_PAGE_SIZE = 20;

export default function HomePage() {
  const [tab, setTab] = useState<LoungeFeedTab>('following');
  const {
    data: feedPages,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['lounge', 'feed', tab],
    queryFn: ({ pageParam }) => homeApi.getFeedByTab(tab, pageParam, LOUNGE_PAGE_SIZE),
    initialPageParam: 0,
    // 마지막 페이지가 꽉 찼으면(=size와 동일) 다음 페이지가 있다고 판단
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === LOUNGE_PAGE_SIZE ? allPages.length : undefined,
  });
  const feed = feedPages?.pages.flat() ?? [];

  // 스크롤 하단 감지용 sentinel — 보이면 다음 페이지 로드
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const { data: trendingWhiskeys = [] } = useQuery({
    queryKey: ['lounge', 'trending-whiskeys', 5],
    queryFn: () => homeApi.getTrendingWhiskeys(5),
  });
  const { data: suggestedUsers = [] } = useQuery({
    queryKey: ['lounge', 'suggested-users', 5],
    queryFn: () => homeApi.getSuggestedUsers(5),
  });

  return (
    <WireframePage scroll>
      <LoungeHero />
      <div className="wf-lounge-shell">
        <main className="wf-lounge-feed">
          <div className="wf-lounge-tabs" role="tablist" aria-label="라운지 피드 탭">
            {FEED_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`wf-lounge-tab${tab === t.key ? ' wf-lounge-tab--on' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div aria-label="피드를 불러오는 중">
              {Array.from({ length: 3 }).map((_, index) => (
                <FeedCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <section className="wf-box wf-box--solid wf-lounge-empty">
              <h2 className="wf-section-title">피드를 불러오지 못했습니다</h2>
              <p className="wf-text-sm">잠시 후 다시 라운지에 접속해주세요.</p>
            </section>
          ) : feed.length ? (
            <>
              {feed.map((post) => <FeedCard key={post.postId} post={post} />)}
              {isFetchingNextPage && <FeedCardSkeleton />}
              {/* 하단 도달 감지 sentinel */}
              <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
              {!hasNextPage && (
                <p className="wf-text-sm wf-lounge-feed-end">모든 글을 확인했어요</p>
              )}
            </>
          ) : (
            <section className="wf-box wf-box--solid wf-lounge-empty">
              <h2 className="wf-section-title">{TAB_EMPTY[tab].title}</h2>
              <p className="wf-text-sm">{TAB_EMPTY[tab].desc}</p>
            </section>
          )}
        </main>
        <aside className="wf-lounge-rail" aria-label="라운지 추천">
          <RecommendedWhiskeys />
          <LoungeSuggestedUsers users={suggestedUsers} />
          <LoungeTrendingWhiskeys whiskeys={trendingWhiskeys} />
          <PromoTasteMatch />
          <LoungeQuickLinks />
        </aside>
      </div>
    </WireframePage>
  );
}
