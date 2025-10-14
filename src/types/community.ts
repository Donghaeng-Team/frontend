// 커뮤니티 게시글 관련 타입 정의

/**
 * 게시글 이미지 등록 정보
 */
export interface PostImageRegister {
  /** S3 키 (필수) */
  s3Key: string;
  /** 이미지 순서 (0부터 시작) */
  order: number;
  /** 이미지 설명 (최대 200자) */
  caption?: string;
  /** MIME 타입 (image/로 시작) */
  contentType?: string;
  /** 파일 크기 (bytes) */
  size?: number;
  /** 이미지 너비 (px) */
  width?: number;
  /** 이미지 높이 (px) */
  height?: number;
  /** 썸네일 여부 */
  thumbnail?: boolean;
}

/**
 * 게시글 생성/수정 요청
 */
export interface PostCreateAndUpdateRequest {
  /** 지역 코드 (필수) */
  region: string;
  /** 태그 (필수) */
  tag: string;
  /** 제목 (필수) */
  title: string;
  /** 내용 (필수) */
  content: string;
  /** 이미지 목록 (최대 5개) */
  images?: PostImageRegister[];
}

/**
 * 게시글 목록 응답 (간략 정보)
 */
export interface PostListResponse {
  /** 게시글 ID */
  postId: number;
  /** 제목 */
  title: string;
  /** 미리보기 내용 */
  previewContent: string;
  /** 지역 */
  region: string;
  /** 태그 */
  tag: string;
  /** 썸네일 URL */
  thumbnailUrl: string | null;
  /** 생성일시 */
  createdAt: string;
  /** 좋아요 수 */
  likeCount: number;
  /** 댓글 수 */
  commentCount: number;
  /** 조회 수 */
  viewCount: number;
}

/**
 * 게시글 상세 응답
 */
export interface PostDetailResponse {
  /** 게시글 ID */
  postId: number;
  /** 제목 */
  title: string;
  /** 내용 */
  content: string;
  /** 지역 */
  region: string;
  /** 태그 */
  tag: string;
  /** 작성자 ID */
  authorId: number;
  /** 이미지 URL 목록 */
  imageUrls: string[];
  /** 썸네일 URL */
  thumbnailUrl: string | null;
  /** 생성일시 */
  createdAt: string;
  /** 수정일시 */
  updatedAt: string;
  /** 좋아요 수 */
  likeCount: number;
  /** 댓글 수 */
  commentCount: number;
  /** 조회 수 */
  viewCount: number;
}

/**
 * 게시글 목록 조회 파라미터
 */
export interface GetPostsListParams {
  /** 지역 코드 (필수) */
  divisionCode: string;
  /** 태그 필터 (기본값: 'all') */
  tag?: string;
}

/**
 * 게시글 태그 타입
 */
export type PostTag =
  | 'all'
  | 'general'
  | 'question'
  | 'tip'
  | 'review'
  | 'event'
  | string; // 확장 가능하도록 string 추가
