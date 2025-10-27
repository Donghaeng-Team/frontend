import { create } from 'zustand';
import { chatService } from '../api/services/chat';
import { ChatWebSocketClient } from '../utils/websocket';
import type { ConnectionStatus } from '../utils/websocket';
import type {
  ChatRoomResponse,
  ChatMessageResponse,
  ParticipantResponse,
  WebSocketChatMessage,
} from '../types';

interface ChatState {
  wsClient: ChatWebSocketClient | null;
  wsStatus: ConnectionStatus;
  chatRooms: ChatRoomResponse[];
  chatRoomsLoading: boolean;
  currentRoom: ChatRoomResponse | null;
  messages: ChatMessageResponse[];
  participants: ParticipantResponse[];
  error: string | null;

  initializeWebSocket: (onStatusChange?: (status: ConnectionStatus) => void) => void;
  disconnectWebSocket: () => void;
  fetchChatRooms: () => Promise<void>;
  fetchChatRoom: (roomId: number) => Promise<void>;
  joinChatRoom: (roomId: number) => Promise<void>;
  leaveChatRoom: (roomId: number) => void;
  exitChatRoom: (roomId: number) => Promise<void>;
  sendMessage: (roomId: number, message: string, userId: number, nickname: string) => void;
  addMessage: (message: ChatMessageResponse) => void;
  confirmBuyer: (roomId: number) => Promise<void>;
  cancelBuyer: (roomId: number) => Promise<void>;
  extendDeadline: (roomId: number, hours: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  wsClient: null,
  wsStatus: 'disconnected',
  chatRooms: [],
  chatRoomsLoading: false,
  currentRoom: null,
  messages: [],
  participants: [],
  error: null,

  initializeWebSocket: (onStatusChange) => {
    const wsClient = new ChatWebSocketClient((status) => {
      set({ wsStatus: status });
      onStatusChange?.(status);
    });
    wsClient.connect();
    set({ wsClient });
  },

  disconnectWebSocket: () => {
    const { wsClient } = get();
    wsClient?.disconnect();
    set({ wsClient: null, wsStatus: 'disconnected' });
  },

  fetchChatRooms: async () => {
    try {
      set({ chatRoomsLoading: true, error: null });
      const response = await chatService.getChatRoomList();
      if (response.success && response.data) {
        set({ chatRooms: response.data.chatRooms, chatRoomsLoading: false });
      }
    } catch (error: any) {
      set({ error: '채팅방 목록을 불러오는데 실패했습니다.', chatRoomsLoading: false });
    }
  },

  fetchChatRoom: async (roomId) => {
    try {
      const response = await chatService.getChatRoom(roomId);
      if (response.success && response.data) {
        set({ currentRoom: response.data });

        // 메시지도 함께 로드
        try {
          const messagesResponse = await chatService.getMessages(roomId, { size: 50 });
          if (messagesResponse.success && messagesResponse.data) {
            const sortedMessages = messagesResponse.data.messages.sort((a, b) =>
              new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
            );
            set({ messages: sortedMessages });
          }
        } catch (error) {
          set({ messages: [] });
        }
      }
    } catch (error: any) {
      set({ error: '채팅방 정보를 불러오는데 실패했습니다.' });
    }
  },

  joinChatRoom: async (roomId) => {
    try {
      // 채팅방 정보 조회 (이미 참가한 채팅방)
      const response = await chatService.getChatRoom(roomId);
      if (import.meta.env.DEV) {
        console.log('[채팅] API 응답 전체:', JSON.stringify(response, null, 2));
        console.log('[채팅] currentRoom 데이터:', response.data);
      }
      if (response.success && response.data) {
        set({ currentRoom: response.data });

        // 이전 채팅 메시지 로드
        try {
          const messagesResponse = await chatService.getMessages(roomId, { size: 50 });
          if (messagesResponse.success && messagesResponse.data) {
            // 최신 메시지가 아래로 오도록 정렬 (오래된 것부터)
            const sortedMessages = messagesResponse.data.messages.sort((a, b) => 
              new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
            );
            set({ messages: sortedMessages });
      
          }
        } catch (error) {
    
          // 메시지 로드 실패해도 채팅방은 계속 진행
          set({ messages: [] });
        }

        // WebSocket 구독 설정 (연결 대기)
        const subscribeWhenReady = (retryCount = 0) => {
          const { wsClient } = get();
          console.log(`[DEBUG] 구독 시도 ${retryCount + 1}/10, 연결:`, wsClient?.isConnected());

          if (wsClient?.isConnected()) {
            console.log(`[DEBUG] 방 ${roomId} 구독 시작`);
            wsClient.subscribeToRoom(roomId, (message: ChatMessageResponse) => {
              console.log('[DEBUG] 메시지 수신:', message);
              get().addMessage(message);
            });
          } else if (retryCount < 10) {
            // 연결 대기 (최대 10번, 5초)
            setTimeout(() => subscribeWhenReady(retryCount + 1), 500);
          } else {
            console.error('[DEBUG] WebSocket 구독 실패 - 연결 안됨');
          }
        };
        subscribeWhenReady();
      }
    } catch (error: any) {
      set({ error: '채팅방 정보를 불러오는데 실패했습니다.' });

    }
  },

  sendMessage: (roomId, message, userId, nickname) => {
    const { wsClient } = get();
    if (import.meta.env.DEV) {
      console.log('[채팅] 메시지 전송 시도:', { roomId, message, userId, nickname, connected: wsClient?.isConnected() });
    }
    if (wsClient?.isConnected()) {
      wsClient.sendMessage(roomId, message, userId, nickname);
    } else {

    }
  },

  addMessage: (message) => {
    set({ messages: [...get().messages, message] });
  },

  confirmBuyer: async (roomId) => {
    try {
      const response = await chatService.confirmBuyer(roomId);
      if (response.success) {
        await get().fetchChatRoom(roomId);
      }
    } catch (error: any) {
      set({ error: '구매자 확정에 실패했습니다.' });
    }
  },

  leaveChatRoom: (roomId) => {
    const { wsClient } = get();
    if (wsClient) {
      wsClient.unsubscribeFromRoom(roomId);
    }
    set({ currentRoom: null, messages: [] });
  },

  exitChatRoom: async (roomId) => {
    try {
      const response = await chatService.leaveChatRoom(roomId);
      if (response.success) {
        // WebSocket 구독 해제
        const { wsClient } = get();
        if (wsClient) {
          wsClient.unsubscribeFromRoom(roomId);
        }
        set({ currentRoom: null, messages: [], error: null });
      }
    } catch (error: any) {
      set({ error: '채팅방 나가기에 실패했습니다.' });
      throw error;
    }
  },

  cancelBuyer: async (roomId) => {
    try {
      const response = await chatService.cancelBuyer(roomId);
      if (response.success) {
        // 채팅방 정보 새로고침
        await get().fetchChatRoom(roomId);
      }
    } catch (error: any) {
      set({ error: '구매 취소에 실패했습니다.' });
      throw error;
    }
  },

  extendDeadline: async (roomId, hours) => {
    try {
      const response = await chatService.extendDeadline(roomId, hours);
      if (response.success) {
        // 채팅방 정보 새로고침
        await get().fetchChatRoom(roomId);
      }
    } catch (error: any) {
      set({ error: '시간 연장에 실패했습니다.' });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    const { wsClient } = get();
    wsClient?.disconnect();
    set({
      wsClient: null,
      wsStatus: 'disconnected',
      chatRooms: [],
      chatRoomsLoading: false,
      currentRoom: null,
      messages: [],
      participants: [],
      error: null,
    });
  },
}));
