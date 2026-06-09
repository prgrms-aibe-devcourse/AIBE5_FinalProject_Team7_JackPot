import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import type { WhiskeyColumnResponse } from '../types';

interface ColumnListProps {
  columns: WhiskeyColumnResponse[];
  isLoading?: boolean;
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function ColumnList({ columns, isLoading }: ColumnListProps) {
  if (isLoading) return <p className="wf-text-sm">불러오는 중…</p>;
  if (columns.length === 0) return <p className="wf-text-sm">칼럼이 없습니다.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {columns.map((column) => (
        <li key={column.id}>
          <Link
            to={PATHS.COMMUNITY_COLUMN.replace(':columnId', String(column.id))}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="wf-box" style={{ padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* 썸네일 */}
              {column.thumbnailUrl && (
                <img
                  src={column.thumbnailUrl}
                  alt={column.title}
                  style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                  <span className="wf-chip" style={{ fontSize: 10 }}>
                    {column.sourceType === 'YOUTUBE' ? '유튜브' : '블로그'}
                  </span>
                  {column.sourceName && (
                    <span style={{ fontSize: 11, color: '#999' }}>{column.sourceName}</span>
                  )}
                </div>
                <strong style={{ fontSize: 14, lineHeight: 1.4, display: 'block', marginBottom: 4 }}>{column.title}</strong>
                {column.description && (
                  <p className="wf-text-xs" style={{
                    margin: '0 0 4px', color: '#666',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {column.description.replace(/#+\s|[*_`>]/g, '').slice(0, 120)}
                  </p>
                )}
                <p className="wf-text-xs" style={{ margin: 0, color: '#aaa' }}>
                  {column.author && <span>{column.author} · </span>}
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
