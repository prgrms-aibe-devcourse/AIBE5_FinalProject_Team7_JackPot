import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';

export function CabinetReviewFeedThumb({
  whiskeyId,
  whiskeyName,
  imageUrl,
}: {
  whiskeyId?: number;
  whiskeyName: string;
  imageUrl?: string | null;
}) {
  const [imgError, setImgError] = useState(false);
  const thumbSrc = resolveMediaUrl(imageUrl);

  const media = thumbSrc && !imgError ? (
    <img
      src={thumbSrc}
      alt=""
      className="wf-cabinet-feed__thumb"
      onError={() => setImgError(true)}
    />
  ) : (
    <div className="wf-cabinet-feed__thumb wf-placeholder" aria-hidden />
  );

  if (whiskeyId) {
    return (
      <Link
        to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(whiskeyId))}
        className="wf-cabinet-feed__thumb-wrap"
        aria-label={`${whiskeyName} 상세 보기`}
      >
        {media}
      </Link>
    );
  }

  return <div className="wf-cabinet-feed__thumb-wrap">{media}</div>;
}

export function CabinetFeedToolbar({ children }: { children: ReactNode }) {
  return <div className="wf-cabinet-feed-toolbar">{children}</div>;
}

export function CabinetFeedEmpty({
  title,
  meta,
  actionLabel,
  actionTo,
}: {
  title: string;
  meta?: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="wf-cabinet-empty">
      <p className="wf-cabinet-empty__title">{title}</p>
      {meta ? <p className="wf-cabinet-empty__meta">{meta}</p> : null}
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="wf-cabinet-empty__link">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function CabinetFeedLoading({ message }: { message: string }) {
  return <p className="wf-cabinet-feed-loading">{message}</p>;
}
