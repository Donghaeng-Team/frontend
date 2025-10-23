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
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // 현재 위치 가져오기 (타임아웃 5초)
  useEffect(() => {
    let timeoutId: number;

    const initializeLocation = async () => {
      if (navigator.geolocation) {
        // 5초 타임아웃 설정
        timeoutId = setTimeout(() => {
          console.warn('위치 가져오기 타임아웃, 기본 위치 사용');
          setCurrentAddress('서울특별시 중구 태평로1가');
          setIsLoadingLocation(false);
          if (onLocationChange) {
            onLocationChange({ 
              lat: initialCenter.lat, 
              lng: initialCenter.lng, 
              address: '서울특별시 중구 태평로1가' 
            });
          }
        }, 5000);

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            clearTimeout(timeoutId);
            const newCenter = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCenter(newCenter);
            await reverseGeocode(newCenter.lat, newCenter.lng);
            setIsLoadingLocation(false);
          },
          async (error) => {
            clearTimeout(timeoutId);
            console.error('위치 정보를 가져올 수 없습니다:', error);
            setCurrentAddress('서울특별시 중구 태평로1가');
            setIsLoadingLocation(false);
            if (onLocationChange) {
              onLocationChange({ 
                lat: initialCenter.lat, 
                lng: initialCenter.lng, 
                address: '서울특별시 중구 태평로1가' 
              });
            }
          },
          {
            timeout: 5000,
            maximumAge: 0,
            enableHighAccuracy: false // 빠른 응답을 위해 정확도 낮춤
          }
        );
      } else {
        console.error('Geolocation을 지원하지 않는 브라우저입니다.');
        setCurrentAddress('서울특별시 중구 태평로1가');
        setIsLoadingLocation(false);
        if (onLocationChange) {
          onLocationChange({ 
            lat: initialCenter.lat, 
            lng: initialCenter.lng, 
            address: '서울특별시 중구 태평로1가' 
          });
        }
      }
    };

    initializeLocation();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Reverse Geocoding: 좌표 → 주소
  const reverseGeocode = async (lat: number, lng: number) => {
    console.log('🗺️ reverseGeocode 호출:', { lat, lng });

    // 좌표는 항상 부모 컴포넌트로 전달 (Geocoding 실패해도 좌표는 업데이트)
    const fallbackAddress = `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ko`
      );
      const data = await response.json();
      console.log('🗺️ Google API 응답:', data);

      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        console.log('✅ 주소 변환 성공:', address);
        setCurrentAddress(address);

        if (onLocationChange) {
          console.log('✅ onLocationChange 호출 (주소 포함):', { lat, lng, address });
          onLocationChange({ lat, lng, address });
        }
      } else {
        console.warn('⚠️ Google API 결과 없음:', data);
        setCurrentAddress(fallbackAddress);

        // Geocoding 실패해도 좌표는 전달
        if (onLocationChange) {
          console.log('✅ onLocationChange 호출 (좌표만):', { lat, lng, address: fallbackAddress });
          onLocationChange({ lat, lng, address: fallbackAddress });
        }
      }
    } catch (error) {
      console.error('❌ Reverse Geocoding 실패:', error);
      setCurrentAddress(fallbackAddress);

      // 에러 발생해도 좌표는 전달
      if (onLocationChange) {
        console.log('✅ onLocationChange 호출 (에러 후 좌표):', { lat, lng, address: fallbackAddress });
        onLocationChange({ lat, lng, address: fallbackAddress });
      }
    }
  };

  // 지도 중심이 변경될 때 호출
  const handleCenterChanged = useCallback((event: any) => {
    console.log('🗺️ handleCenterChanged 이벤트 발생:', event);
    const map = event.map;
    if (map) {
      const newCenter = map.getCenter();
      if (newCenter) {
        const lat = newCenter.lat();
        const lng = newCenter.lng();
        console.log('🗺️ 지도 중심 변경됨:', { lat, lng });
        setCenter({ lat, lng });
        reverseGeocode(lat, lng);
      } else {
        console.warn('⚠️ newCenter가 null입니다');
      }
    } else {
      console.warn('⚠️ map이 null입니다');
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
        <span className="address-text">
          {isLoadingLocation ? '위치를 가져오는 중...' : currentAddress}
        </span>
      </div>
    </div>
  );
};

export default GoogleMap;
