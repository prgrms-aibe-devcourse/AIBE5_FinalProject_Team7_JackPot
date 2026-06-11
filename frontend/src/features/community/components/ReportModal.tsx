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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="wf-modal-overlay"
      onClick={onClose}
    >
      <div
        className="wf-modal-panel wf-modal-panel--report"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="wf-modal-header">
          <div>
            <p className="wf-modal-title">
              {targetType === 'POST' ? '게시글' : '댓글'} 신고
            </p>
            <p className="wf-modal-subtitle">신고 사유를 선택해주세요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="wf-modal-close-btn"
          >
            ✕
          </button>
        </div>

        {/* 신고 사유 선택 */}
        <div className="wf-modal-options">
          {REASON_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setReason(opt.value); setDetail(''); }}
              className={`wf-modal-option${reason === opt.value ? ' wf-modal-option--on' : ''}`}
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
              className="wf-modal-input"
              autoFocus
            />
            <p className={`wf-modal-char-count${detail.length >= DETAIL_MAX_LENGTH ? ' wf-modal-char-count--limit' : ''}`}>
              {detail.length} / {DETAIL_MAX_LENGTH}
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className="wf-modal-footer">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="wf-modal-submit-btn"
          >
            {submitting ? '접수 중...' : '신고하기'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="wf-modal-cancel-btn"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
