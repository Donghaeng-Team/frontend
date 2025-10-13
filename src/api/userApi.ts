import apiClient from './client';
import type {
  User,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  DuplicationCheckResponse,
  PasswordVerifyRequest,
  PasswordChangeRequest,
  NicknameUpdateRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  EmailVerifyRequest,
  ApiResponse
} from '../types';

class UserApi {
  // 사용자 생성 (회원가입)
  async register(data: RegisterRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.post('/api/v1/user/public/register', data);
    return response.data;
  }

  // 로그인 (이메일)
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post('/api/v1/user/public/login', data);

    // 로그인 성공 시 토큰 저장
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userInfo', JSON.stringify(user));
    }

    return response.data;
  }

  // OAuth 로그인 (카카오)
  async loginWithKakao(): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post('/api/v1/user/public/oauth/kakao');

    // OAuth 로그인 성공 시 토큰 저장
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userInfo', JSON.stringify(user));
    }

    return response.data;
  }

  // 로그아웃
  async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.delete('/api/v1/user/private/logout');

    // 로그아웃 시 로컬 토큰 삭제
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');

    return response.data;
  }

  // 토큰 재발급
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const refreshToken = localStorage.getItem('refreshToken');

    const response = await apiClient.post('/api/v1/user/public/refresh', {}, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });

    // 토큰 재발급 성공 시 새 토큰 저장
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return response.data;
  }

  // 이메일 인증
  async verifyEmail(data: EmailVerifyRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.post('/api/v1/user/public/verify', data);
    return response.data;
  }

  // 이메일 인증 재실행
  async resendEmailVerification(email: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post('/api/v1/user/public/reverify', { email });
    return response.data;
  }

  // 비밀번호 초기화 요청
  async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.post('/api/v1/user/public/password/request-reset', data);
    return response.data;
  }

  // 비밀번호 초기화 확인
  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.put('/api/v1/user/public/password/confirm-reset', data);
    return response.data;
  }

  // 비밀번호 확인
  async verifyPassword(data: PasswordVerifyRequest): Promise<ApiResponse<boolean>> {
    const response = await apiClient.post('/api/v1/users/private/me/verify-password', data);
    return response.data;
  }

  // 비밀번호 변경
  async changePassword(data: PasswordChangeRequest): Promise<ApiResponse<null>> {
    const response = await apiClient.put('/api/v1/users/private/me/password', data);
    return response.data;
  }

  // 이메일 중복 체크
  async checkEmailDuplication(email: string): Promise<ApiResponse<DuplicationCheckResponse>> {
    const response = await apiClient.get('/api/v1/user/public/email', {
      params: { email }
    });
    return response.data;
  }

  // 닉네임 중복 체크
  async checkNicknameDuplication(nickname: string): Promise<ApiResponse<DuplicationCheckResponse>> {
    const response = await apiClient.get('/api/v1/user/public/nickname', {
      params: { nickname }
    });
    return response.data;
  }

  // 로그인 사용자 정보 조회
  async getMyProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/api/v1/user/private/me');
    return response.data;
  }

  // 닉네임 수정
  async updateNickname(data: NicknameUpdateRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.put('/api/v1/user/private/me/nickname', data);

    // 닉네임 업데이트 성공 시 로컬 사용자 정보도 업데이트
    if (response.data.success && response.data.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data.data));
    }

    return response.data;
  }

  // 프로필 이미지 수정
  async updateAvatar(imageFile: File): Promise<ApiResponse<User>> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.put('/api/v1/user/private/me/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // 프로필 이미지 업데이트 성공 시 로컬 사용자 정보도 업데이트
    if (response.data.success && response.data.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data.data));
    }

    return response.data;
  }

  // 회원 탈퇴
  async deleteAccount(): Promise<ApiResponse<null>> {
    const response = await apiClient.delete('/api/v1/user/private/me');

    // 회원 탈퇴 성공 시 모든 로컬 데이터 삭제
    if (response.data.success) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    }

    return response.data;
  }

  // 특정 사용자 정보 조회
  async getUserInfo(userId: number): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/api/v1/user/private/userInfo', {
      params: { userId }
    });
    return response.data;
  }

  // 사용자 목록 조회 (상세 조건 확인 필요)
  async getUsersList(params?: any): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get('/api/v1/user/private/usersInfo', { params });
    return response.data;
  }

  // 현재 로그인 상태 확인
  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // 로컬 저장된 사용자 정보 가져오기
  getCurrentUser(): User | null {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // 로컬 토큰 가져오기
  getAccessToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export const userApi = new UserApi();
export default userApi;