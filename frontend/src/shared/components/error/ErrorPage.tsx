import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';
import { Button } from '@/shared/components/ui/Button';
import { PATHS } from '@/app/router/paths';

interface ErrorPageProps {
  code: number;
  title: string;
  message: React.ReactNode;
  showHomeButton?: boolean;
}

export function ErrorPage({ code, title, message, showHomeButton = true }: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div className="wf-error-page">
      <div className="wf-box wf-auth-box wf-error-box">
        {/* 위스키 아이콘 */}
        <div className="wf-error-icon">🥃</div>
        {/* 에러 코드 */}
        <p className="wf-error-code">{code}</p>
        {/* 제목 */}
        <h2 className="wf-title wf-error-title">{title}</h2>
        {/* 안내 메시지 */}
        <p className="wf-subtitle wf-error-subtitle">{message}</p>
        {/* 버튼 영역 */}
        <div className="wf-error-actions">
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
