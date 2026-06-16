import { useState } from 'react';
import { adminApi } from '../api/adminApi';
import { toast } from '@/shared/components/ui/Toast';

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

  const labelStyle = {
    color: '#8b8b96',
    fontSize: 12,
    marginBottom: 4,
    display: 'block',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="위스키 등록 요청"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.65)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(440px, 100%)',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: '#ececf0', fontWeight: 600, fontSize: 15, margin: 0 }}>
              위스키 등록 요청
            </p>
            <p style={{ color: '#8b8b96', fontSize: 12, margin: '4px 0 0' }}>
              원하는 위스키가 없다면 등록을 요청해주세요.
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

        {/* 위스키명 (필수) */}
        <div>
          <label style={labelStyle}>위스키 이름 <span style={{ color: '#f87171' }}>*</span></label>
          <input
            type="text"
            placeholder="예) 글렌피딕 21년"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            style={inputStyle}
          />
        </div>

        {/* 종류 */}
        <div>
          <label style={labelStyle}>종류 (선택)</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">선택 안함</option>
            <option value="single_malt">싱글몰트</option>
            <option value="blended">블렌디드</option>
            <option value="bourbon">버번</option>
            <option value="rye">라이</option>
            <option value="etc">기타</option>
          </select>
        </div>

        {/* 도수 / 생산국 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>도수 (선택)</label>
            <input
              type="number"
              placeholder="예) 40"
              value={abv}
              onChange={(e) => setAbv(e.target.value)}
              min={0}
              max={100}
              step={0.1}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>생산국 (선택)</label>
            <input
              type="text"
              placeholder="예) Scotland"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* 추가 메모 */}
        <div>
          <label style={labelStyle}>추가 설명 (선택)</label>
          <textarea
            placeholder="기타 정보를 자유롭게 입력해주세요."
            value={memo}
            onChange={(e) => { if (e.target.value.length <= 500) setMemo(e.target.value); }}
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
          />
          <p style={{ textAlign: 'right', fontSize: 11, margin: '4px 0 0', color: memo.length >= 500 ? '#f87171' : '#8b8b96' }}>
            {memo.length} / 500
          </p>
        </div>

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
            {submitting ? '요청 중...' : '등록 요청'}
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
