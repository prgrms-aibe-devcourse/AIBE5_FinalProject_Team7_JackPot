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
            <div className="wf-box" style={{ padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* 썸네일 */}
              {feed.thumbnailUrl && (
                <img
                  src={feed.thumbnailUrl}
                  alt={feed.title}
                  style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                  <span className="wf-chip" style={{ fontSize: 10 }}>
                    {feed.sourceType === 'YOUTUBE' ? '유튜브' : '블로그'}
                  </span>
                  {feed.sourceName && (
                    <span style={{ fontSize: 11, color: '#999' }}>{feed.sourceName}</span>
                  )}
                </div>
                <strong style={{ fontSize: 14, lineHeight: 1.4, display: 'block', marginBottom: 4 }}>{feed.title}</strong>
                {feed.description && (
                  <p className="wf-text-xs" style={{
                    margin: '0 0 4px', color: '#666',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {feed.description.replace(/#+\s|[*_`>]/g, '').slice(0, 120)}
                  </p>
                )}
                <p className="wf-text-xs" style={{ margin: 0, color: '#aaa' }}>
                  {feed.author && <span>{feed.author} · </span>}
                  {formatDate(feed.publishedAt || feed.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
