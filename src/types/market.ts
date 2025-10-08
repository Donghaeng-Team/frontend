// 마켓글 관련 타입 정의
import type { PaginationResponse } from './api';

export interface MarketPost {
  marketId: number;
  title: string;
  description: string;
  price: number;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  deadline: string;
  status: 'RECRUITING' | 'COMPLETED' | 'CANCELLED' | 'EXTENDED';
  authorId: number;
  authorName: string;
  category: string;
  location: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  isWished?: boolean; // 찜하기 여부 (로그인 시에만)
}

export interface CreateMarketPostRequest {
  title: string;
  description: string;
  price: number;
  minParticipants: number;
  maxParticipants: number;
  deadline: string;
  category: string;
  location: string;
  images?: File[]; // 업로드할 이미지 파일들
}

export interface UpdateMarketPostRequest {
  title?: string;
  description?: string;
  price?: number;
  minParticipants?: number;
  maxParticipants?: number;
  deadline?: string;
  category?: string;
  location?: string;
  images?: File[];
}

export interface MarketPostFilters {
  category?: string;
  location?: string;
  status?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'deadline' | 'price' | 'participants';
  sortDirection?: 'ASC' | 'DESC';
}

// 마켓글 목록 응답 타입
export type MarketPostListResponse = PaginationResponse<MarketPost>;

// 상품 이미지 관련
export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  order: number;
  alt?: string;
}