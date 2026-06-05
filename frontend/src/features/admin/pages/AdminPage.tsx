import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { toast } from '@/shared/components/ui/Toast';
import { confirmToast } from '@/shared/components/ui/ConfirmToast';
import { isAdmin, isLoggedIn } from '@/shared/lib/authSession';
import { PATHS } from '@/app/router/paths';
import { Pagination } from '@/features/community/components/Pagination';
import {
  adminApi,
  type WhiskeyRequest,
  type WhiskeyRequestStatus,
  type Report,
  type ReportDetail,
  type ReportStatus,
  type ReportAction,
  type AdminUser,
} from '../api/adminApi';

type AdminTabKey = 'whiskey-requests' | 'reports' | 'users';

// ── 스타일 헬퍼 ─────────────────────────────────
const tabStyle = (active: boolean) => ({
  padding: '8px 20px',
  border: 'none',
  borderBottom: active ? '2px solid #c9a227' : '2px solid transparent',
  background: 'none',
  color: active ? '#c9a227' : '#8b8b96',
  fontSize: 14,
  fontWeight: active ? 700 : 400,
  cursor: 'pointer',
} as const);

const badgeStyle = (color: string) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  background: color + '22',
  color,
  border: `1px solid ${color}44`,
  whiteSpace: 'nowrap',
} as const);

const btnStyle = (variant: 'primary' | 'danger' | 'ghost') => ({
  padding: '6px 14px',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  border: variant === 'ghost' ? '1px solid #2e2e38' : 'none',
  background: variant === 'primary' ? '#c9a227' : variant === 'danger' ? '#f87171' : 'none',
  color: variant === 'primary' ? '#0c0c0f' : variant === 'danger' ? '#fff' : '#8b8b96',
  whiteSpace: 'nowrap',
} as const);

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  background: '#16161c',
  border: '1px solid #2e2e38',
  borderRadius: 10,
  marginBottom: 8,
} as const;

const filterBtnStyle = (active: boolean) => ({
  padding: '4px 12px',
  borderRadius: 6,
  fontSize: 12,
  border: `1px solid ${active ? '#c9a227' : '#2e2e38'}`,
  background: active ? 'rgba(201,162,39,0.1)' : 'none',
  color: active ? '#c9a227' : '#8b8b96',
  cursor: 'pointer',
} as const);

// ── 상수 ─────────────────────────────────────────
const REQUEST_STATUS_COLOR: Record<WhiskeyRequestStatus, string> = {
  pending: '#c9a227', approved: '#4ade80', rejected: '#f87171',
};
const REQUEST_STATUS_LABEL: Record<WhiskeyRequestStatus, string> = {
  pending: '대기중', approved: '승인됨', rejected: '반려됨',
};
const REPORT_STATUS_COLOR: Record<ReportStatus, string> = {
  PENDING: '#c9a227', HIDDEN: '#f87171', DISMISSED: '#8b8b96', BANNED: '#ff4d4d',
};
const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: '검토 대기', HIDDEN: '숨김', DISMISSED: '기각', BANNED: '제재 완료',
};
const REASON_LABEL: Record<string, string> = {
  SPAM: '스팸', OBSCENE: '음란', ILLEGAL: '불법', ABUSE: '욕설', OTHER: '기타',
};
const ACTION_LABEL: Record<ReportAction, string> = {
  HIDE: '숨김', RESTORE: '복구', DISMISS: '기각', BAN_USER: '유저 제재', DELETE_CONTENT: '콘텐츠 삭제',
};

