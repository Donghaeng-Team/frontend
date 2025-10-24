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

export interface RecruitmentCancelResponse {
  roomId: number;
  canceledAt: string;
}

export interface ParticipantListResponse {
  roomId: number;
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

export interface MyPurchaseStatsResponse {
  activeAsCreator: number;    // 자신이 개설자 + 현재 활성화 상태인 채팅방 숫자
  activeAsBuyer: number;       // 자신이 개설자가 아닌 구매자 + 현재 활성화 상태인 채팅방 숫자
  completed: number;           // 자신이 개설자 또는 구매자 + 현재 종료 상태인 채팅방 숫자
}

export interface UserMarketIdsResponse {
  ongoing: number[];           // 진행 중인 공동구매 마켓 ID 목록
  completed: number[];         // 완료된 공동구매 마켓 ID 목록
  ongoingCount: number;        // 진행 중인 공동구매 개수
  completedCount: number;      // 완료된 공동구매 개수
}

export interface ParticipatingStaticsResponse {
  activeAsCreator: number;     // 개설자로 활성화된 채팅방 수
  activeAsBuyer: number;       // 구매자로 활성화된 채팅방 수
  completed: number;           // 완료된 채팅방 수
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
