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
    <article className={`wf-cabinet-pick wf-box${highlighted ? ' wf-box--accent' : ''}`}>

      {/* 이미지 — 클릭 시 상세 이동 */}
      <Link to={detailPath} className="wf-cabinet-pick__thumb-link">
        {thumbSrc && !imgError ? (
          <img
            src={thumbSrc}
            alt={name}
            className="wf-cabinet-pick__thumb"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="wf-cabinet-pick__thumb wf-placeholder" />
        )}
      </Link>

      {/* 텍스트 영역 */}
      <div className="wf-cabinet-pick__body">
        <Link to={detailPath} className="wf-cabinet-pick__title">
          {name}
        </Link>
        <p className="wf-text-sm">{meta}</p>
      </div>

      {/* 우측 액션 영역 */}
      <div className="wf-cabinet-pick__actions">
        {/* 상세보기 버튼 */}
        <Link to={detailPath} className="wf-cabinet-pick__detail-btn">
          상세보기
        </Link>

        {/* 제거 버튼 (본인만) */}
        {!readonly && onRemove && (
          <button
            type="button"
            className="wf-cabinet-pick__remove-btn"
            onClick={onRemove}
          >
            제거
          </button>
        )}
      </div>
    </article>
  );
}
