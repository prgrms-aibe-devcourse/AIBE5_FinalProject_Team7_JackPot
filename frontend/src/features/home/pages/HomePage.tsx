import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

type FeedKind = 'following' | 'popular' | 'activity';

interface FeedItem {
  id: string;
  user: string;
  badge: string;
  badgeKind: FeedKind;
  body: string;
  likes: number;
}

const FEED: FeedItem[] = [
  {
    id: '1',
    user: '피트러버_서울',
    badge: '팔로잉',
    badgeKind: 'following',
    body: '라프로익 10 첫 피트 후기 — 캠프파이어 향이 인상적이에요',
    likes: 42,
  },
  {
    id: '2',
    user: '입문왕',
    badge: '인기',
    badgeKind: 'popular',
    body: '싱글몰트 vs 블렌디드 정리했습니다. 입문자분들 참고해 주세요',
    likes: 128,
  },
  {
    id: '3',
    user: 'whisky_fan',
    badge: '♡ 팔로잉 활동',
    badgeKind: 'activity',
    body: '피트러버_서울님이 이 글에 좋아요를 눌렀습니다',
    likes: 24,
  },
];

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <article className="wf-feed-card wf-box wf-box--solid">
      <div className="wf-feed-card__head">
        <div className="wf-feed-card__avatar wf-placeholder" aria-hidden />
        <div>
          <strong>{item.user}</strong>
          <span className={`wf-feed-card__badge wf-feed-card__badge--${item.badgeKind}`}>{item.badge}</span>
          <p className="wf-text-sm">{item.body}</p>
        </div>
      </div>
      <div className="wf-feed-card__preview wf-placeholder" aria-hidden />
      <footer className="wf-feed-card__foot">
        <span className="wf-feed-card__likes">♡ {item.likes}</span>
        <span className="wf-text-xs">(댓글은 글 페이지에서)</span>
        <Link to={PATHS.COMMUNITY} className="wf-link wf-text-sm">
          → 글 상세
        </Link>
      </footer>
    </article>
  );
}

function PromoToday() {
  return (
    <section className="wf-feed-promo wf-box wf-box--accent">
      <div>
        <p className="wf-text-label">추천</p>
        <h2 className="wf-hero__title" style={{ fontSize: 19 }}>
          오늘의 추천
        </h2>
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
        <h2 className="wf-hero__title" style={{ fontSize: 19 }}>
          취향 비슷한 유저
        </h2>
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
  return (
    <WireframePage scroll>
      <header className="wf-lounge-header">
        <h1 className="wf-title">라운지</h1>
        <p className="wf-text-sm">팔로잉 · 인기 · 추천이 섞인 타임라인</p>
      </header>
      <FeedCard item={FEED[0]} />
      <PromoToday />
      <FeedCard item={FEED[1]} />
      <FeedCard item={FEED[2]} />
      <PromoTasteMatch />
    </WireframePage>
  );
}
