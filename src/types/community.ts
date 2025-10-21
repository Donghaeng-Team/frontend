// 커뮤니티 게시글 관련 타입 정의

/**
 * 게시글 초기 생성 요청
 */
export interface PostCreateInitRequest {
  /** 지역 코드 (필수) */
  region: string;
  /** 태그 (필수) */
  tag: string;
}

/**
 * 게시글 데이터
 */
export interface PostData {
  /** 게시글 ID */
  id: number;
  /** 작성자 ID */
  authorId: number;
  /** 제목 */
  title: string;
  /** 내용 */
  content: string;
  /** 지역 */
  region: string;
  /** 태그 */
  tag: string;
  /** 이미지 URL 목록 */
  imageUrls: string[] | null;
}

/**
 * 업데이트 요청의 이미지 메타데이터
 */
export interface ImageMeta {
  s3Key: string;
  order: number;
  caption: string;
  isThumbnail: boolean;
  contentType: string;
  size: number;
}
/**
 * 게시글 최종 수정 요청
 */
export interface PostUpdateRequest {
  /** 지역 코드 (필수) */
  region: string;
  /** 태그 (필수) */
  tag: string;
  /** 제목 */
  title?: string;
  /** 내용 */
  content?: string;
  /** 이미지 S3 키 목록 */
  images?: ImageMeta[];
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
