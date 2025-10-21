import { AxiosError } from 'axios';

// API 에러 타입 정의 (서버 응답)
interface ApiError {
  code?: string;
  message?: string;
  details?: any;
}

// 앱 에러 타입 정의
export interface AppError {
  code: string;
  message: string;
  details?: any;
  status?: number;
}

// 에러 코드 상수
export const ERROR_CODES = {
  // 네트워크 에러
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // 인증 에러
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // 클라이언트 에러
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // 서버 에러
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // 비즈니스 로직 에러
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  INSUFFICIENT_QUANTITY: 'INSUFFICIENT_QUANTITY',
  DEADLINE_PASSED: 'DEADLINE_PASSED',
  ALREADY_JOINED: 'ALREADY_JOINED',
} as const;

// 에러 메시지 맵핑
const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.NETWORK_ERROR]: '네트워크 연결을 확인해주세요.',
  [ERROR_CODES.TIMEOUT_ERROR]: '요청 시간이 초과되었습니다.',
  [ERROR_CODES.UNAUTHORIZED]: '로그인이 필요합니다.',
  [ERROR_CODES.FORBIDDEN]: '접근 권한이 없습니다.',
  [ERROR_CODES.TOKEN_EXPIRED]: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  [ERROR_CODES.BAD_REQUEST]: '잘못된 요청입니다.',
  [ERROR_CODES.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ERROR_CODES.VALIDATION_ERROR]: '입력값을 확인해주세요.',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: '서버 오류가 발생했습니다.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '서비스를 이용할 수 없습니다.',
  [ERROR_CODES.BUSINESS_ERROR]: '처리 중 오류가 발생했습니다.',
  [ERROR_CODES.INSUFFICIENT_QUANTITY]: '재고가 부족합니다.',
  [ERROR_CODES.DEADLINE_PASSED]: '마감 시간이 지났습니다.',
  [ERROR_CODES.ALREADY_JOINED]: '이미 참여한 상품입니다.',
};

// Axios 에러를 AppError로 변환
export const handleAxiosError = (error: AxiosError): AppError => {
  // 네트워크 에러
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        code: ERROR_CODES.TIMEOUT_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR],
        status: 0,
      };
    }
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      status: 0,
    };
  }

  const { status, data } = error.response;

  // 서버에서 반환된 에러 정보 사용
  if (data && typeof data === 'object') {
    const apiError = data as ApiError;
    return {
      code: apiError.code || getErrorCodeByStatus(status),
      message: apiError.message || getErrorMessageByStatus(status),
      details: apiError.details,
      status,
    };
  }

  // 기본 에러 처리
  return {
    code: getErrorCodeByStatus(status),
    message: getErrorMessageByStatus(status),
    status,
  };
};

// HTTP 상태 코드로 에러 코드 매핑
const getErrorCodeByStatus = (status: number): string => {
  switch (status) {
    case 400:
      return ERROR_CODES.BAD_REQUEST;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 422:
      return ERROR_CODES.VALIDATION_ERROR;
    case 500:
      return ERROR_CODES.INTERNAL_SERVER_ERROR;
    case 503:
      return ERROR_CODES.SERVICE_UNAVAILABLE;
    default:
      return ERROR_CODES.BUSINESS_ERROR;
  }
};

// HTTP 상태 코드로 에러 메시지 매핑
const getErrorMessageByStatus = (status: number): string => {
  const code = getErrorCodeByStatus(status);
  return ERROR_MESSAGES[code] || '알 수 없는 오류가 발생했습니다.';
};

// 에러 로깅
export const logError = (error: AppError, context?: string): void => {
  if (import.meta.env.DEV) {
    console.group(`🚨 Error ${context ? `in ${context}` : ''}`);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    if (error.details) {
      console.error('Details:', error.details);
    }
    console.groupEnd();
  }

  // 프로덕션에서는 에러 리포팅 서비스로 전송
  if (import.meta.env.PROD) {
    // 예: Sentry, LogRocket 등
    // reportError(error, context);
  }
};

// 사용자 친화적 에러 메시지 생성
export const getUserFriendlyMessage = (error: AppError): string => {
  return error.message || '알 수 없는 오류가 발생했습니다.';
};

// 에러 재시도 가능 여부 확인
export const isRetryableError = (error: AppError): boolean => {
  const retryableCodes: string[] = [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.TIMEOUT_ERROR,
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.SERVICE_UNAVAILABLE,
  ];

  return retryableCodes.includes(error.code);
};