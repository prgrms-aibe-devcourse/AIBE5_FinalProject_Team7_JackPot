import { Link } from 'react-router-dom';

interface CabinetPickItemProps {
  id: string;
  name: string;
  meta: string;
  highlighted?: boolean;
  readonly?: boolean;
}

export function CabinetPickItem({ id, name, meta, highlighted, readonly }: CabinetPickItemProps) {
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
        <button type="button" className="wf-cabinet-pick__remove">
          제거
        </button>
      ) : (
        <p className="wf-text-xs wf-cabinet-pick__readonly">※ 제거·수정 불가 · 상세만 열람</p>
      )}
    </article>
  );
}
