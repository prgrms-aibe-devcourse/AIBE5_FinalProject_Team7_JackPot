import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { adminApi, type WhiskeyRequest, type WhiskeyRequestStatus } from '../api/adminApi';
import { toast } from '@/shared/components/ui/Toast';
import '../whiskey-request.css';

const STATUS_LABEL: Record<WhiskeyRequestStatus, string> = {
  pending: '대기중',
  approved: '승인됨',
  rejected: '반려됨',
};

const TYPE_LABEL: Record<string, string> = {
  single_malt: '싱글몰트',
  blended: '블렌디드',
  bourbon: '버번',
  rye: '라이',
  etc: '기타',
};

function fieldValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  return null;
}

/**
 * 내 위스키 등록 요청 상세 페이지
 * GET /api/v1/whiskey-requests/:requestId
 */
export default function WhiskeyRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<WhiskeyRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;
    adminApi.getMyWhiskeyRequest(Number(requestId))
      .then((res) => setRequest(res.data.data))
      .catch(() => toast('요청 정보를 불러오지 못했습니다.', 'error'))
      .finally(() => setLoading(false));
  }, [requestId]);

  if (loading) {
    return (
      <WireframePage scroll>
        <div className="wf-whiskey-req-page">
          <p className="wf-whiskey-req-loading">불러오는 중…</p>
        </div>
      </WireframePage>
    );
  }

  if (!request) {
    return (
      <WireframePage scroll>
        <div className="wf-whiskey-req-page">
          <div className="wf-whiskey-req-empty">요청 정보를 찾을 수 없습니다.</div>
          <div className="wf-whiskey-req-back">
            <Button variant="ghost" to={PATHS.WHISKEY_REQUEST}>목록으로</Button>
          </div>
        </div>
      </WireframePage>
    );
  }

  const desc = request.description;
  const name = fieldValue(desc.name) ?? '—';
  const type = fieldValue(desc.type);
  const abv = fieldValue(desc.abv);
  const country = fieldValue(desc.country);
  const memo = fieldValue(desc.memo);

  return (
    <WireframePage scroll>
      <div className="wf-whiskey-req-page">
        <button
          type="button"
          className="wf-whiskey-req-back-link"
          onClick={() => navigate(PATHS.WHISKEY_REQUEST)}
        >
          ← 목록으로
        </button>

        <header className="wf-whiskey-req-intro">
          <p className="wf-whiskey-req-intro__eyebrow">등록 요청</p>
          <h1 className="wf-whiskey-req-intro__title">{name}</h1>
        </header>

        <article className="wf-whiskey-req-detail">
          <div className="wf-whiskey-req-detail__head">
            <span className={`wf-whiskey-req-status wf-whiskey-req-status--${request.status}`}>
              {STATUS_LABEL[request.status]}
            </span>
            <p className="wf-whiskey-req-detail__date">
              요청일 {new Date(request.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>

          <div className="wf-whiskey-req-fields">
            <div>
              <p className="wf-whiskey-req-field__label">위스키 이름</p>
              <p className="wf-whiskey-req-field__value wf-whiskey-req-field__value--title">{name}</p>
            </div>

            {type && (
              <div>
                <p className="wf-whiskey-req-field__label">종류</p>
                <p className="wf-whiskey-req-field__value">{TYPE_LABEL[type] ?? type}</p>
              </div>
            )}

            {abv && (
              <div>
                <p className="wf-whiskey-req-field__label">도수</p>
                <p className="wf-whiskey-req-field__value">{abv}%</p>
              </div>
            )}

            {country && (
              <div>
                <p className="wf-whiskey-req-field__label">생산국</p>
                <p className="wf-whiskey-req-field__value">{country}</p>
              </div>
            )}

            {memo && (
              <div>
                <p className="wf-whiskey-req-field__label">추가 설명</p>
                <p className="wf-whiskey-req-field__value">{memo}</p>
              </div>
            )}
          </div>

          {request.status !== 'pending' && (
            <div className={`wf-whiskey-req-result wf-whiskey-req-result--${request.status}`}>
              <p className="wf-whiskey-req-field__label">처리 결과</p>
              <p className={`wf-whiskey-req-field__value wf-whiskey-req-status wf-whiskey-req-status--${request.status}`}>
                {STATUS_LABEL[request.status]}
              </p>
            </div>
          )}
        </article>
      </div>
    </WireframePage>
  );
}
