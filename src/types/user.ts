// 사용자 관련 타입 정의

export interface User {
  userId: number;
  email: string;
  nickName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  joinDate?: string;
  bio?: string;
  location?: string;
  phone?: string;
  preferences?: {
    notifications: {
      purchaseComplete: boolean;
      newMessage: boolean;
      deadlineAlert: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
    };
  };
}

// Internal API용 사용자 정보 (여러 사용자 조회)
export interface UserInternalResponse {
  userId: number;
  nickName: string;
  imageUrl: string | null;
}

// 여러 사용자 정보 조회 요청
export interface UsersInfoRequest {
  userIds: number[];
}

// 인증 관련
export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface DuplicationCheckResponse {
  duplication: boolean;
  message: string;
}

// 비밀번호 관련
export interface PasswordVerifyRequest {
  password: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

// 프로필 관련
export interface NicknameUpdateRequest {
  nickname: string;
}

export interface EmailVerifyRequest {
  token: string;
}

// 이메일 관련
export interface EmailCheckRequest {
  email: string;
}

export interface EmailRequestDto {
  email: string;
}

// 닉네임 관련
export interface NicknameCheckRequest {
  nickname: string;
}

export interface ChangeNicknameRequest {
  nickname: string;
}

// 인증 코드 관련
export interface VerifyRequest {
  email: string;
  code: string;
}

// 비밀번호 재설정 관련
export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// 사용자 정보 조회 관련
export interface UserInfoRequest {
  userId: number;
}
