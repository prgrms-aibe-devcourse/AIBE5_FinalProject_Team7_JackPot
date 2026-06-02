import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/shared/components/ui/Button';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';

interface CabinetProfileHeaderProps {
  name: string;
  subtitle: string;
  profileImageUrl?: string | null;
  followers: number;
  following: number;
  followHref?: string;
  showFollowButton?: boolean;
  isOwner?: boolean;
}

export function CabinetProfileHeader({
  name,
  subtitle,
  profileImageUrl,
  followers,
  following,
  followHref,
  showFollowButton,
  isOwner,
}: CabinetProfileHeaderProps) {
  const followLink = followHref ?? PATHS.CABINET_FOLLOW;
  const avatarSrc = resolveMediaUrl(profileImageUrl);

  return (
    <header className="wf-cabinet-profile">
      <div className="wf-cabinet-profile__avatar wf-placeholder" aria-hidden>
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : null}
      </div>
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
