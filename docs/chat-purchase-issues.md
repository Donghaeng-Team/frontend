# 채팅 및 구매 서비스 이슈 정리

> 작성일: 2025-10-23
> 프로젝트: Bytogether Frontend
> 관련 기능: 채팅 시스템, 공동구매 참여 관리

## 📋 목차
1. [백엔드 API 이슈](#백엔드-api-이슈)
2. [프론트엔드 미구현 기능](#프론트엔드-미구현-기능)
3. [프론트엔드 수정 사항](#프론트엔드-수정-사항)
4. [백엔드 팀 권장사항](#백엔드-팀-권장사항)

---

## 🔴 백엔드 API 이슈

### 1. 채팅방 나가기 API 500 에러

**엔드포인트**: `POST /api/v1/chat/private/{roomId}/exit`

**문제 상황**:
- 채팅방 나가기 API 호출 시 500 Internal Server Error 발생
- 구매 취소 후 자동 퇴장 처리 시에도 동일한 에러 발생

**에러 로그**:
```
POST http://localhost:8082/api/v1/chat/private/1/exit
Status: 500 Internal Server Error
```

**영향**:
- 사용자가 "채팅방 나가기" 버튼 클릭 시 실제로 채팅방에서 퇴장되지 않음
- 구매 취소 후에도 채팅방 목록에 계속 표시됨
- 백엔드 DB에는 여전히 참여자로 남아있음

**임시 해결방안** (프론트엔드):
```typescript
try {
  await chatService.leaveChatRoom(roomId);
} catch (error: any) {
  console.log('채팅방 나가기 API 에러 (무시):', error);
  // 500 에러 발생해도 프론트엔드는 정상 처리
}
alert('채팅방에서 나갔습니다.');
onClose(); // 모달 닫고 목록 새로고침
```

**필요한 조치**:
- 백엔드에서 채팅방 나가기 API의 500 에러 원인 파악 및 수정 필요
- 트랜잭션 처리나 예외 처리 로직 점검 필요

---

### 2. 채팅방 정보 API - marketId null 반환

**엔드포인트**: `GET /api/v1/chat/private/{roomId}`

**문제 상황**:
- API 응답에서 `marketId` 필드가 `null`로 반환됨
- 공동구매 상세페이지에서 채팅방 매칭이 불가능했던 원인

**API 응답 예시**:
```json
{
  "id": 1,
  "title": "청송 사과 5kg (특)",
  "thumbnailUrl": "...",
  "currentBuyers": 3,
  "maxBuyers": 10,
  "status": "RECRUITING",
  "creator": false,
  "buyer": true,
  "marketId": null,  // ← 문제
  "endTime": "2025-10-24T15:30:00"
}
```

**영향**:
- 공동구매 상품 상세 페이지에서 현재 채팅방을 찾지 못함
- "구매중" 상태 표시가 제대로 작동하지 않았음

**임시 해결방안** (프론트엔드):
- `chatRoomId`를 우선적으로 사용하여 매칭
```typescript
const joinedRoom = product.chatRoomId
  ? chatRooms.find(room => Number(room.id) === product.chatRoomId)
  : chatRooms.find(room => room.marketId === product.marketId);
```

**권장 조치**:
- 채팅방 생성 시 `marketId` 값이 제대로 저장되는지 확인
- 채팅방 조회 API에서 `marketId`를 정확히 반환하도록 수정

---

## ⚠️ 프론트엔드 미구현 기능

### 1. 채팅 메시지 전송 API 연동 누락

**파일**: `src/components/ChatModal/ChatModal.tsx`

**문제 상황**:
- `handleSendMessage` 함수가 로컬 state만 업데이트하고 API를 호출하지 않음
- 메시지가 서버에 저장되지 않아 다른 사용자에게 표시되지 않음
- 새로고침 시 메시지가 사라짐

**현재 구현**:
```typescript
const handleSendMessage = (message: string) => {
  const newMessage: ChatMessage = {
    id: `${Date.now()}`,
    type: 'my',
    content: message,
    timestamp: new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  setMessages([...messages, newMessage]);  // ← API 호출 없음!
};
```

**필요한 수정**:
```typescript
const handleSendMessage = async (message: string) => {
  if (!selectedRoomId) return;

  try {
    const roomId = parseInt(selectedRoomId);

    // API 호출하여 메시지 전송
    const response = await chatService.sendMessage(roomId, {
      messageContent: message,
      messageType: 'NORMAL'
    });

    // 성공하면 메시지 목록 다시 로드
    const messagesResponse = await chatService.getMessages(roomId, { size: 50 });
    // ... 메시지 변환 로직

  } catch (error) {
    console.error('메시지 전송 실패:', error);
    alert('메시지 전송에 실패했습니다.');
  }
};
```

**참고**:
- Chat Service API의 메시지 전송 엔드포인트 확인 필요
- WebSocket 연동 여부 확인 필요 (실시간 메시지 수신용)

---

## ✅ 프론트엔드 수정 사항

### 1. ChatRoom 타입에 buyer, marketId 필드 추가

**파일**: `src/components/ChatRoomListModal/ChatRoomListModal.tsx`

**수정 내용**:
```typescript
export interface ChatRoom {
  id: string;
  productName: string;
  productImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  participants: {
    current: number;
    max: number;
  };
  status: 'active' | 'closing' | 'closed';
  creator: boolean;
  buyer: boolean;      // ← 추가: 구매 확정 여부
  marketId?: number;   // ← 추가: 상품 ID
}
```

**이유**:
- 구매 상태 표시를 위해 buyer 정보 필요
- 공동구매 상세페이지에서 채팅방 매칭을 위해 marketId 필요

---

### 2. API 응답 변환 함수 업데이트

**파일**: `src/utils/chatUtils.ts`

**수정 내용**:
```typescript
export function transformChatRoomForUI(room: ChatRoomResponse): ChatRoom {
  return {
    // ... 기존 필드들
    creator: room.creator,
    buyer: room.buyer,        // ← 추가
    marketId: room.marketId   // ← 추가
  };
}
```

---

### 3. 구매 상태 우선순위 로직 개선

**파일**: `src/components/ChatModal/ChatModal.tsx` (Line 85-88)

**수정 내용**:
```typescript
// 구매자 여부 저장: chatRooms 리스트의 buyer 값을 우선 사용 (더 정확함)
const currentRoom = chatRooms.find(room => room.id === selectedRoomId);
const buyerStatus = currentRoom?.buyer ?? roomInfo?.buyer ?? false;
setIsBuyer(buyerStatus);
```

**이유**:
- chatRooms 목록은 이미 최신 정보를 가지고 있음
- API 재호출 시 발생할 수 있는 동기화 이슈 방지

---

### 4. "이미 공동구매에 참가 중입니다" 에러 처리

**파일**: `src/components/ChatModal/ChatModal.tsx` (Line 231-242)

**수정 내용**:
```typescript
const handleApply = async () => {
  // ...
  try {
    await chatService.confirmBuyer(roomId);
    setIsBuyer(true);
    alert('구매 신청이 완료되었습니다.');
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message;

    // "이미 공동구매에 참가 중입니다" 에러는 실제로 구매자라는 뜻
    if (errorMessage === '이미 공동구매에 참가 중입니다') {
      setIsBuyer(true);  // 구매자 상태로 변경
      // 에러 메시지 표시 안함 (버튼만 자동 전환)
    } else {
      alert(`구매 신청에 실패했습니다: ${errorMessage || '알 수 없는 오류'}`);
    }
  }
};
```

**이유**:
- 이미 구매자인데 버튼이 "구매 신청"으로 보이는 경우 대응
- 불필요한 에러 메시지 표시 방지

---

### 5. 채팅방 매칭 로직 개선

**파일**: `src/pages/ProductDetail/ProductDetail.tsx` (Line 175-207)

**수정 전**:
```typescript
const joinedRoom = chatRooms.find(room => room.marketId === product.marketId);
```

**수정 후**:
```typescript
// chatRoomId가 있으면 그걸로 우선 매칭, 없으면 marketId로 매칭
const joinedRoom = product.chatRoomId
  ? chatRooms.find(room => Number(room.id) === product.chatRoomId)
  : chatRooms.find(room => room.marketId === product.marketId);
```

**이유**:
- marketId가 null인 경우 대비
- chatRoomId를 통한 직접 매칭이 더 정확함
- `Number()` 변환으로 타입 불일치 문제 해결 (id가 number이고 chatRoomId가 number였음)

---

### 6. 중복 useEffect 제거

**파일**: `src/pages/ProductDetail/ProductDetail.tsx`

**문제**:
- 첫 번째 useEffect에서 `setIsBuyer(true)` 설정
- 두 번째 useEffect에서 즉시 `setIsBuyer(false)`로 덮어씀

**수정**:
- 첫 번째 useEffect는 `fetchChatRooms()` 호출만 담당
- 두 번째 useEffect에서 채팅방 매칭 및 상태 설정 담당

---

### 7. 구매 취소 시 채팅방 나가기 추가

**파일**: `src/components/ChatModal/ChatModal.tsx` (Line 245-271)

**수정 내용**:
```typescript
const handleCancel = async () => {
  if (!selectedRoomId) return;

  if (window.confirm('구매를 취소하시겠습니까?')) {
    try {
      const roomId = parseInt(selectedRoomId);

      // 구매 취소
      await chatService.cancelBuyer(roomId);

      // 채팅방 나가기 (500 에러가 발생해도 무시)
      try {
        await chatService.leaveChatRoom(roomId);
      } catch (leaveError) {
        console.log('채팅방 나가기 에러 (무시):', leaveError);
        // 백엔드 500 에러 발생 가능하지만 프론트엔드는 정상 처리
      }

      alert('구매가 취소되었습니다.');
      // 모달을 닫아서 채팅방 목록을 새로고침
      onClose();
    } catch (error) {
      console.error('구매 취소 실패:', error);
      alert('구매 취소에 실패했습니다.');
    }
  }
};
```

**이유**:
- 구매 취소 시 채팅방에서도 나가야 함 (UX 개선)
- 구매 미참여 상태로 돌아가면 "채팅방 참여" 버튼으로 표시되어야 함

---

### 8. 모달 닫기 시 채팅방 목록 새로고침

**파일**: `src/pages/ProductDetail/ProductDetail.tsx` (Line 681-688)

**수정 내용**:
```typescript
onClose={async () => {
  setIsChatModalOpen(false);
  await fetchChatRooms();  // ← 추가: 최신 정보로 업데이트
}}
```

**이유**:
- 채팅방 나가기, 구매 신청/취소 후 UI 상태 동기화
- 백엔드 API 500 에러로 실제 퇴장이 안 되더라도 목록 재조회 시도

---

## 💡 백엔드 팀 권장사항

### 1. 채팅방 나가기 API 긴급 수정 필요
- **우선순위**: 🔴 High
- **엔드포인트**: `POST /api/v1/chat/private/{roomId}/exit`
- **문제**: 500 Internal Server Error
- **영향**: 사용자가 채팅방을 나갈 수 없음

### 2. marketId 필드 정상 반환 필요
- **우선순위**: 🟡 Medium
- **엔드포인트**: `GET /api/v1/chat/private/{roomId}`
- **문제**: marketId가 null로 반환됨
- **영향**: 공동구매 상세 페이지에서 채팅방 매칭 실패
- **참고**: 현재는 chatRoomId로 우회 중

### 3. 메시지 전송 API 명세 공유 필요
- **우선순위**: 🟡 Medium
- **필요사항**:
  - 메시지 전송 엔드포인트 URL 및 Request/Response 형식
  - WebSocket 사용 여부 및 연동 방법
  - 메시지 타입 정의 (NORMAL, SYSTEM, DEADLINE_EXTEND 등)

### 4. API 에러 응답 개선
- **우선순위**: 🟢 Low
- **현재 문제**:
  - "이미 공동구매에 참가 중입니다" 에러가 400/409로 반환됨
  - 실제로는 구매자 상태이므로 성공으로 처리해도 무방
- **제안**:
  - 멱등성(idempotent) 처리: 이미 구매자면 200 OK 반환
  - 또는 명확한 에러 코드 제공 (예: 409 Conflict + 구체적인 code 필드)

### 5. 채팅방 목록 API 개선 제안
- **우선순위**: 🟢 Low
- **현재 누락된 필드**:
  - `lastMessage`: 마지막 메시지 내용
  - `unreadCount`: 읽지 않은 메시지 개수
- **영향**: 현재는 더미 데이터 사용 중

---

## 📊 사용자 상태 정의

현재 시스템에서 사용자는 공동구매에 대해 3가지 상태를 가질 수 있습니다:

| 상태 | 설명 | ProductDetail 버튼 | ChatModal 버튼 |
|-----|------|-------------------|---------------|
| **미참여** | 채팅방에 입장하지 않음 | 💬 채팅방 참여 | - |
| **참여 (미구매)** | 채팅방에는 있지만 구매 신청 안함 | 💬 참여중 | 💳 구매 신청 |
| **구매중** | 채팅방 참여 + 구매 신청 완료 | 💳 구매중 | 🚫 구매 취소 |

**상태 전환**:
```
미참여 → (채팅방 참여) → 참여(미구매) → (구매 신청) → 구매중
                                    ← (구매 취소) ←
```

---

## 🔧 테스트 완료 기능

### ✅ 정상 작동 확인
1. **시간 연장**: `handleExtendTime` - 2시간 연장 API 연동 완료
2. **모집 확정**: `handleConfirm` - closeRecruitment API 연동 완료
3. **구매 신청**: `handleApply` - confirmBuyer API 연동 완료
4. **구매자 상태 표시**: buyer 필드 기반으로 버튼 텍스트 변경 정상 작동

### ❌ 수정 필요
1. **채팅 메시지 전송**: API 연동 누락
2. **채팅방 나가기**: Backend 500 에러로 실제 퇴장 불가

---

## 📝 추가 참고사항

### Git 커밋 이력
이번 세션에서 다음 커밋들이 생성되었습니다:
- `fix: ChatRoom 타입에 buyer, marketId 필드 추가`
- `fix: 채팅방 매칭 로직 개선 및 중복 useEffect 제거`
- `feat: 구매 취소 시 채팅방 나가기 추가`

### 관련 파일
- `src/components/ChatRoomListModal/ChatRoomListModal.tsx`
- `src/components/ChatModal/ChatModal.tsx`
- `src/pages/ProductDetail/ProductDetail.tsx`
- `src/utils/chatUtils.ts`
- `src/types/chat.ts`

---

**문서 종료**
