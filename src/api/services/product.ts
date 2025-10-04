import apiClient, { ApiResponse, PaginatedResponse } from '../config';

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

export interface ProductCreateRequest {
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: File[];
  targetQuantity: number;
  deadline: string;
  locationCode: string;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
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
  getProducts: async (params: ProductSearchParams = {}): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // 상품 상세 조회
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // 상품 생성
  createProduct: async (data: ProductCreateRequest): Promise<ApiResponse<Product>> => {
    const formData = new FormData();

    // 이미지 파일들 추가
    data.images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    // 나머지 데이터 추가
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images') {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    const response = await apiClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 상품 수정
  updateProduct: async (data: ProductUpdateRequest): Promise<ApiResponse<Product>> => {
    const { id, ...updateData } = data;

    if (updateData.images && updateData.images.length > 0) {
      const formData = new FormData();

      updateData.images.forEach((image) => {
        formData.append('images', image);
      });

      Object.entries(updateData).forEach(([key, value]) => {
        if (key !== 'images') {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });

      const response = await apiClient.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await apiClient.put(`/products/${id}`, updateData);
      return response.data;
    }
  },

  // 상품 삭제
  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // 상품 참여
  joinProduct: async (productId: string, quantity: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(`/products/${productId}/join`, { quantity });
    return response.data;
  },

  // 상품 참여 취소
  leaveProduct: async (productId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/products/${productId}/join`);
    return response.data;
  },

  // 내가 참여한 상품 목록
  getMyJoinedProducts: async (params: { page?: number; size?: number } = {}): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    const response = await apiClient.get('/products/my/joined', { params });
    return response.data;
  },

  // 내가 등록한 상품 목록
  getMyProducts: async (params: { page?: number; size?: number } = {}): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    const response = await apiClient.get('/products/my', { params });
    return response.data;
  },

  // 찜하기/찜 해제
  toggleWishlist: async (productId: string): Promise<ApiResponse<{ isWishlisted: boolean }>> => {
    const response = await apiClient.post(`/products/${productId}/wishlist`);
    return response.data;
  },

  // 찜한 상품 목록
  getWishlistedProducts: async (params: { page?: number; size?: number } = {}): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    const response = await apiClient.get('/products/wishlist', { params });
    return response.data;
  },

  // 카테고리 목록 조회
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get('/products/categories');
    return response.data;
  },
};