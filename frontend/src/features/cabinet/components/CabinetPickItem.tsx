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

  return (
    <article className={`wf-ig-grid-item${highlighted ? ' wf-ig-grid-item--accent' : ''}`}>
      <Link to={detailPath} className="wf-ig-grid-item__link" aria-label={`${name} 상세 보기`}>
        {thumbSrc && !imgError ? (
          <img
            src={thumbSrc}
            alt=""
            className="wf-ig-grid-item__img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="wf-ig-grid-item__img wf-placeholder" aria-hidden />
        )}
        <div className="wf-ig-grid-item__overlay">
          <strong className="wf-ig-grid-item__name">{name}</strong>
          {meta ? <span className="wf-ig-grid-item__meta">{meta}</span> : null}
        </div>
      </Link>
      {!readonly && onRemove ? (
        <button
          type="button"
          className="wf-ig-grid-item__remove"
          aria-label={`${name} 제거`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove();
          }}
        >
          제거
        </button>
      ) : null}
    </article>
  );
}
