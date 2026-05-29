/**
 * OAuth callback 페이지 (AUTH-03 2단계 — 프론트)
 *
 * Provider가 redirect하는 URL: /oauth/{provider}/callback?code=...
 * (PATHS.OAUTH_CALLBACK — 백엔드 OAUTH_*_REDIRECT_URI와 동일해야 함)
 *
 * code를 authApi.oauthCallback으로 POST → JWT localStorage 저장 → 온보딩/라운지 이동
 */
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { authApi } from '../api/authApi';

export default function OauthCallbackPage() {
  const navigate = useNavigate();
  const { provider } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const code = searchParams.get('code');
      if (!provider || !code) {
        alert('소셜 로그인에 실패했습니다. (code 누락)');
        navigate(PATHS.LOGIN, { replace: true });
        return;
      }

      try {
        const data = await authApi.oauthCallback(provider, code);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', String(data.userId));
        localStorage.setItem('nickname', data.nickname);
        localStorage.setItem('profileImageUrl', data.profileImageUrl ?? '');
        navigate(data.isNewUser ? PATHS.ONBOARDING : PATHS.LOUNGE, { replace: true });
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : '소셜 로그인에 실패했습니다.');
        navigate(PATHS.LOGIN, { replace: true });
      }
    };
    run();
  }, [navigate, provider, searchParams]);

  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />
      <div className="wf-page wf-guest-center">
        <PageLoader label="소셜 로그인 처리 중..." />
      </div>
    </>
  );
}

