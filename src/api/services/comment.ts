import apiClient from '../client';
import type { ApiResponse } from '../../types';
import type {
  CommentCreateRequest,
  CommentResponse,
  CommentDeleteParams,
  PageCommentResponse,
} from '../../types/comment';

/**
 * 댓글 API 서비스
 */
export const commentService = {
  /**
   * 댓글 목록 조회 (Public)
   * @param postId 게시글 ID
   * @returns 댓글 페이지네이션 응답
   */
  getComments: async (postId: number): Promise<ApiResponse<PageCommentResponse>> => {
    const response = await apiClient.get(`/api/v1/comments/public/${postId}`);
    return response.data;
  },

  /**
   * 댓글 생성 (Private)
   * @param postId 게시글 ID
   * @param data 댓글 생성 데이터
   * @returns 생성된 댓글 정보
   */
  createComment: async (
    postId: number,
    data: CommentCreateRequest
  ): Promise<ApiResponse<CommentResponse>> => {
    const response = await apiClient.post(`/api/v1/comments/private/${postId}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': data.userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * 댓글 수정 (Private)
   * @param commentId 댓글 ID
   * @param authorId 작성자 ID
   * @param content 수정할 내용
   * @returns 수정된 댓글 정보
   */
  updateComment: async (
    commentId: number,
    authorId: number,
    content: string
  ): Promise<ApiResponse<CommentResponse>> => {
    const response = await apiClient.put(
      `/api/v1/comments/private/${commentId}`,
      content,
      {
        params: { authorId },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * 댓글 삭제 (Private)
   * @param params 댓글 ID 및 작성자 ID
   * @returns 삭제 결과
   */
  deleteComment: async (params: CommentDeleteParams): Promise<void> => {
    await apiClient.delete(`/api/v1/comments/private/${params.commentId}`, {
      params: { authorId: params.authorId },
    });
  },
};
