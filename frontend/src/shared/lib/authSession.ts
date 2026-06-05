/**
 * 로그인 세션 (localStorage, MVP)
 * - 저장: accessToken, refreshToken, userId, nickname, profileImageUrl, role
 * - 사용: apiClient Authorization 헤더
 * - 삭제: logout/탈퇴 시 clearAuthSession()
 */

// getStoredUserId
// 의도: 커뮤니티 등에서 "내 글" 판별 등 userId 필요 시 사용
export function getStoredUserId(): number | null {
  const raw = localStorage.getItem('userId');
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

// isLoggedIn
// 의도: 게스트 전용 라우트·UI 분기 (accessToken 존재 여부)
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('accessToken');
}

// 저장된 role 조회
export function getStoredRole(): string | null {
  return localStorage.getItem('role');
}

// 관리자 여부 확인
export function isAdmin(): boolean {
  return localStorage.getItem('role') === 'ADMIN';
}

// clearAuthSession
// 의도: 로그아웃·탈퇴 후 클라이언트 인증 정보 완전 제거
// 2026.06.05 준열 : 권한(role) 추가
export function clearAuthSession(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('nickname');
  localStorage.removeItem('profileImageUrl');
  localStorage.removeItem('role');
}
