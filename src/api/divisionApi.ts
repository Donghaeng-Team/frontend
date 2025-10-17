import apiClient from './client';
import type {
  Division,
  DivisionByCoordRequest,
  DivisionListByCoordRequest,
  DivisionByCodeRequest,
  DivisionListByCodeRequest,
  NearbyDivisionByCodeRequest,
  NearbyDivisionByCoordRequest,
  ApiResponse
} from '../types';

class DivisionApi {
  // 읍면동 검색 (좌표로) - 공개 API
  async getDivisionByCoord(data: DivisionByCoordRequest): Promise<Division> {
    // GET 요청이므로 쿼리 파라미터로 평탄화하여 전달
    const response = await apiClient.get('/api/v1/division/public/by-coord', {
      params: {
        latitude: data.coordinate.latitude,
        longitude: data.coordinate.longitude
      }
    });
    return response.data;
  }

  // 읍면동 리스트 검색 (좌표로) - 내부 API (인증 필요)
  async getDivisionListByCoord(data: DivisionListByCoordRequest): Promise<(Division | null)[]> {
    const response = await apiClient.post('/internal/v1/division/list/by-coord', data);
    return response.data;
  }

  // 읍면동 검색 (읍면동 코드로) - 내부 API (인증 필요)
  async getDivisionByCode(params: DivisionByCodeRequest): Promise<Division> {
    const response = await apiClient.get('/internal/v1/division/by-code', {
      params
    });
    return response.data;
  }

  // 읍면동 리스트 검색 (읍면동 코드로) - 내부 API (인증 필요)
  async getDivisionListByCode(data: DivisionListByCodeRequest): Promise<(Division | null)[]> {
    const response = await apiClient.post('/internal/v1/division/list/by-code', data);
    return response.data;
  }

  // 인접동 검색 (읍면동 코드로) - 내부 API (인증 필요)
  async getNearbyDivisionsByCode(params: NearbyDivisionByCodeRequest): Promise<Division[]> {
    const response = await apiClient.get('/internal/v1/division/near/by-code', {
      params
    });
    return response.data;
  }

  // 인접동 검색 (좌표로) - 내부 API (인증 필요)
  async getNearbyDivisionsByCoord(data: NearbyDivisionByCoordRequest): Promise<Division[]> {
    const response = await apiClient.post('/internal/v1/division/near/by-coord', data);
    return response.data;
  }

  // 편의 메서드들

  // 현재 위치 기반 읍면동 정보 가져오기
  async getCurrentDivision(): Promise<Division | null> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const division = await this.getDivisionByCoord({
              coordinate: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            });
            resolve(division);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분
        }
      );
    });
  }

  // 현재 위치 기반 인접 지역들 가져오기
  async getNearbyDivisionsFromCurrentLocation(depth: number = 1): Promise<Division[]> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const divisions = await this.getNearbyDivisionsByCoord({
              coordinate: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              },
              depth
            });
            resolve(divisions);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5분
        }
      );
    });
  }

  // 지역 정보를 읽기 쉬운 문자열로 변환
  formatDivisionName(division: Division): string {
    return `${division.sidoName} ${division.sggName} ${division.emdName}`;
  }

  // 지역 정보를 짧은 형태로 변환
  formatDivisionShortName(division: Division): string {
    return `${division.sggName} ${division.emdName}`;
  }

  // 두 좌표 간의 거리 계산 (단위: km)
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // 지역 정보를 로컬스토리지에 저장
  saveCurrentDivision(division: Division): void {
    localStorage.setItem('currentDivision', JSON.stringify(division));
  }

  // 로컬스토리지에서 지역 정보 가져오기
  getSavedDivision(): Division | null {
    const saved = localStorage.getItem('currentDivision');
    return saved ? JSON.parse(saved) : null;
  }

  // 저장된 지역 정보 삭제
  clearSavedDivision(): void {
    localStorage.removeItem('currentDivision');
  }
}

export const divisionApi = new DivisionApi();
export default divisionApi;