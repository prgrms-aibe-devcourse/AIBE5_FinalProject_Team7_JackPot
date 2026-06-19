import { Link } from 'react-router-dom';
import type { CabinetTab } from '@/app/router/paths';

interface CabinetStatsBarProps {
  pick: number;
  wish?: number;
  reviews: number;
  notes: number;
  /** 타인 캐비넷: 위시 숨김 */
  hideWish?: boolean;
  /** 현재 선택된 탭 — 전달하면 통계 항목이 탭 역할을 겸함 */
  active?: CabinetTab;
  /** 탭 이동 기준 경로 (예: `${PATHS.CABINET}?section=bar`) — active와 함께 전달 */
  basePath?: string;
}

export function CabinetStatsBar({ pick, wish, reviews, notes, hideWish, active, basePath }: CabinetStatsBarProps) {
  const clickable = active != null && basePath != null;
  const separator = basePath?.includes('?') ? '&' : '?';

  const items: { key: CabinetTab; label: string; value: number; modifier?: string }[] = [
    { key: 'pick', label: 'Pick', value: pick, modifier: 'pick' },
    ...(!hideWish && wish !== undefined ? [{ key: 'wish' as const, label: '위시', value: wish, modifier: 'wish' }] : []),
    { key: 'reviews', label: '리뷰', value: reviews },
    { key: 'note', label: 'Note', value: notes },
  ];

  return (
    <div className="wf-cabinet-stats">
      {items.map(({ key, label, value, modifier }) => {
        const itemClass = `wf-cabinet-stats__item${modifier ? ` wf-cabinet-stats__item--${modifier}` : ''}${clickable ? ' wf-cabinet-stats__item--clickable' : ''}${active === key ? ' wf-cabinet-stats__item--on' : ''}`;
        const content = (
          <>
            <span className="wf-cabinet-stats__num">{value}</span>
            <span className="wf-cabinet-stats__label">{label}</span>
          </>
        );

        return clickable ? (
          <Link key={key} to={`${basePath}${separator}tab=${key}`} className={itemClass}>
            {content}
          </Link>
        ) : (
          <div key={key} className={itemClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
