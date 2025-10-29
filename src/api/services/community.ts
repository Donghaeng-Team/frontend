import apiClient from '../client';
import type { ApiResponse } from '../../types';
import type {
  PostCreateInitRequest,
  PostData,
  PostListResponse,
  PostDetailResponse,
  GetPostsListParams,
  PostUpdateRequest,
} from '../../types/community';
import type {
  UploadUrlsRequest,
  UploadUrlsResponse,
} from '../../types/image';
import { getAccessToken } from '../../utils/token';

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
    const response = await apiClient.get(`/api/v1/posts/public/user/${userId}`);
    return response.data;
  },

  /**
   * 게시글 상세 조회 (Public)
   * @param postId 게시글 ID
   * @returns 게시글 상세 정보
   */
  getPost: async (postId: number): Promise<ApiResponse<PostDetailResponse>> => {
    const response = await apiClient.get(`/api/v1/posts/public/post/${postId}`);
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
   * 프리사인드 URL 발급 (Private) - Step 2 (fetch 사용)
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
    const accessToken = getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Id': userId.toString(),
    };

    // 액세스 토큰이 있으면 Authorization 헤더 추가
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`/api/v1/posts/private/upload-url/${postId}`, {
      method: 'POST',
      headers,
      credentials: 'include', // 쿠키 포함
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('프리사인드 URL 발급 실패');
    }

    const result: UploadUrlsResponse = await response.json();
    console.log('✅ Presigned URL 응답:', result);
    return result;
  },

  /**
   * S3에 이미지 업로드 (External) - Step 3 (fetch 사용)
   * @param presignedUrl S3 프리사인드 URL
   * @param file 업로드할 파일
   */
  uploadToS3: async (presignedUrl: string, file: File): Promise<void> => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`S3 업로드 실패: ${response.status}`);
    }

    console.log('✅ S3 업로드 성공:', file.name);
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
   * 게시글 좋아요 토글 (Private)
   * 좋아요가 없으면 추가, 있으면 취소
   * @param userId 사용자 ID (헤더로 전송)
   * @param postId 게시글 ID
   * @returns 좋아요 토글 결과
   */
  toggleLike: async (userId: number, postId: number): Promise<ApiResponse<unknown>> => {
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
   * 게시글 조회수 증가 (Public)
   * @param postId 게시글 ID
   * @returns 조회수 증가 결과
   */
  increaseViewCount: async (postId: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post(
      `/api/v1/posts/public/post/${postId}`,
      {}
    );
    return response.data;
  },

  /**
   * 이미지와 함께 게시글 생성 (통합 함수) - fetch 사용
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
    // ----------------------------
    // 1️⃣ 게시글 초기 생성
    // ----------------------------
    const initRes = await apiClient.post('/api/v1/posts/private', {
      region: post.region,
      tag: post.tag,
      title: post.title || '제목 없음',
      content: post.content || '내용 없음',
      images: [] // 초기 생성 시 빈 배열
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString(),
      },
    });

    const initJson: ApiResponse<PostData> = initRes.data;
    if (!initJson.success) throw new Error(initJson.message);

    const postId = initJson.data.id;

    // ----------------------------
    // 2️⃣ 프리사인드 URL 발급
    // ----------------------------
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

        console.log('✅ Presigned URL 응답:', urlRes);

        if (!urlRes || !urlRes.urls || !Array.isArray(urlRes.urls)) {
          throw new Error('Presigned URL 응답 형식이 올바르지 않습니다.');
        }

        // ----------------------------
        // 3️⃣ S3에 실제 업로드
        // ----------------------------
        const imgUploadResponse = await Promise.all(
          files.map((file, idx) =>
            fetch(urlRes.urls[idx].uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': file.type },
              body: file,
            })
          )
        );
        imgUploadResponse.forEach((res, i) => {
          console.log(`File ${i}: ${res.status}`);
          if(!res.ok) throw new Error('이미지 업로드 중 오류 발생!');
        });
        console.log('✅ S3 업로드 완료');

        // ----------------------------
        // 4️⃣ 게시글 최종 수정 (이미지 키 반영)
        // ----------------------------
        const images = files.map((file, idx) => ({
          s3Key: urlRes.urls[idx].s3Key,
          order: idx,
          caption: idx === 0 ? "메인 사진" : `사진 ${idx + 1}`,
          thumbnail: idx === 0,
          contentType: file.type,
          size: file.size,
        }));

        const updateBody: PostUpdateRequest = {
          region: post.region,
          tag: post.tag,
          title: post.title || '제목 없음',
          content: post.content || '내용 없음',
          images: images,
        };

        const updateRes = await apiClient.put(`/api/v1/posts/private/${postId}`, updateBody, {
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId.toString(),
          },
        });

        const updateJson: ApiResponse<PostData> = updateRes.data;

        // ----------------------------
        // ✅ 최종 결과 반환
        // ----------------------------
        return updateJson.data.id;
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
        title: post.title || '제목 없음',
        content: post.content || '내용 없음',
      };

      const updateRes = await apiClient.put(`/api/v1/posts/private/${postId}`, updateBody, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
      });

      const updateJson: ApiResponse<PostData> = updateRes.data;
      return updateJson.data.id;
    }

    return postId;
  },
};
