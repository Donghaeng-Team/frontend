// 지역/위치 관련 타입 정의
import type { Coordinate } from './api';

export interface Division {
  id: string;
  sidoCode: string;
  sidoName: string;
  sggCode: string;
  sggName: string;
  emdCode: string;
  emdName: string;
  centroidLat: number;
  centroidLng: number;
}

// API 요청 관련
export interface DivisionByCoordRequest {
  latitude: number;
  longitude: number;
}

export interface DivisionListByCoordRequest {
  coordinateList: Coordinate[];
}

export interface DivisionByCodeRequest {
  divisionId: string;
}

export interface DivisionListByCodeRequest {
  emdList: { emdCode: string }[];
}

export interface NearbyDivisionByCodeRequest {
  emdCode: string;
  depth: number;
}

export interface NearbyDivisionByCoordRequest {
  latitude: number;
  longitude: number;
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