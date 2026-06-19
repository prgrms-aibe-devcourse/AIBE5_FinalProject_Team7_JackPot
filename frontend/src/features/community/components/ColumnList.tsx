// 위스키 칼럼 목록을 카드 형식으로 렌더링하는 컴포넌트
import { useState } from 'react';
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
        <ColumnListItem key={column.id} column={column} />
      ))}
    </ul>
  );
}

function ColumnListItem({ column }: { column: WhiskeyColumnResponse }) {
  const [imgError, setImgError] = useState(false);
  const showThumb = Boolean(column.thumbnailUrl) && !imgError;

  return (
    <li>
      <Link
        to={PATHS.COMMUNITY_COLUMN.replace(':columnId', String(column.id))}
        className="wf-column-list-link"
      >
        <div className="wf-box wf-column-list-item">
          <div className="wf-column-list-thumb-wrap" aria-hidden={!showThumb}>
            {showThumb ? (
              <img
                src={column.thumbnailUrl!}
                alt=""
                className="wf-column-list-thumb"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="wf-column-list-thumb wf-column-list-thumb--placeholder" />
            )}
          </div>
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
            <p className="wf-text-xs wf-column-list-body__desc">
              {column.description
                ? column.description.replace(/#+\s|[*_`>]/g, '').slice(0, 120)
                : '\u00A0'}
            </p>
            <p className="wf-text-xs wf-column-list-body__meta">
              {column.author && <span>{column.author} · </span>}
              {formatDate(column.publishedAt || column.createdAt)}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
