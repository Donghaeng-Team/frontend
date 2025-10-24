# WebSocket 채팅 스펙 분석 및 문제 해결

## 📋 백엔드 스펙 vs 프론트엔드 구현 비교

### 엔드포인트 매핑

| 기능 | 백엔드 스펙 | 프론트엔드 구현 | 상태 |
|------|------------|----------------|------|
| 웹소켓 연결 | `/ws/v1/chat/private` | `/ws/v1/chat/private` | ✅ |
| 채팅방 메시지 구독 | `/topic/rooms.{roomId}.messages` | `/topic/rooms.${roomId}.messages` | ✅ |
| 개인 알림 구독 | `/user/{userId}/queue/notifications` | `/user/${userId}/queue/notifications` | ✅ |
| 메시지 전송 | `/app/chat.{roomId}.sendMessage` | `/app/chat.${roomId}.sendMessage` | ✅ |
| 채팅방 나가기 | `/app/chat.{roomId}.leave` | `/app/chat.${roomId}.leave` | ✅ |

### 메시지 페이로드

**백엔드 요구사항:**
```javascript
{
  messageContent: "메시지 내용"
}
// Principal은 서버에서 자동 처리
```

**프론트엔드 구현:**
```typescript
const payload = {
  messageContent: message
};
```
✅ **일치함**

## 🔧 현재 발생 중인 문제

### 1. 로컬 환경 - 401 Unauthorized

**증상:**
```
GET http://localhost:3000/ws/v1/chat/private/info?token=... 401 (Unauthorized)
```

**원인:**
- `/ws/v1/chat/private/info`는 SockJS 핸드셰이크 엔드포인트
- Spring Security가 `/ws/v1/chat/private/**` 경로를 차단
- 토큰을 쿼리 파라미터로 전송하고 있으나, Security 필터가 경로 자체를 막고 있음

**해결방법 (백엔드):**
```java
// SecurityConfig.java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/ws/v1/chat/private/**").permitAll()  // 추가 필요
            // ... 기타 설정
        );
    return http.build();
}
```

또는 WebSocket 인증을 위한 커스텀 핸들러 구현:
```java
@Configuration
public class WebSocketSecurityConfig {
    @Bean
    public ChannelInterceptor authChannelInterceptor() {
        return new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                // 쿼리 파라미터에서 토큰 검증
                // ...
            }
        };
    }
}
```

### 2. 프로덕션 환경 - WebSocket 연결 실패

**증상:**
```
WebSocket connection to 'wss://bytogether.net/ws/v1/chat/private/...' failed
EventSource's response has a MIME type ("text/html") that is not "text/event-stream"
Uncaught SyntaxError: Unexpected token '<'
```

**원인:**
- CloudFront가 `/ws/*` 경로를 백엔드로 라우팅하지 않음
- 404 HTML 페이지가 반환됨
- SockJS가 HTML을 JSON/이벤트 스트림으로 파싱하려다 실패

**해결방법 (인프라 - CloudFront):**
```yaml
CloudFront Distribution 설정:
  Behaviors:
    - PathPattern: /ws/*
      TargetOrigin: Backend-ALB
      CachePolicy: CachingDisabled
      OriginRequestPolicy: AllViewer
      AllowedMethods:
        - GET
        - HEAD
        - OPTIONS
        - PUT
        - POST
        - PATCH
        - DELETE
      ViewerProtocolPolicy: redirect-to-https
```

**추가 확인 사항:**
1. ALB가 WebSocket 연결을 지원하는지 확인
2. Target Group의 Health Check 설정
3. Security Group에서 WebSocket 포트 허용

## 📝 프론트엔드 코드 구현 상세

### WebSocket 초기화

```typescript
// src/utils/websocket.ts
const client = new Client({
  webSocketFactory: () => {
    const isDev = import.meta.env.DEV;
    const wsBaseURL = isDev ? '' : (import.meta.env.VITE_WS_BASE_URL || 'https://bytogether.net');
    let url = `${wsBaseURL}/ws/v1/chat/private`;
    if (accessToken) {
      url += `?token=${encodeURIComponent(accessToken)}`;
    }
    return new SockJS(url);
  },
  connectHeaders: accessToken ? {
    'Authorization': `Bearer ${accessToken}`,
    'X-Refresh-Token': refreshToken || '',
  } : {},
  // ...
});
```

### 채팅방 구독

```typescript
subscribeToRoom(roomId: number, onMessage: (message: WebSocketChatMessage) => void): void {
  const subscription = this.client.subscribe(
    `/topic/rooms.${roomId}.messages`,
    (message) => {
      const data: WebSocketChatMessage = JSON.parse(message.body);
      onMessage(data);
    }
  );
  this.subscriptions.set(roomId, subscription);
}
```

### 개인 알림 구독

```typescript
subscribeToUserNotifications(userId: number, onNotification: (notification: any) => void): void {
  this.userNotificationSubscription = this.client.subscribe(
    `/user/${userId}/queue/notifications`,
    (message) => {
      const data = JSON.parse(message.body);
      onNotification(data);
    }
  );
}
```

### 메시지 전송

```typescript
sendMessage(roomId: number, message: string): void {
  const payload = {
    messageContent: message
  };
  this.client.publish({
    destination: `/app/chat.${roomId}.sendMessage`,
    body: JSON.stringify(payload),
  });
}
```

### 채팅방 나가기

```typescript
leaveRoom(roomId: number): void {
  this.client.publish({
    destination: `/app/chat.${roomId}.leave`,
    body: '',
  });
  this.unsubscribeFromRoom(roomId);
}
```

## 🎯 권장 플로우

### 채팅 서비스 접근 시
1. WebSocket 연결 구축
2. REST API로 채팅방 목록 조회
3. STOMP로 개인 알림 구독: `/user/{userId}/queue/notifications`

### 개별 채팅방 접근 시
1. REST API로 채팅방 메시지 이력 조회
2. STOMP로 채팅방 메시지 구독: `/topic/rooms.{roomId}.messages`

### 채팅방 나가기 시
1. STOMP로 나가기 메시지 전송: `/app/chat.{roomId}.leave`
2. 채팅방 메시지 구독 해제

## ✅ 결론

**프론트엔드 코드는 백엔드 스펙과 완벽히 일치합니다.**

현재 발생하는 모든 오류는 인프라/백엔드 설정 문제이며, 프론트엔드 코드 수정이 필요하지 않습니다.

### 해결 필요 항목
- [ ] **로컬**: Spring Security에서 `/ws/v1/chat/private/**` 경로 허용
- [ ] **프로덕션**: CloudFront에서 `/ws/*` 경로를 백엔드로 라우팅 설정
- [ ] **프로덕션**: ALB WebSocket 지원 확인

작성일: 2025-10-24
