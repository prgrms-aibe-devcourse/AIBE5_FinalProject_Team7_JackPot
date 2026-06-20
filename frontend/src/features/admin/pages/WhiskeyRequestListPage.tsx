import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { adminApi, type WhiskeyRequest, type WhiskeyRequestStatus } from '../api/adminApi';
import { toast } from '@/shared/components/ui/Toast';
import { Pagination } from '@/features/community/components/Pagination';
import '../whiskey-request.css';

const STATUS_LABEL: Record<WhiskeyRequestStatus, string> = {
  pending: '대기중',
  approved: '승인됨',
  rejected: '반려됨',
};

const FILTER_OPTIONS: Array<{ key: WhiskeyRequestStatus | 'all'; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '대기중' },
  { key: 'approved', label: '승인됨' },
  { key: 'rejected', label: '반려됨' },
];

const PAGE_SIZE = 10;

function getWhiskeyName(description: Record<string, unknown>): string {
  const name = description.name;
  return typeof name === 'string' && name.trim() ? name : '위스키명 없음';
}

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

  return (
    <WireframePage scroll>
      <div className="wf-whiskey-req-page">
        <button
          type="button"
          className="wf-whiskey-req-back-link"
          onClick={() => navigate(PATHS.MY_PAGE)}
        >
          ← 마이페이지
        </button>

        <header className="wf-whiskey-req-intro">
          <p className="wf-whiskey-req-intro__eyebrow">등록 요청</p>
          <h1 className="wf-whiskey-req-intro__title">위스키 등록 요청</h1>
          <p className="wf-whiskey-req-intro__subtitle">
            제안한 위스키의 검토 상태를 확인할 수 있어요.
          </p>
        </header>

        <div className="wf-whiskey-req-filters" role="tablist" aria-label="요청 상태 필터">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`wf-whiskey-req-filter${filter === key ? ' wf-whiskey-req-filter--active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="wf-whiskey-req-loading">불러오는 중…</p>
        ) : requests.length === 0 ? (
          <div className="wf-whiskey-req-empty">등록 요청 내역이 없습니다.</div>
        ) : (
          <div className="wf-whiskey-req-list">
            {requests.map((req) => (
              <button
                key={req.requestId}
                type="button"
                className="wf-whiskey-req-item"
                onClick={() => navigate(`${PATHS.WHISKEY_REQUEST}/${req.requestId}`)}
              >
                <span className={`wf-whiskey-req-status wf-whiskey-req-status--${req.status}`}>
                  {STATUS_LABEL[req.status]}
                </span>
                <div className="wf-whiskey-req-item__main">
                  <p className="wf-whiskey-req-item__name">{getWhiskeyName(req.description)}</p>
                  <p className="wf-whiskey-req-item__meta">
                    {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <span className="wf-whiskey-req-item__chevron" aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </WireframePage>
  );
}
