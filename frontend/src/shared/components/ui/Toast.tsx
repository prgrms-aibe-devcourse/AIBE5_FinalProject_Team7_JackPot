import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

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

const STYLES: Record<ToastType, { border: string; icon: string }> = {
  success: { border: '#4ade80', icon: '#4ade80' },
  error:   { border: '#f87171', icon: '#f87171' },
  info:    { border: '#c9a227', icon: '#c9a227' },
  warning: { border: '#c9a227', icon: '#c9a227' },
};

function ToastComponent({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const style = STYLES[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: 'relative',
        transform: `translateY(${visible ? 0 : '-20px'})`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#1e1e26',
        border: `1px solid ${style.border}`,
        borderRadius: '12px',
        padding: '14px 20px',
        color: '#ececf0',
        fontSize: '14px',
        fontFamily: '"Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        width: '420px',
        whiteSpace: 'pre-line',
      }}
    >
      <span
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          border: `1.5px solid ${style.icon}`,
          color: style.icon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {ICONS[type]}
      </span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{message}</span>
      <button
        type="button"
        onClick={() => { setVisible(false); setTimeout(() => onClose?.(), 300); }}
        style={{
          background: 'none',
          border: 'none',
          color: '#8b8b96',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '0 2px',
          lineHeight: 1,
          flexShrink: 0,
        }}
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
    }}>
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
