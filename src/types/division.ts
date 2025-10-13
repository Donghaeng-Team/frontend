/**
 * Division Service API Types
 * Backend: division-service
 */

// ===== DTO Types =====

/**
 * 좌표 정보
 */
export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * 좌표 + 깊이 정보 (인접동 검색용)
 */
export interface CoordinateDepth extends Coordinate {
  depth: number; // 1~3
}

/**
 * 좌표 리스트
 */
export interface Coordinates {
  coordinateList: Coordinate[];
}

/**
 * 읍면동 코드
 */
export interface Emd {
  emdCode: string; // 8자리 숫자
}

/**
 * 읍면동 코드 + 깊이 정보 (인접동 검색용)
 */
export interface EmdDepth extends Emd {
  depth: number; // 1~3
}

/**
 * 읍면동 코드 리스트
 */
export interface Emds {
  emdList: Emd[];
}

// ===== Entity Types =====

/**
 * 행정구역 정보
 */
export interface Division {
  id: string; // 8자리 행정구역 코드
  sidoCode: string; // 시도 코드 (2자리)
  sidoName: string; // 시도명
  sggCode: string; // 시군구 코드 (3자리)
  sggName: string; // 시군구명
  emdCode: string; // 읍면동 코드 (3자리)
  emdName: string; // 읍면동명
  centroidLat: string; // 중심점 위도 (BigDecimal -> string)
  centroidLng: string; // 중심점 경도 (BigDecimal -> string)
}

// ===== API Response Types =====

/**
 * Optional을 표현하기 위한 타입
 */
export type DivisionOptional = Division | null;

// ===== API Endpoint Types =====

/**
 * Public API (/api/v1/division)
 */
export interface DivisionPublicAPI {
  /**
   * GET /api/v1/division/public/by-coord
   * 좌표로 읍면동 검색
   */
  getDivisionByCoordinates: (params: Coordinate) => Promise<DivisionOptional>;
}

/**
 * Internal API (/internal/v1/division)
 */
export interface DivisionInternalAPI {
  /**
   * POST /internal/v1/division/list/by-coord
   * 좌표 리스트로 읍면동 리스트 검색
   */
  getDivisionListByCoordinatesList: (data: Coordinates) => Promise<DivisionOptional[]>;

  /**
   * GET /internal/v1/division/by-code
   * 읍면동 코드로 읍면동 검색
   */
  getDivisionByCode: (params: Emd) => Promise<DivisionOptional>;

  /**
   * POST /internal/v1/division/list/by-code
   * 읍면동 코드 리스트로 읍면동 리스트 검색
   */
  getDivisionListByCodeList: (data: Emds) => Promise<DivisionOptional[]>;

  /**
   * GET /internal/v1/division/near/by-code
   * 읍면동 코드로 인접동 검색
   */
  getNearDivisionListByCode: (params: EmdDepth) => Promise<Division[]>;

  /**
   * GET /internal/v1/division/near/by-coord
   * 좌표로 인접동 검색
   */
  getNearDivisionListByCoordinates: (params: CoordinateDepth) => Promise<Division[]>;
}
