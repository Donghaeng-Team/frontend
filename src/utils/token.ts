import type { User } from '../types/auth';

// AccessToken 관리
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

// RefreshToken은 백엔드가 쿠키로 관리하므로 프론트엔드에서 저장하지 않음
// 하위 호환성을 위해 함수는 유지하되 빈 구현
export const getRefreshToken = (): string | null => {
  return null; // 쿠키는 브라우저가 자동으로 전송
};

export const setRefreshToken = (token: string): void => {
  // 쿠키로 관리되므로 아무것도 하지 않음
};

// 사용자 정보 관리
export const getUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// 로그아웃 시 모든 정보 제거
export const clearAuth = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  // refreshToken은 쿠키이므로 백엔드 로그아웃 API에서 삭제
};

// 로그인 여부 확인
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
