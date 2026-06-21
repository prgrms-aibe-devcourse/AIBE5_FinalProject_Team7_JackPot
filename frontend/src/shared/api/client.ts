import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRedirect?: boolean;
    skipGlobalErrorRedirect?: boolean;
  }
}

/** 비로그인 조회 허용 API — 401이어도 로그인 페이지로 보내지 않음 */
const PUBLIC_READ_PATH =
  /^\/users\/\d+\/(picks|cabinet\/stats|profile)(?:\?|$)|^\/reviews(?:\?|$)/;

function isPublicReadRequest(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.replace(baseURL, '').split('?')[0];
  return PUBLIC_READ_PATH.test(path);
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10_000,
});

// 요청 시 AccessToken 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 interceptor: 401 시 RefreshToken으로 자동 재발급
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401이고 재시도 아닌 경우 → 토큰 재발급 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      // RefreshToken 없으면 로그인 유도 (타인 캐비넷 등 공개 조회는 제외)
      if (!refreshToken) {
        if (!originalRequest?.skipAuthRedirect && !isPublicReadRequest(originalRequest?.url)) {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // 이미 재발급 중이면 큐에 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        const newAccessToken = res.data.data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // RefreshToken도 만료 → 강제 로그아웃
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 401 외 에러는 백엔드 메시지 추출
    const message = error.response?.data?.error?.message ?? '요청에 실패했습니다.';

    if (error.response?.status === 403) {
      if (!originalRequest?.skipGlobalErrorRedirect) {
        const code = error.response?.data?.error?.code;
        const target = code === 'USER_BANNED' ? '/error/banned' : '/error/403';
        window.history.replaceState(null, '', target);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }

    // 500번대 서버 오류 → 에러 페이지로 이동
    if (error.response?.status >= 500) {
      if (!originalRequest?.skipGlobalErrorRedirect) {
        window.location.href = '/error/500';
      }
    }

    return Promise.reject(new Error(message));
  },
);