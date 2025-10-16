import apiClient from '../client';
import type { ApiResponse } from '../../types';
import type { CartListRequest, MarketListResponse } from '../../types';

/**
 * 장바구니 API 서비스
 */
export const cartService = {
  /**
   * 장바구니에 마켓 추가
   */
  addCart: async (userId: number, marketId: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post(`/api/v1/market/private/cart/${marketId}`, null, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 장바구니에서 마켓 삭제
   */
  deleteCart: async (userId: number, marketId: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.delete(`/api/v1/market/private/cart/${marketId}`, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 내 장바구니 목록 조회
   */
  getMyCarts: async (
    userId: number,
    params: CartListRequest
  ): Promise<ApiResponse<MarketListResponse>> => {
    const response = await apiClient.get('/api/v1/market/private/cart/my', {
      params,
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },
};
