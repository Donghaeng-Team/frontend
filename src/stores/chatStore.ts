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
  sendMessage: (roomId: number, message: string, userId: number, nickname: string) => void;
  addMessage: (message: ChatMessageResponse) => void;
  confirmBuyer: (roomId: number) => Promise<void>;
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
      }
    } catch (error: any) {
      set({ error: '채팅방 정보를 불러오는데 실패했습니다.' });
    }
  },

  joinChatRoom: async (roomId) => {
    try {
      const response = await chatService.joinChatRoom(roomId);
      if (response.success && response.data) {
        set({ currentRoom: response.data });
        const { wsClient } = get();
        if (wsClient?.isConnected()) {
          wsClient.subscribeToRoom(roomId, (message: WebSocketChatMessage) => {
            // WebSocket 메시지 타입에 따라 messageType 결정
            let messageType: 'TEXT' | 'SYSTEM' | 'DEADLINE_EXTEND' = 'TEXT';
            if (message.type === 'SYSTEM' || message.type === 'JOIN' || message.type === 'LEAVE') {
              messageType = 'SYSTEM';
            }

            // 시스템 메시지의 경우 숫자를 닉네임으로 교체
            let messageContent = message.message;
            if (messageType === 'SYSTEM' && message.senderNickname) {
              messageContent = messageContent.replace(/^\d+/, message.senderNickname);
            }

            get().addMessage({
              id: Date.now(),
              senderId: message.senderId,
              senderNickname: message.senderNickname,
              messageContent: messageContent,
              messageType: messageType,
              sentAt: message.timestamp,
            });
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message;

      // "이미 참여중인 채팅방입니다" 에러는 무시 (이미 참여중이면 정상)
      if (errorMessage === '이미 참여중인 채팅방입니다') {
        console.log('[Chat] Already joined, fetching room info instead');
        // 채팅방 정보만 조회
        get().fetchChatRoom(roomId);

        // WebSocket 구독은 설정
        const { wsClient } = get();
        if (wsClient?.isConnected()) {
          wsClient.subscribeToRoom(roomId, (message: WebSocketChatMessage) => {
            let messageType: 'TEXT' | 'SYSTEM' | 'DEADLINE_EXTEND' = 'TEXT';
            if (message.type === 'SYSTEM' || message.type === 'JOIN' || message.type === 'LEAVE') {
              messageType = 'SYSTEM';
            }

            let messageContent = message.message;
            if (messageType === 'SYSTEM' && message.senderNickname) {
              messageContent = messageContent.replace(/^\d+/, message.senderNickname);
            }

            get().addMessage({
              id: Date.now(),
              senderId: message.senderId,
              senderNickname: message.senderNickname,
              messageContent: messageContent,
              messageType: messageType,
              sentAt: message.timestamp,
            });
          });
        }
      } else {
        set({ error: '채팅방 참여에 실패했습니다.' });
      }
    }
  },

  sendMessage: (roomId, message, userId, nickname) => {
    const { wsClient } = get();
    if (wsClient?.isConnected()) {
      wsClient.sendMessage(roomId, message, userId, nickname);
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
