import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { WebSocketChatMessage } from '../types';

// WebSocket 연결 상태
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

// WebSocket 클라이언트 클래스
export class ChatWebSocketClient {
  private client: Client | null = null;
  private subscriptions: Map<number, StompSubscription> = new Map();
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

    // STOMP 클라이언트 생성
    this.client = new Client({
      webSocketFactory: () => {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';
        return new SockJS(\`\${baseURL}/ws-chat\`) as any;
      },
      
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[WebSocket Debug]', str);
        }
      },

      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('[WebSocket] Connected successfully');
        this.updateStatus('connected');
        this.reconnectAttempts = 0;
      },

      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        this.updateStatus('disconnected');
        this.subscriptions.clear();
      },

      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame);
        this.updateStatus('error');
        
        // 재연결 시도
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(\`[WebSocket] Reconnecting... (attempt \${this.reconnectAttempts}/\${this.maxReconnectAttempts})\`);
          setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
        }
      },

      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket error:', event);
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

      // 연결 해제
      this.client.deactivate();
      this.client = null;
      this.updateStatus('disconnected');
      console.log('[WebSocket] Disconnected manually');
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
      console.error('[WebSocket] Not connected. Cannot subscribe to room', roomId);
      return;
    }

    // 이미 구독 중이면 무시
    if (this.subscriptions.has(roomId)) {
      console.log(\`[WebSocket] Already subscribed to room \${roomId}\`);
      return;
    }

    // 채팅방 메시지 구독
    const subscription = this.client.subscribe(
      \`/topic/chat/\${roomId}\`,
      (message) => {
        try {
          const data: WebSocketChatMessage = JSON.parse(message.body);
          onMessage(data);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      }
    );

    this.subscriptions.set(roomId, subscription);
    console.log(\`[WebSocket] Subscribed to room \${roomId}\`);
  }

  /**
   * 채팅방 구독 취소
   */
  unsubscribeFromRoom(roomId: number): void {
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
      console.log(\`[WebSocket] Unsubscribed from room \${roomId}\`);
    }
  }

  /**
   * 메시지 전송
   */
  sendMessage(roomId: number, message: string, userId: number, nickname: string): void {
    if (!this.client?.connected) {
      console.error('[WebSocket] Not connected. Cannot send message');
      return;
    }

    const payload = {
      roomId,
      senderId: userId,
      senderNickname: nickname,
      message,
      timestamp: new Date().toISOString(),
    };

    this.client.publish({
      destination: \`/app/chat/\${roomId}\`,
      body: JSON.stringify(payload),
    });

    console.log('[WebSocket] Message sent:', payload);
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
