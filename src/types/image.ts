// 이미지 업로드 관련 타입 정의

/**
 * 파일 정보 (S3 Presigned URL 요청용)
 */
export interface FileInfo {
  /** 파일 인덱스 */
  index: number;
  /** 파일 이름 */
  fileName: string;
  /** MIME 타입 (예: image/jpeg) */
  contentType: string;
}

/**
 * S3 업로드 URL 요청
 */
export interface UploadUrlsRequest {
  /** 업로드할 파일 목록 */
  files: FileInfo[];
}

/**
 * S3 업로드 URL 정보
 */
export interface UploadUrl {
  /** Presigned Upload URL */
  uploadUrl: string;
  /** S3 키 (저장 경로) */
  s3Key: string;
}

/**
 * S3 업로드 URL 응답
 */
export interface UploadUrlsResponse {
  /** 업로드 URL 목록 */
  urls: UploadUrl[];
}

/**
 * 이미지 업로드 헬퍼 타입
 */
export interface ImageUploadResult {
  /** S3 키 */
  s3Key: string;
  /** 업로드 URL */
  uploadUrl: string;
  /** 원본 파일 */
  file: File;
  /** 업로드 성공 여부 */
  success?: boolean;
  /** 에러 메시지 */
  error?: string;
}
