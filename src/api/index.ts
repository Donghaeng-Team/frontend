// API 관련 모든 exports를 한 곳에서 관리

export { default as apiClient } from './client';
export { default as marketApi } from './marketApi';
export { default as userApi } from './userApi';
export { default as divisionApi } from './divisionApi';

// 타입은 src/types에서 import하세요:
// import { marketApi, userApi, divisionApi } from '@/api';
// import type { ApiResponse, MarketPost, User, Division } from '@/types';
