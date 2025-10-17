// 로그인 Provider 타입
export type AuthProvider = 'LOCAL' | 'KAKAO' | 'GOOGLE';

// 인증 타입 (이메일 인증, 비밀번호 재설정)
export type VerifyType = 'EMAIL' | 'PASSWORD';

// 사용자 정보
export interface User {
  userId?: number; // User API 호출 시 필요
  email: string;
  nickName: string;
  avatarUrl: string | null;
  provider: AuthProvider;
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 로그인 응답
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// 회원가입 요청
export interface SignUpRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  nickName: string;
}

// 회원가입 요청 (Swagger 기반)
export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
}

// 회원가입 응답 (이메일 인증 필요)
export interface RegisterResponse {
  message: string;
}

// Token 갱신 응답
export interface RefreshTokenResponse {
  accessToken: string;
}

// 이메일 요청
export interface EmailRequestDto {
  email: string;
}

// 이메일 중복 체크 요청
export interface EmailCheckRequest {
  email: string;
}

// 닉네임 중복 체크 요청
export interface NicknameCheckRequest {
  nickname: string;
}

// 이메일/비밀번호 인증 요청
export interface VerifyRequest {
  email: string;
  token: string;
  type: VerifyType;
}

// 비밀번호 재설정 요청
export interface ResetPasswordRequest {
  email: string;
  token: string;
  type: VerifyType;
  password: string;
  passwordConfirm: string;
}

// 비밀번호 변경 요청
export interface ChangePasswordRequest {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}

// 닉네임 변경 요청
export interface ChangeNicknameRequest {
  nickname: string;
}

// 사용자 정보 조회 요청
export interface UserInfoRequest {
  userId: number;
}
