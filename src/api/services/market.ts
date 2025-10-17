import apiClient from '../client';
import type { ApiResponse } from '../../types';
import type {
  MarketListRequest,
  MarketListResponse,
  MarketDetailResponse,
  CreateMarketRequest,
  CreateMarketResponse,
  PutMarketRequest,
  PutMarketResponse,
  ExtendMarketRequest,
  ExtendMarketResponse,
  DefaultPageRequest,
} from '../../types/market';

/**
 * 마켓(공동구매) API 서비스
 */
export const marketService = {
  // ===== Public API =====

  /**
   * 마켓 목록 조회 (Public)
   */
  getMarketPosts: async (
    params: MarketListRequest
  ): Promise<ApiResponse<MarketListResponse>> => {
    console.log('🔍 getMarketPosts params:', params);
    const response = await apiClient.get('/api/v1/market/public', { params });
    console.log('✅ getMarketPosts response:', response.data);
    return response.data;
  },

  /**
   * 마켓 상세 조회 (Public)
   */
  getMarketPostDetail: async (
    marketId: number
  ): Promise<ApiResponse<MarketDetailResponse>> => {
    const response = await apiClient.get(`/api/v1/market/public/${marketId}`);
    return response.data;
  },

  /**
   * 특정 사용자의 마켓 게시글 조회 (Public)
   */
  getPostsByUserId: async (
    userId: number,
    params: DefaultPageRequest
  ): Promise<ApiResponse<MarketListResponse>> => {
    const response = await apiClient.get(`/api/v1/market/public/user/${userId}`, {
      params,
    });
    return response.data;
  },

  // ===== Private API (X-User-Id 헤더 필요) =====

  /**
   * 마켓 목록 조회 (로그인)
   */
  getMarketPostsWithLogin: async (
    userId: number,
    params: MarketListRequest
  ): Promise<ApiResponse<MarketListResponse>> => {
    const response = await apiClient.get('/api/v1/market/private', {
      params,
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 마켓 상세 조회 (로그인)
   */
  getMarketPostDetailWithLogin: async (
    userId: number,
    marketId: number
  ): Promise<ApiResponse<MarketDetailResponse>> => {
    const response = await apiClient.get(`/api/v1/market/private/${marketId}`, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 마켓 게시글 생성
   */
  createMarketPost: async (
    userId: number,
    data: CreateMarketRequest
  ): Promise<ApiResponse<CreateMarketResponse>> => {
    const formData = new FormData();

    // 이미지 파일 추가
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // 나머지 데이터 추가
    formData.append('title', data.title);
    formData.append('categoryId', data.categoryId);
    formData.append('price', data.price.toString());
    formData.append('recruitMin', data.recruitMin.toString());
    formData.append('recruitMax', data.recruitMax.toString());
    formData.append('endTime', data.endTime);
    formData.append('content', data.content);
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    formData.append('locationText', data.locationText);

    const response = await apiClient.post('/api/v1/market/private', formData, {
      headers: {
        'X-User-Id': userId.toString(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 마켓 게시글 수정
   */
  updateMarketPost: async (
    userId: number,
    marketId: number,
    data: PutMarketRequest
  ): Promise<ApiResponse<PutMarketResponse>> => {
    const formData = new FormData();

    // 이미지 파일 추가
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // 나머지 데이터 추가
    formData.append('title', data.title);
    formData.append('categoryId', data.categoryId);
    formData.append('endTime', data.endTime);
    formData.append('content', data.content);

    const response = await apiClient.put(`/api/v1/market/private/${marketId}`, formData, {
      headers: {
        'X-User-Id': userId.toString(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 마켓 게시글 삭제
   */
  deleteMarketPost: async (
    userId: number,
    marketId: number
  ): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.delete(`/api/v1/market/private/${marketId}`, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 마켓 마감일 연장
   */
  extendMarketPost: async (
    userId: number,
    marketId: number,
    data: ExtendMarketRequest
  ): Promise<ApiResponse<ExtendMarketResponse>> => {
    const response = await apiClient.patch(
      `/api/v1/market/private/extend/${marketId}`,
      data,
      {
        headers: {
          'X-User-Id': userId.toString(),
        },
      }
    );
    return response.data;
  },
};
