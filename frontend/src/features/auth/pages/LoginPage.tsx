import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { authApi } from '../api/authApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 이미 로그인된 상태면 라운지로 이동
  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate(PATHS.LOUNGE, { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', String(data.userId));
      localStorage.setItem('nickname', data.nickname);
      localStorage.setItem('profileImageUrl', data.profileImageUrl ?? '');
      navigate(data.isNewUser ? PATHS.ONBOARDING : PATHS.LOUNGE);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // AUTH-03 1단계: GET /api/v1/auth/oauth/{provider} → provider 로그인
  function handleOauth(provider: 'kakao' | 'google' | 'naver') {
    window.location.href = `/api/v1/auth/oauth/${provider}`;
  }

  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />
      <div className="wf-page wf-guest-center">
        <div className="wf-box wf-auth-box">
          <h2 className="wf-title" style={{ fontSize: 22 }}>로그인</h2>
          <p className="wf-subtitle">취향 설문 후 맞춤 추천을 받아보세요</p>
          <Input
            placeholder="이메일"
            style={{ marginTop: 20 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="비밀번호"
            type="password"
            style={{ marginTop: 10 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button block style={{ marginTop: 16 }} onClick={handleLogin} disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
          <Button variant="ghost" block style={{ marginTop: 8 }} onClick={() => handleOauth('kakao')}>카카오</Button>
          <Button variant="ghost" block style={{ marginTop: 8 }} onClick={() => handleOauth('google')}>Google</Button>
          <Button variant="ghost" block style={{ marginTop: 8 }} onClick={() => handleOauth('naver')}>네이버</Button>
          <p className="wf-text-xs" style={{ textAlign: 'center', marginTop: 16 }}>
            계정이 없으신가요? <Link to={PATHS.REGISTER} className="wf-link">회원가입</Link>
          </p>
        </div>
      </div>
    </>
  );
}
