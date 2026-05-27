const API_PREFIX = '/api/v1';

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
