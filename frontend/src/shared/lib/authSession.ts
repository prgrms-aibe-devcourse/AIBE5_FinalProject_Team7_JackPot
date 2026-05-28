/** localStorage 기반 로그인 세션 (MVP) */

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
