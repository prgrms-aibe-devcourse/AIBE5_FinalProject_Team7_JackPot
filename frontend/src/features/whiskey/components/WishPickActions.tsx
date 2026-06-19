interface WishPickActionsProps {
  isWished: boolean;
  isPicked: boolean;
  wishLoading: boolean;
  pickLoading: boolean;
  onWishToggle: () => void;
  onPickToggle: () => void;
}

function WishIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
      />
    </svg>
  );
}

function PickIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2l2.39 6.26L21 9.27l-5 4.87 1.18 6.88L12 17.77l-5.18 3.25L8 14.14 3 9.27l6.61-1.01L12 2z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WishPickActions({
  isWished,
  isPicked,
  wishLoading,
  pickLoading,
  onWishToggle,
  onPickToggle,
}: WishPickActionsProps) {
  return (
    <div className="wf-wishpick-stack" aria-label="위시리스트 및 My Pick">
      <div
        className={`wf-wishpick-stack__row wf-wishpick-stack__row--wish${isWished ? ' wf-wishpick-stack__row--on' : ''}`}
      >
        <span className="wf-wishpick-stack__icon wf-wishpick-stack__icon--wish" aria-hidden>
          <WishIcon filled={isWished} />
        </span>
        <div className="wf-wishpick-stack__copy">
          <strong>위시리스트</strong>
          <span>마시고 싶은 술</span>
        </div>
        <button
          type="button"
          className="wf-wishpick-stack__action"
          onClick={onWishToggle}
          disabled={wishLoading}
          aria-pressed={isWished}
        >
          {wishLoading ? '…' : isWished ? '저장됨' : '추가'}
        </button>
      </div>
      <div
        className={`wf-wishpick-stack__row wf-wishpick-stack__row--pick${isPicked ? ' wf-wishpick-stack__row--on' : ''}`}
      >
        <span className="wf-wishpick-stack__icon wf-wishpick-stack__icon--pick" aria-hidden>
          <PickIcon filled={isPicked} />
        </span>
        <div className="wf-wishpick-stack__copy">
          <strong>My Pick</strong>
          <span>추천하고 싶은 술</span>
        </div>
        <button
          type="button"
          className="wf-wishpick-stack__action"
          onClick={onPickToggle}
          disabled={pickLoading}
          aria-pressed={isPicked}
        >
          {pickLoading ? '…' : isPicked ? '저장됨' : '추가'}
        </button>
      </div>
    </div>
  );
}
