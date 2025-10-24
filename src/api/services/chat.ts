import apiClient from '../client';
import type {
  ApiResponse,
  ChatRoomResponse,
  ChatRoomPageRequest,
  ChatRoomPageResponse,
  ChatMessagePageRequest,
  ChatMessagePageResponse,
  ParticipantListResponse,
  BuyerConfirmResponse,
  ExtendDeadlineResponse,
  RecruitmentCloseResponse,
  RecruitmentCancelResponse,
  ChatRoomCreateRequest,
  MyPurchaseStatsResponse,
  UserMarketIdsResponse,
  ParticipatingStaticsResponse,
} from '../../types';

// ========================================
// 채팅방 관리 API
// ========================================

export const chatService = {
  /**
   * 채팅방 목록 조회 (커서 기반 페이징)
   * GET /api/v1/chat/private
   */
  getChatRoomList: async (
    params: ChatRoomPageRequest = {}
  ): Promise<ApiResponse<ChatRoomPageResponse>> => {
    const response = await apiClient.get('/api/v1/chat/private', { params });
    return response.data;
  },

  /**
   * 채팅방 상세 조회 (입장)
   * GET /api/v1/chat/private/{roomId}
   */
  getChatRoom: async (roomId: number): Promise<ApiResponse<ChatRoomResponse>> => {
    const response = await apiClient.get(`/api/v1/chat/private/${roomId}`);
    return response.data;
  },

  /**
   * 채팅방 참여
   * POST /api/v1/chat/private/{marketId}/join
   */
  joinChatRoom: async (marketId: number): Promise<ApiResponse<ChatRoomResponse>> => {
    const response = await apiClient.post(`/api/v1/chat/private/${marketId}/join`);
    return response.data;
  },

  /**
   * 채팅방 나가기
   * POST /api/v1/chat/private/{roomId}/exit
   */
  leaveChatRoom: async (roomId: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.post(`/api/v1/chat/private/${roomId}/exit`);
    return response.data;
  },

  /**
   * 채팅방 생성 (Internal API)
   * POST /internal/v1/chat/create
   */
  createChatRoom: async (
    data: ChatRoomCreateRequest
  ): Promise<ApiResponse<ChatRoomResponse>> => {
    const response = await apiClient.post('/internal/v1/chat/create', data);
    return response.data;
  },

  // ========================================
  // 구매자 관리 API
  // ========================================

  /**
   * 구매자 확정
   * POST /api/v1/chat/private/{roomId}/participate
   */
  confirmBuyer: async (roomId: number): Promise<ApiResponse<BuyerConfirmResponse>> => {
    const response = await apiClient.post(`/api/v1/chat/private/${roomId}/participate`);
    return response.data;
  },

  /**
   * 구매자 취소
   * DELETE /api/v1/chat/private/{roomId}/participate
   */
  cancelBuyer: async (roomId: number): Promise<ApiResponse<BuyerConfirmResponse>> => {
    const response = await apiClient.delete(`/api/v1/chat/private/${roomId}/participate`);
    return response.data;
  },

  /**
   * 참여자 강퇴
   * POST /api/v1/chat/private/{roomId}/kick
   */
  kickParticipant: async (
    roomId: number,
    targetUserId: number
  ): Promise<ApiResponse<string>> => {
    const response = await apiClient.post(`/api/v1/chat/private/${roomId}/kick`, null, {
      params: { targetUserId },
    });
    return response.data;
  },

  // ========================================
  // 채팅방 상태 관리 API
  // ========================================

  /**
   * 마감 시간 연장
   * PATCH /api/v1/chat/private/{roomId}/extend
   */
  extendDeadline: async (
    roomId: number,
    hours: number
  ): Promise<ApiResponse<ExtendDeadlineResponse>> => {
    const response = await apiClient.patch(
      `/api/v1/chat/private/${roomId}/extend`,
      {},
      {
        params: { hours },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * 모집 마감
   * PATCH /api/v1/chat/private/{roomId}/close
   */
  closeRecruitment: async (
    roomId: number
  ): Promise<ApiResponse<RecruitmentCloseResponse>> => {
    const response = await apiClient.patch(
      `/api/v1/chat/private/${roomId}/close`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * 모집 취소
   * PATCH /api/v1/chat/private/{roomId}/cancel
   */
  cancelRecruitment: async (roomId: number): Promise<ApiResponse<RecruitmentCancelResponse>> => {
    const response = await apiClient.patch(
      `/api/v1/chat/private/${roomId}/cancel`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * 구매 완료
   * POST /api/v1/chat/private/{roomId}/complete
   */
  completePurchase: async (roomId: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.post(`/api/v1/chat/private/${roomId}/complete`);
    return response.data;
  },

  // ========================================
  // 메시지 & 참여자 조회 API
  // ========================================

  /**
   * 메시지 목록 조회 (커서 기반 페이징)
   * GET /api/v1/chat/private/{roomId}/messages
   */
  getMessages: async (
    roomId: number,
    params: Omit<ChatMessagePageRequest, 'roomId'>
  ): Promise<ApiResponse<ChatMessagePageResponse>> => {
    const response = await apiClient.get(`/api/v1/chat/private/${roomId}/messages`, {
      params: { ...params, roomId },
    });
    return response.data;
  },

  /**
   * 참여자 목록 조회
   * GET /api/v1/chat/public/{marketId}/participants
   */
  getParticipants: async (
    marketId: number
  ): Promise<ApiResponse<ParticipantListResponse>> => {
    const response = await apiClient.get(`/api/v1/chat/public/${marketId}/participants`);
    return response.data;
  },

  /**
   * 내 공동구매 통계 조회
   * GET /api/v1/chat/private/me
   */
  getMyStats: async (): Promise<ApiResponse<ParticipatingStaticsResponse>> => {
    const response = await apiClient.get('/api/v1/chat/private/me');
    return response.data;
  },

  /**
   * 내 공동구매 마켓 ID 목록 조회
   * GET /api/v1/chat/private/mylist
   */
  getMyMarketIds: async (): Promise<ApiResponse<UserMarketIdsResponse>> => {
    const response = await apiClient.get('/api/v1/chat/private/mylist');
    return response.data;
  },

  /**
   * @deprecated getMyStats를 사용하세요
   */
  getMyPurchaseStats: async (): Promise<ApiResponse<MyPurchaseStatsResponse>> => {
    const response = await apiClient.get('/api/v1/chat/private/me');
    return response.data;
  },
};
