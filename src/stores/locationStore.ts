import { create } from 'zustand';
import { divisionApi } from '../api/divisionApi';
import type { Division } from '../types';

interface LocationState {
  currentDivision: Division | null;
  isLoading: boolean;
  error: string | null;
  setCurrentDivision: (division: Division) => void;
  clearDivision: () => void;
  initializeLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentDivision: null,
  isLoading: false,
  error: null,

  setCurrentDivision: (division: Division) => {
    set({ currentDivision: division, error: null });
    divisionApi.saveCurrentDivision(division);
  },

  clearDivision: () => {
    set({ currentDivision: null });
    divisionApi.clearSavedDivision();
  },

  initializeLocation: async () => {
    set({ isLoading: true, error: null });

    try {
      // 1. localStorage에서 저장된 위치 확인
      const savedDivision = divisionApi.getSavedDivision();
      if (savedDivision) {
        set({ currentDivision: savedDivision, isLoading: false });
        return;
      }

      // 2. 저장된 위치 없으면 현재 위치 가져오기
      const division = await divisionApi.getCurrentDivision();
      if (division) {
        set({ currentDivision: division });
        divisionApi.saveCurrentDivision(division);
      }
    } catch (err) {
      console.error('위치 초기화 실패:', err);
      set({ error: '위치 정보를 가져올 수 없습니다. 수동으로 설정해주세요.' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
