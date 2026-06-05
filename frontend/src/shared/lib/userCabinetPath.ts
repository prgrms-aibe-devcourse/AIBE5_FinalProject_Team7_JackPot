import { PATHS } from '@/app/router/paths';
import { getStoredUserId } from '@/shared/lib/authSession';

/** 본인 → /cabinet, 타인 → /user/:userId (Bar 탭 기본) */
export function userCabinetPath(userId: number, currentUserId?: number | null): string {
  const me = currentUserId ?? getStoredUserId();
  if (me != null && userId === me) {
    return PATHS.CABINET;
  }
  return `${PATHS.USER_PROFILE.replace(':userId', String(userId))}?section=bar&tab=pick`;
}
