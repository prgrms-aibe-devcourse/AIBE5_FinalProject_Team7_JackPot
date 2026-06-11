import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './Toast.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};

function ToastComponent({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`wf-toast wf-toast--${type}`}
      style={{
        transform: `translateY(${visible ? 0 : '-20px'})`,
        opacity: visible ? 1 : 0,
      }}
    >
      <span className={`wf-toast__icon wf-toast__icon--${type}`}>
        {ICONS[type]}
      </span>
      <span className="wf-toast__message">{message}</span>
      <button
        type="button"
        className="wf-toast__close"
        onClick={() => { setVisible(false); setTimeout(() => onClose?.(), 300); }}
      >
        ✕
      </button>
    </div>
  );
}

// ── 전역 toast() 함수 ──────────────────────────────
let _containerEl: HTMLElement | null = null;
let _root: ReturnType<typeof createRoot> | null = null;
const _queue: Array<{ message: string; type: ToastType; id: number }> = [];
let _idCounter = 0;

function renderQueue() {
  if (!_containerEl) {
    _containerEl = document.createElement('div');
    document.body.appendChild(_containerEl);
    _root = createRoot(_containerEl);
  }

  _root!.render(
    <div className="wf-toast-container">
      {_queue.map((item) => (
        <ToastComponent
          key={item.id}
          message={item.message}
          type={item.type}
          onClose={() => {
            const idx = _queue.findIndex((q) => q.id === item.id);
            if (idx !== -1) _queue.splice(idx, 1);
            renderQueue();
          }}
        />
      ))}
    </div>
  );
}

export function toast(message: string, type: ToastType = 'info') {
  _queue.push({ message, type, id: ++_idCounter });
  renderQueue();
}
