import { Link } from 'react-router-dom';
import type { CabinetSection } from '@/app/router/paths';

interface CabinetPrimaryTabsProps {
  section: CabinetSection;
  isOwner?: boolean;
  ownerLabel?: string;
  barHref: string;
  communityHref: string;
}

export function CabinetPrimaryTabs({ section, isOwner, ownerLabel, barHref, communityHref }: CabinetPrimaryTabsProps) {
  const prefix = isOwner ? '내 ' : (ownerLabel && ownerLabel !== '내' ? '' : ownerLabel ? '내 ' : '');

  return (
    <nav className="wf-lounge-tabs wf-cabinet-primary" aria-label="캐비넷 메뉴">
      <Link
        to={barHref}
        className={`wf-lounge-tab${section === 'bar' ? ' wf-lounge-tab--on' : ''}`}
      >
        {prefix}Bar
      </Link>
      <Link
        to={communityHref}
        className={`wf-lounge-tab${section === 'community' ? ' wf-lounge-tab--on' : ''}`}
      >
        {prefix}커뮤니티
      </Link>
    </nav>
  );
}
