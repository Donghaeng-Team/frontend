import apiClient from '../client';
import type { ApiResponse } from '../../types';

// 지역 관련 타입 정의
export interface LocationItem {
  code: string;
  name: string;
}

export interface LocationData {
  sido: LocationItem;
  gugun: LocationItem;
  dong: LocationItem;
  fullAddress: string;
}

// 지역 API 서비스
export const locationService = {
  // 시/도 목록 조회
  getSidoList: async (): Promise<ApiResponse<LocationItem[]>> => {
    const response = await apiClient.get('/locations/sido');
    return response.data;
  },

  // 구/군 목록 조회
  getGugunList: async (sidoCode: string): Promise<ApiResponse<LocationItem[]>> => {
    const response = await apiClient.get(`/locations/gugun/${sidoCode}`);
    return response.data;
  },

  // 동 목록 조회
  getDongList: async (gugunCode: string): Promise<ApiResponse<LocationItem[]>> => {
    const response = await apiClient.get(`/locations/dong/${gugunCode}`);
    return response.data;
  },

  // 주소 검색
  searchAddress: async (query: string): Promise<ApiResponse<LocationData[]>> => {
    const response = await apiClient.get('/locations/search', {
      params: { q: query },
    });
    return response.data;
  },

  // 좌표로 주소 조회 (역지오코딩)
  getAddressByCoordinates: async (lat: number, lng: number): Promise<ApiResponse<LocationData>> => {
    const response = await apiClient.get('/locations/reverse-geocoding', {
      params: { lat, lng },
    });
    return response.data;
  },

  // 주소로 좌표 조회 (지오코딩)
  getCoordinatesByAddress: async (address: string): Promise<ApiResponse<{ lat: number; lng: number }>> => {
    const response = await apiClient.get('/locations/geocoding', {
      params: { address },
    });
    return response.data;
  },
};