import { Link } from 'react-router-dom';
import { PATHS, type CabinetSection } from '@/app/router/paths';
import { resolveProfileImageUrl } from '@/shared/lib/mediaUrl';

interface CabinetProfileHeaderProps {
  name: string;
  profileImageUrl?: string | null;
  avatarSeed?: string | number | null;
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
  avatarSeed,
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
  const avatarSrc = resolveProfileImageUrl(profileImageUrl, avatarSeed ?? name);
  const showSectionTabs = section != null && barHref != null && communityHref != null;
  const bio = introduction?.trim();

  return (
    <header className="wf-ig-profile">
      <div className="wf-ig-profile__main">
        <div className="wf-ig-profile__avatar-wrap">
          <img src={avatarSrc} alt="" className="wf-ig-profile__avatar" />
        </div>

        <div className="wf-ig-profile__info">
          <div className="wf-ig-profile__name-row">
            <h1 className="wf-ig-profile__username">{name}</h1>
            {isOwner ? (
              <Link to={PATHS.MY_PAGE} className="wf-ig-profile__settings" aria-label="프로필 편집">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
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
