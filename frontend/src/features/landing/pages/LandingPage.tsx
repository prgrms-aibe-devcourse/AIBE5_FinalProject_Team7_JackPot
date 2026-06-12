import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { isLoggedIn } from '@/shared/lib/authSession';
import { apiClient } from '@/shared/api/client';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(PATHS.ONBOARDING, { replace: true });
      return;
    }
    // skipGlobalErrorRedirect: 설문 미완료(404) 또는 서버 오류(500) 모두 /onboarding으로
    // 처리해야 하므로 전역 500 인터셉터 우회 — 에러는 .catch()에서 직접 처리
    apiClient
      .get('/taste/survey/me', { skipGlobalErrorRedirect: true })
      .then(() => navigate(PATHS.LOUNGE, { replace: true }))
      .catch(() => navigate(PATHS.ONBOARDING, { replace: true }));
  }, [navigate]);

  return null;
}
