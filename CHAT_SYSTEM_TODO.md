# 채팅 시스템 백엔드 연동 및 개선 TODO

> 현재 채팅 시스템의 UI는 구현되어 있으나, 백엔드 API 연동과 실시간 통신 기능이 필요합니다.

## 📋 목차
- [백엔드 연동 작업](#백엔드-연동-작업)
- [추가 UI 기능](#추가-ui-기능)
- [권장 라이브러리](#권장-라이브러리)
- [우선순위](#우선순위)

---

## 🔌 백엔드 연동 작업

### 1. WebSocket/실시간 통신 연동

#### 설치
```bash
npm install socket.io-client
```

#### 구현 파일
- [ ] `src/services/websocket.ts` - WebSocket 연결 관리 서비스 작성
- [ ] `src/hooks/useWebSocket.ts` - WebSocket 훅 작성

#### 기능
- [ ] WebSocket 연결 초기화
- [ ] 실시간 메시지 수신 처리
- [ ] 실시간 읽음 상태 업데이트
- [ ] 실시간 참여자 상태 업데이트
- [ ] 연결 끊김/재연결 처리
- [ ] 연결 상태 표시 UI

---

### 2. ChatList 페이지 API 연동
**파일**: `src/pages/ChatList/ChatList.tsx`

#### API 호출
- [ ] `chatService.getChatRooms()` - 채팅방 목록 로드
- [ ] `chatService.getUnreadCount()` - 전체 읽지 않은 메시지 수

#### 구현 기능
- [ ] 채팅방 목록 상태 관리 (useState/useQuery)
- [ ] 무한 스크롤 또는 페이지네이션
- [ ] 실시간 새 메시지 도착 시 목록 업데이트
- [ ] 채팅방 목록 정렬 (최근 메시지 기준)
- [ ] 빈 상태 처리
- [ ] 로딩 상태 표시
- [ ] 에러 처리

#### 코드 예시
```typescript
const ChatList: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setIsLoading(true);
        const response = await chatService.getChatRooms();
        setChatRooms(response.data.items);
      } catch (err) {
        setError('채팅방 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  // WebSocket으로 실시간 업데이트
  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      // 채팅방 목록 업데이트
    };

    socket.on('new-message', handleNewMessage);
    return () => socket.off('new-message', handleNewMessage);
  }, []);
};
```

---

### 3. ChatRoomPage API 연동
**파일**: `src/pages/ChatRoomPage/ChatRoomPage.tsx`

#### API 호출
- [ ] `chatService.getChatRoom(roomId)` - 채팅방 정보 로드
- [ ] `chatService.getMessages(roomId)` - 메시지 히스토리 로드
- [ ] `chatService.markAsRead(roomId)` - 메시지 읽음 처리

#### 구현 기능
- [ ] URL 파라미터로 채팅방 ID 추출
- [ ] 채팅방 정보 로드 (상품 정보, 모집 상태)
- [ ] 메시지 히스토리 로드
- [ ] 이전 메시지 로드 (스크롤 상단 도달 시)
- [ ] 사용자 역할(seller/buyer) 확인
- [ ] 실시간 메시지 수신
- [ ] 모집 상태 실시간 업데이트
- [ ] 참여자 입장/퇴장 알림

#### 코드 예시
```typescript
const ChatRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userRole, setUserRole] = useState<'seller' | 'buyer'>('buyer');

  useEffect(() => {
    if (!roomId) return;

    const loadChatRoom = async () => {
      try {
        const roomResponse = await chatService.getChatRoom(roomId);
        setChatRoom(roomResponse.data);

        const messagesResponse = await chatService.getMessages(roomId);
        setMessages(messagesResponse.data.items);

        // 읽음 처리
        await chatService.markAsRead(roomId);

        // 역할 확인
        const currentUserId = /* 현재 사용자 ID */;
        const role = roomResponse.data.participants.find(
          p => p.userId === currentUserId
        )?.role || 'buyer';
        setUserRole(role);
      } catch (error) {
        console.error('채팅방 로드 실패:', error);
      }
    };

    loadChatRoom();
  }, [roomId]);

  // WebSocket 실시간 메시지 수신
  useEffect(() => {
    if (!roomId) return;

    socket.emit('join-room', roomId);

    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      chatService.markAsRead(roomId);
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.emit('leave-room', roomId);
    };
  }, [roomId]);
};
```

---

### 4. ChatRoom 컴포넌트 기능 구현
**파일**: `src/components/ChatRoom/ChatRoom.tsx`

#### API 연동
- [ ] `chatService.sendMessage()` - 메시지 전송
- [ ] `chatService.sendImageMessage()` - 이미지 메시지 전송
- [ ] `chatService.markAsRead()` - 메시지 읽음 처리
- [ ] `chatService.leaveChatRoom()` - 채팅방 나가기

#### 구현 기능
- [ ] 메시지 전송 (`handleSendMessage`)
- [ ] 이미지 메시지 전송
- [ ] 메시지 전송 실패 처리 및 재전송
- [ ] 채팅방 나가기 확인 및 처리
- [ ] 시간 연장 기능 (판매자)
- [ ] 모집 확정 기능 (판매자)
- [ ] 구매 신청 기능 (구매자)
- [ ] 메시지 전송 중 상태 표시

#### 코드 예시
```typescript
const handleSendMessage = async (message: string) => {
  if (!message.trim()) return;

  try {
    // 낙관적 업데이트
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      type: 'my',
      content: message,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    setMessages(prev => [...prev, tempMessage]);

    // API 호출
    const response = await chatService.sendMessage(roomId, {
      content: message,
      messageType: 'text'
    });

    // 성공 시 임시 메시지 교체
    setMessages(prev =>
      prev.map(msg => msg.id === tempMessage.id ? response.data : msg)
    );
  } catch (error) {
    console.error('메시지 전송 실패:', error);
    // 실패 상태 표시
    setMessages(prev =>
      prev.map(msg =>
        msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
      )
    );
  }
};
```

---

### 5. 읽지 않은 메시지 카운트 관리

#### 전역 상태 관리
- [ ] Zustand 또는 Context로 전역 카운트 관리
- [ ] `src/stores/chatStore.ts` 생성

#### 연동 위치
- [ ] Header 컴포넌트 - 채팅 버튼 뱃지 (`chatNotificationCount` prop)
- [ ] BottomNav 컴포넌트 - 채팅 버튼 뱃지
- [ ] ChatModal 컴포넌트

#### 구현
```typescript
// src/stores/chatStore.ts
import { create } from 'zustand';

interface ChatStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: (amount: number) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: (amount) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - amount) }))
}));

// 사용 예시
const Header: React.FC = () => {
  const unreadCount = useChatStore((state) => state.unreadCount);

  return (
    <button className="header-icon-btn" onClick={handleChatClick}>
      <span className="icon">💬</span>
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount}</span>
      )}
    </button>
  );
};
```

---

### 6. 알림 설정
**API**: `chatService.updateNotificationSettings()`

#### UI 위치
- [ ] 채팅방 헤더에 설정 버튼 추가
- [ ] 설정 모달/드로어 생성

#### 기능
- [ ] 채팅방별 알림 on/off
- [ ] 알림 설정 상태 저장
- [ ] 알림 설정 변경 시 API 호출

---

### 7. 에러 처리 및 로딩 상태

#### 모든 API 호출에 적용
- [ ] try-catch 블록 추가
- [ ] 로딩 스피너 표시
- [ ] 에러 메시지 표시 (Toast/Alert)
- [ ] 네트워크 오류 시 재시도 로직
- [ ] 타임아웃 처리 (10초)

#### 에러 처리 예시
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleApiCall = async () => {
  try {
    setIsLoading(true);
    setError(null);
    const response = await chatService.someMethod();
    // 성공 처리
  } catch (err) {
    setError(err.message || '요청 처리에 실패했습니다.');
    // 에러 토스트 표시
  } finally {
    setIsLoading(false);
  }
};
```

---

### 8. 타입 동기화

#### 작업
- [ ] `src/api/services/chat.ts`의 타입 확인
- [ ] 컴포넌트의 타입과 통합
- [ ] 백엔드 응답 타입과 매칭 확인

#### 타입 정리
```typescript
// 통합된 ChatMessage 타입
export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderProfileImage?: string;
  content: string;
  messageType: 'text' | 'image' | 'system';
  isRead: boolean;
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed'; // 로컬 상태
}

// 통합된 ChatRoom 타입
export interface ChatRoom {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎨 추가 UI 기능

### 1. 메시지 관련

#### 이미지 메시지 전송
- [ ] 파일 선택 버튼 UI
- [ ] 이미지 프리뷰 모달
- [ ] 업로드 진행률 표시
- [ ] 이미지 압축 (선택)

#### 메시지 상태 표시
- [ ] 전송 중: 로딩 스피너
- [ ] 전송 실패: ⚠️ 아이콘 + 재전송 버튼
- [ ] 읽음/안읽음: ✓ (전송), ✓✓ (읽음)

#### 메시지 타임스탬프 개선
- [ ] "오늘", "어제", "MM월 DD일" 형식
- [ ] 같은 날짜 메시지 그룹핑
- [ ] 시간 표시 (HH:mm)

#### 메시지 액션
- [ ] 길게 눌러 복사 (모바일)
- [ ] 메시지 신고 기능

---

### 2. 채팅방 목록 개선

#### 검색 기능
- [ ] 검색창 UI
- [ ] 채팅방 이름으로 검색
- [ ] 메시지 내용으로 검색 (선택)

#### 필터링
- [ ] 필터 버튼 UI
- [ ] 진행중/마감임박/마감 필터
- [ ] 읽지 않은 메시지 있는 채팅방만 보기

#### 정렬 옵션
- [ ] 정렬 드롭다운 UI
- [ ] 최신 메시지순 (기본)
- [ ] 마감 임박순
- [ ] 읽지 않은 메시지순

#### 스와이프 액션 (모바일)
- [ ] 좌측 스와이프: 알림 on/off
- [ ] 우측 스와이프: 채팅방 나가기
- [ ] 스와이프 애니메이션

---

### 3. 채팅방 내부

#### 참여자 목록
- [ ] 참여자 목록 모달/드로어
- [ ] 참여자 프로필 표시
- [ ] 판매자/구매자 구분 뱃지
- [ ] 참여자 수 표시

#### 이전 메시지 로드
- [ ] 스크롤 상단 감지
- [ ] "이전 메시지 불러오는 중..." 표시
- [ ] 페이지네이션 처리
- [ ] 스크롤 위치 유지

#### 메시지 입력창 개선
- [ ] 여러 줄 입력 지원 (textarea)
- [ ] 이미지 첨부 버튼 (📷)
- [ ] 이모지 선택기 버튼 (😊)
- [ ] Shift+Enter로 줄바꿈, Enter로 전송

#### 시스템 메시지 타입 확장
- [ ] "👋 {사용자}님이 입장했습니다"
- [ ] "🚪 {사용자}님이 퇴장했습니다"
- [ ] "⏰ 모집 시간이 {시간} 연장되었습니다"
- [ ] "✅ 모집이 확정되었습니다"
- [ ] "🛒 {사용자}님이 구매 신청했습니다"

---

### 4. 알림 설정 UI

#### 채팅방 설정 메뉴
- [ ] 헤더에 설정 버튼 (⚙️)
- [ ] 설정 드로어/모달
  - 알림 켜기/끄기 토글
  - 채팅방 나가기
  - 신고하기

---

### 5. 빈 상태 개선

#### ChatList 빈 상태
- [ ] 일러스트 또는 아이콘
- [ ] "참여중인 채팅방이 없습니다" 메시지
- [ ] "공동구매 상품 둘러보기" 버튼

#### 첫 채팅 가이드
- [ ] 채팅 사용법 안내 툴팁
- [ ] 첫 메시지 가이드

---

### 6. 로딩 및 에러 상태

#### 스켈레톤 로더
- [ ] 채팅방 목록 스켈레톤
- [ ] 메시지 목록 스켈레톤

#### 에러 상태
- [ ] 에러 메시지 표시 UI
- [ ] "다시 시도" 버튼
- [ ] 네트워크 오류 안내

---

### 7. 접근성 개선

- [ ] 스크린 리더 지원 (aria-label)
- [ ] 키보드 네비게이션 (Tab, Enter, Esc)
- [ ] 포커스 관리 (모달 열기/닫기)
- [ ] 색상 대비 개선

---

### 8. 추가 기능

#### 채팅방 고정
- [ ] 중요한 채팅방 상단 고정
- [ ] 고정 아이콘 표시 (📌)

#### 메시지 알림음
- [ ] 새 메시지 도착 시 알림음
- [ ] 알림음 on/off 설정

#### 안읽은 메시지로 스크롤
- [ ] 채팅방 진입 시 안읽은 메시지 위치로 스크롤
- [ ] "새로운 메시지" 구분선

#### 멘션 기능
- [ ] @사용자명 입력 시 자동완성
- [ ] 멘션된 메시지 하이라이트

#### 링크 프리뷰
- [ ] URL 자동 감지
- [ ] 링크 미리보기 카드

---

## 📦 권장 라이브러리

### 필수
```json
{
  "socket.io-client": "^4.7.2",
  "date-fns": "^2.30.0"
}
```

### 선택
```json
{
  "react-intersection-observer": "^9.5.3",  // 무한 스크롤
  "react-virtualized": "^9.22.5",  // 대량 메시지 최적화
  "emoji-picker-react": "^4.5.16",  // 이모지 선택기
  "react-hot-toast": "^2.4.1"  // 토스트 알림
}
```

### 설치 명령어
```bash
# 필수
npm install socket.io-client date-fns

# 선택
npm install react-intersection-observer emoji-picker-react react-hot-toast
```

---

## 🎯 우선순위

### High Priority (필수) ⭐⭐⭐
1. **WebSocket 실시간 통신 연동**
   - 실시간 메시지 송수신
   - 연결 상태 관리
2. **API 연동**
   - 채팅방 목록 로드
   - 메시지 히스토리 로드
   - 메시지 전송
3. **읽지 않은 메시지 카운트**
   - 전역 상태 관리
   - Header/BottomNav 뱃지 표시
4. **메시지 상태 표시**
   - 전송중/실패/성공
   - 재전송 기능
5. **에러 처리**
   - 네트워크 오류
   - API 에러
   - 타임아웃

### Medium Priority (중요) ⭐⭐
1. **이미지 메시지 전송**
2. **이전 메시지 로드** (무한 스크롤)
3. **참여자 목록**
4. **알림 설정**
5. **검색/필터링**
6. **타임스탬프 개선**
7. **로딩 상태 (스켈레톤)**

### Low Priority (선택) ⭐
1. **메시지 복사**
2. **이모지 선택기**
3. **링크 프리뷰**
4. **멘션 기능**
5. **채팅방 고정**
6. **알림음**

---

## 📝 체크리스트

### Phase 1: 기본 연동
- [ ] WebSocket 서비스 구현
- [ ] 채팅방 목록 API 연동
- [ ] 메시지 로드 API 연동
- [ ] 메시지 전송 API 연동
- [ ] 읽지 않은 메시지 카운트

### Phase 2: 실시간 기능
- [ ] 실시간 메시지 수신
- [ ] 실시간 읽음 상태 업데이트
- [ ] 실시간 참여자 상태

### Phase 3: UX 개선
- [ ] 메시지 상태 표시
- [ ] 에러 처리 및 재시도
- [ ] 로딩 상태
- [ ] 이전 메시지 로드

### Phase 4: 추가 기능
- [ ] 이미지 메시지
- [ ] 검색/필터
- [ ] 알림 설정
- [ ] 참여자 목록

---

## 🔍 현재 상태

### 구현 완료 ✅
- 채팅방 목록 UI
- 채팅방 UI
- 메시지 입력/표시 UI
- 역할별 액션 버튼
- 모집 상태 표시
- 반응형 디자인

### 미구현 ❌
- 실시간 통신
- API 연동
- 상태 관리
- 에러 처리
- 이미지 메시지

---

## 📞 문의 및 이슈

이 문서는 백엔드 개발 완료 후 프론트엔드 작업의 가이드라인입니다.
백엔드 API 명세와 WebSocket 이벤트 정의가 필요합니다.
