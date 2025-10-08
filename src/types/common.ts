// 공통 타입 정의
import type { User } from './user';

// 로딩 상태 관련
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// 검색/필터 관련
export interface SearchFilters {
  keyword?: string;
  category?: string;
  location?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  status?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

// 알림 관련
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// 채팅 관련 (향후 확장용)
export interface ChatRoom {
  id: string;
  marketPostId: number;
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: number;
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'system';
  timestamp: string;
  readBy: number[];
}