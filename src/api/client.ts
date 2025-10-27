import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, setAccessToken, getRefreshToken, clearAuth, getUser } from '../utils/token';

// 토큰 재발급 중인지 추적
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// API 클라이언트 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  // 개발: http://localhost:8080 (Docker 백엔드 직접 호출)
  // 프로덕션: https://bytogether.net
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000, // 기본값을 30초로 증가
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송 활성화 (refresh token용)
});

// 디버그 모드 로깅 제거 (필요시 VITE_DEBUG=true로 활성화)

// 요청 인터셉터: 토큰 및 사용자 ID 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    const user = getUser();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // X-User-Id 헤더 추가 (백엔드 Market/Cart API 요구사항)
    if (user?.userId && config.headers) {
      config.headers['X-User-Id'] = user.userId.toString();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리 및 토큰 재발급
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 로그인/회원가입 API는 401 인터셉터에서 제외
    const isAuthEndpoint = originalRequest.url?.includes('/api/v1/user/public/login') || 
                          originalRequest.url?.includes('/api/v1/user/public/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // 이미 토큰 재발급 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const accessToken = getAccessToken();

      // 테스트 토큰인 경우 재발급 시도하지 않음
      if (accessToken && accessToken.startsWith('fake-access-token-')) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // 토큰 재발급 요청 (백엔드가 쿠키에서 refresh token을 읽음)
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/v1/user/public/refresh`,
          {},
          { withCredentials: true } // 쿠키 전송 활성화
        );

        // 백엔드가 헤더로 새 accessToken을 전달
        const newAccessToken = response.headers['authorization']?.replace('Bearer ', '');

        if (newAccessToken) {
          // 새 토큰 저장
          setAccessToken(newAccessToken);

          // 헤더 업데이트
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 대기 중인 요청들 처리
          processQueue(null, newAccessToken);

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 재발급 실패
        processQueue(refreshError, null);

        // 모든 토큰 삭제 및 로그인 페이지로 리다이렉트
        clearAuth();
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;