// API 관련 타입 정의

// 공통 API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  timestamp: string;
}

// 페이지네이션 관련
export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 좌표 관련
export interface Coordinate {
  latitude: number;
  longitude: number;
}