// ── 위스키 등록 요청 탭 ──────────────────────────
function WhiskeyRequestsTab() {
  const [requests, setRequests] = useState<WhiskeyRequest[]>([]);
  const [filter, setFilter] = useState<WhiskeyRequestStatus | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  const load = async (status: WhiskeyRequestStatus | 'all', p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.getWhiskeyRequests(status === 'all' ? undefined : status, p, PAGE_SIZE);
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
    setExpanded(null);
    load(filter, 0);
  }, [filter]);

  useEffect(() => {
    load(filter, page);
  }, [page]);

  const handleReview = async (id: number, action: 'approved' | 'rejected') => {
    const label = action === 'approved' ? '승인' : '반려';
    const ok = await confirmToast({ message: `이 요청을 ${label}할까요?`, confirmLabel: label, danger: action === 'rejected' });
    if (!ok) return;
    try {
      await adminApi.reviewWhiskeyRequest(id, action);
      toast(`${label}되었습니다.`, action === 'approved' ? 'success' : 'info');
      load(filter, page);
    } catch {
      toast(`${label} 처리에 실패했습니다.`, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button key={s} type="button" style={filterBtnStyle(filter === s)} onClick={() => setFilter(s)}>
            {s === 'all' ? '전체' : REQUEST_STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ color: '#8b8b96' }}>불러오는 중...</p>
      ) : requests.length === 0 ? (
        <p style={{ color: '#8b8b96' }}>요청이 없습니다.</p>
      ) : requests.map((req) => (
        <div key={req.requestId}>
          <div style={rowStyle}>
            <span style={badgeStyle(REQUEST_STATUS_COLOR[req.status])}>{REQUEST_STATUS_LABEL[req.status]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#ececf0', fontSize: 14, margin: 0, fontWeight: 600 }}>
                {(req.description as any)?.name ?? '위스키명 없음'}
              </p>
              <p style={{ color: '#8b8b96', fontSize: 12, margin: '2px 0 0' }}>
                요청자: {req.requesterNickName} · {new Date(req.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button type="button" style={btnStyle('ghost')} onClick={() => setExpanded(expanded === req.requestId ? null : req.requestId)}>
              {expanded === req.requestId ? '접기' : '상세'}
            </button>
            {req.status === 'pending' && (
              <>
                <button type="button" style={btnStyle('primary')} onClick={() => handleReview(req.requestId, 'approved')}>승인</button>
                <button type="button" style={btnStyle('danger')} onClick={() => handleReview(req.requestId, 'rejected')}>반려</button>
              </>
            )}
          </div>
          {expanded === req.requestId && (
            <div style={{ background: '#1e1e26', border: '1px solid #2e2e38', borderRadius: '0 0 10px 10px', padding: 16, marginTop: -8, marginBottom: 8 }}>
              <pre style={{ color: '#ececf0', fontSize: 12, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(req.description, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

// ── 신고 탭 ──────────────────────────────────────
function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportStatus | 'all'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async (status: ReportStatus | 'all') => {
    setLoading(true);
    try {
      const res = await adminApi.getReports(status === 'all' ? undefined : status);
      setReports(res.data.data?.content ?? res.data.data ?? []);
    } catch {
      toast('신고 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleDetail = async (id: number) => {
    if (detail?.reportId === id) { setDetail(null); return; }
    setDetailLoading(true);
    try {
      const res = await adminApi.getReportDetail(id);
      setDetail(res.data.data);
    } catch {
      toast('신고 상세를 불러오지 못했습니다.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAction = async (id: number, action: ReportAction) => {
    const ok = await confirmToast({ message: `'${ACTION_LABEL[action]}' 처리를 진행할까요?`, confirmLabel: ACTION_LABEL[action], danger: action === 'BAN_USER' || action === 'DELETE_CONTENT' });
    if (!ok) return;
    try {
      await adminApi.createReportAction(id, action, actionNote || undefined);
      toast(`${ACTION_LABEL[action]} 처리되었습니다.`, 'success');
      setDetail(null);
      setActionNote('');
      load(filter);
    } catch {
      toast('처리에 실패했습니다.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'PENDING', 'HIDDEN', 'DISMISSED', 'BANNED'] as const).map((s) => (
          <button key={s} type="button" style={filterBtnStyle(filter === s)} onClick={() => setFilter(s)}>
            {s === 'all' ? '전체' : REPORT_STATUS_LABEL[s as ReportStatus]}
          </button>
        ))}
      </div>
      {loading ? (
        <p style={{ color: '#8b8b96' }}>불러오는 중...</p>
      ) : reports.length === 0 ? (
        <p style={{ color: '#8b8b96' }}>신고가 없습니다.</p>
      ) : reports.map((report) => (
        <div key={report.reportId}>
          <div style={rowStyle}>
            <span style={badgeStyle(REPORT_STATUS_COLOR[report.status])}>{REPORT_STATUS_LABEL[report.status]}</span>
            <span style={badgeStyle('#8b8b96')}>{report.targetType}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#ececf0', fontSize: 14, margin: 0, fontWeight: 600 }}>
                {REASON_LABEL[report.reason]} 신고
                {report.detail && <span style={{ color: '#8b8b96', fontWeight: 400 }}> — {report.detail}</span>}
              </p>
              <p style={{ color: '#8b8b96', fontSize: 12, margin: '2px 0 0' }}>
                신고자: {report.reporterNickname} · {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button type="button" style={btnStyle('ghost')} onClick={() => handleDetail(report.reportId)}>
              {detail?.reportId === report.reportId ? '접기' : '상세'}
            </button>
          </div>
          {detail?.reportId === report.reportId && (
            <div style={{ background: '#1e1e26', border: '1px solid #2e2e38', borderRadius: '0 0 10px 10px', padding: 16, marginTop: -8, marginBottom: 8 }}>
              {detailLoading ? (
                <p style={{ color: '#8b8b96', fontSize: 13 }}>불러오는 중...</p>
              ) : (
                <>
                  {detail.targetContent && (
                    <div style={{ marginBottom: 12, padding: 12, background: '#0c0c0f', borderRadius: 8 }}>
                      <p style={{ color: '#8b8b96', fontSize: 11, margin: '0 0 4px' }}>신고 대상 내용</p>
                      <p style={{ color: '#ececf0', fontSize: 13, margin: 0 }}>{detail.targetContent}</p>
                    </div>
                  )}
                  {detail.actions?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ color: '#8b8b96', fontSize: 11, margin: '0 0 6px' }}>처리 이력</p>
                      {detail.actions.map((a) => (
                        <div key={a.actionId} style={{ padding: '6px 0', borderBottom: '1px solid #2e2e38', fontSize: 12, color: '#ececf0' }}>
                          <span style={{ color: '#c9a227' }}>{a.action}</span>
                          {a.note && <span style={{ color: '#8b8b96' }}> — {a.note}</span>}
                          <span style={{ color: '#8b8b96', marginLeft: 8 }}>{new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {report.status === 'PENDING' && (
                    <div>
                      <p style={{ color: '#8b8b96', fontSize: 11, margin: '0 0 8px' }}>처리하기</p>
                      <textarea
                        placeholder="처리 메모 (선택)"
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                        rows={2}
                        style={{ width: '100%', background: '#16161c', border: '1px solid #2e2e38', borderRadius: 8, padding: '8px 12px', color: '#ececf0', fontSize: 13, resize: 'none', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button type="button" style={btnStyle('ghost')} onClick={() => handleAction(report.reportId, 'HIDE')}>숨김</button>
                        <button type="button" style={btnStyle('ghost')} onClick={() => handleAction(report.reportId, 'DISMISS')}>기각</button>
                        <button type="button" style={btnStyle('danger')} onClick={() => handleAction(report.reportId, 'DELETE_CONTENT')}>콘텐츠 삭제</button>
                        <button type="button" style={{ ...btnStyle('danger'), background: '#7f1d1d' }} onClick={() => handleAction(report.reportId, 'BAN_USER')}>유저 제재</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── 회원 관리 탭 ─────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getUsers()
      .then((res) => setUsers(res.data.data?.content ?? res.data.data ?? []))
      .catch(() => toast('회원 목록을 불러오지 못했습니다.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const ROLE_COLOR: Record<string, string> = { USER: '#8b8b96', ADMIN: '#c9a227', PRO: '#4ade80' };

  return (
    <div>
      {loading ? (
        <p style={{ color: '#8b8b96' }}>불러오는 중...</p>
      ) : users.length === 0 ? (
        <p style={{ color: '#8b8b96' }}>회원이 없습니다.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 130px 80px', gap: 8, padding: '8px 16px', color: '#8b8b96', fontSize: 12, marginBottom: 4 }}>
            <span>닉네임</span><span>이메일</span><span>권한</span><span>마지막 로그인</span><span>상태</span>
          </div>
          {users.map((user) => (
            <div key={user.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 130px 80px', gap: 8, padding: '12px 16px', background: '#16161c', border: '1px solid #2e2e38', borderRadius: 10, marginBottom: 6, alignItems: 'center' }}>
              <span style={{ color: '#ececf0', fontSize: 14, fontWeight: 600 }}>{user.nickname}</span>
              <span style={{ color: '#8b8b96', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
              <span style={badgeStyle(ROLE_COLOR[user.role?.toUpperCase()] ?? '#8b8b96')}>{user.role}</span>
              <span style={{ color: '#8b8b96', fontSize: 12 }}>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '없음'}</span>
              <span style={badgeStyle(user.isDeleted ? '#f87171' : '#4ade80')}>{user.isDeleted ? '탈퇴' : '정상'}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── 메인 AdminPage ───────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<AdminTabKey>('whiskey-requests');
  const navigate = useNavigate();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return; // 이미 체크했으면 스킵 (StrictMode 2번 실행 방지)
    checked.current = true;

    if (!isLoggedIn()) {
      toast('로그인이 필요합니다.', 'warning');
      navigate(PATHS.LOGIN, { replace: true });
      return;
    }
    if (!isAdmin()) {
      toast('관리자만 접근할 수 있습니다.', 'error');
      navigate(PATHS.LOUNGE, { replace: true });
    }
  }, [navigate]);

  const TAB_LIST: Array<{ key: AdminTabKey; label: string }> = [
    { key: 'whiskey-requests', label: '📋 위스키 등록 요청' },
    { key: 'reports',          label: '🚨 신고 관리' },
    { key: 'users',            label: '👤 회원 관리' },
  ];

  return (
    <WireframePage scroll>
      <div style={{ marginBottom: 24 }}>
        <h1 className="wf-title" style={{ marginBottom: 4 }}>관리자</h1>
        <p style={{ color: '#8b8b96', fontSize: 13, margin: 0 }}>운영 · 신고 처리 · 위스키 등록 승인</p>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid #2e2e38', marginBottom: 24 }}>
        {TAB_LIST.map(({ key, label }) => (
          <button key={key} type="button" style={tabStyle(tab === key)} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'whiskey-requests' && <WhiskeyRequestsTab />}
      {tab === 'reports'          && <ReportsTab />}
      {tab === 'users'            && <UsersTab />}
    </WireframePage>
  );
}
