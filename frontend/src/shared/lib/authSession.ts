/**
 * localStorage 기반 로그인 세션 (MVP)
 *
 * 로그인/소셜 callback 성공 시 저장: accessToken, refreshToken, userId, nickname, profileImageUrl
 * apiClient가 accessToken을 Authorization 헤더에 사용.
 * 로그아웃·탈퇴 시 clearAuthSession() 호출.
 */

export function getStoredUserId(): number | null {
  const raw = localStorage.getItem('userId');
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('accessToken');
}

export function clearAuthSession(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('nickname');
  localStorage.removeItem('profileImageUrl');
}
