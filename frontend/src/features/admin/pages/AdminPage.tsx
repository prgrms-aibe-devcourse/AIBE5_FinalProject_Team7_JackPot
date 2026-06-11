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
  PENDING: '#c9a227', HIDDEN: '#f87171', DISMISSED: '#8b8b96', BANNED: '#ff4d4d', RESTORED: '#4ade80',
};
const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: '검토 대기', HIDDEN: '숨김', DISMISSED: '기각', BANNED: '제재 완료', RESTORED: '복구됨',
};
const ACTION_LABEL: Record<ReportAction, string> = {
  HIDE: '숨김', RESTORE: '복구', DISMISS: '기각', DELETE_CONTENT: '콘텐츠 삭제',
};
const REASON_LABEL_KO: Record<string, string> = {
  SPAM: '스팸', OBSCENE: '음란물', ILLEGAL: '불법 정보', ABUSE: '욕설/혐오', OTHER: '기타',
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

  useEffect(() => { setPage(0); setExpanded(null); load(filter, 0); }, [filter]);
  useEffect(() => { load(filter, page); }, [page]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#16161c', border: '1px solid #2e2e38', borderRadius: 10, marginBottom: 8 }}>
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
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  const load = async (status: ReportStatus | 'all', p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.getReports(status === 'all' ? undefined : status, p, PAGE_SIZE);
      const data = res.data.data;
      setReports(data?.content ?? data ?? []);
      setTotalPages(data?.totalPages ?? 1);
    } catch {
      toast('신고 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(0); setSelectedReport(null); setSelectedId(null); load(filter, 0); }, [filter]);
  useEffect(() => { load(filter, page); }, [page]);

  const handleSelectReport = async (report: Report) => {
    if (selectedId === report.reportId) {
      setSelectedId(null);
      setSelectedReport(null);
      return;
    }
    setSelectedId(report.reportId);
    setSelectedReport(null);
    setActionNote('');
    setDetailLoading(true);
    try {
      const res = await adminApi.getReportDetail(report.reportId);
      setSelectedReport(res.data.data);
    } catch {
      toast('신고 상세를 불러오지 못했습니다.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAction = async (action: ReportAction) => {
    if (!selectedReport) return;
    const ok = await confirmToast({
      message: `'${ACTION_LABEL[action]}' 처리를 진행할까요?`,
      confirmLabel: ACTION_LABEL[action],
      danger: action === 'DELETE_CONTENT',
    });
    if (!ok) return;
    setProcessing(true);
    try {
      await adminApi.createReportAction(selectedReport.reportId, action, actionNote || undefined);
      toast(`${ACTION_LABEL[action]} 처리되었습니다.`, 'success');
      setSelectedReport(null);
      setSelectedId(null);
      setActionNote('');
      load(filter, page);
    } catch {
      toast('처리에 실패했습니다.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const getTargetLink = (report: Report | ReportDetail) =>
    report.targetType === 'POST' ? `/community/posts/${report.targetId}` : null;

  return (
    <div>
      {/* 필터 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'PENDING', 'HIDDEN', 'DISMISSED', 'RESTORED'] as const).map((s) => (
          <button key={s} type="button" style={filterBtnStyle(filter === s)} onClick={() => setFilter(s as ReportStatus | 'all')}>
            {s === 'all' ? '전체' : REPORT_STATUS_LABEL[s as ReportStatus]}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#8b8b96' }}>불러오는 중...</p>
      ) : reports.length === 0 ? (
        <p style={{ color: '#8b8b96' }}>신고가 없습니다.</p>
      ) : reports.map((report) => {
        const isOpen = selectedId === report.reportId;
        const targetLink = getTargetLink(report);
        return (
          <div key={report.reportId} style={{ marginBottom: 8 }}>
            <div
              onClick={() => handleSelectReport(report)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                background: isOpen ? 'rgba(201,162,39,0.06)' : '#16161c',
                border: `1px solid ${isOpen ? '#c9a227' : '#2e2e38'}`,
                borderRadius: isOpen ? '10px 10px 0 0' : 10,
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}
            >
              <span style={badgeStyle(REPORT_STATUS_COLOR[report.status])}>{REPORT_STATUS_LABEL[report.status]}</span>
              <span style={badgeStyle('#8b8b96')}>{report.targetType}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#ececf0', fontSize: 13, fontWeight: 600, margin: 0 }}>
                  {REASON_LABEL_KO[report.reason] ?? report.reason} 신고
                </p>
                {report.detail && (
                  <p style={{ color: '#8b8b96', fontSize: 12, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {report.detail}
                  </p>
                )}
                <p style={{ color: '#666', fontSize: 11, margin: '2px 0 0' }}>
                  신고자 {report.reporterNickname} · {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              {targetLink && (
                <a href={targetLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                  style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #2e2e38', color: '#8b8b96', fontSize: 11, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  원문 보기 ↗
                </a>
              )}
              <span style={{ color: isOpen ? '#c9a227' : '#8b8b96', fontSize: 12, flexShrink: 0 }}>
                {isOpen ? '▲ 접기' : '▼ 상세'}
              </span>
            </div>

            {isOpen && (
              <div style={{ background: '#1a1a22', border: '1px solid #c9a227', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 16 }}>
                {detailLoading ? (
                  <p style={{ color: '#8b8b96', fontSize: 13 }}>불러오는 중...</p>
                ) : selectedReport ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <p style={{ color: '#8b8b96', fontSize: 11, margin: '0 0 4px' }}>신고 사유</p>
                        <p style={{ color: '#ececf0', fontSize: 13, margin: 0, fontWeight: 600 }}>{REASON_LABEL_KO[selectedReport.reason]}</p>
                        {selectedReport.detail && <p style={{ color: '#8b8b96', fontSize: 12, margin: '4px 0 0', lineHeight: 1.5 }}>{selectedReport.detail}</p>}
                      </div>
                      <div>
                        <p style={{ color: '#8b8b96', fontSize: 11, margin: '0 0 4px' }}>신고 일시</p>
                        <p style={{ color: '#ececf0', fontSize: 13, margin: 0 }}>{new Date(selectedReport.createdAt).toLocaleString()}</p>
                        {selectedReport.targetType === 'COMMENT' && (
                          <div style={{ marginTop: 8 }}>
                            <span style={{ color: '#8b8b96', fontSize: 11 }}>댓글 ID #{selectedReport.targetId}</span>
                            {selectedReport.postId ? (
                              <a href={`/community/posts/${selectedReport.postId}`} target="_blank" rel="noreferrer"
                                style={{ display: 'block', marginTop: 4, color: '#c9a227', fontSize: 12 }}>원본 게시글 보기 ↗</a>
                            ) : (
                              <span style={{ display: 'block', marginTop: 4, color: '#666', fontSize: 11 }}>(게시글 삭제됨)</span>
                            )}
                          </div>
                        )}
                        {selectedReport.targetType === 'POST' && (
                          <a href={`/community/posts/${selectedReport.targetId}`} target="_blank" rel="noreferrer"
                            style={{ display: 'block', marginTop: 8, color: '#c9a227', fontSize: 12 }}>게시글 보기 ↗</a>
                        )}
                      </div>
                    </div>

                    {selectedReport.actions?.length > 0 && (
                      <div>
                        <p style={{ color: '#8b8b96', fontSize: 11, margin: '0 0 8px' }}>처리 이력</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {selectedReport.actions.map((a) => (
                            <div key={a.actionId} style={{ padding: '8px 12px', background: '#16161c', border: '1px solid #2e2e38', borderRadius: 8, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                              <div>
                                <span style={{ color: '#c9a227', fontWeight: 600 }}>{ACTION_LABEL[a.action as ReportAction] ?? a.action}</span>
                                {a.note && <span style={{ color: '#8b8b96', marginLeft: 8 }}>{a.note}</span>}
                              </div>
                              <span style={{ color: '#666', flexShrink: 0 }}>{new Date(a.createdAt).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReport.status === 'PENDING' && (
                      <div style={{ borderTop: '1px solid #2e2e38', paddingTop: 14 }}>
                        <p style={{ color: '#8b8b96', fontSize: 11, margin: '0 0 8px' }}>처리하기</p>
                        <textarea placeholder="처리 메모 (선택)" value={actionNote} onChange={(e) => setActionNote(e.target.value)} rows={2}
                          style={{ width: '100%', background: '#16161c', border: '1px solid #2e2e38', borderRadius: 8, padding: '8px 12px', color: '#ececf0', fontSize: 13, resize: 'none', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" disabled={processing} style={btnStyle('ghost')} onClick={() => handleAction('DISMISS')}>✓ 기각</button>
                          <button type="button" disabled={processing} style={{ ...btnStyle('ghost'), borderColor: '#f87171', color: '#f87171' }} onClick={() => handleAction('HIDE')}>🙈 숨김</button>
                          <button type="button" disabled={processing} style={btnStyle('danger')} onClick={() => handleAction('DELETE_CONTENT')}>🗑 삭제</button>
                        </div>
                      </div>
                    )}

                    {selectedReport.status === 'HIDDEN' && (
                      <div style={{ borderTop: '1px solid #2e2e38', paddingTop: 14 }}>
                        <p style={{ color: '#8b8b96', fontSize: 11, margin: '0 0 8px' }}>처리하기</p>
                        <textarea placeholder="처리 메모 (선택)" value={actionNote} onChange={(e) => setActionNote(e.target.value)} rows={2}
                          style={{ width: '100%', background: '#16161c', border: '1px solid #2e2e38', borderRadius: 8, padding: '8px 12px', color: '#ececf0', fontSize: 13, resize: 'none', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
                        <button type="button" disabled={processing} style={btnStyle('primary')} onClick={() => handleAction('RESTORE')}>↩ 복구</button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

// ── 회원 관리 탭 ─────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  const load = async (kw: string, f: string, p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(kw || undefined, f === 'all' ? undefined : f, p, PAGE_SIZE);
      const data = res.data.data;
      setUsers(data?.content ?? data ?? []);
      setTotalPages(data?.totalPages ?? 1);
    } catch {
      toast('회원 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(0); load(keyword, filter, 0); }, [filter]);
  useEffect(() => { load(keyword, filter, page); }, [page]);

  const handleSearch = () => { setPage(0); load(keyword, filter, 0); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  const handleRoleChange = async (user: AdminUser) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const ok = await confirmToast({
      message: `${user.nickname}의 권한을 ${newRole}로 변경할까요?`,
      confirmLabel: '변경',
      danger: false,
    });
    if (!ok) return;
    try {
      await adminApi.updateUserRole(user.id, newRole);
      toast(`권한이 ${newRole}로 변경되었습니다.`, 'success');
      load(keyword, filter, page);
    } catch {
      toast('권한 변경에 실패했습니다.', 'error');
    }
  };

  const handleBan = async (user: AdminUser) => {
    const ok = await confirmToast({
      message: `${user.nickname} 계정을 이용 제한(밴)할까요?`,
      confirmLabel: '밴',
      danger: true,
    });
    if (!ok) return;
    try {
      await adminApi.banUser(user.id);
      toast('이용 제한 처리되었습니다.', 'success');
      load(keyword, filter, page);
    } catch (err: any) {
      toast(err?.message ?? '밴 처리에 실패했습니다.', 'error');
    }
  };

  const handleUnban = async (user: AdminUser) => {
    const ok = await confirmToast({
      message: `${user.nickname} 계정의 이용 제한을 해제할까요?`,
      confirmLabel: '해제',
      danger: false,
    });
    if (!ok) return;
    try {
      await adminApi.unbanUser(user.id);
      toast('이용 제한이 해제되었습니다.', 'success');
      load(keyword, filter, page);
    } catch (err: any) {
      toast(err?.message ?? '밴 해제에 실패했습니다.', 'error');
    }
  };

  const formatLastLogin = (dt: string | null) => {
    if (!dt) return '없음';
    const d = new Date(dt);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const ROLE_COLOR: Record<string, string> = { USER: '#8b8b96', ADMIN: '#c9a227', PRO: '#4ade80' };

  return (
    <div>
      {/* 검색 + 필터 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flex: 1, minWidth: 220 }}>
          <input
            type="text"
            placeholder="이메일 또는 닉네임 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, background: '#16161c', border: '1px solid #2e2e38',
              borderRight: 'none', borderRadius: '8px 0 0 8px',
              padding: '7px 14px', color: '#ececf0', fontSize: 14, outline: 'none',
            }}
          />
          <button type="button" onClick={handleSearch} style={{
            padding: '7px 16px', background: '#c9a227', border: 'none',
            borderRadius: '0 8px 8px 0', color: '#0c0c0f', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            검색
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            { value: 'all',     label: '전체' },
            { value: 'banned',  label: '🚫 밴' },
            { value: 'deleted', label: '🗑 탈퇴' },
          ] as const).map(({ value, label }) => (
            <button key={value} type="button" style={filterBtnStyle(filter === value)} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <p style={{ color: '#8b8b96' }}>불러오는 중...</p>
      ) : users.length === 0 ? (
        <p style={{ color: '#8b8b96' }}>회원이 없습니다.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map((user) => (
            <div key={user.id} style={{
              background: '#16161c',
              border: `1px solid ${user.isBanned ? '#f8717144' : '#2e2e38'}`,
              borderRadius: 10, padding: '16px 18px',
            }}>
              {/* 1행 — 닉네임 + 뱃지 + 버튼 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>

                {/* 닉네임 */}
                <p style={{ color: '#ececf0', fontSize: 16, fontWeight: 700, margin: 0, marginRight: 4 }}>
                  {user.nickname}
                  {user.name && (
                    <span style={{ color: '#8b8b96', fontWeight: 400, marginLeft: 6, fontSize: 13 }}>
                      ({user.name})
                    </span>
                  )}
                </p>

                {/* 온보딩 미완료 뱃지 — 권한 앞 */}
                {user.isNewUser && (
                  <span style={badgeStyle('#a78bfa')}>온보딩 미완료</span>
                )}

                {/* 권한 뱃지 */}
                <span style={badgeStyle(ROLE_COLOR[user.role?.toUpperCase()] ?? '#8b8b96')}>
                  {user.role}
                </span>

                {/* 밴 뱃지 */}
                {user.isBanned && <span style={badgeStyle('#f87171')}>이용 제한</span>}

                {/* 탈퇴 뱃지 */}
                {user.isDeleted && <span style={badgeStyle('#555')}>탈퇴</span>}

                {/* 액션 버튼 영역 */}
                {!user.isDeleted && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

                    {/* 권한 토글 — PRO 제외 */}
                    {user.role !== 'PRO' && (
                      <div
                        onClick={() => handleRoleChange(user)}
                        title={`${user.role === 'ADMIN' ? 'USER' : 'ADMIN'}으로 변경`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 0,
                          background: '#0c0c14', border: '1px solid #2e2e38',
                          borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                        }}
                      >
                        {/* USER 쪽 */}
                        <span style={{
                          padding: '5px 12px', fontSize: 12, fontWeight: 700,
                          background: user.role === 'USER' ? '#8b8b9633' : 'transparent',
                          color: user.role === 'USER' ? '#ececf0' : '#555',
                          borderRight: '1px solid #2e2e38',
                          transition: 'all 0.15s',
                        }}>USER</span>
                        {/* ADMIN 쪽 */}
                        <span style={{
                          padding: '5px 12px', fontSize: 12, fontWeight: 700,
                          background: user.role === 'ADMIN' ? '#c9a22733' : 'transparent',
                          color: user.role === 'ADMIN' ? '#c9a227' : '#555',
                          transition: 'all 0.15s',
                        }}>ADMIN</span>
                      </div>
                    )}

                    {/* 밴 / 밴 해제 버튼 */}
                    {user.isBanned ? (
                      <button type="button" onClick={() => handleUnban(user)} style={{
                        padding: '5px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', border: '1px solid #4ade8044',
                        background: '#4ade8011', color: '#4ade80',
                      }}>밴 해제</button>
                    ) : (
                      <button type="button" onClick={() => handleBan(user)} style={{
                        padding: '5px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', border: '1px solid #f8717144',
                        background: '#f8717111', color: '#f87171',
                      }}>이용 제한</button>
                    )}
                  </div>
                )}
              </div>

              {/* 2행 — 상세 정보 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px 20px' }}>
                <div>
                  <span style={{ color: '#8b8b96', fontSize: 12 }}>이메일 </span>
                  <span style={{ color: '#ececf0', fontSize: 13 }}>{user.email ?? '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#8b8b96', fontSize: 12 }}>생년월일 </span>
                  <span style={{ color: '#ececf0', fontSize: 13 }}>{user.birthday ?? '-'}</span>
                </div>
                <div>
                  <span style={{ color: '#8b8b96', fontSize: 12 }}>마지막 로그인 </span>
                  <span style={{ color: '#ececf0', fontSize: 13 }}>{formatLastLogin(user.lastLoginAt)}</span>
                </div>
                <div>
                  <span style={{ color: '#8b8b96', fontSize: 12 }}>가입일 </span>
                  <span style={{ color: '#ececf0', fontSize: 13 }}>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {user.isBanned && user.bannedAt && (
                  <div>
                    <span style={{ color: '#f87171', fontSize: 12 }}>제한 일시 </span>
                    <span style={{ color: '#f87171', fontSize: 13 }}>{new Date(user.bannedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  );
}

// ── 메인 AdminPage ───────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<AdminTabKey>('whiskey-requests');
  const navigate = useNavigate();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
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
