import apiClient from '../client';
import type {
  UploadUrlsRequest,
  UploadUrlsResponse,
  ImageUploadResult,
} from '../../types/image';

/**
 * 이미지 업로드 API 서비스
 * S3 Presigned URL을 사용한 이미지 업로드
 */
export const imageService = {
  /**
   * 단일 파일용 Presigned URL 생성
   * @param request 파일 정보
   * @returns Presigned URL 및 이미지 URL
   */
  getPresignedUrl: async (request: { fileName: string; fileType: string }): Promise<{ success: boolean; data?: { presignedUrl: string; imageUrl: string } }> => {
    try {
      const response = await apiClient.post('/api/v1/market/private/images/presigned-url', request);
      return {
        success: true,
        data: {
          presignedUrl: response.data.presignedUrl || response.data.uploadUrl,
          imageUrl: response.data.imageUrl || response.data.s3Url
        }
      };
    } catch (error) {
      console.error('Presigned URL 생성 실패:', error);
      return { success: false };
    }
  },

  /**
   * S3 업로드 URL 생성
   * @param userId 사용자 ID (헤더로 전송)
   * @param postId 게시글 ID
   * @param request 파일 정보 목록
   * @returns Presigned Upload URL 목록
   */
  generateUploadUrls: async (
    userId: number,
    postId: number,
    request: UploadUrlsRequest
  ): Promise<UploadUrlsResponse> => {
    const response = await apiClient.post(`/upload-url/${postId}`, request, {
      headers: {
        'X-User-Id': userId.toString(),
      },
    });
    return response.data;
  },

  /**
   * S3에 이미지 직접 업로드
   * @param uploadUrl Presigned Upload URL
   * @param file 업로드할 파일
   * @returns 업로드 성공 여부
   */
  uploadToS3: async (uploadUrl: string, file: File): Promise<boolean> => {
    try {
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      return true;
    } catch (error) {
      console.error('S3 업로드 실패:', error);
      return false;
    }
  },

  /**
   * 여러 이미지를 업로드하는 헬퍼 함수
   * @param userId 사용자 ID
   * @param postId 게시글 ID
   * @param files 업로드할 파일 목록
   * @returns 업로드 결과 목록
   */
  uploadMultipleImages: async (
    userId: number,
    postId: number,
    files: File[]
  ): Promise<ImageUploadResult[]> => {
    // 1. Presigned URL 생성 요청
    const request: UploadUrlsRequest = {
      files: files.map((file, index) => ({
        index,
        fileName: file.name,
        contentType: file.type,
      })),
    };

    const urlsResponse = await imageService.generateUploadUrls(userId, postId, request);

    // 2. 각 파일을 S3에 업로드
    const results: ImageUploadResult[] = await Promise.all(
      urlsResponse.urls.map(async (urlInfo, index) => {
        const file = files[index];
        const success = await imageService.uploadToS3(urlInfo.uploadUrl, file);

        return {
          s3Key: urlInfo.s3Key,
          uploadUrl: urlInfo.uploadUrl,
          file,
          success,
          error: success ? undefined : 'S3 업로드 실패',
        };
      })
    );

    return results;
  },
};
