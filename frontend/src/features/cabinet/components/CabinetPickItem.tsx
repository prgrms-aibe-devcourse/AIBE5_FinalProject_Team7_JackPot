import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';

interface CabinetPickItemProps {
  id: string;
  name: string;
  meta: string;
  imageUrl?: string | null;
  highlighted?: boolean;
  readonly?: boolean;
  onRemove?: () => void;
}

export function CabinetPickItem({ id, name, meta, imageUrl, highlighted, readonly, onRemove }: CabinetPickItemProps) {
  const thumbSrc = resolveMediaUrl(imageUrl);
  const [imgError, setImgError] = useState(false);
  const detailPath = `/whiskey/${id}`;
  const [type, abv] = meta.split(' · ');

  return (
    <article className={`wf-cabinet-pick-card${highlighted ? ' wf-cabinet-pick-card--accent' : ''}`}>

      {/* 이미지 */}
      <Link to={detailPath} className="wf-cabinet-pick-card__thumb-link">
        {thumbSrc && !imgError ? (
          <img
            src={thumbSrc}
            alt={name}
            className="wf-cabinet-pick-card__thumb"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="wf-cabinet-pick-card__thumb wf-placeholder" />
        )}
      </Link>

      {/* 텍스트 영역 */}
      <div className="wf-cabinet-pick-card__body">
        <Link to={detailPath} className="wf-cabinet-pick-card__title">
          {name}
        </Link>
        <div className="wf-cabinet-pick-card__badges">
          {type && <span className="wf-cabinet-pick-card__badge wf-cabinet-pick-card__badge--type">{type}</span>}
          {abv  && <span className="wf-cabinet-pick-card__badge wf-cabinet-pick-card__badge--abv">🌡 {abv}</span>}
        </div>
      </div>

      {/* 액션 */}
      <div className="wf-cabinet-pick-card__footer">
        <Link to={detailPath} className="wf-cabinet-pick-card__detail-btn">
          상세보기
        </Link>
        {!readonly && onRemove && (
          <button
            type="button"
            className="wf-cabinet-pick-card__remove-btn"
            onClick={onRemove}
          >
            제거
          </button>
        )}
      </div>
    </article>
  );
}
