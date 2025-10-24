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
    const response = await apiClient.post<ApiResponse<User>>('/api/v1/user/public/login', data);
    
    console.log('로그인 응답:', response.data);
    console.log('응답 헤더:', response.headers);
    
    // 백엔드가 토큰을 헤더로 전달 (Axios는 헤더를 소문자로 정규화)
    const accessToken = (response.headers['authorization'] || response.headers['Authorization'])?.replace('Bearer ', '');
    // refreshToken은 쿠키로 전달되므로 브라우저가 자동 관리
    
    if (!accessToken) {
      throw new Error('로그인 응답에 토큰이 없습니다.');
    }
    
    // AccessToken 먼저 저장
    setAccessToken(accessToken);
    
    // 사용자 정보는 응답 body에 포함되지만, userId가 없을 수 있으므로
    // /api/v1/user/private/me를 호출하여 완전한 사용자 정보 가져오기
    let user = response.data.data;
    
    if (!user) {
      throw new Error('사용자 정보를 가져올 수 없습니다.');
    }
    
    // userId가 없으면 JWT 토큰에서 추출 시도
    if (!user.userId && accessToken) {
      try {
        // JWT 토큰 디코딩 (payload 부분)
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('🔍 JWT payload:', tokenPayload);
        
        // JWT에서 userId 찾기 (sub 필드에 있을 가능성이 높음)
        if (tokenPayload.sub) {
          user.userId = parseInt(tokenPayload.sub, 10);
          console.log('✅ JWT sub에서 userId 추출:', user.userId);
        } else if (tokenPayload.userId) {
          user.userId = tokenPayload.userId;
          console.log('✅ JWT에서 userId 추출:', user.userId);
        } else if (tokenPayload.id) {
          user.userId = tokenPayload.id;
          console.log('✅ JWT id에서 userId 추출:', user.userId);
        }
      } catch (jwtError) {
        console.error('❌ JWT 디코딩 실패:', jwtError);
      }
    }
    
    // 여전히 userId가 없으면 getProfile API 호출
    if (!user.userId) {
      console.log('⚠️ JWT에도 userId 없음, getProfile API 호출');
      try {
        const profileResponse = await apiClient.get<ApiResponse<User>>('/api/v1/user/private/me');
        if (profileResponse.data.success && profileResponse.data.data) {
          const profileUser = profileResponse.data.data;
          user = { ...user, ...profileUser };
          console.log('✅ 완전한 사용자 정보:', user);
        }
      } catch (profileError) {
        console.error('❌ 프로필 정보 조회 실패:', profileError);
      }
    }
    
    // 사용자 정보 저장
    setUser(user);
    
    // LoginResponse 형태로 반환 (호환성 유지)
    return {
      success: true,
      message: '로그인 성공',
      data: {
        accessToken,
        refreshToken: '', // 쿠키로 관리되므로 빈 문자열
        user
      },
      timestamp: new Date().toISOString()
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
      data: { accessToken },
      timestamp: new Date().toISOString()
    };
  },

  // 내 정보 조회
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/api/v1/user/private/me');
    console.log('🔍 getProfile RAW API Response:', response.data);
    console.log('🔍 getProfile User Data:', response.data.data);
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