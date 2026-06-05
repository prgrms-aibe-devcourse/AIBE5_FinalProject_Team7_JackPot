import { apiClient } from '@/shared/api/client';

// ── 타입 정의 ──────────────────────────────────────

export type WhiskeyRequestStatus = 'pending' | 'approved' | 'rejected';
export type ReportStatus = 'PENDING' | 'HIDDEN' | 'DISMISSED' | 'BANNED';
export type ReportAction = 'HIDE' | 'RESTORE' | 'DISMISS' | 'BAN_USER' | 'DELETE_CONTENT';

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
  reporterId: number;
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
  targetContent: string;
  actions: Array<{
    actionId: number;
    adminId: number;
    action: ReportAction;
    note: string | null;
    createdAt: string;
  }>;
}

export interface AdminUser {
  id: number;
  email: string;
  nickname: string;
  role: string;
  isDeleted: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

// ── API 함수 ──────────────────────────────────────

export const adminApi = {
  // ADM-01: 위스키 등록 요청 목록 (관리자용 전체)
  getWhiskeyRequests: (status?: WhiskeyRequestStatus, page = 0, size = 20) =>
    apiClient.get('/admin/whiskey-requests', { params: { status, page, size } }),

  // ADM-02: 위스키 등록 요청 승인/반려
  reviewWhiskeyRequest: (id: number, status: 'approved' | 'rejected') =>
    apiClient.patch(`/admin/whiskey-requests/${id}`, { status }),

  // ADM-03: 신고 목록
  getReports: (status?: ReportStatus, page = 0, size = 20) =>
    apiClient.get('/admin/reports', { params: { status, page, size } }),

  // ADM-03-1: 신고 상세
  getReportDetail: (id: number) =>
    apiClient.get(`/admin/reports/${id}`),

  // ADM-04: 신고 처리
  createReportAction: (id: number, action: ReportAction, note?: string) =>
    apiClient.post(`/admin/reports/${id}/actions`, { action, note }),

  // ADM-05: 회원 목록
  getUsers: (page = 0, size = 20) =>
    apiClient.get('/admin/users', { params: { page, size } }),

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
