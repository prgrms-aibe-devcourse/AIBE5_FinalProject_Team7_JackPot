import { useState } from 'react';
import { adminApi } from '../api/adminApi';
import { toast } from '@/shared/components/ui/Toast';
import '@/features/community/community.css';

interface WhiskeyRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 위스키 등록 요청 모달
 * - 위스키명(필수), 종류, 도수, 생산국 입력
 * - 제출 시 POST /api/v1/whiskey-requests
 */
export function WhiskeyRequestModal({ onClose, onSuccess }: WhiskeyRequestModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [abv, setAbv] = useState('');
  const [country, setCountry] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast('위스키 이름은 필수입니다.', 'warning');
      return;
    }

    const description: Record<string, unknown> = { name: name.trim() };
    if (type.trim()) description.type = type.trim();
    if (abv.trim()) description.abv = Number(abv);
    if (country.trim()) description.country = country.trim();
    if (memo.trim()) description.memo = memo.trim();

    setSubmitting(true);
    try {
      await adminApi.createWhiskeyRequest(description);
      toast('등록 요청이 접수되었습니다.', 'success');
      onSuccess();
      onClose();
    } catch {
      toast('등록 요청에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="위스키 등록 요청"
      className="wf-modal-overlay"
      onClick={onClose}
    >
      <div
        className="wf-modal-panel wf-modal-panel--whiskey-request"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wf-modal-header">
          <div>
            <p className="wf-modal-title">위스키 등록 요청</p>
            <p className="wf-modal-subtitle">원하는 위스키가 없다면 등록을 요청해주세요.</p>
          </div>
          <button type="button" onClick={onClose} className="wf-modal-close-btn">
            ✕
          </button>
        </div>

        <div>
          <label className="wf-modal-label">
            위스키 이름 <span className="wf-modal-label-required">*</span>
          </label>
          <input
            type="text"
            placeholder="예) 글렌피딕 21년"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="wf-modal-input"
          />
        </div>

        <div>
          <label className="wf-modal-label">종류 (선택)</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="wf-modal-input"
            style={{ cursor: 'pointer' }}
          >
            <option value="">선택 안함</option>
            <option value="single_malt">싱글몰트</option>
            <option value="blended">블렌디드</option>
            <option value="bourbon">버번</option>
            <option value="rye">라이</option>
            <option value="etc">기타</option>
          </select>
        </div>

        <div className="wf-modal-field-row">
          <div>
            <label className="wf-modal-label">도수 (선택)</label>
            <input
              type="number"
              placeholder="예) 40"
              value={abv}
              onChange={(e) => setAbv(e.target.value)}
              min={0}
              max={100}
              step={0.1}
              className="wf-modal-input"
            />
          </div>
          <div>
            <label className="wf-modal-label">생산국 (선택)</label>
            <input
              type="text"
              placeholder="예) Scotland"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="wf-modal-input"
            />
          </div>
        </div>

        <div>
          <label className="wf-modal-label">추가 설명 (선택)</label>
          <textarea
            placeholder="기타 정보를 자유롭게 입력해주세요."
            value={memo}
            onChange={(e) => { if (e.target.value.length <= 500) setMemo(e.target.value); }}
            rows={3}
            className="wf-modal-input"
          />
          <p className={`wf-modal-char-count${memo.length >= 500 ? ' wf-modal-char-count--limit' : ''}`}>
            {memo.length} / 500
          </p>
        </div>

        <div className="wf-modal-footer">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="wf-modal-submit-btn"
          >
            {submitting ? '요청 중...' : '등록 요청'}
          </button>
          <button type="button" onClick={onClose} className="wf-modal-cancel-btn">
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
