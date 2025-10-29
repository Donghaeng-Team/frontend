import apiClient from '../client';
import type { ApiResponse, PaginationResponse } from '../../types';
import type { MarketDetailResponse } from '../../types/market';
import { getUser } from '../../utils/token';

// 상품 관련 타입 정의
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  targetQuantity: number;
  currentQuantity: number;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  location: {
    sido: string;
    gugun: string;
    dong: string;
    fullAddress: string;
  };
  seller: {
    id: string;
    name: string;
    profileImage?: string;
    rating: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Swagger 기반 CreateMarketRequest
export interface ProductCreateRequest {
  images?: File[]; // multipart/form-data로 전송
  title: string;
  categoryId: string;
  price: number;
  recruitMin: number;
  recruitMax: number;
  endTime: string; // ISO 8601 datetime
  content: string;
  latitude: number;
  longitude: number;
  locationText: string;
}

export interface ProductUpdateRequest {
  id: string;
  images?: File[]; // multipart/form-data로 전송
  title: string;
  categoryId: string;
  endTime: string; // ISO 8601 datetime
  content: string;
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  locationCode?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sortBy?: 'createdAt' | 'deadline' | 'price' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

// 상품 API 서비스
export const productService = {
  // 상품 목록 조회
  getProducts: async (params: ProductSearchParams = {}): Promise<ApiResponse<PaginationResponse<Product>>> => {
    const response = await apiClient.get('/api/v1/market/public/products', { params });
    return response.data;
  },

  // 상품 상세 조회
  getProduct: async (id: string): Promise<ApiResponse<MarketDetailResponse>> => {
    const response = await apiClient.get(`/api/v1/market/public/${id}`);
    return response.data;
  },

  // 상품 생성 (multipart/form-data)
  createProduct: async (data: ProductCreateRequest, userId: number): Promise<ApiResponse<{ marketId: number }>> => {

    const formData = new FormData();
    
    // 이미지 파일 추가
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }
    
    // 나머지 필드 추가
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
        'Content-Type': 'multipart/form-data',
        'X-User-Id': userId.toString()
      }
    });
    
    return response.data;
  },

  // 상품 수정
  updateProduct: async (data: ProductUpdateRequest, userId: number): Promise<ApiResponse<Product>> => {
    const { id, images, ...updateData } = data;
    const formData = new FormData();

    // 이미지 추가 (있는 경우)
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // 나머지 필수 필드 추가
    formData.append('title', updateData.title);
    formData.append('categoryId', updateData.categoryId);
    formData.append('endTime', updateData.endTime);
    formData.append('content', updateData.content);

    const response = await apiClient.put(`/api/v1/market/private/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  // 상품 삭제
  deleteProduct: async (id: string, userId: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/api/v1/market/private/${id}`, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  // 상품 참여
  joinProduct: async (productId: string, quantity: number, userId: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(`/api/v1/market/private/${productId}/join`, { quantity }, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  // 상품 참여 취소
  leaveProduct: async (productId: string, userId: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/api/v1/market/private/${productId}/join`, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  // 내가 참여한 상품 목록 (TODO: 백엔드 API 구현 대기)
  getMyJoinedProducts: async (params: { pageNum?: number; pageSize?: number } = {}): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/api/v1/market/private/participating', {
      params: {
        pageNum: params.pageNum || 0,
        pageSize: params.pageSize || 100
      }
    });
    return response.data;
  },

  // 내가 완료한 상품 목록
  getMyCompletedProducts: async (params: { pageNum?: number; pageSize?: number } = {}): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/api/v1/market/private/completed', {
      params: {
        pageNum: params.pageNum || 0,
        pageSize: params.pageSize || 100
      }
    });
    return response.data;
  },

  // 내가 등록한 상품 목록
  getMyProducts: async (params: { pageNum?: number; pageSize?: number } = {}): Promise<ApiResponse<PaginationResponse<Product>>> => {
    const user = getUser();
    if (!user?.userId) {
      throw new Error('로그인이 필요합니다.');
    }

    // /api/v1/market/public/user/{userId} 사용
    const response = await apiClient.get(`/api/v1/market/public/user/${user.userId}`, {
      params: {
        pageNum: params.pageNum || 0,
        pageSize: params.pageSize || 10
      }
    });
    return response.data;
  },

  // 좋아요 추가
  addWishlist: async (marketId: number): Promise<ApiResponse<null>> => {
    const user = getUser();
    if (!user?.userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await apiClient.post(`/api/v1/market/private/cart/${marketId}`, null, {
      headers: {
        'X-User-Id': user.userId.toString(),
      },
    });
    return response.data;
  },

  // 좋아요 취소
  removeWishlist: async (marketId: number): Promise<ApiResponse<null>> => {
    const user = getUser();
    if (!user?.userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await apiClient.delete(`/api/v1/market/private/cart/${marketId}`, {
      headers: {
        'X-User-Id': user.userId.toString(),
      },
    });
    return response.data;
  },

  // 좋아요 토글 (기존 호환성 유지)
  toggleWishlist: async (productId: string): Promise<ApiResponse<{ isWishlisted: boolean }>> => {
    // TODO: 현재 좋아요 상태를 확인한 후 추가/삭제 결정
    // 임시로 추가만 수행
    const marketId = parseInt(productId);
    await productService.addWishlist(marketId);
    return {
      success: true,
      message: '좋아요 추가',
      data: { isWishlisted: true },
      timestamp: new Date().toISOString()
    };
  },

  // 좋아요한 상품 목록
  getWishlistedProducts: async (params: { pageNum?: number; pageSize?: number } = {}): Promise<ApiResponse<PaginationResponse<Product>>> => {
    const user = getUser();
    if (!user?.userId) {
      throw new Error('로그인이 필요합니다.');
    }

    // /api/v1/market/private/cart/my 사용
    const response = await apiClient.get('/api/v1/market/private/cart/my', {
      params: {
        pageNum: params.pageNum || 0,
        pageSize: params.pageSize || 10
      },
      headers: {
        'X-User-Id': user.userId.toString(),
      },
    });
    return response.data;
  },

  // 좋아요한 상품 개수만 조회 (효율적)
  getWishlistCount: async (): Promise<ApiResponse<number>> => {
    // GET /api/v1/market/private/cart/my/count
    const response = await apiClient.get('/api/v1/market/private/cart/my/count');
    return response.data;
  },

  // 카테고리 목록 조회
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get('/api/v1/market/public/categories');
    return response.data;
  },
};