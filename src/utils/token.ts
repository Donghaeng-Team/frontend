import type { User } from '../types/auth';

// AccessToken 관리
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

// RefreshToken 관리
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refreshToken', token);
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
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// 로그인 여부 확인
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
