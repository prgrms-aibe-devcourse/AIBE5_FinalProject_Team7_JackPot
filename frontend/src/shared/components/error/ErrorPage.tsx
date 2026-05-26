import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { PATHS } from '@/app/router/paths';

interface ErrorPageProps {
  code: number;
  title: string;
  message: string;
  showHomeButton?: boolean;
}

export function ErrorPage({ code, title, message, showHomeButton = true }: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="wf-box wf-auth-box" style={{
        textAlign: 'center',
        width: '100%',
        maxWidth: 480,
      }}>
        {/* 에러 코드 */}
        <p style={{ fontSize: 80, fontWeight: 700, margin: '0 0 8px', opacity: 0.15, lineHeight: 1 }}>
          {code}
        </p>
        {/* 제목 */}
        <h2 className="wf-title" style={{ fontSize: 22, marginBottom: 10 }}>
          {title}
        </h2>
        {/* 안내 메시지 */}
        <p className="wf-subtitle" style={{ marginBottom: 32 }}>
          {message}
        </p>
        {/* 버튼 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {showHomeButton && (
            <Button block to={PATHS.LANDING}>
              홈으로 돌아가기
            </Button>
          )}
          <Button block variant="ghost" onClick={() => navigate(-1)}>
            이전 페이지로
          </Button>
        </div>
      </div>
    </div>
  );
}
