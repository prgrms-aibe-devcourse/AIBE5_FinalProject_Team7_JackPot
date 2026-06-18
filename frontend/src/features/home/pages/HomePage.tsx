import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { PATHS } from '@/app/router/paths';
import { homeApi, type LoungePost, type LoungeTrendingWhiskey, type LoungeFeedTab, type LoungeSuggestedUser, type LoungeToday } from '@/features/home/api/homeApi';
import { cabinetApi } from '@/features/cabinet/api/cabinetApi';
import { fetchWhiskeyById, fetchWhiskeys, type WhiskeyCard } from '@/features/search/api/whiskeyApi';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
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

const POST_TYPE_LABEL: Record<LoungePost['postType'], string> = {
  NOTICE: '공지',
  COLUMN: '칼럼',
  QA: '질문',
  FREE: '자유',
  FEED: '피드',
};

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
  const authorImage = resolveMediaUrl(post.authorProfileImageUrl);
  const thumbnail = resolveMediaUrl(extractFirstImage(post.context));
  const visibleWhiskeys = post.whiskeyNames.slice(0, 2);
  const hiddenWhiskeyCount = Math.max(post.whiskeyNames.length - visibleWhiskeys.length, 0);

  return (
    <article className="wf-feed-card wf-box wf-box--solid">
      <div className="wf-feed-card__head">
        {authorImage ? (
          <img
            src={authorImage}
            alt={authorName}
            className="wf-feed-card__avatar"
          />
        ) : (
          <div className="wf-feed-card__avatar wf-feed-card__avatar--initial" aria-hidden>
            {authorName.charAt(0)}
          </div>
        )}
        <div className="wf-feed-card__author">
          <div className="wf-feed-card__author-row">
            <strong className="wf-feed-card__author-name">{authorName}</strong>
            <span className="wf-feed-card__badge wf-feed-card__badge--following">팔로잉</span>
          </div>
          <span className="wf-feed-card__date">{post.createdAt.slice(0, 10)}</span>
        </div>
        <span className="wf-feed-card__type">{POST_TYPE_LABEL[post.postType]}</span>
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

      <div className="wf-feed-card__signals" aria-label="게시글 반응 정보">
        <span className="wf-feed-card__signal">♥ {formatCount(post.likeCount)}</span>
        <span className="wf-feed-card__signal">댓글 {formatCount(post.commentCount)}</span>
        <span className="wf-feed-card__signal">조회 {formatCount(post.viewCount)}</span>
      </div>

      {visibleWhiskeys.length > 0 && (
        <div className="wf-feed-card__tags" aria-label="위스키 태그">
          {visibleWhiskeys.map((name) => (
            <span key={name} className="wf-feed-card__tag">
              {name}
            </span>
          ))}
          {hiddenWhiskeyCount > 0 && (
            <span className="wf-feed-card__tag wf-feed-card__tag--more">
              +{hiddenWhiskeyCount}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function FeedCardSkeleton() {
  return (
    <article className="wf-feed-card wf-box wf-box--solid" aria-hidden>
      <div className="wf-feed-card__head">
        <Skeleton className="wf-feed-card__avatar" circle />
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
        <div className="wf-feed-card__skeleton-signal-row">
          <Skeleton width={74} height={24} radius={999} />
          <Skeleton width={68} height={24} radius={999} />
          <Skeleton width={64} height={24} radius={999} />
        </div>
        <Skeleton width={96} height={12} radius={4} />
      </div>
    </article>
  );
}

function PromoToday({ whiskey }: { whiskey?: WhiskeyCard | null }) {
  const image = whiskey ? resolveMediaUrl(whiskey.imageUrl) : null;
  return (
    <section className="wf-feed-promo wf-feed-promo--today wf-box wf-box--accent">
      <div className="wf-feed-promo__head">
        <div className="wf-feed-promo__copy">
          <p className="wf-text-label">TODAY</p>
          <h2 className="wf-feed-promo__title">오늘의 추천</h2>
          <p className="wf-text-sm">{whiskey?.name ?? '오늘의 위스키를 둘러보세요'}</p>
        </div>
        {image ? (
          <img src={image} alt="" aria-hidden className="wf-feed-promo__bottle" loading="lazy" />
        ) : null}
      </div>
      <Button to={whiskey ? `/whiskey/${whiskey.id}` : PATHS.SEARCH} variant="ghost">
        보러가기
      </Button>
    </section>
  );
}

function PromoTasteMatch() {
  return (
    <section className="wf-feed-promo wf-box wf-feed-promo--match">
      <div>
        <p className="wf-text-label">MATCH</p>
        <h2 className="wf-feed-promo__title">취향 비슷한 유저</h2>
        <p className="wf-text-sm">피트러버_서울 · 89% 일치</p>
      </div>
      <Button to={PATHS.TASTE_MATCH} variant="ghost">
        보러가기
      </Button>
    </section>
  );
}

function LoungeHero({ today }: { today?: LoungeToday }) {
  return (
    <section className="wf-lounge-hero">
      <div className="wf-lounge-hero__copy">
        <p className="wf-text-label">WHISKEY NOTE LOUNGE</p>
        <h1 className="wf-lounge-hero__title">취향이 오가는 라운지</h1>
        <p className="wf-lounge-hero__desc">
          팔로우한 유저의 글을 모아 보고, 오늘 마실 위스키와 다음 대화 주제를 가볍게 발견해보세요.
        </p>
        <div className="wf-lounge-hero__actions">
          <Button to={PATHS.COMMUNITY} variant="primary">커뮤니티 보기</Button>
          <Button to={PATHS.SEARCH} variant="ghost">위스키 검색</Button>
        </div>
      </div>
      <div className="wf-lounge-hero__today" aria-label="오늘의 라운지">
        <p className="wf-lounge-hero__today-label">TODAY · 오늘의 라운지</p>
        <div className="wf-lounge-hero__today-row">
          <span className="wf-lounge-hero__today-key">새 글</span>
          <span className="wf-lounge-hero__today-num">{today?.newPostCount ?? 0}</span>
        </div>
        <div className="wf-lounge-hero__today-row">
          <span className="wf-lounge-hero__today-key">인기 글</span>
          {today?.topPost ? (
            <Link
              to={PATHS.COMMUNITY_POST.replace(':postId', String(today.topPost.postId))}
              className="wf-lounge-hero__today-link"
            >
              {today.topPost.title}
            </Link>
          ) : (
            <span className="wf-lounge-hero__today-muted">아직 없음</span>
          )}
        </div>
        <div className="wf-lounge-hero__today-row">
          <span className="wf-lounge-hero__today-key">화제 위스키</span>
          <span className="wf-lounge-hero__today-val">{today?.topWhiskeyName ?? '아직 없음'}</span>
        </div>
      </div>
    </section>
  );
}

function LoungeQuickLinks() {
  return (
    <section className="wf-lounge-quick wf-box wf-box--solid">
      <p className="wf-text-label">바로가기</p>
      <Link to={PATHS.COMMUNITY} className="wf-lounge-quick__item">
        <span>커뮤니티</span>
        <strong>새 글 둘러보기</strong>
      </Link>
      <Link to={PATHS.SEARCH} className="wf-lounge-quick__item">
        <span>검색</span>
        <strong>보틀 찾아보기</strong>
      </Link>
      <Link to={PATHS.SURVEY} className="wf-lounge-quick__item">
        <span>설문조사</span>
        <strong>추천 정교화</strong>
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
      <p className="wf-text-label">팔로우 추천</p>
      <div className="wf-lounge-suggest__list">
        {visible.map((user) => {
          const name = user.nickname || `사용자 #${user.userId}`;
          const image = resolveMediaUrl(user.profileImageUrl);
          return (
            <div key={user.userId} className="wf-lounge-suggest__item">
              <Link to={PATHS.USER_PROFILE.replace(':userId', String(user.userId))} className="wf-lounge-suggest__user">
                {image ? (
                  <img src={image} alt={name} className="wf-lounge-suggest__avatar" />
                ) : (
                  <span className="wf-lounge-suggest__avatar wf-lounge-suggest__avatar--initial">{name.charAt(0)}</span>
                )}
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
        <p className="wf-text-label">많이 언급된 위스키</p>
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

const TAB_META: Record<LoungeFeedTab, { eyebrow: string; title: string }> = {
  following: { eyebrow: 'TIMELINE', title: '팔로잉 피드' },
  popular: { eyebrow: 'POPULAR', title: '인기 게시글' },
  latest: { eyebrow: 'LATEST', title: '최신 게시글' },
};

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
  // 오늘의 추천: 화제의 위스키(trending 1위)를 우선, 없으면 카탈로그 첫 위스키로 폴백
  const featuredWhiskeyId = trendingWhiskeys[0]?.whiskeyId;
  const { data: featuredWhiskey } = useQuery({
    queryKey: ['lounge', 'today-pick', featuredWhiskeyId ?? 'fallback'],
    queryFn: async () => {
      if (featuredWhiskeyId) return fetchWhiskeyById(featuredWhiskeyId);
      const page = await fetchWhiskeys({ size: 1 });
      return page.content[0] ?? null;
    },
  });
  const { data: suggestedUsers = [] } = useQuery({
    queryKey: ['lounge', 'suggested-users', 5],
    queryFn: () => homeApi.getSuggestedUsers(5),
  });
  const { data: today } = useQuery({
    queryKey: ['lounge', 'today'],
    queryFn: () => homeApi.getToday(),
  });

  return (
    <WireframePage scroll>
      <LoungeHero today={today} />
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
          <div className="wf-lounge-section-head">
            <div>
              <p className="wf-text-label">{TAB_META[tab].eyebrow}</p>
              <h2 className="wf-section-title">{TAB_META[tab].title}</h2>
            </div>
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
          <PromoToday whiskey={featuredWhiskey} />
          <LoungeSuggestedUsers users={suggestedUsers} />
          <LoungeTrendingWhiskeys whiskeys={trendingWhiskeys} />
          <PromoTasteMatch />
          <LoungeQuickLinks />
        </aside>
      </div>
    </WireframePage>
  );
}
