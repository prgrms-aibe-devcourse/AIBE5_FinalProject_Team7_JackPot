import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { isLoggedIn } from '@/shared/lib/authSession';
import { surveyApi } from '@/features/survey/api/surveyApi';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(PATHS.ONBOARDING, { replace: true });
      return;
    }
    surveyApi
      .getMyProfile()
      .then(() => navigate(PATHS.LOUNGE, { replace: true }))
      .catch(() => navigate(PATHS.ONBOARDING, { replace: true }));
  }, [navigate]);

  return null;
}
