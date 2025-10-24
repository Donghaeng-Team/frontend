# WebSocket 연결 이슈 - 백엔드 수정 필요

## 현재 상황

프론트엔드에서 WebSocket 연결 시 다음 오류들이 발생하고 있습니다:

### 1. 401 Unauthorized
```
GET http://localhost:8080/ws/v1/chat/private/info?token=eyJ... 401 (Unauthorized)
```

### 2. CORS 오류
```
Access to XMLHttpRequest at 'http://localhost:8080/ws/v1/chat/private/info?token=...'
from origin 'http://localhost:3000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 문제 분석

### SockJS 동작 방식
SockJS는 WebSocket 연결 전에 서버 정보를 확인하기 위해 `/info` 엔드포인트를 먼저 호출합니다:

1. **Step 1**: `GET /ws/v1/chat/private/info` - 서버 정보 조회 (401 발생)
2. **Step 2**: WebSocket 연결 시도 (Step 1 실패로 진행 불가)

### 프론트엔드 구현 내용
프론트엔드에서는 이미 다음과 같이 구현했습니다:

1. ✅ Access Token을 쿼리 파라미터로 전달: `?token=eyJ...`
2. ✅ STOMP 연결 헤더에 Authorization 추가
3. ✅ 개발 환경에서 Vite proxy 설정

---

## 백엔드 수정 필요사항

### 1. WebSocket CORS 설정 추가 (필수)

Spring Boot의 경우:

```java
@Configuration
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/v1/chat/private")
            .setAllowedOriginPatterns("http://localhost:3000", "http://localhost:5173")  // ← 추가
            .withSockJS();
    }

    // 또는 setAllowedOrigins 사용
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/v1/chat/private")
            .setAllowedOrigins("http://localhost:3000", "http://localhost:5173")  // ← 추가
            .withSockJS();
    }
}
```

### 2. `/info` 엔드포인트 인증 제외 (필수)

SockJS의 `/info` 엔드포인트는 **인증 없이 접근 가능**해야 합니다.

#### Spring Security 설정:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // SockJS info 엔드포인트는 인증 제외
                .requestMatchers("/ws/v1/chat/private/info").permitAll()
                .requestMatchers("/ws/v1/chat/private/**").permitAll()  // SockJS 전체 경로
                // 기타 설정...
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

또는 WebSocket 관련 경로 전체를 인증 제외:

```java
.requestMatchers("/ws/**").permitAll()
```

### 3. WebSocket 인증 처리 방식 확인

현재 프론트엔드는 다음 3가지 방법으로 토큰을 전달하고 있습니다:

1. **쿼리 파라미터**: `?token=eyJ...`
2. **STOMP 연결 헤더**: `Authorization: Bearer eyJ...`
3. **STOMP 연결 헤더**: `X-Refresh-Token: ...`

백엔드에서는 **STOMP 연결 시점**(WebSocket handshake 이후)에 인증을 처리해야 합니다.

#### 권장 구현:

```java
@Configuration
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                    MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Authorization 헤더에서 토큰 추출
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        // 토큰 검증 로직
                        // ...
                        // 인증 정보 설정
                        accessor.setUser(new UsernamePasswordAuthenticationToken(...));
                    }
                }
                return message;
            }
        });
    }
}
```

---

## 테스트 방법

### 1. CORS 설정 확인
브라우저 개발자 도구 > Network 탭에서:
- `/ws/v1/chat/private/info` 요청의 Response Headers 확인
- `Access-Control-Allow-Origin: http://localhost:3000` 헤더가 있어야 함

### 2. 인증 확인
- `/ws/v1/chat/private/info` 요청이 **200 OK** 반환
- `/ws/v1/chat/private/xxx/websocket` WebSocket 연결 성공 (101 Switching Protocols)

### 3. 메시지 전송 테스트
- 브라우저 2개로 동일 채팅방 입장
- 한 쪽에서 메시지 전송 시 다른 쪽에서 실시간 수신 확인

---

## 임시 해결책 (개발 환경)

프론트엔드에서 Vite proxy를 설정하여 개발 환경에서는 CORS 문제를 회피하고 있습니다.

하지만 **프로덕션 환경**에서는 백엔드 CORS 설정이 필수입니다.

---

## 참고 문서

- [Spring WebSocket Documentation](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [SockJS Protocol](https://sockjs.github.io/sockjs-protocol/sockjs-protocol-0.3.3.html)
- [STOMP Over WebSocket](https://stomp.github.io/stomp-specification-1.2.html)

---

## 요약

### 백엔드에서 반드시 수정해야 할 사항:

1. ✅ **WebSocket CORS 설정 추가** - `setAllowedOrigins("http://localhost:3000")`
2. ✅ **`/ws/v1/chat/private/info` 엔드포인트 인증 제외** - Security 설정에서 permitAll
3. ✅ **STOMP 연결 시점에 Authorization 헤더로 인증 처리**

이 세 가지를 수정하면 WebSocket 연결이 정상적으로 작동할 것입니다.
