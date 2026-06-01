import { Link } from 'react-router-dom';

interface CabinetPickItemProps {
  id: string;
  name: string;
  meta: string;
  highlighted?: boolean;
  readonly?: boolean;
  onRemove?: () => void;  // 제거 버튼 클릭 핸들러
}

export function CabinetPickItem({ id, name, meta, highlighted, readonly, onRemove }: CabinetPickItemProps) {
  return (
    <article className={`wf-cabinet-pick wf-box${highlighted ? ' wf-box--accent' : ''}`}>
      <div className="wf-cabinet-pick__thumb wf-placeholder" />
      <div className="wf-cabinet-pick__body">
        <Link to={`/whiskey/${id}`} className="wf-cabinet-pick__title">
          {name}
        </Link>
        <p className="wf-text-sm">{meta}</p>
        <p className="wf-text-xs">클릭·상세보기 → 09</p>
      </div>
      {!readonly ? (
        <button
          type="button"
          className="wf-cabinet-pick__remove"
          onClick={onRemove}
          style={{ transition: 'background 0.15s, color 0.15s' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#ff4d4d';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '';
            (e.currentTarget as HTMLButtonElement).style.color = '';
          }}
        >
          제거
        </button>
      ) : (
        <p className="wf-text-xs wf-cabinet-pick__readonly">※ 제거·수정 불가 · 상세만 열람</p>
      )}
    </article>
  );
}
