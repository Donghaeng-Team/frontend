import apiClient from '../client';
import type { ApiResponse } from '../../types';
import type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  RefreshTokenResponse,
  User
} from '../../types/auth';
import {
  setAccessToken,
  setRefreshToken,
  setUser,
  clearAuth,
  getRefreshToken
} from '../../utils/token';

// 기존 타입 (하위 호환성 유지)
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// 인증 API 서비스
export const authService = {
  // 로그인
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data.data;

    // 토큰과 사용자 정보 저장
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);

    return response.data;
  },

  // 회원가입
  register: async (data: SignUpRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data);
    const { accessToken, refreshToken, user } = response.data.data;

    // 회원가입 후 자동 로그인 처리
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);

    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/logout');

    // 로컬 스토리지에서 인증 정보 제거
    clearAuth();

    return response.data;
  },

  // 토큰 갱신
  refreshToken: async (): Promise<ApiResponse<RefreshTokenResponse>> => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', { refreshToken });
    const { accessToken } = response.data.data;

    // 새로운 AccessToken 저장
    setAccessToken(accessToken);

    return response.data;
  },

  // 내 정보 조회
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // 비밀번호 변경
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.put('/auth/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async (email: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/password-reset-request', { email });
    return response.data;
  },

  // 비밀번호 재설정
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/password-reset', { token, newPassword });
    return response.data;
  },

  // 이메일 인증 요청
  requestEmailVerification: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/email-verification-request');
    return response.data;
  },

  // 이메일 인증 확인
  verifyEmail: async (token: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/email-verification', { token });
    return response.data;
  },
};