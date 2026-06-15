/** WhiskeyNote API 공통 래퍼 — API명세서_v2 §1.1 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

export interface PageData<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  hasNext: boolean;
}

export function unwrapApiData<T>(payload: ApiResponse<T>): T {
  if (!payload.success || payload.data == null) {
    throw new Error(payload.error?.message ?? 'API request failed');
  }
  return payload.data;
}

export function unwrapApiVoid(payload: ApiResponse<unknown>): void {
  if (!payload.success) {
    throw new Error(payload.error?.message ?? 'API request failed');
  }
}
