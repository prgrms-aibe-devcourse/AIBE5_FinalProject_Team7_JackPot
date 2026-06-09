import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PATHS } from '@/app/router/paths';
import { cabinetApi, type FollowUser } from '@/features/cabinet/api/cabinetApi';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';

type FollowTab = 'followers' | 'followings';

function parseTab(value: string | null): FollowTab {
  return value === 'followings' ? 'followings' : 'followers';
}

function FollowUserRow({ user, label }: { user: FollowUser; label: string }) {
  const avatarSrc = resolveMediaUrl(user.profileImageUrl);

  return (
    <Link
      to={PATHS.USER_PROFILE.replace(':userId', String(user.userId))}
      className="wf-box wf-cabinet-follow"
      style={{ padding: 16, marginTop: 12, textDecoration: 'none' }}
    >
      <div className="wf-topnav__avatar wf-placeholder" style={{ width: 48, height: 48, overflow: 'hidden' }}>
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : null}
      </div>
      <div>
        <strong>{user.nickname}</strong>
        <p className="wf-text-sm">{label}</p>
      </div>
    </Link>
  );
}

/** svg/pages/12-cabinet-follow.svg */
export default function CabinetFollowPage() {
  const [params, setParams] = useSearchParams();
  const tab = parseTab(params.get('tab'));

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

  const users = tab === 'followers' ? followersQuery.data : followingsQuery.data;
  const isLoading = tab === 'followers' ? followersQuery.isLoading : followingsQuery.isLoading;
  const isError = tab === 'followers' ? followersQuery.isError : followingsQuery.isError;

  const setTab = (nextTab: FollowTab) => {
    setParams({ tab: nextTab });
  };

  return (
    <WireframePage scroll>
      <h1 className="wf-title">팔로우</h1>
      <div className="wf-cabinet-sub" role="tablist" aria-label="팔로우 목록">
        <button
          type="button"
          className={`wf-cabinet-sub__tab${tab === 'followers' ? ' wf-cabinet-sub__tab--on' : ''}`}
          onClick={() => setTab('followers')}
        >
          팔로워
        </button>
        <button
          type="button"
          className={`wf-cabinet-sub__tab${tab === 'followings' ? ' wf-cabinet-sub__tab--on' : ''}`}
          onClick={() => setTab('followings')}
        >
          팔로잉
        </button>
      </div>

      {isLoading ? (
        <p className="wf-text-sm">목록을 불러오는 중입니다.</p>
      ) : isError ? (
        <p className="wf-text-sm">목록을 불러오지 못했습니다.</p>
      ) : users?.length ? (
        users.map((user) => (
          <FollowUserRow
            key={user.userId}
            user={user}
            label={tab === 'followers' ? '나를 팔로우합니다' : '내가 팔로우합니다'}
          />
        ))
      ) : (
        <p className="wf-text-sm">
          {tab === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로잉한 사용자가 없습니다.'}
        </p>
      )}
    </WireframePage>
  );
}
