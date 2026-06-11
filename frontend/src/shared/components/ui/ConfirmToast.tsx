import { createRoot } from 'react-dom/client';
import './ConfirmToast.css';

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
        className="wf-confirm-overlay"
        onClick={() => cleanup(false)}
      >
        <div
          className="wf-confirm-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 메시지 */}
          <p className="wf-confirm-message">{message}</p>

          {/* 버튼 */}
          <div className="wf-confirm-footer">
            <button
              type="button"
              className="wf-confirm-cancel"
              onClick={() => cleanup(false)}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`wf-confirm-ok${danger ? ' wf-confirm-ok--danger' : ''}`}
              onClick={() => cleanup(true)}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  });
}
