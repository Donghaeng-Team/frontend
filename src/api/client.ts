import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, setAccessToken, getRefreshToken, clearAuth } from '../utils/token';

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
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // 개발 환경에서는 Vite proxy 사용
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 디버그 모드에서 요청/응답 로깅
if (import.meta.env.VITE_DEBUG === 'true') {
  apiClient.interceptors.request.use((config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      console.log('✅ API Response:', response.status, response.config.url, response.data);
      return response;
    },
    (error) => {
      console.error('❌ API Error:', error.response?.status, error.config?.url, error.response?.data);
      return Promise.reject(error);
    }
  );
}

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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

      const refreshToken = getRefreshToken();
      const accessToken = getAccessToken();

      // 테스트 토큰인 경우 재발급 시도하지 않음
      if (accessToken && accessToken.startsWith('fake-access-token-')) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      if (refreshToken) {
        try {
          // 토큰 재발급 요청
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/user/public/refresh`,
            { refreshToken }
          );

          if (response.data.success && response.data.data) {
            const { accessToken } = response.data.data;

            // 새 토큰 저장
            setAccessToken(accessToken);

            // 헤더 업데이트
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // 대기 중인 요청들 처리
            processQueue(null, accessToken);

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
      } else {
        // 리프레시 토큰이 없으면 바로 로그인 페이지로
        clearAuth();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;