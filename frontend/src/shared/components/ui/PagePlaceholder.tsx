import type { RouteMeta } from '@/app/router/types';

interface PagePlaceholderProps extends RouteMeta {
  description?: string;
}

export function PagePlaceholder({
  screenId,
  title,
  phase,
  apiIds = [],
  description,
}: PagePlaceholderProps) {
  return (
    <article className="page-placeholder">
      <header>
        <p className="page-placeholder__screen-id">{screenId}</p>
        <h1>{title}</h1>
        <p className="page-placeholder__phase">Phase: {phase}</p>
      </header>
      {description ? <p>{description}</p> : null}
      {apiIds.length > 0 ? (
        <section>
          <h2>연동 API (v2 명세)</h2>
          <ul>
            {apiIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
