import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { authApi } from '@/features/auth/api/authApi';
import { clearAuthSession } from '@/shared/lib/authSession';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';

/** MyPage 등에서 프로필 저장 후 TopNav 아바타 갱신용 */
export const PROFILE_UPDATED_EVENT = 'whiskeynote:profile-updated';

const NAV = [
  { to: PATHS.LOUNGE, label: '라운지' },
  { to: PATHS.SEARCH, label: '검색' },
  { to: PATHS.COMMUNITY, label: '커뮤니티' },
  { to: PATHS.CABINET, label: '캐비넷' },
  { to: PATHS.SURVEY, label: '설문조사' },
  { to: PATHS.MY_PAGE, label: '마이페이지' },
];

interface TopNavProps {
  searchPlaceholder?: string;
}

export function TopNav({ searchPlaceholder = '위스키 검색' }: TopNavProps) {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');
  const [nickname, setNickname] = useState(() => localStorage.getItem('nickname') || '');
  const [profileImageKey, setProfileImageKey] = useState(() => localStorage.getItem('profileImageUrl') || '');
  const isLoggedIn = !!accessToken;
  const avatarSrc = resolveMediaUrl(profileImageKey || null);

  useEffect(() => {
    const syncProfile = () => {
      setNickname(localStorage.getItem('nickname') || '');
      setProfileImageKey(localStorage.getItem('profileImageUrl') || '');
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, syncProfile);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, syncProfile);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // 서버 오류여도 클라이언트는 로그아웃 처리
    } finally {
      clearAuthSession();
      navigate(PATHS.LOGIN);
    }
  };

  return (
    <nav className="wf-topnav">
      <Link to={PATHS.LOUNGE} className="wf-topnav__logo-link">
        <div className="wf-topnav__logo">Whiskey Note</div>
      </Link>
      <Link to={PATHS.SEARCH} className="wf-input wf-topnav__search">
        {searchPlaceholder}
      </Link>
      <div className="wf-topnav__links">
        {NAV.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {label}
          </NavLink>
        ))}
      </div>

      {/* 로그인 상태 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {isLoggedIn ? (
          <>
            {/* 프로필 아바타 */}
            <Link to={PATHS.MY_PAGE} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '2px solid var(--wf-accent)',
                overflow: 'hidden',
                background: 'var(--wf-surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={nickname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 16 }}>🥃</span>
                )}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--wf-text)', whiteSpace: 'nowrap' }}>
                {nickname}
              </span>
            </Link>

            {/* 로그아웃 버튼 */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                height: 32,
                padding: '0 14px',
                borderRadius: 8,
                border: '1px solid var(--wf-border)',
                background: 'transparent',
                color: 'var(--wf-muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.borderColor = 'var(--wf-danger)';
                (e.target as HTMLButtonElement).style.color = 'var(--wf-danger)';
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.borderColor = 'var(--wf-border)';
                (e.target as HTMLButtonElement).style.color = 'var(--wf-muted)';
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            to={PATHS.LOGIN}
            style={{
              height: 32,
              padding: '0 16px',
              borderRadius: 8,
              border: '1px solid var(--wf-accent)',
              background: 'var(--wf-accent-dim)',
              color: 'var(--wf-accent)',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
