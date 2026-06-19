import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PATHS } from '@/app/router/paths';

function getCurrentUserId(): number | null {
  const value = localStorage.getItem('userId');
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}
import { cabinetApi, type FollowUser } from '@/features/cabinet/api/cabinetApi';
import { CabinetPagination } from '@/features/cabinet/components/CabinetPagination';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import '@/features/cabinet/cabinet.css';

const FOLLOW_PAGE_SIZE = 15;

type FollowTab = 'followers' | 'followings';

function parseTab(value: string | null): FollowTab {
  return value === 'followings' ? 'followings' : 'followers';
}

function FollowUserRow({ user, label }: { user: FollowUser; label: string }) {
  const avatarSrc = resolveMediaUrl(user.profileImageUrl);
  const currentUserId = getCurrentUserId();
  const isSelf = currentUserId != null && currentUserId === user.userId;
  const href = isSelf ? PATHS.CABINET : PATHS.USER_PROFILE.replace(':userId', String(user.userId));

  return (
    <Link
      to={href}
      className="wf-follow-user-card"
    >
      <div className="wf-follow-user-card__avatar wf-placeholder">
        {avatarSrc ? <img src={avatarSrc} alt={user.nickname} /> : null}
      </div>
      <div className="wf-follow-user-card__info">
        <strong className="wf-follow-user-card__name">{user.nickname}</strong>
        <span className="wf-follow-user-card__label">{label}</span>
      </div>
      <span className="wf-follow-user-card__arrow">›</span>
    </Link>
  );
}

/** svg/pages/12-cabinet-follow.svg */
export default function CabinetFollowPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = parseTab(params.get('tab'));
  const [page, setPage] = useState(0);

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

  const totalPages = Math.max(1, Math.ceil((allUsers?.length ?? 0) / FOLLOW_PAGE_SIZE));
  const pagedUsers = allUsers?.slice(page * FOLLOW_PAGE_SIZE, (page + 1) * FOLLOW_PAGE_SIZE) ?? [];

  const setTab = (nextTab: FollowTab) => {
    setParams({ tab: nextTab });
    setPage(0);
  };

  return (
    <WireframePage scroll>
      {/* 헤더 */}
      <div className="wf-follow-page-header">
        <button
          type="button"
          className="wf-follow-back-btn"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          ← 뒤로
        </button>
        <h1 className="wf-follow-page-title">팔로우</h1>
      </div>

      {/* 탭 */}
      <div className="wf-follow-tabs" role="tablist" aria-label="팔로우 목록">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'followers'}
          className={`wf-follow-tab${tab === 'followers' ? ' wf-follow-tab--on' : ''}`}
          onClick={() => setTab('followers')}
        >
          팔로워
          {followersQuery.data && (
            <span className="wf-follow-tab__count">{followersQuery.data.length}</span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'followings'}
          className={`wf-follow-tab${tab === 'followings' ? ' wf-follow-tab--on' : ''}`}
          onClick={() => setTab('followings')}
        >
          팔로잉
          {followingsQuery.data && (
            <span className="wf-follow-tab__count">{followingsQuery.data.length}</span>
          )}
        </button>
      </div>

      {/* 리스트 */}
      <div className="wf-follow-list">
        {isLoading ? (
          <p className="wf-text-sm" style={{ padding: '20px 0' }}>목록을 불러오는 중입니다.</p>
        ) : isError ? (
          <p className="wf-text-sm" style={{ padding: '20px 0' }}>목록을 불러오지 못했습니다.</p>
        ) : pagedUsers.length ? (
          pagedUsers.map((user) => (
            <FollowUserRow
              key={user.userId}
              user={user}
              label={tab === 'followers' ? '나를 팔로우합니다' : '내가 팔로우합니다'}
            />
          ))
        ) : (
          <p className="wf-text-sm" style={{ padding: '20px 0' }}>
            {tab === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로잉한 사용자가 없습니다.'}
          </p>
        )}
      </div>

      <CabinetPagination
        page={page}
        totalPages={totalPages}
        onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        disabled={isLoading}
      />
    </WireframePage>
  );
}
