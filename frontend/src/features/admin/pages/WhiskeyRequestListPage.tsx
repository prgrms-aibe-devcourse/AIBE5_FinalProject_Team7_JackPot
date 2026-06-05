import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { adminApi, type WhiskeyRequest, type WhiskeyRequestStatus } from '../api/adminApi';
import { toast } from '@/shared/components/ui/Toast';
import { Pagination } from '@/features/community/components/Pagination';

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

const PAGE_SIZE = 10;

/**
 * 내 위스키 등록 요청 목록 페이지
 * GET /api/v1/whiskey-requests
 */
export default function WhiskeyRequestListPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<WhiskeyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WhiskeyRequestStatus | 'all'>('all');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = async (status: WhiskeyRequestStatus | 'all', p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.getMyWhiskeyRequests(status === 'all' ? undefined : status, p, PAGE_SIZE);
      const data = res.data.data;
      setRequests(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 1);
    } catch {
      toast('요청 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    load(filter, 0);
  }, [filter]);

  useEffect(() => {
    load(filter, page);
  }, [page]);

  const filterBtnStyle = (active: boolean) => ({
    padding: '4px 14px',
    borderRadius: 6,
    fontSize: 13,
    border: `1px solid ${active ? '#c9a227' : '#2e2e38'}`,
    background: active ? 'rgba(201,162,39,0.1)' : 'none',
    color: active ? '#c9a227' : '#8b8b96',
    cursor: 'pointer',
  } as const);

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">홈 / 마이페이지 / <strong>위스키 등록 요청</strong></p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="wf-title" style={{ margin: 0 }}>내 등록 요청 목록</h1>
      </div>

      {/* 필터 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button key={s} type="button" style={filterBtnStyle(filter === s)} onClick={() => setFilter(s)}>
            {s === 'all' ? '전체' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {loading ? (
        <p style={{ color: '#8b8b96' }}>불러오는 중...</p>
      ) : requests.length === 0 ? (
        <div className="wf-box" style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: '#8b8b96', margin: 0 }}>등록 요청 내역이 없습니다.</p>
        </div>
      ) : (
        requests.map((req) => (
          <div
            key={req.requestId}
            onClick={() => navigate(`/whiskey-requests/${req.requestId}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              background: '#16161c',
              border: '1px solid #2e2e38',
              borderRadius: 10,
              marginBottom: 8,
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c9a227')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2e2e38')}
          >
            {/* 상태 뱃지 */}
            <span style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: STATUS_COLOR[req.status] + '22',
              color: STATUS_COLOR[req.status],
              border: `1px solid ${STATUS_COLOR[req.status]}44`,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {STATUS_LABEL[req.status]}
            </span>

            {/* 위스키명 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#ececf0', fontSize: 14, fontWeight: 600, margin: 0 }}>
                {(req.description as any)?.name ?? '위스키명 없음'}
              </p>
              <p style={{ color: '#8b8b96', fontSize: 12, margin: '2px 0 0' }}>
                {new Date(req.createdAt).toLocaleDateString()}
              </p>
            </div>

            <span style={{ color: '#8b8b96', fontSize: 18 }}>›</span>
          </div>
        ))
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </WireframePage>
  );
}
