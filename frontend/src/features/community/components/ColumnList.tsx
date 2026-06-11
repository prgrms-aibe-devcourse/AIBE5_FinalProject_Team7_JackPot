// 위스키 칼럼 목록을 카드 형식으로 렌더링하는 컴포넌트
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import type { WhiskeyColumnResponse } from '../types';

interface ColumnListProps {
  columns: WhiskeyColumnResponse[];
  isLoading?: boolean;
}

// iso.slice(0, 10)으로 날짜를 파싱하는 이유:
// publishedAt·createdAt은 서버에서 ISO 8601 형식(예: "2024-03-15T09:30:00")으로 내려온다.
// new Date(iso).toLocaleDateString()을 쓰면 브라우저 시간대에 따라 날짜가 하루 앞뒤로 밀릴 수 있다.
// 단순히 앞 10자(YYYY-MM-DD)만 잘라 쓰면 시간대 영향 없이 원본 날짜를 그대로 표시할 수 있다.
function formatDate(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function ColumnList({ columns, isLoading }: ColumnListProps) {
  if (isLoading) return <p className="wf-text-sm">불러오는 중…</p>;
  if (columns.length === 0) return <p className="wf-text-sm">칼럼이 없습니다.</p>;

  return (
    <ul className="wf-column-list">
      {columns.map((column) => (
        <li key={column.id}>
          <Link
            to={PATHS.COMMUNITY_COLUMN.replace(':columnId', String(column.id))}
            className="wf-column-list-link"
          >
            <div className="wf-box wf-column-list-item">
              {/* 썸네일 */}
              {column.thumbnailUrl && (
                <img
                  src={column.thumbnailUrl}
                  alt={column.title}
                  className="wf-column-list-thumb"
                  // 외부 이미지 URL이 만료되거나 접근 불가한 경우 깨진 이미지 아이콘 대신 숨김 처리
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="wf-column-list-body">
                <div className="wf-column-list-body__tags">
                  <span className="wf-chip wf-column-list-body__chip">
                    {column.sourceType === 'YOUTUBE' ? '유튜브' : '블로그'}
                  </span>
                  {column.sourceName && (
                    <span className="wf-column-list-body__source">{column.sourceName}</span>
                  )}
                </div>
                <strong className="wf-column-list-body__title">{column.title}</strong>
                {column.description && (
                  <p className="wf-text-xs wf-column-list-body__desc">
                    {/* 마크다운 기호를 제거하는 이유: description이 마크다운 원문이므로
                        목록 카드에서 #, *, _, `, > 같은 기호가 그대로 노출되면 가독성이 떨어진다.
                        ReactMarkdown을 쓰지 않고 단순 정규식으로 제거해 성능 부담을 최소화하고
                        앞 120자 미리보기 텍스트로만 사용한다. */}
                    {column.description.replace(/#+\s|[*_`>]/g, '').slice(0, 120)}
                  </p>
                )}
                <p className="wf-text-xs wf-column-list-body__meta">
                  {column.author && <span>{column.author} · </span>}
                  {/* publishedAt이 없으면 createdAt(수집일)으로 대체 표시 */}
                  {formatDate(column.publishedAt || column.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
