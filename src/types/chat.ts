// 채팅 API 타입 정의

// ========================================
// Enums
// ========================================

export type ChatRoomStatus =
  | 'RECRUITING'           // 모집 중
  | 'RECRUITMENT_CLOSED'   // 모집 마감
  | 'COMPLETED'            // 구매 완료
  | 'CANCELLED';           // 취소됨

export type ParticipantStatus =
  | 'ACTIVE'                // 활성
  | 'LEFT_VOLUNTARY'        // 자발적 퇴장
  | 'LEFT_NOT_BUYER'        // 구매자 아니어서 퇴장
  | 'LEFT_COMPLETED'        // 완료 후 퇴장
  | 'BANNED';               // 강퇴됨

export type MessageType =
  | 'TEXT'                  // 일반 텍스트
  | 'SYSTEM'                // 시스템 메시지
  | 'DEADLINE_EXTEND';      // 마감 연장 알림

// ========================================
// Response Types
// ========================================

export interface ChatRoomResponse {
  id: number;
  creatorUserId: number;
  marketId: number;
  title: string;
  thumbnailUrl: string;
  minBuyers: number;
  maxBuyers: number;
  currentBuyers: number;
  currentParticipants: number;
  status: ChatRoomStatus;
  participantStatus: ParticipantStatus;
  lastMessageAt: string;
  listOrderTime: string;
  endTime: string;
  recruitmentClosedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
  creator: boolean;
  buyer: boolean;
}

export interface ChatMessageResponse {
  id: number;
  senderId: number;
  senderNickname: string;
  messageContent: string;
  messageType: MessageType;
  sentAt: string;
}

export interface ParticipantResponse {
  userId: number;
  nickname: string;
  profileImage: string;
  isBuyer: boolean;
  isCreator: boolean;
  joinedAt: string;
}

export interface BuyerConfirmResponse {
  userId: number;
  isBuyer: boolean;
  currentBuyers: number;
  confirmedAt: string;
}

export interface ExtendDeadlineResponse {
  roomId: number;
  newDeadline: string;
  extendedHours: number;
}

export interface RecruitmentCloseResponse {
  roomId: number;
  closedAt: string;
  finalBuyerCount: number;
  kickedCount: number;
}

export interface ParticipantListResponse {
  currentParticipants: number;
  currentBuyers: number;
  participants: ParticipantResponse[];
}

export interface ChatRoomPageResponse {
  chatRooms: ChatRoomResponse[];
  hasMore: boolean;
  nextCursor: string | null;
  nextParticipantId: number | null;
}

export interface ChatMessagePageResponse {
  messages: ChatMessageResponse[];
  hasMore: boolean;
  nextCursor: number | null;
}

// ========================================
// Request Types
// ========================================

export interface ChatRoomCreateRequest {
  marketId: number;
  creatorUserId: number;
  endTime: string;
  minBuyers: number;
  maxBuyers: number;
  thumbnailUrl: string;
  title: string;
}

export interface ChatRoomPageRequest {
  cursor?: string;           // ISO 8601 datetime
  participantId?: number;
  size?: number;             // minimum: 1
}

export interface ChatMessagePageRequest {
  cursor?: number;           // message ID
  roomId: number;
  size?: number;             // minimum: 1
}

// ========================================
// WebSocket Message Types
// ========================================

export interface WebSocketChatMessage {
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'SYSTEM';
  roomId: number;
  senderId: number;
  senderNickname: string;
  message: string;
  timestamp: string;
}

export interface WebSocketSubscription {
  roomId: number;
  subscription: any; // STOMP subscription object
}
