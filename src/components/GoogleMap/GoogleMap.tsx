import React, { useEffect, useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import './GoogleMap.css';

interface GoogleMapProps {
  onLocationChange?: (location: { lat: number; lng: number; address: string }) => void;
  initialCenter?: { lat: number; lng: number };
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  onLocationChange,
  initialCenter = { lat: 37.5665, lng: 126.9780 } // 서울시청 기본값
}) => {
  const [center, setCenter] = useState(initialCenter);
  const [currentAddress, setCurrentAddress] = useState('위치를 가져오는 중...');
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(newCenter);
          reverseGeocode(newCenter.lat, newCenter.lng);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          setCurrentAddress('서울특별시 중구 태평로1가');
          reverseGeocode(initialCenter.lat, initialCenter.lng);
        }
      );
    } else {
      console.error('Geolocation을 지원하지 않는 브라우저입니다.');
      setCurrentAddress('서울특별시 중구 태평로1가');
      reverseGeocode(initialCenter.lat, initialCenter.lng);
    }
  }, []);

  // Reverse Geocoding: 좌표 → 주소
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ko`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setCurrentAddress(address);

        if (onLocationChange) {
          onLocationChange({ lat, lng, address });
        }
      }
    } catch (error) {
      console.error('Reverse Geocoding 실패:', error);
      setCurrentAddress('주소를 가져올 수 없습니다');
    }
  };

  // 지도 중심이 변경될 때 호출
  const handleCenterChanged = useCallback((event: any) => {
    const map = event.map;
    if (map) {
      const newCenter = map.getCenter();
      if (newCenter) {
        const lat = newCenter.lat();
        const lng = newCenter.lng();
        setCenter({ lat, lng });
        reverseGeocode(lat, lng);
      }
    }
  }, []);

  if (!apiKey) {
    return (
      <div className="google-map-error">
        Google Maps API 키가 설정되지 않았습니다.
        <br />
        .env 파일에 VITE_GOOGLE_MAPS_API_KEY를 추가해주세요.
      </div>
    );
  }

  return (
    <div className="google-map-container">
      <APIProvider apiKey={apiKey}>
        <div className="map-wrapper">
          <Map
            defaultCenter={center}
            defaultZoom={15}
            gestureHandling="greedy"
            disableDefaultUI={false}
            onDragend={handleCenterChanged}
            mapId="product-register-map"
            style={{ width: '100%', height: '100%' }}
          >
            {/* 고정 마커 (지도 중앙) */}
            <div className="center-marker">
              <div className="marker-pin">📍</div>
            </div>
          </Map>
        </div>
      </APIProvider>

      {/* 현재 주소 표시 */}
      <div className="current-address">
        <span className="address-icon">📍</span>
        <span className="address-text">{currentAddress}</span>
      </div>
    </div>
  );
};

export default GoogleMap;
