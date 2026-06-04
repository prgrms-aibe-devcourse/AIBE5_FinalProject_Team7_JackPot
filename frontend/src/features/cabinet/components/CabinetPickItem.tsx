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
  const detailPath = `/whiskey/${id}`;

  return (
    <article className={`wf-cabinet-pick wf-box${highlighted ? ' wf-box--accent' : ''}`}>

      {/* 이미지 — 클릭 시 상세 이동 */}
      <Link to={detailPath} style={{ flexShrink: 0, display: 'block' }}>
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={name}
            className="wf-cabinet-pick__thumb"
            style={{
              width: 64, height: 64,
              objectFit: 'cover', borderRadius: 8,
              transition: 'opacity 0.15s',
            }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
          />
        ) : (
          <div className="wf-cabinet-pick__thumb wf-placeholder" style={{ width: 64, height: 64, borderRadius: 8 }} />
        )}
      </Link>

      {/* 텍스트 영역 */}
      <div className="wf-cabinet-pick__body" style={{ flex: 1, minWidth: 0 }}>
        <Link to={detailPath} className="wf-cabinet-pick__title">
          {name}
        </Link>
        <p className="wf-text-sm">{meta}</p>
      </div>

      {/* 우측 액션 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* 상세보기 버튼 */}
        <Link
          to={detailPath}
          style={{
            padding: '6px 12px',
            border: '1px solid #2e2e38',
            borderRadius: 8,
            color: '#8b8b96',
            fontSize: 13,
            textDecoration: 'none',
            transition: 'border-color 0.15s, color 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#c9a227';
            e.currentTarget.style.color = '#c9a227';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#2e2e38';
            e.currentTarget.style.color = '#8b8b96';
          }}
        >
          상세보기
        </Link>

        {/* 제거 버튼 (본인만) */}
        {!readonly && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              padding: '6px 12px',
              border: '1px solid #2e2e38',
              borderRadius: 8,
              background: 'none',
              color: '#8b8b96',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s, background 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f87171';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2e2e38';
              e.currentTarget.style.color = '#8b8b96';
            }}
          >
            제거
          </button>
        )}
      </div>
    </article>
  );
}
