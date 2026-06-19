import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PATHS, type CabinetSection } from '@/app/router/paths';
import { cabinetApi, type FollowUser } from '@/features/cabinet/api/cabinetApi';
import { CabinetPagination } from '@/features/cabinet/components/CabinetPagination';
import { CabinetProfileHeader } from '@/features/cabinet/components/CabinetProfileHeader';
import { CabinetFeedEmpty, CabinetFeedLoading } from '@/features/cabinet/components/CabinetFeedParts';
import { userApi } from '@/features/my-page/api/userApi';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PROFILE_UPDATED_EVENT } from '@/shared/components/layout/TopNav';
import { resolveProfileImageUrl } from '@/shared/lib/mediaUrl';
import '@/features/cabinet/cabinet.css';

const FOLLOW_PAGE_SIZE = 15;

type FollowTab = 'followers' | 'followings';

function parseTab(value: string | null): FollowTab {
  return value === 'followings' ? 'followings' : 'followers';
}

function getCurrentUserId(): number | null {
  const value = localStorage.getItem('userId');
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function getCurrentNickname(): string {
  return localStorage.getItem('nickname') || '';
}

function getCurrentProfileImageUrl(): string | null {
  const value = localStorage.getItem('profileImageUrl') || '';
  return value.trim() ? value : null;
}

function getCurrentIntroduction(): string {
  return localStorage.getItem('profileIntroduction') || '';
}

function FollowUserRow({ user }: { user: FollowUser }) {
  const avatarSrc = resolveProfileImageUrl(user.profileImageUrl, user.userId);
  const currentUserId = getCurrentUserId();
  const isSelf = currentUserId != null && currentUserId === user.userId;
  const href = isSelf ? PATHS.CABINET : PATHS.USER_PROFILE.replace(':userId', String(user.userId));

  return (
    <li>
      <Link to={href} className="wf-cabinet-follow-row">
        <div className="wf-cabinet-follow-row__avatar">
          <img src={avatarSrc} alt="" />
        </div>
        <span className="wf-cabinet-follow-row__name">{user.nickname}</span>
        <span className="wf-cabinet-follow-row__chevron" aria-hidden>
          ›
        </span>
      </Link>
    </li>
  );
}

/** svg/pages/12-cabinet-follow.svg */
export default function CabinetFollowPage() {
  const [params, setParams] = useSearchParams();
  const tab = parseTab(params.get('tab'));
  const [page, setPage] = useState(0);
  const currentUserId = getCurrentUserId();
  const currentNickname = getCurrentNickname();
  const currentProfileImageUrl = getCurrentProfileImageUrl();
  const [currentIntroduction, setCurrentIntroduction] = useState(getCurrentIntroduction);

  const section: CabinetSection = 'bar';
  const barHref = `${PATHS.CABINET}?section=bar&tab=pick`;
  const communityHref = `${PATHS.CABINET}?section=community`;

  useEffect(() => {
    const refreshProfile = () => setCurrentIntroduction(getCurrentIntroduction());
    window.addEventListener(PROFILE_UPDATED_EVENT, refreshProfile);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, refreshProfile);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    userApi
      .getMe()
      .then((data) => {
        if (data.introduction !== undefined) {
          const intro = data.introduction ?? '';
          localStorage.setItem('profileIntroduction', intro);
          setCurrentIntroduction(intro);
        }
      })
      .catch(() => {});
  }, [currentUserId]);

  const { data: followerCount } = useQuery({
    queryKey: ['follows', 'followers', currentUserId],
    queryFn: () => cabinetApi.getFollowerCount(),
    enabled: currentUserId != null,
    staleTime: 30_000,
  });

  const { data: followingCount } = useQuery({
    queryKey: ['follows', 'followings', currentUserId],
    queryFn: () => cabinetApi.getFollowingCount(),
    enabled: currentUserId != null,
    staleTime: 30_000,
  });

  const followersQuery = useQuery({
    queryKey: ['follows', 'followers', 'list'],
    queryFn: () => cabinetApi.getFollowers(),
    enabled: tab === 'followers',
  });

  const followingsQuery = useQuery({
    queryKey: ['follows', 'followings', 'list'],
    queryFn: () => cabinetApi.getFollowings(),
    enabled: tab === 'followings',
  });

  const allUsers = tab === 'followers' ? followersQuery.data : followingsQuery.data;
  const isLoading = tab === 'followers' ? followersQuery.isLoading : followingsQuery.isLoading;
  const isError = tab === 'followers' ? followersQuery.isError : followingsQuery.isError;
  const followerTotal = followersQuery.data?.length ?? followerCount?.count ?? 0;
  const followingTotal = followingsQuery.data?.length ?? followingCount?.count ?? 0;

  const totalPages = Math.max(1, Math.ceil((allUsers?.length ?? 0) / FOLLOW_PAGE_SIZE));
  const pagedUsers = allUsers?.slice(page * FOLLOW_PAGE_SIZE, (page + 1) * FOLLOW_PAGE_SIZE) ?? [];

  const setTab = (nextTab: FollowTab) => {
    setParams({ tab: nextTab });
    setPage(0);
  };

  return (
    <WireframePage scroll>
      <div className="wf-cabinet-page">
        <CabinetProfileHeader
          name={currentNickname || '내 캐비넷'}
          subtitle={currentNickname ? '내 캐비넷' : undefined}
          profileImageUrl={currentProfileImageUrl}
          introduction={currentIntroduction}
          followers={followerCount?.count ?? 0}
          following={followingCount?.count ?? 0}
          followersHref={`${PATHS.CABINET_FOLLOW}?tab=followers`}
          followingHref={`${PATHS.CABINET_FOLLOW}?tab=followings`}
          avatarSeed={currentUserId ?? currentNickname}
          isOwner
          section={section}
          barHref={barHref}
          communityHref={communityHref}
        />

        <div className="wf-cabinet-body">
          <nav className="wf-ig-tabs" role="tablist" aria-label="팔로우 목록">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'followers'}
              className={`wf-ig-tabs__item${tab === 'followers' ? ' wf-ig-tabs__item--on' : ''}`}
              onClick={() => setTab('followers')}
            >
              팔로워 {followerTotal}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'followings'}
              className={`wf-ig-tabs__item${tab === 'followings' ? ' wf-ig-tabs__item--on' : ''}`}
              onClick={() => setTab('followings')}
            >
              팔로우 {followingTotal}
            </button>
          </nav>

          <section className="wf-cabinet-panel wf-cabinet-panel--feed">
            {isLoading ? (
              <CabinetFeedLoading message="목록을 불러오는 중입니다." />
            ) : isError ? (
              <CabinetFeedEmpty title="목록을 불러오지 못했습니다." />
            ) : pagedUsers.length ? (
              <ul className="wf-cabinet-follow-list">
                {pagedUsers.map((user) => (
                  <FollowUserRow key={user.userId} user={user} />
                ))}
              </ul>
            ) : (
              <CabinetFeedEmpty
                title={tab === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로우한 사용자가 없습니다.'}
                meta="위스키를 즐기는 다른 사용자를 찾아보세요."
                actionLabel="라운지 가기"
                actionTo={PATHS.LOUNGE}
              />
            )}

            <CabinetPagination
              page={page}
              totalPages={totalPages}
              onPage={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={isLoading}
            />
          </section>
        </div>
      </div>
    </WireframePage>
  );
}
