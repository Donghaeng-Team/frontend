import apiClient from '../client';
import type { ApiResponse } from '../../types';
import type {
  PostCreateInitRequest,
  PostData,
  PostListResponse,
  PostDetailResponse,
  GetPostsListParams,
  UploadUrlsRequest,
  UploadUrlsResponse,
  PostUpdateRequest,
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
   * 게시글 초기 생성 (Private) - Step 1
   * @param data 게시글 초기 데이터 (region, tag만 포함)
   * @returns 생성된 게시글 정보
   */
  createPostInit: async (data: PostCreateInitRequest): Promise<ApiResponse<PostData>> => {
    const response = await apiClient.post('/api/v1/posts/private', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * 프리사인드 URL 발급 (Private) - Step 2
   * @param postId 게시글 ID
   * @param userId 사용자 ID
   * @param data 파일 정보 목록
   * @returns 프리사인드 URL 목록
   */
  getUploadUrls: async (
    postId: number,
    userId: number,
    data: UploadUrlsRequest
  ): Promise<UploadUrlsResponse> => {
    const response = await apiClient.post(`/api/v1/upload-url/${postId}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * S3에 이미지 업로드 (External) - Step 3
   * @param presignedUrl S3 프리사인드 URL
   * @param file 업로드할 파일
   */
  uploadToS3: async (presignedUrl: string, file: File): Promise<void> => {
    await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });
  },

  /**
   * 게시글 최종 수정 (Private) - Step 4
   * @param postId 게시글 ID
   * @param userId 사용자 ID
   * @param data 수정할 데이터 (title, content, imageKeys 포함)
   * @returns 수정된 게시글 정보
   */
  updatePost: async (
    postId: number,
    userId: number,
    data: PostUpdateRequest
  ): Promise<ApiResponse<PostData>> => {
    const response = await apiClient.put(`/api/v1/posts/private/${postId}`, data, {
      headers: {
        'Content-Type': 'application/json',
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

  /**
   * 이미지와 함께 게시글 생성 (통합 함수)
   * @param userId 사용자 ID
   * @param post 게시글 초기 데이터
   * @param files 업로드할 파일 목록
   * @returns 생성된 게시글 ID
   */
  createPostWithImages: async (
    userId: number,
    post: PostCreateInitRequest & { title?: string; content?: string },
    files: File[]
  ): Promise<number> => {
    // 1️⃣ 게시글 초기 생성
    const initRes = await communityService.createPostInit({
      region: post.region,
      tag: post.tag,
    });

    if (!initRes.success) throw new Error(initRes.message);
    const postId = initRes.data.id;

    // 2️⃣ 프리사인드 URL 발급
    if (files.length > 0) {
      try {
        const urlReqBody: UploadUrlsRequest = {
          files: files.map((file, idx) => ({
            index: idx,
            fileName: file.name,
            contentType: file.type,
          })),
        };

        const urlRes = await communityService.getUploadUrls(postId, userId, urlReqBody);

        // 3️⃣ S3에 실제 업로드
        await Promise.all(
          files.map((file, idx) =>
            communityService.uploadToS3(urlRes.uploadUrls[idx].presignedUrl, file)
          )
        );

        // 4️⃣ 게시글 최종 수정 (이미지 키 반영)
        const updateBody: PostUpdateRequest = {
          region: post.region,
          tag: post.tag,
          title: post.title,
          content: post.content,
          imageKeys: urlRes.uploadUrls.map((u) => u.s3Key),
        };

        const updateRes = await communityService.updatePost(postId, userId, updateBody);
        if (!updateRes.success) throw new Error('게시글 최종 수정 실패');

        return updateRes.data.id;
      } catch (imageError) {
        console.error('⚠️ 이미지 업로드 실패, 텍스트만 저장합니다:', imageError);
        // 이미지 업로드 실패 시에도 텍스트 저장 진행
      }
    }

    // 이미지 없거나 이미지 업로드 실패한 경우 - title, content만 업데이트
    if (post.title || post.content) {
      const updateBody: PostUpdateRequest = {
        region: post.region,
        tag: post.tag,
        title: post.title,
        content: post.content,
      };

      const updateRes = await communityService.updatePost(postId, userId, updateBody);
      if (!updateRes.success) throw new Error('게시글 최종 수정 실패');

      return updateRes.data.id;
    }

    return postId;
  },
};
