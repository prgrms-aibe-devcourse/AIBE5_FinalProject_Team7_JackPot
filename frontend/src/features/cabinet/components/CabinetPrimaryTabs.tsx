import { Link } from 'react-router-dom';
import type { CabinetSection } from '@/app/router/paths';

interface CabinetPrimaryTabsProps {
  section: CabinetSection;
  /** 본인 캐비넷일 때만 '내 Bar' / '내 커뮤니티'로 표시, 타인은 생략 */
  isOwner?: boolean;
  /** @deprecated ownerLabel 대신 isOwner 사용 */
  ownerLabel?: string;
  barHref: string;
  communityHref: string;
}

export function CabinetPrimaryTabs({ section, isOwner, ownerLabel, barHref, communityHref }: CabinetPrimaryTabsProps) {
  // isOwner가 명시된 경우 우선, 아니면 ownerLabel 레거시 처리
  const prefix = isOwner ? '내 ' : (ownerLabel && ownerLabel !== '내' ? '' : ownerLabel ? '내 ' : '');

  return (
    <nav className="wf-cabinet-primary" aria-label="캐비넷 메뉴">
      <Link
        to={barHref}
        className={`wf-cabinet-primary__tab${section === 'bar' ? ' wf-cabinet-primary__tab--on' : ''}`}
      >
        {prefix}Bar
      </Link>
      <Link
        to={communityHref}
        className={`wf-cabinet-primary__tab${section === 'community' ? ' wf-cabinet-primary__tab--on' : ''}`}
      >
        {prefix}커뮤니티
      </Link>
    </nav>
  );
}
