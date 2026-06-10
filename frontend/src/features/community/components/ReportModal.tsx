import { useState } from 'react';
import { adminApi } from '@/features/admin/api/adminApi';
import { toast } from '@/shared/components/ui/Toast';

interface ReportModalProps {
  targetId: number;
  targetType: 'POST' | 'COMMENT';
  onClose: () => void;
}

const REASON_OPTIONS = [
  { value: 'SPAM',    label: '스팸' },
  { value: 'OBSCENE', label: '음란물' },
  { value: 'ILLEGAL', label: '불법 정보' },
  { value: 'ABUSE',   label: '욕설 / 혐오' },
  { value: 'OTHER',   label: '기타' },
] as const;

type ReasonValue = typeof REASON_OPTIONS[number]['value'];

// 기타 사유 최대 글자수
const DETAIL_MAX_LENGTH = 200;

/**
 * 게시글 / 댓글 신고 모달
 * - 신고 사유 선택 (기타 선택 시 상세 입력 + 글자수 제한)
 * - 중복 신고 시 409 → 안내 토스트
 * - POST /api/v1/reports
 */
export function ReportModal({ targetId, targetType, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReasonValue>('SPAM');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (reason === 'OTHER' && !detail.trim()) {
      toast('기타 사유를 입력해주세요.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createReport({
        targetId,
        targetType,
        reason,
        detail: reason === 'OTHER' ? detail.trim() : null,
      });
      toast('신고가 접수되었습니다.', 'success');
      onClose();
    } catch (err: any) {
      // interceptor가 new Error(message)로 변환하므로 err.message로 받음
      const message = err?.message ?? '신고 접수에 실패했습니다.';
      const is409 = message.includes('이미 신고');
      toast(message, is409 ? 'warning' : 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#16161c',
    border: '1px solid #2e2e38',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#ececf0',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(0,0,0,0.65)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(420px, 100%)',
          background: '#1e1e26',
          border: '1px solid #2e2e38',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#ececf0', fontWeight: 600, fontSize: 15, margin: 0 }}>
              {targetType === 'POST' ? '게시글' : '댓글'} 신고
            </p>
            <p style={{ color: '#8b8b96', fontSize: 12, margin: '4px 0 0' }}>
              신고 사유를 선택해주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8b8b96', fontSize: 18, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* 신고 사유 선택 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REASON_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setReason(opt.value); setDetail(''); }}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: `1px solid ${reason === opt.value ? '#c9a227' : '#2e2e38'}`,
                background: reason === opt.value ? 'rgba(201,162,39,0.1)' : '#16161c',
                color: reason === opt.value ? '#c9a227' : '#ececf0',
                fontSize: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 기타 상세 입력 + 글자수 카운터 */}
        {reason === 'OTHER' && (
          <div>
            <textarea
              placeholder="신고 사유를 입력해주세요."
              value={detail}
              onChange={(e) => {
                if (e.target.value.length <= DETAIL_MAX_LENGTH) {
                  setDetail(e.target.value);
                }
              }}
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
              autoFocus
            />
            <p style={{
              textAlign: 'right',
              fontSize: 12,
              margin: '4px 0 0',
              color: detail.length >= DETAIL_MAX_LENGTH ? '#f87171' : '#8b8b96',
            }}>
              {detail.length} / {DETAIL_MAX_LENGTH}
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            style={{
              flex: 1,
              background: '#c9a227',
              border: 'none',
              borderRadius: 10,
              padding: '11px',
              color: '#0c0c0f',
              fontWeight: 600,
              fontSize: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '접수 중...' : '신고하기'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #2e2e38',
              borderRadius: 10,
              padding: '11px 16px',
              color: '#8b8b96',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
