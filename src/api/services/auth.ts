import apiClient from '../client';
import type { ApiResponse } from '../../types';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
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
    const response = await apiClient.post<ApiResponse<null>>('/api/v1/user/public/login', data);
    
    console.log('로그인 응답:', response.data);
    console.log('응답 헤더:', response.headers);
    
    // 백엔드가 토큰을 헤더로 전달함
    const accessToken = response.headers['authorization']?.replace('Bearer ', '');
    // refreshToken은 쿠키로 전달되므로 브라우저가 자동 관리
    
    if (!accessToken) {
      throw new Error('로그인 응답에 토큰이 없습니다.');
    }
    
    // AccessToken 저장
    setAccessToken(accessToken);
    
    // 사용자 정보는 별도 API로 조회
    const userResponse = await apiClient.get<ApiResponse<User>>('/api/v1/user/private/me');
    const user = userResponse.data.data;
    
    if (!user) {
      throw new Error('사용자 정보를 가져올 수 없습니다.');
    }
    
    setUser(user);
    
    // LoginResponse 형태로 반환 (호환성 유지)
    return {
      success: true,
      message: '로그인 성공',
      data: {
        accessToken,
        refreshToken: '', // 쿠키로 관리되므로 빈 문자열
        user
      }
    };
  },

  // 회원가입 (이메일 인증 필요)
  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>('/api/v1/user/public/register', data);
    
    console.log('회원가입 응답:', response.data);
    
    // 회원가입 성공 시 이메일 인증이 필요하므로 자동 로그인하지 않음
    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete('/api/v1/user/private/logout');

    // 로컬 스토리지에서 인증 정보 제거
    clearAuth();

    return response.data;
  },

  // 토큰 갱신
  refreshToken: async (): Promise<ApiResponse<RefreshTokenResponse>> => {
    // 백엔드가 쿠키에서 refresh token을 자동으로 읽으므로 요청 body는 비어있음
    const response = await apiClient.post<ApiResponse<null>>('/api/v1/user/public/refresh', {});
    
    // 백엔드가 새 accessToken을 헤더로 전달
    const accessToken = response.headers['authorization']?.replace('Bearer ', '');
    
    if (!accessToken) {
      throw new Error('토큰 갱신 응답에 액세스 토큰이 없습니다.');
    }
    
    // 새로운 AccessToken 저장
    setAccessToken(accessToken);

    return {
      success: true,
      message: '토큰 갱신 성공',
      data: { accessToken }
    };
  },

  // 내 정보 조회
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/api/v1/user/private/me');
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