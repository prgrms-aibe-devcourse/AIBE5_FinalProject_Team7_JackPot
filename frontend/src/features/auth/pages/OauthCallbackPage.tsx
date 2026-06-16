/**
 * AUTH-03 콜백 페이지 (프론트 2단계)
 * - 라우트: /oauth/{provider}/callback?code=... (OAUTH_*_REDIRECT_URI와 동일)
 * - authApi.oauthCallback → JWT localStorage → 온보딩/라운지
 */
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { toast } from '@/shared/components/ui/Toast';
import { authApi } from '../api/authApi';

export default function OauthCallbackPage() {
  const navigate = useNavigate();
  const { provider } = useParams();
  const [searchParams] = useSearchParams();

  // AUTH-03: 소셜 로그인 콜백
  // 의도: provider가 넘긴 code로 JWT 받아 이메일 로그인과 동일하게 세션 저장
  useEffect(() => {
    const run = async () => {
      const code = searchParams.get('code');
      if (!provider || !code) {
        toast('소셜 로그인에 실패했습니다. (code 누락)', 'error');
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
        localStorage.setItem('role', data.role ?? 'USER');
        navigate(data.isNewUser ? PATHS.ONBOARDING : PATHS.LOUNGE, { replace: true });
      } catch (e: unknown) {
        toast(e instanceof Error ? e.message : '소셜 로그인에 실패했습니다.', 'error');
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

