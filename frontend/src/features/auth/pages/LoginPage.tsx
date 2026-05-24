import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export default function LoginPage() {
  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />
      <div className="wf-page wf-guest-center">
        <div className="wf-box wf-auth-box">
          <h2 className="wf-title" style={{ fontSize: 22 }}>로그인</h2>
          <p className="wf-subtitle">취향 설문 후 맞춤 추천을 받아보세요</p>
          <Input placeholder="이메일" style={{ marginTop: 20 }} />
          <Input placeholder="비밀번호" style={{ marginTop: 10 }} />
          <Button block style={{ marginTop: 16 }} to={PATHS.ONBOARDING}>로그인</Button>
          <Button variant="ghost" block style={{ marginTop: 8 }}>카카오</Button>
          <Button variant="ghost" block style={{ marginTop: 8 }}>Google</Button>
          <p className="wf-text-xs" style={{ textAlign: 'center', marginTop: 16 }}>
            계정이 없으신가요? <Link to={PATHS.ONBOARDING} className="wf-link">회원가입</Link>
          </p>
        </div>
      </div>
    </>
  );
}
