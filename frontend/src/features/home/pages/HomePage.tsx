import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PATHS } from '@/app/router/paths';
import { homeApi, type LoungePost } from '@/features/home/api/homeApi';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import '../lounge.css';

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function FeedCard({ post }: { post: LoungePost }) {
  const detailPath = PATHS.COMMUNITY_POST.replace(':postId', String(post.postId));
  const contentPreview = stripHtml(post.context);
  const authorName = post.authorNickname || `사용자 #${post.authorId}`;

  return (
    <article className="wf-feed-card wf-box wf-box--solid">
      <div className="wf-feed-card__head">
        {resolveMediaUrl(post.authorProfileImageUrl) ? (
          <img
            src={resolveMediaUrl(post.authorProfileImageUrl)!}
            alt={authorName}
            className="wf-feed-card__avatar"
          />
        ) : (
          <div className="wf-feed-card__avatar wf-placeholder" aria-hidden />
        )}
        <div>
          <strong>{authorName}</strong>
          <span className="wf-feed-card__badge wf-feed-card__badge--following">팔로잉</span>
          <p className="wf-text-sm">{post.title}</p>
          <p className="wf-text-xs">{contentPreview}</p>
        </div>
      </div>
      <div className="wf-feed-card__preview wf-placeholder" aria-hidden />
      <footer className="wf-feed-card__foot">
        <span className="wf-text-xs">{post.createdAt.slice(0, 10)}</span>
        <span className="wf-text-xs">(댓글은 글 페이지에서)</span>
        <Link to={detailPath} className="wf-link wf-text-sm">
          → 글 상세
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
          <Skeleton width="40%" height={14} />
          <Skeleton width="70%" height={12} />
          <Skeleton width="90%" height={12} />
        </div>
      </div>
      <Skeleton className="wf-feed-card__preview" />
      <div className="wf-feed-card__foot">
        <Skeleton width={80} height={11} />
        <Skeleton width={60} height={11} />
      </div>
    </article>
  );
}

function PromoToday() {
  return (
    <section className="wf-feed-promo wf-box wf-box--accent">
      <div>
        <p className="wf-text-label">추천</p>
        <h2 className="wf-hero__title wf-feed-promo__title">오늘의 추천</h2>
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
        <p className="wf-text-label">추천</p>
        <h2 className="wf-hero__title wf-feed-promo__title">취향 비슷한 유저</h2>
        <p className="wf-text-sm">피트러버_서울 · 89% 일치</p>
      </div>
      <Button to={PATHS.TASTE_MATCH} variant="ghost">
        보러가기
      </Button>
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

  return (
    <WireframePage scroll>
      <header className="wf-lounge-header">
        <h1 className="wf-title">라운지</h1>
        <p className="wf-text-sm">팔로우한 유저의 커뮤니티 글을 모아 보는 타임라인</p>
      </header>
      {isLoading ? (
        <div aria-label="팔로잉 피드를 불러오는 중">
          {Array.from({ length: 3 }).map((_, index) => (
            <FeedCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <p className="wf-text-sm">팔로잉 피드를 불러오지 못했습니다.</p>
      ) : feed.length ? (
        feed.map((post) => <FeedCard key={post.postId} post={post} />)
      ) : (
        <section className="wf-box wf-box--solid wf-lounge-empty">
          <h2 className="wf-section-title">팔로잉 글이 없습니다</h2>
          <p className="wf-text-sm">유저를 팔로우하거나 팔로우한 유저가 글을 작성하면 여기에 표시됩니다.</p>
        </section>
      )}
      <PromoToday />
      <PromoTasteMatch />
    </WireframePage>
  );
}
