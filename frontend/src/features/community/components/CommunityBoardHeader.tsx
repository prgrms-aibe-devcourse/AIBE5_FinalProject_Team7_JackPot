import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CommunityBoardHeaderProps {
  title: string;
  writeTo?: string;
  filters?: ReactNode;
}

/** 커뮤니티 게시판 목록 상단 — 제목·글쓰기·필터 영역 높이를 탭마다 동일하게 유지 */
export function CommunityBoardHeader({ title, writeTo, filters }: CommunityBoardHeaderProps) {
  const hasFilters = filters != null && (Array.isArray(filters) ? filters.length > 0 : true);

  return (
    <header className="wf-community-board-header">
      <div className="wf-community-board-header__row">
        <h1 className="wf-title wf-community-page-title">{title}</h1>
        <div className="wf-community-board-header__actions">
          {writeTo ? (
            <Link to={writeTo} className="wf-chip wf-community-write-btn">
              + 글쓰기
            </Link>
          ) : (
            <span
              className="wf-chip wf-community-write-btn wf-community-board-header__placeholder"
              aria-hidden="true"
            >
              + 글쓰기
            </span>
          )}
        </div>
      </div>
      <div className="wf-community-board-header__filters">
        {hasFilters ? filters : (
          <span
            className="wf-chip wf-community-filter-btn wf-community-board-header__placeholder"
            aria-hidden="true"
          >
            전체
          </span>
        )}
      </div>
    </header>
  );
}
