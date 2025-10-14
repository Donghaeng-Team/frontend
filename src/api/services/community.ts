import apiClient from '../client';
import type { ApiResponse } from '../../types';
import type {
  PostCreateAndUpdateRequest,
  PostListResponse,
  PostDetailResponse,
  GetPostsListParams,
} from '../../types/community';

/**
 * 커뮤니티 게시글 API 서비스
 */
export const communityService = {
  /**
   * 게시글 목록 조회 (Public)
   * @param params 지역 코드 및 태그 필터
   * @returns 게시글 목록
   */
  getPosts: async (params: GetPostsListParams): Promise<ApiResponse<PostListResponse[]>> => {
    const response = await apiClient.get('/api/v1/posts/public', { params });
    return response.data;
  },

  /**
   * 특정 사용자의 게시글 목록 조회 (Public)
   * @param userId 사용자 ID
   * @returns 게시글 목록
   */
  getPostsByUserId: async (userId: number): Promise<ApiResponse<PostListResponse[]>> => {
    const response = await apiClient.get(`/api/v1/posts/public/${userId}`);
    return response.data;
  },

  /**
   * 게시글 상세 조회 (Public)
   * @param postId 게시글 ID
   * @returns 게시글 상세 정보
   */
  getPost: async (postId: number): Promise<ApiResponse<PostDetailResponse>> => {
    const response = await apiClient.get(`/api/v1/posts/public/${postId}`);
    return response.data;
  },

  /**
   * 게시글 생성 (Private)
   * @param userId 작성자 ID (헤더로 전송)
   * @param data 게시글 생성 데이터
   * @returns 생성된 게시글 정보
   */
  createPost: async (
    userId: number,
    data: PostCreateAndUpdateRequest
  ): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post('/api/v1/posts/private', data, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 게시글 수정 (Private)
   * @param userId 작성자 ID (헤더로 전송)
   * @param postId 게시글 ID
   * @param data 수정할 데이터
   * @returns 수정된 게시글 정보
   */
  updatePost: async (
    userId: number,
    postId: number,
    data: PostCreateAndUpdateRequest
  ): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.put(`/api/v1/posts/private/${postId}`, data, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 게시글 삭제 (Private)
   * @param userId 작성자 ID (헤더로 전송)
   * @param postId 게시글 ID
   * @returns 삭제 결과
   */
  deletePost: async (userId: number, postId: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.delete(`/api/v1/posts/private/${postId}`, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 게시글 좋아요 증가 (Private)
   * @param userId 사용자 ID (헤더로 전송)
   * @param postId 게시글 ID
   * @returns 좋아요 결과
   */
  increaseLike: async (userId: number, postId: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post(
      `/api/v1/posts/private/${postId}/likes`,
      {},
      {
        headers: {
          'X-User-Id': userId.toString(),
        },
      }
    );
    return response.data;
  },
};
