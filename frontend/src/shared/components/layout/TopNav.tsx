import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import './TopNav.css';
import { PATHS } from '@/app/router/paths';
import { authApi } from '@/features/auth/api/authApi';
import { clearAuthSession } from '@/shared/lib/authSession';
import { resolveProfileImageUrl } from '@/shared/lib/mediaUrl';

export const PROFILE_UPDATED_EVENT = 'whiskeynote:profile-updated';

const NAV = [
  { to: PATHS.LOUNGE,    label: '라운지' },
  { to: PATHS.SEARCH,    label: '검색' },
  { to: PATHS.COMMUNITY, label: '커뮤니티' },
  { to: PATHS.CABINET,   label: '캐비넷' },
  { to: PATHS.SURVEY,    label: '설문조사' },
  { to: PATHS.MY_PAGE,   label: '마이페이지' },
];

interface TopNavProps {
  searchPlaceholder?: string;
}

export function TopNav({ searchPlaceholder: _searchPlaceholder }: TopNavProps) {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const accessToken  = localStorage.getItem('accessToken');
  const [nickname, setNickname] = useState(() => localStorage.getItem('nickname') || '');
  const [profileImageKey, setProfileImageKey] = useState(() => localStorage.getItem('profileImageUrl') || '');
  const isLoggedIn = !!accessToken;
  const userId = localStorage.getItem('userId') || '';
  const avatarSrc = resolveProfileImageUrl(profileImageKey || null, userId || nickname);

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
      // 로그아웃 시 React Query 캐시 전체 초기화
      // → 다음 유저 로그인 시 이전 유저 데이터가 남지 않도록 처리
      queryClient.clear();
      navigate(PATHS.LOGIN);
    }
  };

  return (
    <nav className="wf-topnav">
      {/* 로고 + 네비게이션 (중앙 클러스터, 로고가 첫 번째) */}
      <div className="wf-topnav__center">
        <Link to={PATHS.LANDING} className="wf-topnav__logo-link" aria-label="Whiskey Note">
          <img src="/images/logoNoback.png" alt="Whiskey Note" className="wf-topnav__logo-img" />
        </Link>
        <div className="wf-topnav__links">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : undefined}>
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* 유저 영역 */}
      <div className="wf-topnav__user">
        {isLoggedIn ? (
          <>
            <Link to={PATHS.MY_PAGE} className="wf-topnav__profile">
              <div className="wf-topnav__avatar">
                <img src={avatarSrc} alt={nickname} />
              </div>
              <span className="wf-topnav__nickname">{nickname}</span>
            </Link>
            <button type="button" className="wf-topnav__logout" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <Link to={PATHS.LOGIN} className="wf-topnav__login">
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
