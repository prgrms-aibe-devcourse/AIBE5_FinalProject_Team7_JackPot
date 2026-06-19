const API_PREFIX = '/api/v1';

export const DEFAULT_PROFILE_AVATAR_COUNT = 9;
const DEFAULT_PROFILE_IMAGE_DIR = '/images/default-avatars';

/** @deprecated use getDefaultProfileImagePath */
export const DEFAULT_PROFILE_IMAGE = `${DEFAULT_PROFILE_IMAGE_DIR}/0.png`;

/**
 * DB/API imageUrl → img src
 * - http(s):// 절대 URL
 * - /api/v1/media?key=... 또는 /vite.svg 등 그대로
 * - posts/1/xxx.jpg 객체 키 → /api/v1/media?key=...
 */
export function resolveMediaUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) {
    return null;
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }

  return `${API_PREFIX}/media?key=${encodeURIComponent(trimmed)}`;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** 프로필 없을 때 userId·닉네임 등 seed로 9종 중 하나 고정 선택 */
export function getDefaultProfileImagePath(seed: string | number): string {
  const index = hashString(String(seed)) % DEFAULT_PROFILE_AVATAR_COUNT;
  return `${DEFAULT_PROFILE_IMAGE_DIR}/${index}.png`;
}

export function isDefaultProfileImageSrc(src: string): boolean {
  return src.includes(`${DEFAULT_PROFILE_IMAGE_DIR}/`);
}

/** 프로필 이미지 — 없으면 seed 기반 기본 아바타 (seed 없으면 세션마다 랜덤) */
export function resolveProfileImageUrl(
  imageUrl: string | null | undefined,
  seed?: string | number | null,
): string {
  const resolved = resolveMediaUrl(imageUrl);
  if (resolved) {
    return resolved;
  }

  if (seed != null && String(seed).trim() !== '') {
    return getDefaultProfileImagePath(seed);
  }

  const sessionKey = 'defaultAvatarSessionSeed';
  let sessionSeed = sessionStorage.getItem(sessionKey);
  if (!sessionSeed) {
    sessionSeed = String(Math.random());
    sessionStorage.setItem(sessionKey, sessionSeed);
  }
  return getDefaultProfileImagePath(sessionSeed);
}
