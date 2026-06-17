import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PATHS } from '@/app/router/paths';
import { homeApi, type LoungePost } from '@/features/home/api/homeApi';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Skeleton } from '@/shared/components/ui/Skeleton';
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

function FeedCard({ post }: { post: LoungePost }) {
  const [thumbError, setThumbError] = useState(false);
  const detailPath = PATHS.COMMUNITY_POST.replace(':postId', String(post.postId));
  const contentPreview = stripContentPreview(post.context);
  const authorName = post.authorNickname || `사용자 #${post.authorId}`;
  const authorImage = resolveMediaUrl(post.authorProfileImageUrl);
  const thumbnail = resolveMediaUrl(extractFirstImage(post.context));

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

      <footer className="wf-feed-card__foot">
        <span className="wf-feed-card__meta">커뮤니티 포스트</span>
        <Link to={detailPath} className="wf-feed-card__more">
          자세히 보기
        </Link>
      </footer>
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
        <Skeleton width={96} height={12} radius={4} />
      </div>
    </article>
  );
}

function PromoToday() {
  return (
    <section className="wf-feed-promo wf-feed-promo--today wf-box wf-box--accent">
      <div>
        <p className="wf-text-label">TODAY</p>
        <h2 className="wf-feed-promo__title">오늘의 추천</h2>
        <p className="wf-text-sm">글렌피딕 12 · 가벼운 과일향</p>
      </div>
      <Button to="/whiskey/1" variant="ghost">
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

function LoungeHero({ feedCount, authorCount }: { feedCount: number; authorCount: number }) {
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
      <div className="wf-lounge-hero__stats" aria-label="라운지 요약">
        <div className="wf-lounge-stat">
          <span className="wf-lounge-stat__value">{feedCount}</span>
          <span className="wf-lounge-stat__label">새 피드</span>
        </div>
        <div className="wf-lounge-stat">
          <span className="wf-lounge-stat__value">{authorCount}</span>
          <span className="wf-lounge-stat__label">작성자</span>
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

function LoungeAuthors({ posts }: { posts: LoungePost[] }) {
  const authors = Array.from(
    new Map(posts.map((post) => [post.authorId, post])).values(),
  ).slice(0, 4);

  if (!authors.length) return null;

  return (
    <section className="wf-lounge-authors wf-box wf-box--solid">
      <p className="wf-text-label">팔로잉 활동</p>
      <div className="wf-lounge-authors__list">
        {authors.map((post) => {
          const authorName = post.authorNickname || `사용자 #${post.authorId}`;
          const authorImage = resolveMediaUrl(post.authorProfileImageUrl);

          return (
            <div key={post.authorId} className="wf-lounge-author">
              {authorImage ? (
                <img src={authorImage} alt={authorName} className="wf-lounge-author__avatar" />
              ) : (
                <span className="wf-lounge-author__avatar wf-lounge-author__avatar--initial">
                  {authorName.charAt(0)}
                </span>
              )}
              <div>
                <strong>{authorName}</strong>
                <span>{post.createdAt.slice(0, 10)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** svg/pages/06-home.svg — 라운지 타임라인 */
export default function HomePage() {
  const {
    data: feed = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['lounge', 'feed', 0, 20],
    queryFn: () => homeApi.getLoungeFeed(0, 20),
  });
  const authorCount = new Set(feed.map((post) => post.authorId)).size;

  return (
    <WireframePage scroll>
      <LoungeHero feedCount={feed.length} authorCount={authorCount} />
      <div className="wf-lounge-shell">
        <main className="wf-lounge-feed">
          <div className="wf-lounge-section-head">
            <div>
              <p className="wf-text-label">TIMELINE</p>
              <h2 className="wf-section-title">팔로잉 피드</h2>
            </div>
            <span className="wf-lounge-section-count">{feed.length}건</span>
          </div>
          {isLoading ? (
            <div aria-label="팔로잉 피드를 불러오는 중">
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
            feed.map((post) => <FeedCard key={post.postId} post={post} />)
          ) : (
            <section className="wf-box wf-box--solid wf-lounge-empty">
              <h2 className="wf-section-title">팔로잉 글이 없습니다</h2>
              <p className="wf-text-sm">유저를 팔로우하거나 팔로우한 유저가 글을 작성하면 여기에 표시됩니다.</p>
            </section>
          )}
        </main>
        <aside className="wf-lounge-rail" aria-label="라운지 추천">
          <PromoToday />
          <PromoTasteMatch />
          <LoungeAuthors posts={feed} />
          <LoungeQuickLinks />
        </aside>
      </div>
    </WireframePage>
  );
}
