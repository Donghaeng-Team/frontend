import apiClient from '../client';
import type { ApiResponse, PaginationResponse } from '../../types';

// 채팅 관련 타입 정의
export interface ChatRoom {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  userId: string;
  userName: string;
  userProfileImage?: string;
  role: 'seller' | 'buyer';
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderProfileImage?: string;
  content: string;
  messageType: 'text' | 'image' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  messageType?: 'text' | 'image';
}

// 채팅 API 서비스
export const chatService = {
  // 채팅방 목록 조회
  getChatRooms: async (params: { page?: number; size?: number } = {}): Promise<ApiResponse<PaginationResponse<ChatRoom>>> => {
    const response = await apiClient.get('/chat/rooms', { params });
    return response.data;
  },

  // 특정 상품의 채팅방 조회/생성
  getOrCreateChatRoom: async (productId: string): Promise<ApiResponse<ChatRoom>> => {
    const response = await apiClient.post(`/chat/rooms/product/${productId}`);
    return response.data;
  },

  // 채팅방 상세 조회
  getChatRoom: async (roomId: string): Promise<ApiResponse<ChatRoom>> => {
    const response = await apiClient.get(`/chat/rooms/${roomId}`);
    return response.data;
  },

  // 채팅 메시지 목록 조회
  getMessages: async (
    roomId: string,
    params: { page?: number; size?: number; before?: string } = {}
  ): Promise<ApiResponse<PaginationResponse<ChatMessage>>> => {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, { params });
    return response.data;
  },

  // 메시지 전송
  sendMessage: async (roomId: string, data: SendMessageRequest): Promise<ApiResponse<ChatMessage>> => {
    const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, data);
    return response.data;
  },

  // 이미지 메시지 전송
  sendImageMessage: async (roomId: string, image: File): Promise<ApiResponse<ChatMessage>> => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('messageType', 'image');

    const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 메시지 읽음 처리
  markAsRead: async (roomId: string, messageId?: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.put(`/chat/rooms/${roomId}/read`, {
      messageId,
    });
    return response.data;
  },

  // 채팅방 나가기
  leaveChatRoom: async (roomId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/chat/rooms/${roomId}/leave`);
    return response.data;
  },

  // 읽지 않은 메시지 총 개수 조회
  getUnreadCount: async (): Promise<ApiResponse<{ totalUnreadCount: number }>> => {
    const response = await apiClient.get('/chat/unread-count');
    return response.data;
  },

  // 채팅방 알림 설정
  updateNotificationSettings: async (
    roomId: string,
    enabled: boolean
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.put(`/chat/rooms/${roomId}/notifications`, {
      enabled,
    });
    return response.data;
  },
};