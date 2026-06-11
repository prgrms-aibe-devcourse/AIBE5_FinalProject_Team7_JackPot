import { apiClient } from '@/shared/api/client';

// ── 타입 정의 ──────────────────────────────────────

export type WhiskeyRequestStatus = 'pending' | 'approved' | 'rejected';
export type ReportStatus = 'PENDING' | 'HIDDEN' | 'DISMISSED' | 'BANNED' | 'RESTORED';
export type ReportAction = 'HIDE' | 'RESTORE' | 'DISMISS' | 'DELETE_CONTENT';

export interface WhiskeyRequest {
  requestId: number;
  requesterNickName: string;
  description: Record<string, unknown>;
  status: WhiskeyRequestStatus;
  reviewedByNickName: string | null;
  createdAt: string;
}

export interface Report {
  reportId: number;
  reporterId: number | null;
  reporterNickname: string;
  targetId: number;
  targetType: 'POST' | 'COMMENT';
  reason: 'SPAM' | 'OBSCENE' | 'ILLEGAL' | 'ABUSE' | 'OTHER';
  detail: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDetail extends Report {
  postId: number | null;    // 댓글 신고 시 원본 게시글 ID
  targetContent: string;
  actions: Array<{
    actionId: number;
    adminId: number;
    action: ReportAction;
    note: string | null;
    createdAt: string;
  }>;
}

// 백엔드 AdminUserDto와 1:1 매핑
export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  nickname: string;
  birthday: string | null;       // "YYYY-MM-DD"
  role: string;                  // "USER" | "ADMIN" | "PRO"
  isDeleted: boolean;
  isBanned: boolean;
  bannedAt: string | null;       // ISO datetime
  lastLoginAt: string | null;    // ISO datetime
  createdAt: string;
  isNewUser: boolean;            // 온보딩 미완료 여부
}

// ── API 함수 ──────────────────────────────────────

export const adminApi = {
  // ADM-01: 위스키 등록 요청 목록 (관리자용 전체)
  getWhiskeyRequests: (status?: WhiskeyRequestStatus, page = 0, size = 10) =>
    apiClient.get('/admin/whiskey-requests', { params: { status, page, size } }),

  // ADM-02: 위스키 등록 요청 승인/반려
  reviewWhiskeyRequest: (id: number, status: 'approved' | 'rejected') =>
    apiClient.patch(`/admin/whiskey-requests/${id}`, { status }),

  // ADM-03: 신고 목록 조회 (status 필터링)
  getReports: (status?: ReportStatus, page = 0, size = 10) =>
    apiClient.get('/admin/reports', { params: { status, page, size } }),

  // ADM-03-1: 신고 상세
  getReportDetail: (id: number) =>
    apiClient.get(`/admin/reports/${id}`),

  // ADM-04: 신고 처리
  createReportAction: (id: number, action: ReportAction, note?: string) =>
    apiClient.post(`/admin/reports/${id}/actions`, { action, note }),

  // ADM-USR-01: 회원 목록 (검색 / 필터 / 페이징)
  getUsers: (keyword?: string, filter?: string, page = 0, size = 10) =>
    apiClient.get('/admin/users', { params: { keyword, filter, page, size } }),

  // ADM-USR-02: 권한 변경
  updateUserRole: (id: number, role: string) =>
    apiClient.patch(`/admin/users/${id}/role`, { role }),

  // ADM-USR-03: 밴 처리
  banUser: (id: number) =>
    apiClient.patch(`/admin/users/${id}/ban`),

  // ADM-USR-04: 밴 해제
  unbanUser: (id: number) =>
    apiClient.patch(`/admin/users/${id}/unban`),

  // RPT-01: 신고 생성 (사용자용)
  createReport: (body: {
    targetId: number;
    targetType: 'POST' | 'COMMENT';
    reason: string;
    detail: string | null;
  }) =>
    apiClient.post('/reports', body),

  // WH-05: 위스키 등록 요청 생성 (사용자용)
  createWhiskeyRequest: (description: Record<string, unknown>) =>
    apiClient.post('/whiskey-requests', { description }),

  // WH-02: 내 등록 요청 목록 (사용자용)
  getMyWhiskeyRequests: (status?: WhiskeyRequestStatus, page = 0, size = 20) =>
    apiClient.get('/whiskey-requests', { params: { status, page, size } }),

  // WH-03: 내 등록 요청 상세 (사용자용)
  getMyWhiskeyRequest: (requestId: number) =>
    apiClient.get(`/whiskey-requests/${requestId}`),
};
