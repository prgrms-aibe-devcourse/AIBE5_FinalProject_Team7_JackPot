import { Link } from 'react-router-dom';
import { PATHS, type CabinetSection } from '@/app/router/paths';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';

interface CabinetProfileHeaderProps {
  name: string;
  profileImageUrl?: string | null;
  introduction?: string | null;
  followers: number;
  following: number;
  subtitle?: string;
  followersHref?: string;
  followingHref?: string;
  followHref?: string;
  showFollowButton?: boolean;
  isFollowing?: boolean;
  followBusy?: boolean;
  onFollowClick?: () => void;
  isOwner?: boolean;
  section?: CabinetSection;
  barHref?: string;
  communityHref?: string;
}

export function CabinetProfileHeader({
  name,
  profileImageUrl,
  introduction,
  followers,
  following,
  subtitle,
  followersHref,
  followingHref,
  followHref,
  showFollowButton,
  isFollowing,
  followBusy,
  onFollowClick,
  isOwner,
  section,
  barHref,
  communityHref,
}: CabinetProfileHeaderProps) {
  const fallbackLink = followHref ?? PATHS.CABINET_FOLLOW;
  const followersLink = followersHref ?? fallbackLink;
  const followingLink = followingHref ?? fallbackLink;
  const avatarSrc = resolveMediaUrl(profileImageUrl);
  const showSectionTabs = section != null && barHref != null && communityHref != null;
  const bio = introduction?.trim();

  return (
    <header className="wf-ig-profile">
      <div className="wf-ig-profile__main">
        <div className="wf-ig-profile__avatar-wrap">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="wf-ig-profile__avatar" />
          ) : (
            <div className="wf-ig-profile__avatar wf-placeholder" aria-hidden />
          )}
        </div>

        <div className="wf-ig-profile__info">
          <div className="wf-ig-profile__name-row">
            <h1 className="wf-ig-profile__username">{name}</h1>
            {isOwner ? (
              <Link to={PATHS.MY_PAGE} className="wf-ig-profile__settings" aria-label="프로필 편집">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm8.94-2.88a1 1 0 0 0-.24-1.09l-1.2-1.2a8.03 8.03 0 0 0 .18-1.75v-.16a8.03 8.03 0 0 0-.18-1.75l1.2-1.2a1 1 0 0 0 .24-1.09 1 1 0 0 0-.86-.51h-1.7a8.03 8.03 0 0 0-1.75-.18h-.16a8.03 8.03 0 0 0-1.75.18h-1.7a1 1 0 0 0-.86.51 1 1 0 0 0-.24 1.09l1.2 1.2a8.03 8.03 0 0 0-.18 1.75v.16c0 .6.06 1.18.18 1.75l-1.2 1.2a1 1 0 0 0-.24 1.09 1 1 0 0 0 .86.51h1.7c.55.07 1.14.13 1.75.18h.16c.6-.05 1.18-.11 1.75-.18h1.7a1 1 0 0 0 .86-.51 1 1 0 0 0 .24-1.09l-1.2-1.2c.12-.57.18-1.15.18-1.75v-.16c0-.6-.06-1.18-.18-1.75l1.2-1.2a1 1 0 0 0 .24-1.09Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : null}
          </div>

          {subtitle ? <p className="wf-ig-profile__display-name">{subtitle}</p> : null}

          <ul className="wf-ig-profile__stats" aria-label="프로필 통계">
            <li>
              <Link to={followersLink} className="wf-ig-profile__stat-link">
                <strong>{followers}</strong>
                <span>팔로워</span>
              </Link>
            </li>
            <li>
              <Link to={followingLink} className="wf-ig-profile__stat-link">
                <strong>{following}</strong>
                <span>팔로우</span>
              </Link>
            </li>
          </ul>

          {bio ? <p className="wf-ig-profile__bio">{bio}</p> : null}
        </div>
      </div>

      <div className={`wf-ig-profile__actions${showFollowButton ? ' wf-ig-profile__actions--with-follow' : ''}`}>
        {showFollowButton ? (
          <button
            type="button"
            className={`wf-ig-profile__btn wf-ig-profile__btn--follow${isFollowing ? ' wf-ig-profile__btn--follow-on' : ' wf-ig-profile__btn--follow-pending'}`}
            onClick={onFollowClick}
            disabled={followBusy}
          >
            {isFollowing ? (
              <>
                <span className="wf-ig-profile__follow-text">팔로잉</span>
                <span className="wf-ig-profile__follow-text wf-ig-profile__follow-text--hover">팔로우 취소</span>
              </>
            ) : (
              '팔로우'
            )}
          </button>
        ) : null}
        {showSectionTabs ? (
          <>
            <Link
              to={barHref}
              className={`wf-ig-profile__btn${section === 'bar' ? ' wf-ig-profile__btn--on' : ''}`}
            >
              {isOwner ? '내 Bar' : 'Bar'}
            </Link>
            <Link
              to={communityHref}
              className={`wf-ig-profile__btn${section === 'community' ? ' wf-ig-profile__btn--on' : ''}`}
            >
              {isOwner ? '내 커뮤니티' : '커뮤니티'}
            </Link>
          </>
        ) : null}
      </div>
    </header>
  );
}
