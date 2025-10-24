import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { WebSocketChatMessage } from '../types';
import { getAccessToken, getRefreshToken } from './token';

// WebSocket 연결 상태
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

// WebSocket 클라이언트 클래스
export class ChatWebSocketClient {
  private client: Client | null = null;
  private subscriptions: Map<number, StompSubscription> = new Map();
  private userNotificationSubscription: StompSubscription | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private onStatusChange?: (status: ConnectionStatus) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3초

  constructor(onStatusChange?: (status: ConnectionStatus) => void) {
    this.onStatusChange = onStatusChange;
  }

  /**
   * WebSocket 연결
   */
  connect(): void {
    if (this.client?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    this.updateStatus('connecting');

    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    // STOMP 클라이언트 생성
    this.client = new Client({
      webSocketFactory: () => {
        // 개발: 상대 경로 (Vite proxy 사용, CORS 회피)
        // 프로덕션: 절대 URL (https://bytogether.net)
        const isDev = import.meta.env.DEV;
        const wsBaseURL = isDev ? '' : (import.meta.env.VITE_WS_BASE_URL || 'https://bytogether.net');

        // SockJS 생성 시 토큰을 쿼리 파라미터로 전달
        let url = `${wsBaseURL}/ws/v1/chat/private`;
        if (accessToken) {
          url += `?token=${encodeURIComponent(accessToken)}`;
        }
        return new SockJS(url) as any;
      },

      // STOMP 연결 헤더에도 토큰 추가
      connectHeaders: accessToken ? {
        'Authorization': `Bearer ${accessToken}`,
        'X-Refresh-Token': refreshToken || '',
      } : {},

      debug: () => {
        // WebSocket 디버그 로그 비활성화
      },

      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        if (import.meta.env.DEV) {
          console.log('[WebSocket] Connected successfully');
        }
        this.updateStatus('connected');
        this.reconnectAttempts = 0;
      },

      onDisconnect: () => {
        if (import.meta.env.DEV) {
          console.log('[WebSocket] Disconnected');
        }
        this.updateStatus('disconnected');
        this.subscriptions.clear();
      },

      onStompError: (frame) => {
        if (import.meta.env.DEV) {
          console.error('[WebSocket] STOMP error:', frame);
        }
        this.updateStatus('error');

        // 재연결 시도
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          if (import.meta.env.DEV) {
            console.log(`[WebSocket] Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          }
          setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
        }
      },

      onWebSocketError: (event) => {
        if (import.meta.env.DEV) {
          console.error('[WebSocket] WebSocket error:', event);
        }
        this.updateStatus('error');
      },
    });

    this.client.activate();
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect(): void {
    if (this.client) {
      // 모든 구독 취소
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();

      // 개인 알림 구독 취소
      this.unsubscribeFromUserNotifications();

      // 연결 해제
      this.client.deactivate();
      this.client = null;
      this.updateStatus('disconnected');
      if (import.meta.env.DEV) {
        console.log('[WebSocket] Disconnected manually');
      }
    }
  }

  /**
   * 채팅방 구독
   */
  subscribeToRoom(
    roomId: number,
    onMessage: (message: WebSocketChatMessage) => void
  ): void {
    if (!this.client?.connected) {
      if (import.meta.env.DEV) {
        console.error('[WebSocket] Not connected. Cannot subscribe to room', roomId);
      }
      return;
    }

    // 이미 구독 중이면 무시
    if (this.subscriptions.has(roomId)) {
      if (import.meta.env.DEV) {
        console.log(`[WebSocket] Already subscribed to room ${roomId}`);
      }
      return;
    }

    // 채팅방 메시지 구독
    const subscription = this.client.subscribe(
      `/topic/rooms.${roomId}.messages`,
      (message) => {
        try {
          const data: WebSocketChatMessage = JSON.parse(message.body);
          onMessage(data);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        }
      }
    );

    this.subscriptions.set(roomId, subscription);
    if (import.meta.env.DEV) {
      console.log(`[WebSocket] Subscribed to room ${roomId}`);
    }
  }

  /**
   * 채팅방 구독 취소
   */
  unsubscribeFromRoom(roomId: number): void {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
      if (import.meta.env.DEV) {
        console.log(`[WebSocket] Unsubscribed from room ${roomId}`);
      }
    }
  }

  /**
   * 개인 알림 구독 (강퇴, 시스템 알림 등)
   */
  subscribeToUserNotifications(
    userId: number,
    onNotification: (notification: any) => void
  ): void {
    if (!this.client?.connected) {
      if (import.meta.env.DEV) {
        console.error('[WebSocket] Not connected. Cannot subscribe to notifications');
      }
      return;
    }

    if (this.userNotificationSubscription) {
      if (import.meta.env.DEV) {
        console.log('[WebSocket] Already subscribed to user notifications');
      }
      return;
    }

    this.userNotificationSubscription = this.client.subscribe(
      `/user/${userId}/queue/notifications`,
      (message) => {
        try {
          const data = JSON.parse(message.body);
          onNotification(data);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('[WebSocket] Failed to parse notification:', error);
          }
        }
      }
    );

    if (import.meta.env.DEV) {
      console.log(`[WebSocket] Subscribed to user ${userId} notifications`);
    }
  }

  /**
   * 개인 알림 구독 취소
   */
  unsubscribeFromUserNotifications(): void {
    if (this.userNotificationSubscription) {
      this.userNotificationSubscription.unsubscribe();
      this.userNotificationSubscription = null;
      if (import.meta.env.DEV) {
        console.log('[WebSocket] Unsubscribed from user notifications');
      }
    }
  }

  /**
   * 메시지 전송
   */
  sendMessage(roomId: number, message: string, userId: number, nickname: string): void {
    if (!this.client?.connected) {
      if (import.meta.env.DEV) {
        console.error('[WebSocket] Not connected. Cannot send message');
      }
      return;
    }

    // 백엔드 문서에 따르면 Principal은 서버에서 자동 처리되므로 messageContent만 전송
    const payload = {
      messageContent: message
    };

    this.client.publish({
      destination: `/app/chat.${roomId}.sendMessage`,
      body: JSON.stringify(payload),
    });

    if (import.meta.env.DEV) {
      console.log('[WebSocket] Message sent to room', roomId, ':', payload);
    }
  }

  /**
   * 채팅방 나가기
   */
  leaveRoom(roomId: number): void {
    if (!this.client?.connected) {
      if (import.meta.env.DEV) {
        console.error('[WebSocket] Not connected. Cannot leave room');
      }
      return;
    }

    this.client.publish({
      destination: `/app/chat.${roomId}.leave`,
      body: '',
    });

    this.unsubscribeFromRoom(roomId);
    if (import.meta.env.DEV) {
      console.log(`[WebSocket] Left room ${roomId}`);
    }
  }

  /**
   * 연결 상태 조회
   */
  getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * 연결 여부 확인
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * 상태 업데이트
   */
  private updateStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.onStatusChange?.(status);
  }
}

// 싱글톤 인스턴스 (필요시 사용)
let chatWebSocketInstance: ChatWebSocketClient | null = null;

export const getChatWebSocketClient = (
  onStatusChange?: (status: ConnectionStatus) => void
): ChatWebSocketClient => {
  if (!chatWebSocketInstance) {
    chatWebSocketInstance = new ChatWebSocketClient(onStatusChange);
  }
  return chatWebSocketInstance;
};

export const disconnectChatWebSocket = (): void => {
  if (chatWebSocketInstance) {
    chatWebSocketInstance.disconnect();
    chatWebSocketInstance = null;
  }
};
