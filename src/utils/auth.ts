import { getUser } from './token';
import type { AuthProvider } from '../types/auth';

/**
 * 현재 로그인한 사용자의 Provider 타입 반환
 * @returns AuthProvider | null
 */
export const getUserProvider = (): AuthProvider | null => {
  const user = getUser();
  return user?.provider ?? null;
};

/**
 * 소셜 로그인(KAKAO, GOOGLE) 사용자인지 확인
 * @returns boolean
 */
export const isSocialLoginUser = (): boolean => {
  const provider = getUserProvider();
  return provider === 'KAKAO' || provider === 'GOOGLE';
};

/**
 * 로컬 계정(LOCAL) 사용자인지 확인
 * @returns boolean
 */
export const isLocalUser = (): boolean => {
  const provider = getUserProvider();
  return provider === 'LOCAL';
};

/**
 * 비밀번호 변경 기능을 사용할 수 있는지 확인
 * 로컬 계정 사용자만 비밀번호 변경이 가능
 * @returns boolean
 */
export const canChangePassword = (): boolean => {
  return isLocalUser();
};
