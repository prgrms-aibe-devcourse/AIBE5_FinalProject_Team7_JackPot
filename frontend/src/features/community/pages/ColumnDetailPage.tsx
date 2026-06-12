// 위스키 칼럼 상세 페이지 — 마크다운 본문 렌더링 및 출처 카드 표시
import '../community.css';
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
    <a href={url} target="_blank" rel="noopener noreferrer" className="wf-source-card-link">
      <div className="wf-box wf-source-card">
        <img
          src={favicon}
          alt={domain}
          width={24}
          height={24}
          className="wf-source-card__favicon"
          // Google Favicon API가 실패하거나 도메인에 파비콘이 없으면 이미지 자체를 숨김.
          // 부모 요소를 숨기지 않는 이유: 파비콘만 없을 뿐 출처 카드 자체는 유효하기 때문이다.
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="wf-source-card__body">
          <p className="wf-source-card__name">{sourceName || domain}</p>
          {author && <p className="wf-source-card__author">by {author}</p>}
        </div>
        <span className="wf-source-card__cta">원문 읽기 →</span>
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
      <nav className="wf-community-nav">
        <Link to={PATHS.COMMUNITY} className="wf-chip">커뮤니티 홈</Link>
        <Link to={PATHS.COMMUNITY_COLUMNS} className="wf-chip">칼럼</Link>
      </nav>

      <div className="wf-box wf-column-detail">
        {/* 배지 */}
        <div className="wf-column-detail__badges">
          <span className="wf-chip wf-chip--sm">
            {column.sourceType === 'YOUTUBE' ? '유튜브' : '블로그'}
          </span>
          {column.whiskeyKeyword && (
            <span className="wf-chip wf-chip--sm">{column.whiskeyKeyword}</span>
          )}
        </div>

        {/* 제목 */}
        <h1 className="wf-column-detail__title">{column.title}</h1>

        {/* 날짜 */}
        <p className="wf-column-detail__date">
          {formatDate(column.publishedAt || column.createdAt)}
        </p>

        {/* 본문 마크다운 */}
        {bodyMarkdown && (
          <div className="wf-markdown-body">
            <ReactMarkdown
              components={{
                // h1 → h2로 강등하는 이유: 페이지 제목이 이미 <h1>으로 렌더링되어 있으므로
                // 본문 내 # 헤딩을 그대로 h1으로 두면 SEO 및 접근성 상 h1이 중복된다.
                // 한 단계씩 내려서(h1→h2, h2→h3, h3→h4) 헤딩 계층 구조를 유지한다.
                h1: ({ children }) => <h2>{children}</h2>,
                h2: ({ children }) => <h3>{children}</h3>,
                h3: ({ children }) => <h4>{children}</h4>,
                img: ({ src, alt }) => (
                  // img를 span으로 감싸는 이유: p 태그 안에 img가 있으면 HTML 유효성 오류가 발생한다.
                  // onError에서 img 자체가 아닌 부모 span을 숨기는 이유: img만 숨기면
                  // 빈 여백(margin)이 남아 레이아웃이 어색해지기 때문이다.
                  <span className="wf-markdown-img-wrap">
                    <img
                      src={src}
                      alt={alt}
                      onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                    />
                  </span>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                ),
              }}
            >
              {bodyMarkdown}
            </ReactMarkdown>
          </div>
        )}

        {/* 출처 임베드 카드 */}
        <div className="wf-column-detail__source">
          <p className="wf-column-detail__source-label">출처</p>
          <SourceCard url={column.url} sourceName={column.sourceName} author={column.author} />
        </div>
      </div>
    </WireframePage>
  );
}
