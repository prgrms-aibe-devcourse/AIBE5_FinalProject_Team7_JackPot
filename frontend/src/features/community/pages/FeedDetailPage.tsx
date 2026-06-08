import { useParams, Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { useFeed } from '../hooks/useCommunity';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export default function FeedDetailPage() {
  const { feedId } = useParams<{ feedId: string }>();
  const { data: feed, isLoading } = useFeed(feedId ? Number(feedId) : undefined);

  if (isLoading) return <WireframePage><p className="wf-text-sm">불러오는 중…</p></WireframePage>;
  if (!feed) return <WireframePage><p className="wf-text-sm">피드를 찾을 수 없습니다.</p></WireframePage>;

  return (
    <WireframePage scroll>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <Link to={PATHS.COMMUNITY_COLUMNS} className="wf-chip">칼럼</Link>
      </nav>

      <div className="wf-box" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <span className="wf-chip" style={{ fontSize: 11 }}>
            {feed.sourceType === 'YOUTUBE' ? '유튜브' : '블로그'}
          </span>
          {feed.whiskeyKeyword && (
            <span className="wf-text-xs" style={{ color: '#888' }}>{feed.whiskeyKeyword}</span>
          )}
        </div>

        <h1 className="wf-title" style={{ marginBottom: 8, lineHeight: 1.4 }}>{feed.title}</h1>

        <p className="wf-text-xs" style={{ color: '#888', marginBottom: 20 }}>
          {formatDate(feed.publishedAt || feed.createdAt)}
        </p>

        {feed.thumbnailUrl && (
          <img
            src={feed.thumbnailUrl}
            alt={feed.title}
            style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8, marginBottom: 20 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        {feed.description && (
          <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>
            {feed.description}
          </p>
        )}

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
          <a
            href={feed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="wf-chip wf-chip--on"
            style={{ fontSize: 13 }}
          >
            원문 보기 →
          </a>
        </div>
      </div>
    </WireframePage>
  );
}
