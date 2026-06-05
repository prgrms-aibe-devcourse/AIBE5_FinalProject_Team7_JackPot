import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { adminApi, type WhiskeyRequest, type WhiskeyRequestStatus } from '../api/adminApi';
import { toast } from '@/shared/components/ui/Toast';

const STATUS_LABEL: Record<WhiskeyRequestStatus, string> = {
  pending: '대기중',
  approved: '승인됨',
  rejected: '반려됨',
};

const STATUS_COLOR: Record<WhiskeyRequestStatus, string> = {
  pending: '#c9a227',
  approved: '#4ade80',
  rejected: '#f87171',
};

const TYPE_LABEL: Record<string, string> = {
  single_malt: '싱글몰트',
  blended: '블렌디드',
  bourbon: '버번',
  rye: '라이',
  etc: '기타',
};

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
        <p style={{ color: '#8b8b96' }}>불러오는 중...</p>
      </WireframePage>
    );
  }

  if (!request) {
    return (
      <WireframePage scroll>
        <p style={{ color: '#8b8b96' }}>요청 정보를 찾을 수 없습니다.</p>
      </WireframePage>
    );
  }

  const desc = request.description as any;

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">
        홈 / 마이페이지 /&nbsp;
        <button
          type="button"
          onClick={() => navigate('/whiskey-requests')}
          style={{ background: 'none', border: 'none', color: '#8b8b96', cursor: 'pointer', padding: 0, fontSize: 13 }}
        >
          위스키 등록 요청
        </button>
        &nbsp;/ <strong>{desc?.name ?? '상세'}</strong>
      </p>

      <div className="wf-box" style={{ padding: 20, marginBottom: 12 }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            background: STATUS_COLOR[request.status] + '22',
            color: STATUS_COLOR[request.status],
            border: `1px solid ${STATUS_COLOR[request.status]}44`,
          }}>
            {STATUS_LABEL[request.status]}
          </span>
          <p style={{ color: '#8b8b96', fontSize: 12, margin: 0 }}>
            요청일: {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* 위스키 정보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ color: '#8b8b96', fontSize: 12, margin: '0 0 4px' }}>위스키 이름</p>
            <p style={{ color: '#ececf0', fontSize: 18, fontWeight: 700, margin: 0 }}>
              {desc?.name ?? '—'}
            </p>
          </div>

          {desc?.type && (
            <div>
              <p style={{ color: '#8b8b96', fontSize: 12, margin: '0 0 4px' }}>종류</p>
              <p style={{ color: '#ececf0', fontSize: 14, margin: 0 }}>
                {TYPE_LABEL[desc.type] ?? desc.type}
              </p>
            </div>
          )}

          {desc?.abv && (
            <div>
              <p style={{ color: '#8b8b96', fontSize: 12, margin: '0 0 4px' }}>도수</p>
              <p style={{ color: '#ececf0', fontSize: 14, margin: 0 }}>{desc.abv}%</p>
            </div>
          )}

          {desc?.country && (
            <div>
              <p style={{ color: '#8b8b96', fontSize: 12, margin: '0 0 4px' }}>생산국</p>
              <p style={{ color: '#ececf0', fontSize: 14, margin: 0 }}>{desc.country}</p>
            </div>
          )}

          {desc?.memo && (
            <div>
              <p style={{ color: '#8b8b96', fontSize: 12, margin: '0 0 4px' }}>추가 설명</p>
              <p style={{ color: '#ececf0', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{desc.memo}</p>
            </div>
          )}
        </div>

        {/* 처리 결과 */}
        {request.status !== 'pending' && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: '#0c0c0f',
            borderRadius: 8,
            borderLeft: `3px solid ${STATUS_COLOR[request.status]}`,
          }}>
            <p style={{ color: '#8b8b96', fontSize: 12, margin: '0 0 4px' }}>처리 결과</p>
            <p style={{ color: STATUS_COLOR[request.status], fontSize: 14, fontWeight: 600, margin: 0 }}>
              {STATUS_LABEL[request.status]}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate('/whiskey-requests')}
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
        ← 목록으로
      </button>
    </WireframePage>
  );
}
