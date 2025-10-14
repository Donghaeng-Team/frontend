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
  /** 작성자 이름 */
  userName: string;
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
