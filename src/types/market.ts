// 마켓글(공동구매) 관련 타입 정의

import type { ParticipantResponse } from './chat';

/**
 * 마켓 상태
 */
export type MarketStatus = 'RECRUITING' | 'ENDED' | 'CANCELLED' | 'REMOVED';

/**
 * 정렬 옵션
 */
export type MarketSortType = 'LATEST' | 'ENDING_SOON' | 'CHEAPEST' | 'MOST_VIEWED';

/**
 * 이미지 응답
 */
export interface ImageResponse {
  sortOrder: number;
  imageUrl: string;
  originalName: string;
}

/**
 * 마켓 간략 정보 (목록용)
 */
export interface MarketSimpleResponse {
  marketId: number;
  title: string;
  categoryId: string;
  price: number;
  emdName: string;
  recruitNow: number;
  recruitMax: number;
  status: MarketStatus;
  thumbnailImageUrl: string | null;
  nickname: string;
  userProfileImageUrl: string | null;
}

/**
 * 마켓 상세 정보
 */
export interface MarketDetailResponse {
  marketId: number;
  categoryId: string;
  endTime: string;
  price: number;
  recruitMin: number;
  recruitMax: number;
  recruitNow: number;
  status: MarketStatus;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  locationText: string;
  divisionId: string;
  emdName: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  views: number;
  images: ImageResponse[];
  participants: ParticipantResponse[];
  chatRoomId?: number; // 채팅방 ID (백엔드에서 제공)
}

/**
 * 마켓 목록 요청
 */
export interface MarketListRequest {
  pageNum?: number;
  pageSize?: number;
  divisionId: string;
  depth: number;
  status?: MarketStatus;
  categoryId?: string;
  keyword?: string;
  sort?: MarketSortType;
}

/**
 * 마켓 목록 응답
 */
export interface MarketListResponse {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  markets: MarketSimpleResponse[];
}

/**
 * 마켓 생성 요청
 */
export interface CreateMarketRequest {
  images?: File[];
  title: string;
  categoryId: string;
  price: number;
  recruitMin: number;
  recruitMax: number;
  endTime: string;
  content: string;
  latitude: number;
  longitude: number;
  locationText: string;
}

/**
 * 마켓 생성 응답
 */
export interface CreateMarketResponse {
  marketId: number;
}

/**
 * 마켓 수정 요청
 */
export interface PutMarketRequest {
  images?: File[];
  title: string;
  categoryId: string;
  endTime: string;
  content: string;
}

/**
 * 마켓 수정 응답
 */
export interface PutMarketResponse {
  marketId: number;
}

/**
 * 마켓 마감일 연장 요청
 */
export interface ExtendMarketRequest {
  endTime: string;
}

/**
 * 마켓 마감일 연장 응답
 */
export interface ExtendMarketResponse {
  marketId: number;
}

/**
 * 기본 페이지 요청
 */
export interface DefaultPageRequest {
  pageNum?: number;
  pageSize?: number;
}

// 기존 타입 (하위 호환성 유지)
export interface MarketPost {
  marketId: number;
  title: string;
  description: string;
  price: number;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  deadline: string;
  status: MarketStatus;
  authorId: number;
  authorName: string;
  category: string;
  location: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  isWished?: boolean;
}