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

  // 현재 선택된 시/도 코드를 추적하기 위한 ref
  const [currentSidoCode, setCurrentSidoCode] = React.useState<string>('');

  const handleFetchGugunList = async (sidoCode: string): Promise<LocationItem[]> => {
    setCurrentSidoCode(sidoCode);
    return fetchGugunList(sidoCode);
  };

  const handleFetchDongList = async (gugunCode: string): Promise<LocationItem[]> => {
    if (!currentSidoCode) {
      console.error('Sido code is not set');
      return [];
    }
    return fetchDongList(currentSidoCode, gugunCode);
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
  const getInitialLocation = (): SelectedLocation | undefined => {
    if (!currentDivision || !currentDivision.id) return undefined;

    // Division의 id는 10자리 행정구역 코드 (예: "1115051000")
    // 앞 2자리: 시/도, 3-5자리: 구/군, 6-8자리: 동/읍/면
    const sidoCode = currentDivision.sidoCode;
    const sggCode = currentDivision.sggCode;
    const emdCode = currentDivision.emdCode;

    return {
      sido: { code: sidoCode, name: currentDivision.sidoName },
      gugun: { code: sggCode, name: currentDivision.sggName },
      dong: { code: emdCode, name: currentDivision.emdName }
    };
  };

  return (
    <LocationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      initialLocation={getInitialLocation()}
      fetchSidoList={fetchSidoList}
      fetchGugunList={handleFetchGugunList}
      fetchDongList={handleFetchDongList}
    />
  );
};

export default LocationModalWrapper;
