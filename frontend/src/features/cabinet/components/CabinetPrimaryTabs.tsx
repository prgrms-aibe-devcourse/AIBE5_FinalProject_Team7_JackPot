import { Link } from 'react-router-dom';
import type { CabinetSection } from '@/app/router/paths';

interface CabinetPrimaryTabsProps {
  section: CabinetSection;
  ownerLabel?: string;
  barHref: string;
  communityHref: string;
}

export function CabinetPrimaryTabs({ section, ownerLabel = '내', barHref, communityHref }: CabinetPrimaryTabsProps) {
  return (
    <nav className="wf-cabinet-primary" aria-label="캐비넷 메뉴">
      <Link
        to={barHref}
        className={`wf-cabinet-primary__tab${section === 'bar' ? ' wf-cabinet-primary__tab--on' : ''}`}
      >
        {ownerLabel} Bar
      </Link>
      <Link
        to={communityHref}
        className={`wf-cabinet-primary__tab${section === 'community' ? ' wf-cabinet-primary__tab--on' : ''}`}
      >
        {ownerLabel} 커뮤니티
      </Link>
    </nav>
  );
}
