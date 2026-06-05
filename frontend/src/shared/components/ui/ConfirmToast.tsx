import { createRoot } from 'react-dom/client';

interface ConfirmOptions {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

/**
 * 프로젝트 색상 기반 확인 다이얼로그
 * confirm() 대신 사용
 *
 * 사용 예시:
 * const ok = await confirmToast({ message: '삭제할까요?', danger: true });
 * if (!ok) return;
 */
export function confirmToast({
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = (result: boolean) => {
      root.unmount();
      document.body.removeChild(container);
      resolve(result);
    };

    root.render(
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          background: 'rgba(0,0,0,0.65)',
        }}
        onClick={() => cleanup(false)}
      >
        <div
          style={{
            width: 'min(360px, 100%)',
            background: '#1e1e26',
            border: '1px solid #2e2e38',
            borderRadius: 12,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 메시지 */}
          <p style={{
            color: '#ececf0',
            fontSize: 14,
            lineHeight: 1.6,
            margin: 0,
            whiteSpace: 'pre-line',
          }}>
            {message}
          </p>

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => cleanup(false)}
              style={{
                background: 'none',
                border: '1px solid #2e2e38',
                borderRadius: 8,
                padding: '8px 16px',
                color: '#8b8b96',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => cleanup(true)}
              style={{
                background: danger ? '#f87171' : '#c9a227',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                color: danger ? '#fff' : '#0c0c0f',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  });
}
