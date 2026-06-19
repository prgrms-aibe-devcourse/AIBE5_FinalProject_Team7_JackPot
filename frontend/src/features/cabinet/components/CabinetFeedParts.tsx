import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

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
