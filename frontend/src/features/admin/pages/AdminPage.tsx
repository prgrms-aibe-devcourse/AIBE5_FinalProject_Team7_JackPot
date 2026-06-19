import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import '../admin.css';

type AdminTabKey = 'whiskey-requests' | 'reports' | 'users';

const REQUEST_STATUS_LABEL: Record<WhiskeyRequestStatus, string> = {
  pending: '대기중',
  approved: '승인됨',
  rejected: '반려됨',
};

const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: '검토 대기',
  HIDDEN: '숨김',
  DISMISSED: '기각',
  BANNED: '제재 완료',
  RESTORED: '복구됨',
};

const ACTION_LABEL: Record<ReportAction, string> = {
  HIDE: '숨김',
  RESTORE: '복구',
  DISMISS: '기각',
  DELETE_CONTENT: '콘텐츠 삭제',
};

const REASON_LABEL_KO: Record<string, string> = {
  SPAM: '스팸',
  OBSCENE: '음란물',
  ILLEGAL: '불법 정보',
  ABUSE: '욕설/혐오',
  OTHER: '기타',
};

function getWhiskeyName(description: Record<string, unknown>) {
  const name = description.name;
  return typeof name === 'string' && name.trim() ? name : '위스키명 없음';
}

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
    const ok = await confirmToast({
      message: `이 요청을 ${label}할까요?`,
      confirmLabel: label,
      danger: action === 'rejected',
    });
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
      <div className="wf-admin-filters" role="tablist" aria-label="요청 상태">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={filter === s}
            className={`wf-admin-filter${filter === s ? ' wf-admin-filter--active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? '전체' : REQUEST_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="wf-admin-loading">불러오는 중…</p>
      ) : requests.length === 0 ? (
        <p className="wf-admin-empty">요청이 없습니다.</p>
      ) : (
        <div className="wf-admin-list">
          {requests.map((req) => {
            const isOpen = expanded === req.requestId;
            return (
              <div key={req.requestId}>
                <div className={`wf-admin-row${isOpen ? ' wf-admin-row--open' : ''}`}>
                  <span className={`wf-admin-status wf-admin-status--${req.status}`}>
                    {REQUEST_STATUS_LABEL[req.status]}
                  </span>
                  <div className="wf-admin-row__main">
                    <p className="wf-admin-row__title">{getWhiskeyName(req.description)}</p>
                    <p className="wf-admin-row__meta">
                      요청자 {req.requesterNickName} · {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="wf-admin-row__actions">
                    <button
                      type="button"
                      className="wf-admin-btn"
                      onClick={() => setExpanded(isOpen ? null : req.requestId)}
                    >
                      {isOpen ? '접기' : '상세'}
                    </button>
                    {req.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          className="wf-admin-btn wf-admin-btn--primary"
                          onClick={() => handleReview(req.requestId, 'approved')}
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          className="wf-admin-btn wf-admin-btn--danger"
                          onClick={() => handleReview(req.requestId, 'rejected')}
                        >
                          반려
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <div className="wf-admin-detail">
                    <pre className="wf-admin-pre">{JSON.stringify(req.description, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="wf-admin-pagination">
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  );
}

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
      <div className="wf-admin-filters" role="tablist" aria-label="신고 상태">
        {(['all', 'PENDING', 'HIDDEN', 'DISMISSED', 'RESTORED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={filter === s}
            className={`wf-admin-filter${filter === s ? ' wf-admin-filter--active' : ''}`}
            onClick={() => setFilter(s as ReportStatus | 'all')}
          >
            {s === 'all' ? '전체' : REPORT_STATUS_LABEL[s as ReportStatus]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="wf-admin-loading">불러오는 중…</p>
      ) : reports.length === 0 ? (
        <p className="wf-admin-empty">신고가 없습니다.</p>
      ) : (
        <div className="wf-admin-list">
          {reports.map((report) => {
            const isOpen = selectedId === report.reportId;
            const targetLink = getTargetLink(report);
            return (
              <div key={report.reportId}>
                <div
                  role="button"
                  tabIndex={0}
                  className={`wf-admin-row wf-admin-row--clickable${isOpen ? ' wf-admin-row--open' : ''}`}
                  onClick={() => handleSelectReport(report)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectReport(report); }}
                >
                  <span className={`wf-admin-status wf-admin-status--${report.status}`}>
                    {REPORT_STATUS_LABEL[report.status]}
                  </span>
                  <span className="wf-admin-status wf-admin-status--muted">{report.targetType}</span>
                  <div className="wf-admin-row__main">
                    <p className="wf-admin-row__title">
                      {REASON_LABEL_KO[report.reason] ?? report.reason} 신고
                    </p>
                    {report.detail && (
                      <p className="wf-admin-row__meta wf-admin-row__meta--truncate">{report.detail}</p>
                    )}
                    <p className="wf-admin-row__meta">
                      신고자 {report.reporterNickname} · {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  {targetLink && (
                    <Link
                      to={targetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="wf-admin-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      원문 보기
                    </Link>
                  )}
                  <span className="wf-admin-chevron">{isOpen ? '접기' : '상세'}</span>
                </div>

                {isOpen && (
                  <div className="wf-admin-detail">
                    {detailLoading ? (
                      <p className="wf-admin-loading">불러오는 중…</p>
                    ) : selectedReport ? (
                      <div className="wf-admin-detail__stack">
                        <div className="wf-admin-detail__grid">
                          <div>
                            <p className="wf-admin-field__label">신고 사유</p>
                            <p className="wf-admin-field__value wf-admin-field__value--strong">
                              {REASON_LABEL_KO[selectedReport.reason]}
                            </p>
                            {selectedReport.detail && (
                              <p className="wf-admin-field__value wf-admin-field__value--muted wf-admin-field__value--mt">
                                {selectedReport.detail}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="wf-admin-field__label">신고 일시</p>
                            <p className="wf-admin-field__value">
                              {new Date(selectedReport.createdAt).toLocaleString('ko-KR')}
                            </p>
                            {selectedReport.targetType === 'COMMENT' && (
                              <div className="wf-admin-mt-lg">
                                <span className="wf-admin-field__value wf-admin-field__value--muted wf-admin-field__value--sm">
                                  댓글 #{selectedReport.targetId}
                                </span>
                                {selectedReport.postId ? (
                                  <Link
                                    to={`/community/posts/${selectedReport.postId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="wf-admin-link wf-admin-link--spaced"
                                  >
                                    원본 게시글
                                  </Link>
                                ) : (
                                  <span className="wf-admin-field__value wf-admin-field__value--muted wf-admin-field__value--xs wf-admin-field__value--mt">
                                    게시글 삭제됨
                                  </span>
                                )}
                              </div>
                            )}
                            {selectedReport.targetType === 'POST' && (
                              <Link
                                to={`/community/posts/${selectedReport.targetId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="wf-admin-link wf-admin-link--spaced-lg"
                              >
                                게시글 보기
                              </Link>
                            )}
                          </div>
                        </div>

                        {selectedReport.actions?.length > 0 && (
                          <div>
                            <p className="wf-admin-field__label">처리 이력</p>
                            <div className="wf-admin-history">
                              {selectedReport.actions.map((a) => (
                                <div key={a.actionId} className="wf-admin-history__item">
                                  <div>
                                    <span className="wf-admin-history__action">
                                      {ACTION_LABEL[a.action as ReportAction] ?? a.action}
                                    </span>
                                    {a.note && <span className="wf-admin-history__note">{a.note}</span>}
                                  </div>
                                  <span className="wf-admin-history__date">
                                    {new Date(a.createdAt).toLocaleString('ko-KR')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedReport.status === 'PENDING' && (
                          <div className="wf-admin-panel-divider">
                            <p className="wf-admin-field__label">처리하기</p>
                            <textarea
                              className="wf-admin-textarea"
                              placeholder="처리 메모 (선택)"
                              value={actionNote}
                              onChange={(e) => setActionNote(e.target.value)}
                              rows={2}
                            />
                            <div className="wf-admin-action-row">
                              <button type="button" disabled={processing} className="wf-admin-btn" onClick={() => handleAction('DISMISS')}>
                                기각
                              </button>
                              <button type="button" disabled={processing} className="wf-admin-btn wf-admin-btn--warn" onClick={() => handleAction('HIDE')}>
                                숨김
                              </button>
                              <button type="button" disabled={processing} className="wf-admin-btn wf-admin-btn--danger" onClick={() => handleAction('DELETE_CONTENT')}>
                                삭제
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedReport.status === 'HIDDEN' && (
                          <div className="wf-admin-panel-divider">
                            <p className="wf-admin-field__label">처리하기</p>
                            <textarea
                              className="wf-admin-textarea"
                              placeholder="처리 메모 (선택)"
                              value={actionNote}
                              onChange={(e) => setActionNote(e.target.value)}
                              rows={2}
                            />
                            <button type="button" disabled={processing} className="wf-admin-btn wf-admin-btn--primary" onClick={() => handleAction('RESTORE')}>
                              복구
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="wf-admin-pagination">
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  );
}

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
      message: `${user.nickname} 계정을 이용 제한할까요?`,
      confirmLabel: '제한',
      danger: true,
    });
    if (!ok) return;
    try {
      await adminApi.banUser(user.id);
      toast('이용 제한 처리되었습니다.', 'success');
      load(keyword, filter, page);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : '밴 처리에 실패했습니다.', 'error');
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
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : '밴 해제에 실패했습니다.', 'error');
    }
  };

  const formatLastLogin = (dt: string | null) => {
    if (!dt) return '없음';
    return new Date(dt).toLocaleString('ko-KR');
  };

  const roleStatusClass = (role: string) => {
    const key = role?.toUpperCase();
    if (key === 'ADMIN') return 'wf-admin-status--role-admin';
    if (key === 'PRO') return 'wf-admin-status--role-pro';
    return 'wf-admin-status--role-user';
  };

  return (
    <div>
      <div className="wf-admin-search-bar">
        <div className="wf-admin-search">
          <input
            type="text"
            className="wf-admin-search__input"
            placeholder="이메일 또는 닉네임 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="wf-admin-search__btn" onClick={handleSearch}>
            검색
          </button>
        </div>
        <div className="wf-admin-filters wf-admin-filters--compact">
          {([
            { value: 'all', label: '전체' },
            { value: 'banned', label: '이용 제한' },
            { value: 'deleted', label: '탈퇴' },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`wf-admin-filter${filter === value ? ' wf-admin-filter--active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="wf-admin-loading">불러오는 중…</p>
      ) : users.length === 0 ? (
        <p className="wf-admin-empty">회원이 없습니다.</p>
      ) : (
        <div className="wf-admin-list">
          {users.map((user) => (
            <article
              key={user.id}
              className={`wf-admin-user-card${user.isBanned ? ' wf-admin-user-card--banned' : ''}`}
            >
              <div className="wf-admin-user-card__head">
                <p className="wf-admin-user-card__name">
                  {user.nickname}
                  {user.name && (
                    <span className="wf-admin-user-card__realname"> ({user.name})</span>
                  )}
                </p>
                {user.isNewUser && (
                  <span className="wf-admin-status wf-admin-status--onboarding">온보딩 미완료</span>
                )}
                <span className={`wf-admin-status ${roleStatusClass(user.role)}`}>{user.role}</span>
                {user.isBanned && <span className="wf-admin-status wf-admin-status--rejected">이용 제한</span>}
                {user.isDeleted && <span className="wf-admin-status wf-admin-status--deleted">탈퇴</span>}

                {!user.isDeleted && (
                  <div className="wf-admin-user-card__actions">
                    {user.role !== 'PRO' && (
                      <div
                        className="wf-admin-role-toggle"
                        onClick={() => handleRoleChange(user)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRoleChange(user); }}
                        role="button"
                        tabIndex={0}
                        title={`${user.role === 'ADMIN' ? 'USER' : 'ADMIN'}으로 변경`}
                      >
                        <span className={`wf-admin-role-toggle__opt${user.role === 'USER' ? ' wf-admin-role-toggle__opt--on-user' : ''}`}>
                          USER
                        </span>
                        <span className={`wf-admin-role-toggle__opt${user.role === 'ADMIN' ? ' wf-admin-role-toggle__opt--on' : ''}`}>
                          ADMIN
                        </span>
                      </div>
                    )}
                    {user.isBanned ? (
                      <button type="button" className="wf-admin-btn wf-admin-btn--success" onClick={() => handleUnban(user)}>
                        제한 해제
                      </button>
                    ) : (
                      <button type="button" className="wf-admin-btn wf-admin-btn--danger" onClick={() => handleBan(user)}>
                        이용 제한
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="wf-admin-user-meta">
                <div>
                  <span className="wf-admin-user-meta__label">이메일 </span>
                  <span className="wf-admin-user-meta__value">{user.email ?? '-'}</span>
                </div>
                <div>
                  <span className="wf-admin-user-meta__label">생년월일 </span>
                  <span className="wf-admin-user-meta__value">{user.birthday ?? '-'}</span>
                </div>
                <div>
                  <span className="wf-admin-user-meta__label">마지막 로그인 </span>
                  <span className="wf-admin-user-meta__value">{formatLastLogin(user.lastLoginAt)}</span>
                </div>
                <div>
                  <span className="wf-admin-user-meta__label">가입일 </span>
                  <span className="wf-admin-user-meta__value">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                {user.isBanned && user.bannedAt && (
                  <div>
                    <span className="wf-admin-user-meta__label wf-admin-field__value--danger">제한 일시 </span>
                    <span className="wf-admin-field__value--danger">
                      {new Date(user.bannedAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="wf-admin-pagination">
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  );
}

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
    { key: 'whiskey-requests', label: '위스키 등록 요청' },
    { key: 'reports', label: '신고 관리' },
    { key: 'users', label: '회원 관리' },
  ];

  return (
    <WireframePage scroll>
      <div className="wf-admin-page">
        <header className="wf-admin-intro">
          <p className="wf-admin-intro__eyebrow">운영</p>
          <h1 className="wf-admin-intro__title">관리자</h1>
          <p className="wf-admin-intro__subtitle">등록 요청 승인, 신고 처리, 회원 관리</p>
        </header>

        <nav className="wf-admin-tabs" aria-label="관리자 메뉴">
          {TAB_LIST.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`wf-admin-tab${tab === key ? ' wf-admin-tab--active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'whiskey-requests' && <WhiskeyRequestsTab />}
        {tab === 'reports' && <ReportsTab />}
        {tab === 'users' && <UsersTab />}
      </div>
    </WireframePage>
  );
}
