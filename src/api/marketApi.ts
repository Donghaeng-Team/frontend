import apiClient from './client';
import type {
  MarketPost,
  CreateMarketRequest,
  PutMarketRequest,
  MarketListResponse,
  MarketListRequest,
  PaginationParams,
  ApiResponse
} from '../types';

class MarketApi {
  // 마켓글 작성
  async createMarketPost(data: CreateMarketRequest): Promise<ApiResponse<MarketPost>> {
    const formData = new FormData();

    // 텍스트 데이터 추가
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // 이미지 파일 추가
    if (data.images) {
      data.images.forEach((file, index) => {
        formData.append(`images`, file);
      });
    }

    const response = await apiClient.post('/api/v1/market/private', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 마켓글 수정
  async updateMarketPost(marketId: number, data: PutMarketRequest): Promise<ApiResponse<MarketPost>> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    if (data.images) {
      data.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await apiClient.put(`/api/v1/market/private/${marketId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 마켓글 삭제
  async deleteMarketPost(marketId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/v1/market/private/${marketId}`);
    return response.data;
  }

  // 마켓글 연장
  async extendMarketPost(marketId: number): Promise<ApiResponse<MarketPost>> {
    const response = await apiClient.patch(`/api/v1/market/private/extend/${marketId}`);
    return response.data;
  }

  // 마켓글 목록 조회 (공개)
  async getMarketPosts(
    filters: Partial<MarketListRequest> = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<MarketListResponse>> {
    const params = {
      ...filters,
      page: pagination.page || 0,
      size: pagination.size || 20,
    };

    const response = await apiClient.get('/api/v1/market/public', { params });
    return response.data;
  }

  // 마켓글 목록 조회 (로그인)
  async getMarketPostsPrivate(
    filters: Partial<MarketListRequest> = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<MarketListResponse>> {
    const params = {
      ...filters,
      page: pagination.page || 0,
      size: pagination.size || 20,
    };

    const response = await apiClient.get('/api/v1/market/private', { params });
    return response.data;
  }

  // 마켓글 상세 조회 (공개)
  async getMarketPost(marketId: number): Promise<ApiResponse<MarketPost>> {
    const response = await apiClient.get(`/api/v1/market/public/${marketId}`);
    return response.data;
  }

  // 마켓글 상세 조회 (로그인)
  async getMarketPostPrivate(marketId: number): Promise<ApiResponse<MarketPost>> {
    const response = await apiClient.get(`/api/v1/market/private/${marketId}`);
    return response.data;
  }

  // 마켓글 상태 변경
  async updateMarketPostStatus(
    marketId: number,
    status: 'RECRUITING' | 'COMPLETED' | 'CANCELLED'
  ): Promise<ApiResponse<MarketPost>> {
    const response = await apiClient.patch(`/api/v1/market/private/status/${marketId}`, {
      status,
    });
    return response.data;
  }

  // 특정 유저의 마켓글 검색
  async getUserMarketPosts(
    userId: number,
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<MarketListResponse>> {
    const params = {
      page: pagination.page || 0,
      size: pagination.size || 20,
    };

    const response = await apiClient.get(`/api/v1/market/public/user/${userId}`, { params });
    return response.data;
  }

  // 찜하기 추가
  async addToWishlist(marketId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`/api/v1/market/private/cart/${marketId}`);
    return response.data;
  }

  // 찜하기 삭제
  async removeFromWishlist(marketId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/v1/market/private/cart/${marketId}`);
    return response.data;
  }

  // 내가 찜한 목록 보기
  async getMyWishlist(pagination: PaginationParams = {}): Promise<ApiResponse<MarketListResponse>> {
    const params = {
      page: pagination.page || 0,
      size: pagination.size || 20,
    };

    const response = await apiClient.get('/api/v1/market/private/cart/my', { params });
    return response.data;
  }
}

export const marketApi = new MarketApi();
export default marketApi;