import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { useFeed } from '../hooks/useCommunity';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function injectImageIntoMarkdown(markdown: string, imageUrl: string): string {
  // 첫 번째 ### 섹션 직전에 이미지 삽입 (도입부 다음)
  const h3Match = markdown.search(/\n###\s/);
  if (h3Match !== -1) {
    return markdown.slice(0, h3Match) + `\n\n![](${imageUrl})\n` + markdown.slice(h3Match);
  }
  // fallback: 두 번째 빈 줄 뒤
  let pos = 0;
  for (let i = 0; i < 2; i++) {
    const next = markdown.indexOf('\n\n', pos + 1);
    if (next === -1) break;
    pos = next;
  }
  return markdown.slice(0, pos) + `\n\n![](${imageUrl})\n` + markdown.slice(pos);
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch { return ''; }
}

function SourceCard({ url, sourceName, author }: { url: string; sourceName: string | null; author: string | null }) {
  const domain = getDomain(url);
  const favicon = getFaviconUrl(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', borderRadius: 10,
        border: '1px solid var(--wf-border)', background: 'var(--wf-surface-2)',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--wf-accent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--wf-border)')}
      >
        <img
          src={favicon}
          alt={domain}
          width={24}
          height={24}
          style={{ borderRadius: 4, flexShrink: 0 }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--wf-text)' }}>
            {sourceName || domain}
          </p>
          {author && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--wf-muted)' }}>by {author}</p>
          )}
        </div>
        <span style={{ fontSize: 12, color: 'var(--wf-accent)', flexShrink: 0 }}>원문 읽기 →</span>
      </div>
    </a>
  );
}

export default function FeedDetailPage() {
  const { feedId } = useParams<{ feedId: string }>();
  const { data: feed, isLoading } = useFeed(feedId ? Number(feedId) : undefined);

  if (isLoading) return <WireframePage><p className="wf-text-sm">불러오는 중…</p></WireframePage>;
  if (!feed) return <WireframePage><p className="wf-text-sm">피드를 찾을 수 없습니다.</p></WireframePage>;

  const bodyMarkdown = feed.description && feed.thumbnailUrl
    ? injectImageIntoMarkdown(feed.description, feed.thumbnailUrl)
    : feed.description ?? '';

  return (
    <WireframePage scroll>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <Link to={PATHS.COMMUNITY_COLUMNS} className="wf-chip">칼럼</Link>
      </nav>

      <div className="wf-box" style={{ padding: '24px' }}>
        {/* 배지 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="wf-chip" style={{ fontSize: 11 }}>
            {feed.sourceType === 'YOUTUBE' ? '유튜브' : '블로그'}
          </span>
          {feed.whiskeyKeyword && (
            <span className="wf-chip" style={{ fontSize: 11 }}>{feed.whiskeyKeyword}</span>
          )}
        </div>

        {/* 제목 */}
        <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.4, margin: '0 0 10px', color: 'var(--wf-text)' }}>
          {feed.title}
        </h1>

        {/* 날짜 */}
        <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--wf-muted)' }}>
          {formatDate(feed.publishedAt || feed.createdAt)}
        </p>

        {/* 본문 마크다운 (이미지 중간 삽입 포함) */}
        {bodyMarkdown && (
          <div style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--wf-text)' }}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h2 style={{ fontSize: 20, fontWeight: 700, margin: '28px 0 10px', borderBottom: '1px solid var(--wf-border)', paddingBottom: 6, color: 'var(--wf-text)' }}>{children}</h2>,
                h2: ({ children }) => <h3 style={{ fontSize: 17, fontWeight: 700, margin: '22px 0 8px', color: 'var(--wf-text)' }}>{children}</h3>,
                h3: ({ children }) => <h4 style={{ fontSize: 15, fontWeight: 600, margin: '16px 0 6px', color: 'var(--wf-accent)' }}>{children}</h4>,
                p: ({ children }) => <p style={{ margin: '0 0 14px', color: 'var(--wf-text)' }}>{children}</p>,
                strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#fff' }}>{children}</strong>,
                em: ({ children }) => <em style={{ color: 'var(--wf-muted)' }}>{children}</em>,
                img: ({ src, alt }) => (
                  <span style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                    <img
                      src={src}
                      alt={alt}
                      style={{ width: '40%', minWidth: 160, borderRadius: 10, objectFit: 'cover', boxShadow: '0 2px 12px rgba(0,0,0,0.40)' }}
                      onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                    />
                  </span>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--wf-accent)', textDecoration: 'underline' }}>
                    {children}
                  </a>
                ),
                hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--wf-border)', margin: '20px 0' }} />,
                blockquote: ({ children }) => (
                  <blockquote style={{ borderLeft: '3px solid var(--wf-accent)', paddingLeft: 14, color: 'var(--wf-muted)', margin: '16px 0', fontStyle: 'italic' }}>
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: '0 0 14px', color: 'var(--wf-text)' }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: '0 0 14px', color: 'var(--wf-text)' }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                code: ({ children }) => <code style={{ background: 'var(--wf-surface-2)', color: 'var(--wf-accent)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>{children}</code>,
              }}
            >
              {bodyMarkdown}
            </ReactMarkdown>
          </div>
        )}

        {/* 출처 임베드 카드 */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--wf-border)' }}>
          <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--wf-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>출처</p>
          <SourceCard url={feed.url} sourceName={feed.sourceName} author={feed.author} />
        </div>
      </div>
    </WireframePage>
  );
}
