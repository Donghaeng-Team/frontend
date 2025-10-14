// API 관련 모든 exports를 한 곳에서 관리

export { default as apiClient } from './client';
export { default as marketApi } from './marketApi';
export { default as userApi } from './userApi';
export { default as divisionApi } from './divisionApi';

// 서비스 레이어 export
export { authService } from './services/auth';
export { productService } from './services/product';
export { chatService } from './services/chat';
export { locationService } from './services/location';
export { communityService } from './services/community';
export { commentService } from './services/comment';
export { imageService } from './services/image';

// 타입은 src/types에서 import하세요:
// import { marketApi, userApi, divisionApi, communityService, commentService } from '@/api';
// import type { ApiResponse, MarketPost, User, Division, PostListResponse } from '@/types';
