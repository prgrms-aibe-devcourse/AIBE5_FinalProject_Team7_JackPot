import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/shared/components/ui/Button';

interface CabinetProfileHeaderProps {
  name: string;
  subtitle: string;
  followers: number;
  following: number;
  followHref?: string;
  showFollowButton?: boolean;
  isOwner?: boolean;
}

export function CabinetProfileHeader({
  name,
  subtitle,
  followers,
  following,
  followHref,
  showFollowButton,
  isOwner,
}: CabinetProfileHeaderProps) {
  const followLink = followHref ?? PATHS.CABINET_FOLLOW;

  return (
    <header className="wf-cabinet-profile">
      <div className="wf-cabinet-profile__avatar wf-placeholder" aria-hidden />
      <div className="wf-cabinet-profile__info">
        <h1 className="wf-title" style={{ fontSize: 28, margin: 0 }}>
          {name}
        </h1>
        <p className="wf-text-sm">{subtitle}</p>
      </div>
      <div className="wf-cabinet-profile__stats">
        {isOwner ? (
          <Link to={followLink} className="wf-link wf-text-sm">
            팔로워 {followers} · 팔로잉 {following}
          </Link>
        ) : (
          <>
            <p className="wf-text-sm">팔로워 {followers}</p>
            <Link to={followLink} className="wf-link wf-text-xs">
              팔로잉 {following}
            </Link>
          </>
        )}
        {showFollowButton ? (
          <Button style={{ marginTop: 8, height: 40, width: 96 }}>팔로우</Button>
        ) : null}
      </div>
    </header>
  );
}
