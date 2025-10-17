// 지역/위치 관련 타입 정의
import type { Coordinate } from './api';
import type { Division } from './division';

export type { Division };

// API 요청 관련
export interface DivisionByCoordRequest {
  coordinate: Coordinate;
}

export interface DivisionListByCoordRequest {
  coordinateList: Coordinate[];
}

export interface DivisionByCodeRequest {
  emdCode: string;
}

export interface DivisionListByCodeRequest {
  emdList: { emdCode: string }[];
}

export interface NearbyDivisionByCodeRequest {
  emdCode: string;
  depth: number;
}

export interface NearbyDivisionByCoordRequest {
  coordinate: Coordinate;
  depth: number;
}

// 지도 관련
export interface MapProps {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    onClick?: () => void;
  }>;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}