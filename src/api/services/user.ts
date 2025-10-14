import apiClient from '../client';
import type { ApiResponse } from '../../types';
import type {
  RegisterRequest,
  EmailCheckRequest,
  NicknameCheckRequest,
  VerifyRequest,
  EmailRequestDto,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ChangeNicknameRequest,
  UserInfoRequest,
  UsersInfoRequest,
  UserInternalResponse,
} from '../../types';

/**
 * 사용자 관련 API 서비스
 */
export const userService = {
  // ===== Public API =====

  /**
   * 회원가입
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post('/api/v1/user/public/register', data);
    return response.data;
  },

  /**
   * 이메일 중복 체크
   */
  checkEmail: async (data: EmailCheckRequest): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get('/api/v1/user/public/email', {
      params: data,
    });
    return response.data;
  },

  /**
   * 닉네임 중복 체크
   */
  checkNickname: async (data: NicknameCheckRequest): Promise<unknown> => {
    const response = await apiClient.get('/api/v1/user/public/nickname', {
      params: data,
    });
    return response.data;
  },

  /**
   * 이메일/비밀번호 인증
   */
  verify: async (data: VerifyRequest): Promise<unknown> => {
    const response = await apiClient.post('/api/v1/user/public/verify', data);
    return response.data;
  },

  /**
   * 이메일 재인증 요청
   */
  reverify: async (data: EmailRequestDto): Promise<unknown> => {
    const response = await apiClient.post('/api/v1/user/public/reverify', null, {
      params: data,
    });
    return response.data;
  },

  /**
   * 비밀번호 재설정 요청
   */
  requestPasswordReset: async (data: EmailRequestDto): Promise<unknown> => {
    const response = await apiClient.post('/api/v1/user/public/password/request-reset', data);
    return response.data;
  },

  /**
   * 비밀번호 재설정 확인
   */
  confirmPasswordReset: async (data: ResetPasswordRequest): Promise<unknown> => {
    const response = await apiClient.post('/api/v1/user/public/password/confirm-reset', data);
    return response.data;
  },

  /**
   * 토큰 갱신
   */
  refresh: async (): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post('/api/v1/user/public/refresh');
    return response.data;
  },

  // ===== Private API =====

  /**
   * 내 정보 조회
   */
  getMyInfo: async (userId: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get('/api/v1/user/private/me', {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 사용자 정보 조회 (다른 사용자)
   */
  getUserInfo: async (data: UserInfoRequest): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get('/api/v1/user/private/userInfo', {
      params: data,
    });
    return response.data;
  },

  /**
   * 비밀번호 변경
   */
  changePassword: async (
    userId: number,
    data: ChangePasswordRequest
  ): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.put('/api/v1/user/private/me/password', null, {
      params: data,
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 닉네임 변경
   */
  changeNickname: async (
    userId: number,
    data: ChangeNicknameRequest
  ): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.put('/api/v1/user/private/me/nickname', null, {
      params: data,
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 로그아웃
   */
  logout: async (userId: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.delete('/api/v1/user/private/logout', {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  // ===== Internal API =====

  /**
   * 여러 사용자 정보 조회 (Internal)
   */
  getUsersInfo: async (data: UsersInfoRequest): Promise<UserInternalResponse[]> => {
    const response = await apiClient.post('/internal/v1/user/usersinfo', data);
    return response.data;
  },
};
