import React, { useState, useEffect, useRef } from 'react';
import './LocationModal.css';

// 타입 정의
export interface LocationItem {
  code: string;
  name: string;
}

export interface SelectedLocation {
  sido: LocationItem | null;
  gugun: LocationItem | null;
  dong: LocationItem | null;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: SelectedLocation) => void;
  onCurrentLocation?: () => Promise<void>;
  initialLocation?: SelectedLocation;
  // API 호출 함수들을 props로 받음
  fetchSidoList: () => Promise<LocationItem[]>;
  fetchGugunList: (sidoCode: string) => Promise<LocationItem[]>;
  fetchDongList: (sidoCode: string, gugunCode: string) => Promise<LocationItem[]>;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCurrentLocation,
  initialLocation = { sido: null, gugun: null, dong: null },
  fetchSidoList,
  fetchGugunList,
  fetchDongList
}) => {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>(initialLocation);
  const [sidoList, setSidoList] = useState<LocationItem[]>([]);
  const [gugunList, setGugunList] = useState<LocationItem[]>([]);
  const [dongList, setDongList] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState({
    sido: false,
    gugun: false,
    dong: false
  });
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const selectContainerRef = useRef<HTMLDivElement>(null);

  // 시/도 목록 로드 및 외부 스크롤 제어
  useEffect(() => {
    if (isOpen) {
      // 모달 열릴 때 외부 스크롤 막기
      document.body.style.overflow = 'hidden';
      loadSidoList();
    } else {
      // 모달 닫힐 때 외부 스크롤 복원
      document.body.style.overflow = '';
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 시/도 선택 시 구/군 목록 로드
  useEffect(() => {
    if (selectedLocation.sido) {
      loadGugunList(selectedLocation.sido.code);
    } else {
      setGugunList([]);
      setDongList([]);
    }
  }, [selectedLocation.sido]);

  // 구/군 선택 시 동 목록 로드
  useEffect(() => {
    if (selectedLocation.sido && selectedLocation.gugun) {
      loadDongList(selectedLocation.sido.code, selectedLocation.gugun.code);
    } else {
      setDongList([]);
    }
  }, [selectedLocation.sido, selectedLocation.gugun]);

  const loadSidoList = async () => {
    setLoading(prev => ({ ...prev, sido: true }));
    try {
      const data = await fetchSidoList();
      setSidoList(data);
    } catch (error) {
      console.error('시/도 목록 로드 실패:', error);
      // 에러 처리 (토스트 메시지 등)
    } finally {
      setLoading(prev => ({ ...prev, sido: false }));
    }
  };

  const loadGugunList = async (sidoCode: string) => {
    setLoading(prev => ({ ...prev, gugun: true }));
    try {
      const data = await fetchGugunList(sidoCode);
      setGugunList(data);
    } catch (error) {
      console.error('구/군 목록 로드 실패:', error);
    } finally {
      setLoading(prev => ({ ...prev, gugun: false }));
    }
  };

  const loadDongList = async (sidoCode: string, gugunCode: string) => {
    setLoading(prev => ({ ...prev, dong: true }));
    try {
      const data = await fetchDongList(sidoCode, gugunCode);
      setDongList(data);
    } catch (error) {
      console.error('동 목록 로드 실패:', error);
    } finally {
      setLoading(prev => ({ ...prev, dong: false }));
    }
  };

  const handleSidoSelect = (sido: LocationItem) => {
    setSelectedLocation({
      sido,
      gugun: null,
      dong: null
    });
    // 모바일에서 자동으로 다음 레벨(구/군)로 스크롤
    setTimeout(() => scrollToColumn(1), 300);
  };

  const handleGugunSelect = (gugun: LocationItem) => {
    setSelectedLocation(prev => ({
      ...prev,
      gugun,
      dong: null
    }));
    // 모바일에서 자동으로 다음 레벨(동)로 스크롤
    setTimeout(() => scrollToColumn(2), 300);
  };

  const handleDongSelect = (dong: LocationItem) => {
    setSelectedLocation(prev => ({
      ...prev,
      dong
    }));
  };

  const handleConfirm = () => {
    if (selectedLocation.sido && selectedLocation.gugun && selectedLocation.dong) {
      onConfirm(selectedLocation);
      // onClose()는 Wrapper의 handleConfirm에서 처리
    }
  };

  const handleCurrentLocation = async () => {
    if (!onCurrentLocation) return;

    setLoadingCurrentLocation(true);
    try {
      await onCurrentLocation();
      onClose();
    } catch (error) {
      console.error('현재 위치 가져오기 실패:', error);
      alert('현재 위치를 가져올 수 없습니다.');
    } finally {
      setLoadingCurrentLocation(false);
    }
  };

  const getLocationPath = () => {
    const parts = [];
    if (selectedLocation.sido) parts.push(selectedLocation.sido.name);
    if (selectedLocation.gugun) parts.push(selectedLocation.gugun.name);
    if (selectedLocation.dong) parts.push(selectedLocation.dong.name);
    return parts.join(' ➔ ');
  };

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (selectContainerRef.current) {
      const scrollLeft = selectContainerRef.current.scrollLeft;
      const columnWidth = selectContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / columnWidth);
      setCurrentColumnIndex(newIndex);
    }
  };

  // 특정 컬럼으로 스크롤
  const scrollToColumn = (index: number) => {
    if (selectContainerRef.current) {
      selectContainerRef.current.scrollTo({
        left: index * selectContainerRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="location-modal-header">
          <h2 className="location-modal-title">📍 지역 선택</h2>
          <button className="location-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 선택 경로 표시 */}
        <div className="location-path-container">
          <span className="location-path">
            {getLocationPath() || '지역을 선택해주세요'}
          </span>
        </div>

        {/* 선택 영역 */}
        <div className="location-select-container" ref={selectContainerRef} onScroll={handleScroll}>
          {/* 시/도 선택 */}
          <div className="location-column">
            <div className="location-column-header">
              <span>시/도</span>
            </div>
            <div className="location-column-content">
              {loading.sido ? (
                <div className="location-loading">
                  <span className="loading-spinner"></span>
                  로딩 중...
                </div>
              ) : (
                sidoList.map((sido) => (
                  <div
                    key={sido.code}
                    className={`location-item ${
                      selectedLocation.sido?.code === sido.code ? 'selected' : ''
                    }`}
                    onClick={() => handleSidoSelect(sido)}
                  >
                    {sido.name}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 구/군 선택 */}
          <div className="location-column">
            <div className="location-column-header">
              <span>구/군</span>
            </div>
            <div className="location-column-content">
              {!selectedLocation.sido ? (
                <div className="location-placeholder">
                  시/도를 먼저 선택해주세요
                </div>
              ) : loading.gugun ? (
                <div className="location-loading">
                  <span className="loading-spinner"></span>
                  로딩 중...
                </div>
              ) : gugunList.length === 0 ? (
                <div className="location-placeholder">
                  데이터가 없습니다
                </div>
              ) : (
                gugunList.map((gugun) => (
                  <div
                    key={gugun.code}
                    className={`location-item ${
                      selectedLocation.gugun?.code === gugun.code ? 'selected' : ''
                    }`}
                    onClick={() => handleGugunSelect(gugun)}
                  >
                    {gugun.name}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 동/읍/면 선택 */}
          <div className="location-column">
            <div className="location-column-header">
              <span>동/읍/면</span>
            </div>
            <div className="location-column-content">
              {!selectedLocation.gugun ? (
                <div className="location-placeholder">
                  구/군을 먼저 선택해주세요
                </div>
              ) : loading.dong ? (
                <div className="location-loading">
                  <span className="loading-spinner"></span>
                  로딩 중...
                </div>
              ) : dongList.length === 0 ? (
                <div className="location-placeholder">
                  데이터가 없습니다
                </div>
              ) : (
                dongList.map((dong) => (
                  <div
                    key={dong.code}
                    className={`location-item ${
                      selectedLocation.dong?.code === dong.code ? 'selected' : ''
                    }`}
                    onClick={() => handleDongSelect(dong)}
                  >
                    {dong.name}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 인디케이터 dots (모바일 전용) */}
        <div className="location-indicators">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              className={`indicator-dot ${currentColumnIndex === i ? 'active' : ''}`}
              onClick={() => scrollToColumn(i)}
              aria-label={`${['시/도', '구/군', '동/읍/면'][i]} 선택으로 이동`}
            />
          ))}
        </div>

        {/* 하단 버튼 영역 */}
        <div className="location-modal-footer">
          {onCurrentLocation && (
            <button
              className="location-btn-current"
              onClick={handleCurrentLocation}
              disabled={loadingCurrentLocation}
            >
              {loadingCurrentLocation ? '위치 확인 중...' : '📍 현재 위치'}
            </button>
          )}
          <button
            className="location-btn-confirm"
            onClick={handleConfirm}
            disabled={!selectedLocation.sido || !selectedLocation.gugun || !selectedLocation.dong}
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;