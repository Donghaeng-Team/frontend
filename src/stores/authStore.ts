import { create } from 'zustand';
import { authService } from '../api/services/auth';
import type { User } from '../types/auth';
import { getAccessToken, getUser, clearAuth } from '../utils/token';

interface AuthState {
  // 상태
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;

  // 액션
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (user: User) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // 초기 상태
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,

  // 로그인
  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      const response = await authService.login({ email, password });

      if (response.success) {
        // 토큰과 사용자 정보는 authService에서 자동으로 저장됨
        set({
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      // 401 Unauthorized인 경우 사용자 친화적인 메시지로 변환
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      if (error.response?.status === 401) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // 회원가입
  register: async (email: string, password: string, nickname: string) => {
    try {
      set({ loading: true, error: null });

      const response = await authService.register({
        email,
        password,
        passwordConfirm: password,
        nickname,
      });

      if (response.success) {
        // 회원가입 성공 - 이메일 인증이 필요하므로 자동 로그인하지 않음
        set({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error: any) {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || '회원가입 중 오류가 발생했습니다.',
      });
      throw error;
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await authService.logout();
      // authService.logout()에서 clearAuth()를 호출함
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
      // 에러가 발생해도 로컬의 인증 정보는 제거
      clearAuth();
    } finally {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      // 메인 페이지로 리다이렉트
      window.location.href = '/';
    }
  },

  // 프로필 새로고침
  refreshProfile: async () => {
    try {
      const response = await authService.getProfile();

      if (response.success) {
        set({
          user: response.data,
        });
      }
    } catch (error) {
      console.error('프로필 새로고침 실패:', error);
    }
  },

  // 프로필 업데이트 (로컬 상태만)
  updateProfile: (user: User) => {
    set({
      isAuthenticated: true,
      user,
    });
  },

  // 에러 초기화
  clearError: () => {
    set({ error: null });
  },

  // 인증 초기화 (앱 시작 시 호출)
  initializeAuth: async () => {
    const token = getAccessToken();
    const savedUser = getUser(); // localStorage에서 사용자 정보 먼저 가져오기

    if (token) {
      // localStorage에 사용자 정보가 있으면 먼저 설정 (빠른 UI 업데이트)
      if (savedUser) {
        set({
          isAuthenticated: true,
          user: savedUser,
          loading: false,
          error: null,
        });
        if (import.meta.env.DEV) {
          console.log('✅ localStorage에서 사용자 정보 복원:', savedUser);
        }
      }

      // 테스트 토큰인 경우 API 호출 건너뛰기
      if (token.startsWith('fake-access-token-')) {
        if (savedUser) {
          return;
        }
      }

      try {
        const response = await authService.getProfile();

        if (response.success) {
          // getProfile 응답과 localStorage 데이터 병합 (userId 유지)
          const mergedUser = {
            ...response.data,
            // getProfile에 userId가 없으면 localStorage의 userId 사용
            userId: response.data.userId || savedUser?.userId
          };

          set({
            isAuthenticated: true,
            user: mergedUser,
            loading: false,
            error: null,
          });
        } else {
          // API 호출 실패 시, localStorage에 사용자 정보가 있으면 유지
          if (!savedUser) {
            clearAuth();
            set({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        // 401 등 인증 오류 발생 시, localStorage에 사용자 정보가 있으면 유지
        if (import.meta.env.DEV) {
          console.warn('인증 초기화 실패 (토큰 만료 또는 유효하지 않음)');
        }
        if (!savedUser) {
          clearAuth();
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          });
        }
      }
    } else {
      // 토큰이 없으면 로그인되지 않은 상태로 설정
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  },
}));
