import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import type { ContentFeedResponse } from '../types';

interface FeedListProps {
  feeds: ContentFeedResponse[];
  isLoading?: boolean;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function FeedList({ feeds, isLoading }: FeedListProps) {
  if (isLoading) return <p className="wf-text-sm">불러오는 중…</p>;
  if (feeds.length === 0) return <p className="wf-text-sm">칼럼이 없습니다.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {feeds.map((feed) => (
        <li key={feed.id}>
          <Link
            to={PATHS.COMMUNITY_FEED.replace(':feedId', String(feed.id))}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="wf-box" style={{ padding: '12px 16px', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span className="wf-chip" style={{ fontSize: 11 }}>
                  {feed.sourceType === 'YOUTUBE' ? '유튜브' : '블로그'}
                </span>
                <strong style={{ fontSize: 14 }}>{feed.title}</strong>
              </div>
              {feed.description && (
                <p className="wf-text-xs" style={{ margin: '4px 0', color: '#555', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {feed.description}
                </p>
              )}
              <p className="wf-text-xs" style={{ margin: 0, color: '#888' }}>
                {feed.whiskeyKeyword && <span>{feed.whiskeyKeyword} · </span>}
                {formatDate(feed.publishedAt || feed.createdAt)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
