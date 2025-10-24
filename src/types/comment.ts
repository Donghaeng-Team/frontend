// 댓글 관련 타입 정의

/**
 * 댓글 생성 요청
 */
export interface CommentCreateRequest {
  /** 게시글 ID */
  postId: number;
  /** 작성자 ID */
  userId: number;
  /** 댓글 내용 */
  content: string;
  /** 생성일시 */
  createdAt?: string;
}

/**
 * 댓글 응답
 */
export interface CommentResponse {
  /** 댓글 ID */
  commentId: number;
  /** 작성자 ID */
  userId: number;
  /** 작성자 이름 (nullable) */
  userName: string | null;
  /** 댓글 내용 */
  content: string;
  /** 생성일시 */
  createdAt: string;
  /** 수정일시 */
  updatedAt: string;
}

/**
 * 댓글 수정 요청
 */
export interface CommentUpdateRequest {
  /** 댓글 ID */
  commentId: number;
  /** 작성자 ID */
  authorId: number;
  /** 수정할 내용 */
  content: string;
}

/**
 * 댓글 삭제 요청 파라미터
 */
export interface CommentDeleteParams {
  /** 댓글 ID */
  commentId: number;
  /** 작성자 ID */
  authorId: number;
}

/**
 * 페이지네이션 정렬 객체
 */
export interface SortObject {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

/**
 * 페이지네이션 Pageable 객체
 */
export interface PageableObject {
  offset: number;
  sort: SortObject;
  paged: boolean;
  pageSize: number;
  pageNumber: number;
  unpaged: boolean;
}

/**
 * 댓글 페이지네이션 응답
 */
export interface PageCommentResponse {
  /** 전체 요소 개수 */
  totalElements: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 크기 */
  size: number;
  /** 댓글 목록 */
  content: CommentResponse[];
  /** 현재 페이지 번호 */
  number: number;
  /** 정렬 정보 */
  sort: SortObject;
  /** 첫 페이지 여부 */
  first: boolean;
  /** 마지막 페이지 여부 */
  last: boolean;
  /** 현재 페이지의 요소 개수 */
  numberOfElements: number;
  /** Pageable 객체 */
  pageable: PageableObject;
  /** 빈 페이지 여부 */
  empty: boolean;
}
