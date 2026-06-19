import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { Button } from '@/shared/components/ui/Button';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';

interface CabinetProfileHeaderProps {
  name: string;
  profileImageUrl?: string | null;
  followers: number;
  following: number;
  /** 팔로워 링크 (지정 안 하면 followHref 사용) */
  followersHref?: string;
  /** 팔로잉 링크 (지정 안 하면 followHref 사용) */
  followingHref?: string;
  /** 팔로워·팔로잉 공통 링크 (legacy) */
  followHref?: string;
  showFollowButton?: boolean;
  isFollowing?: boolean;
  followBusy?: boolean;
  onFollowClick?: () => void;
  isOwner?: boolean;
}

export function CabinetProfileHeader({
  name,
  profileImageUrl,
  followers,
  following,
  followersHref,
  followingHref,
  followHref,
  showFollowButton,
  isFollowing,
  followBusy,
  onFollowClick,
  isOwner: _isOwner,
}: CabinetProfileHeaderProps) {
  const fallbackLink = followHref ?? PATHS.CABINET_FOLLOW;
  const followersLink = followersHref ?? fallbackLink;
  const followingLink = followingHref ?? fallbackLink;
  const avatarSrc = resolveMediaUrl(profileImageUrl);

  return (
    <header className="wf-cabinet-profile">
      <div className="wf-cabinet-profile__avatar wf-placeholder" aria-hidden>
        {avatarSrc ? (
          <img src={avatarSrc} alt="" />
        ) : null}
      </div>

      <div className="wf-cabinet-profile__info">
        <h1 className="wf-title wf-cabinet-profile__name">{name}</h1>
      </div>

      <div className="wf-cabinet-profile__stats">
        <div className="wf-cabinet-follow-stats">
          <Link to={followersLink} className="wf-cabinet-follow-stat">
            <span className="wf-cabinet-follow-stat__num">{followers}</span>
            <span className="wf-cabinet-follow-stat__label">팔로워</span>
          </Link>
          <Link to={followingLink} className="wf-cabinet-follow-stat">
            <span className="wf-cabinet-follow-stat__num">{following}</span>
            <span className="wf-cabinet-follow-stat__label">팔로잉</span>
          </Link>
        </div>
        {showFollowButton ? (
          <Button
            variant={isFollowing ? 'ghost' : 'primary'}
            className="wf-cabinet-follow-btn"
            onClick={onFollowClick}
            disabled={followBusy}
          >
            {isFollowing ? '팔로잉' : '팔로우'}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
