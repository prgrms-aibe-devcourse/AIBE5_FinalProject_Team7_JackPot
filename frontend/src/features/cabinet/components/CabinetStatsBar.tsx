interface CabinetStatsBarProps {
  pick: number;
  wish?: number;
  reviews: number;
  notes: number;
  /** 타인 캐비넷: 위시 숨김 */
  hideWish?: boolean;
}

export function CabinetStatsBar({ pick, wish, reviews, notes, hideWish }: CabinetStatsBarProps) {
  return (
    <div className="wf-cabinet-stats wf-box wf-box--solid">
      <span className="wf-cabinet-stats__pick">★ Pick {pick}</span>
      {!hideWish && wish !== undefined ? (
        <span className="wf-cabinet-stats__wish">♡ 위시 {wish}</span>
      ) : null}
      {hideWish ? (
        <span className="wf-cabinet-stats__hint">♡ 위시 — 본인만 (타인 열람 불가)</span>
      ) : null}
      <span className="wf-cabinet-stats__reviews">💬 리뷰 {reviews}</span>
      <span className="wf-cabinet-stats__notes">📝 Note {notes}</span>
    </div>
  );
}
