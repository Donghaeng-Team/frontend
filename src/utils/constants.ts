// 환경 변수 관리
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/ws',
  APP_TITLE: import.meta.env.VITE_APP_TITLE || '함께 사요',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',

  // API 키들
  KAKAO_MAP_API_KEY: import.meta.env.VITE_KAKAO_MAP_API_KEY || '',
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',

  // 업로드 설정
  MAX_FILE_SIZE: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],

  // 페이지네이션
  DEFAULT_PAGE_SIZE: Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20,
  MAX_PAGE_SIZE: Number(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,

  // 토큰 만료 시간 (분)
  ACCESS_TOKEN_EXPIRES_IN: Number(import.meta.env.VITE_ACCESS_TOKEN_EXPIRES_IN) || 15,
  REFRESH_TOKEN_EXPIRES_IN: Number(import.meta.env.VITE_REFRESH_TOKEN_EXPIRES_IN) || 10080,

  // 개발 도구
  ENABLE_DEV_TOOLS: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
  ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',

  // CDN
  CDN_BASE_URL: import.meta.env.VITE_CDN_BASE_URL || '',
} as const;

// 애플리케이션 상수
export const APP_CONSTANTS = {
  // 로컬 스토리지 키
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
    SELECTED_LOCATION: 'selectedLocation',
  },

  // 상품 상태
  PRODUCT_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
  } as const,

  // 채팅 상태
  CHAT_STATUS: {
    ACTIVE: 'active',
    CLOSED: 'closed',
  } as const,

  // 메시지 타입
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    SYSTEM: 'system',
  } as const,

  // 사용자 역할
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    SELLER: 'seller',
    BUYER: 'buyer',
  } as const,

  // 정렬 옵션
  SORT_OPTIONS: {
    CREATED_AT: 'createdAt',
    DEADLINE: 'deadline',
    PRICE: 'price',
    POPULARITY: 'popularity',
  } as const,

  // 정렬 방향
  SORT_ORDERS: {
    ASC: 'asc',
    DESC: 'desc',
  } as const,

  // 카테고리 (백엔드와 동기화 필요)
  CATEGORIES: [
    '식품/음료',
    '생활용품',
    '화장품/미용',
    '의류/패션',
    '가전제품',
    '도서/문구',
    '스포츠/레저',
    '건강/의료',
    '기타',
  ] as const,

  // 페이지 경로
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id',
    PRODUCT_CREATE: '/products/create',
    PRODUCT_EDIT: '/products/:id/edit',
    CHAT: '/chat',
    CHAT_ROOM: '/chat/:roomId',
    PROFILE: '/profile',
    MY_PAGE: '/mypage',
    PURCHASE_HISTORY: '/purchase-history',
    NOT_FOUND: '/404',
  } as const,

  // 이미지 관련
  DEFAULT_IMAGES: {
    PRODUCT_PLACEHOLDER: '/images/product-placeholder.png',
    USER_AVATAR: '/images/user-avatar.png',
    LOGO: '/images/logo.png',
  } as const,

  // 유효성 검사 규칙
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 50,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    TITLE_MIN_LENGTH: 5,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MIN_LENGTH: 10,
    DESCRIPTION_MAX_LENGTH: 2000,
    MIN_PRICE: 1000,
    MAX_PRICE: 10000000,
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 1000,
  } as const,
} as const;

// 개발/프로덕션 환경 확인
export const isDevelopment = ENV.NODE_ENV === 'development';
export const isProduction = ENV.NODE_ENV === 'production';

// 브라우저 기능 지원 확인
export const BROWSER_SUPPORT = {
  localStorage: typeof Storage !== 'undefined',
  sessionStorage: typeof Storage !== 'undefined',
  webSocket: typeof WebSocket !== 'undefined',
  fileAPI: typeof File !== 'undefined' && typeof FileList !== 'undefined',
  geolocation: 'geolocation' in navigator,
  notification: 'Notification' in window,
} as const;