import type { ReactNode } from 'react';

interface WireframePageProps {
  children: ReactNode;
  scroll?: boolean;
}

export function WireframePage({ children, scroll }: WireframePageProps) {
  return (
    <div className={`wf-page__inner${scroll ? ' wf-page__inner--scroll' : ''}`}>{children}</div>
  );
}
