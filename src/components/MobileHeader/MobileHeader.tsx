import React, { useState } from 'react';
import { useLocationStore } from '../../stores/locationStore';
import { divisionApi } from '../../api/divisionApi';
import LocationModalWrapper from '../LocationModal/LocationModalWrapper';
import './MobileHeader.css';

const MobileHeader: React.FC = () => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const currentDivision = useLocationStore((state) => state.currentDivision);
  const isLoadingLocation = useLocationStore((state) => state.isLoading);

  const getLocationText = (): string => {
    if (isLoadingLocation) return '위치 확인 중...';
    if (!currentDivision) return '위치 설정';
    return divisionApi.formatDivisionShortName(currentDivision);
  };

  return (
    <>
      <header className="mobile-header">
        <button 
          className="mobile-location-button" 
          onClick={() => setIsLocationModalOpen(true)}
        >
          <span className="location-icon">📍</span>
          <span className="location-text">{getLocationText()}</span>
          <span className="location-arrow">▽</span>
        </button>
      </header>

      <LocationModalWrapper
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};

export default MobileHeader;
