import React from 'react';
import LocationModal from './LocationModal';
import type { LocationItem, SelectedLocation } from './LocationModal';
import { fetchSidoList, fetchGugunList, fetchDongList, buildDivisionCode } from '../../services/locationService';
import { useLocationStore } from '../../stores/locationStore';
import { divisionApi } from '../../api/divisionApi';
import type { Division } from '../../types';

interface LocationModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * LocationModal의 래퍼 컴포넌트
 * - LocationModal에 API 연결 로직을 주입
 * - 선택 완료 시 Zustand store 업데이트
 */
const LocationModalWrapper: React.FC<LocationModalWrapperProps> = ({ isOpen, onClose }) => {
  const setCurrentDivision = useLocationStore((state) => state.setCurrentDivision);
  const currentDivision = useLocationStore((state) => state.currentDivision);

  const handleFetchGugunList = async (sidoCode: string): Promise<LocationItem[]> => {
    return fetchGugunList(sidoCode);
  };

  const handleFetchDongList = async (sidoCode: string, gugunCode: string): Promise<LocationItem[]> => {
    return fetchDongList(sidoCode, gugunCode);
  };

  const handleConfirm = async (location: SelectedLocation) => {
    if (!location.sido || !location.gugun || !location.dong) {
      console.error('Invalid location selection');
      return;
    }

    try {
      // 행정구역 코드 생성
      const divisionId = buildDivisionCode(
        location.sido.code,
        location.gugun.code,
        location.dong.code
      );

      // API를 통해 Division 정보 가져오기
      const division = await divisionApi.getDivisionByCode({ divisionId });

      // Zustand store에 저장
      setCurrentDivision(division);

      console.log('위치 설정 완료:', division);
    } catch (error) {
      console.error('위치 설정 실패:', error);
      // 에러 처리 - 토스트 메시지 등으로 사용자에게 알림
      alert('위치 설정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // currentDivision을 LocationModal의 initialLocation으로 변환
  const initialLocation = React.useMemo((): SelectedLocation | undefined => {
    if (!currentDivision || !currentDivision.id) return undefined;

    return {
      sido: { code: currentDivision.sidoCode, name: currentDivision.sidoName },
      gugun: { code: currentDivision.sggCode, name: currentDivision.sggName },
      dong: { code: currentDivision.emdCode, name: currentDivision.emdName }
    };
  }, [currentDivision]);

  return (
    <LocationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      initialLocation={initialLocation}
      fetchSidoList={fetchSidoList}
      fetchGugunList={handleFetchGugunList}
      fetchDongList={handleFetchDongList}
    />
  );
};

export default LocationModalWrapper;
