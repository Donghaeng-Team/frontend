// 모든 타입을 통합 export

// API 관련 (기본 우선)
export * from './api';

// 사용자 관련
export * from './user';

// 마켓글 관련
export * from './market';

// 지역/위치 관련 (Coordinate는 api.ts에서 이미 export됨)
export type { Division } from './location';
export type {
  DivisionByCoordRequest,
  DivisionListByCoordRequest,
  DivisionByCodeRequest,
  DivisionListByCodeRequest,
  NearbyDivisionByCodeRequest,
  NearbyDivisionByCoordRequest,
  MapProps,
} from './location';

// 행정구역 관련 (Division과 Coordinate 중복 방지)
export type {
  CoordinateDepth,
  Coordinates,
  Emd,
  EmdDepth,
  Emds,
  DivisionOptional,
  DivisionPublicAPI,
  DivisionInternalAPI,
} from './division';

// 컴포넌트 관련
export * from './components';

// 공통 타입
export * from './common';

// 커뮤니티 관련
export * from './community';

// 댓글 관련
export * from './comment';

// 이미지 업로드 관련
export * from './image';

// 사용 예시:
// import { User, MarketPost, ButtonVariant, ApiResponse } from '@/types';