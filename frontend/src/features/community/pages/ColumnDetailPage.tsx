// 위스키 칼럼 상세 페이지 — 마크다운 본문 렌더링 및 출처 카드 표시
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PATHS } from '@/app/router/paths';
import { useWhiskeyColumn } from '../hooks/useCommunity';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 썸네일 이미지를 마크다운 본문 중간에 삽입하는 함수.
// 삽입 위치 로직:
// 1) 본문에 ### 헤딩이 있으면 첫 번째 ### 바로 앞에 삽입 — 도입부가 끝나는 자연스러운 위치.
// 2) ### 헤딩이 없으면 두 번째 빈 줄(\n\n) 이후에 삽입 — 첫 단락 이후를 추정한 휴리스틱.
// 이유: 썸네일을 최상단에 두면 제목과 겹쳐 어색하고, 너무 아래 삽입하면 스크롤 후에야 보인다.
function injectImageIntoMarkdown(markdown: string, imageUrl: string): string {
  const h3Match = markdown.search(/\n###\s/);
  if (h3Match !== -1) {
    return markdown.slice(0, h3Match) + `\n\n![](${imageUrl})\n` + markdown.slice(h3Match);
  }
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

// Google Favicon API 사용 주의:
// https://www.google.com/s2/favicons?domain=... 는 구글이 공개한 비공식 API로
// 공식 문서가 없으며 언제든 서비스가 중단될 수 있다.
// 실패 시 onError 핸들러에서 이미지를 숨기므로 UX 에 직접적인 영향은 없지만,
// 장기적으로는 파비콘을 직접 프록시하거나 대체 서비스를 고려해야 한다.
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
          // Google Favicon API가 실패하거나 도메인에 파비콘이 없으면 이미지 자체를 숨김.
          // 부모 요소를 숨기지 않는 이유: 파비콘만 없을 뿐 출처 카드 자체는 유효하기 때문이다.
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

export default function ColumnDetailPage() {
  const { columnId } = useParams<{ columnId: string }>();
  const { data: column, isLoading } = useWhiskeyColumn(columnId ? Number(columnId) : undefined);

  if (isLoading) return <WireframePage><p className="wf-text-sm">불러오는 중…</p></WireframePage>;
  if (!column) return <WireframePage><p className="wf-text-sm">칼럼을 찾을 수 없습니다.</p></WireframePage>;

  const bodyMarkdown = column.description && column.thumbnailUrl
    ? injectImageIntoMarkdown(column.description, column.thumbnailUrl)
    : column.description ?? '';

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
            {column.sourceType === 'YOUTUBE' ? '유튜브' : '블로그'}
          </span>
          {column.whiskeyKeyword && (
            <span className="wf-chip" style={{ fontSize: 11 }}>{column.whiskeyKeyword}</span>
          )}
        </div>

        {/* 제목 */}
        <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.4, margin: '0 0 10px', color: 'var(--wf-text)' }}>
          {column.title}
        </h1>

        {/* 날짜 */}
        <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--wf-muted)' }}>
          {formatDate(column.publishedAt || column.createdAt)}
        </p>

        {/* 본문 마크다운 */}
        {bodyMarkdown && (
          <div style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--wf-text)' }}>
            <ReactMarkdown
              components={{
                // h1 → h2로 강등하는 이유: 페이지 제목이 이미 <h1>으로 렌더링되어 있으므로
                // 본문 내 # 헤딩을 그대로 h1으로 두면 SEO 및 접근성 상 h1이 중복된다.
                // 한 단계씩 내려서(h1→h2, h2→h3, h3→h4) 헤딩 계층 구조를 유지한다.
                h1: ({ children }) => <h2 style={{ fontSize: 20, fontWeight: 700, margin: '28px 0 10px', borderBottom: '1px solid var(--wf-border)', paddingBottom: 6, color: 'var(--wf-text)' }}>{children}</h2>,
                h2: ({ children }) => <h3 style={{ fontSize: 17, fontWeight: 700, margin: '22px 0 8px', color: 'var(--wf-text)' }}>{children}</h3>,
                h3: ({ children }) => <h4 style={{ fontSize: 15, fontWeight: 600, margin: '16px 0 6px', color: 'var(--wf-accent)' }}>{children}</h4>,
                p: ({ children }) => <p style={{ margin: '0 0 14px', color: 'var(--wf-text)' }}>{children}</p>,
                strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#fff' }}>{children}</strong>,
                em: ({ children }) => <em style={{ color: 'var(--wf-muted)' }}>{children}</em>,
                img: ({ src, alt }) => (
                  // img를 span으로 감싸는 이유: p 태그 안에 img가 있으면 HTML 유효성 오류가 발생한다.
                  // span으로 감싸 block-level처럼 보이게 하고 중앙 정렬을 유지한다.
                  // onError에서 img 자체가 아닌 부모 span을 숨기는 이유: img만 숨기면
                  // 빈 여백(margin)이 남아 레이아웃이 어색해지기 때문이다.
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
          <SourceCard url={column.url} sourceName={column.sourceName} author={column.author} />
        </div>
      </div>
    </WireframePage>
  );
}
