// 로그인 Provider 타입
export type AuthProvider = 'LOCAL' | 'KAKAO' | 'GOOGLE';

// 사용자 정보
export interface User {
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

// Token 갱신 응답
export interface RefreshTokenResponse {
  accessToken: string;
}
