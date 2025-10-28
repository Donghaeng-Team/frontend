# 함께 사요 (ByTogether) 프론트엔드 개발 발표

> Talk to Figma 디자인부터 Playwright MCP 테스트까지

**부트캠프 최종 발표 자료 (핵심 버전)**

---

## 📑 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [개발 방식 - 99% Vibe Coding](#2-개발-방식---99-vibe-coding)
3. [기술 스택](#3-기술-스택)
4. [Talk to Figma - 디자인 시스템 구축](#4-talk-to-figma---디자인-시스템-구축)
5. [핵심 기능 개발](#5-핵심-기능-개발)
6. [실시간 채팅 시스템](#6-실시간-채팅-시스템)
7. [Playwright MCP - E2E 테스트 자동화](#7-playwright-mcp---e2e-테스트-자동화)
8. [주요 트러블슈팅](#8-주요-트러블슈팅)
9. [성과 및 배운 점](#9-성과-및-배운-점)

---

## 1. 프로젝트 개요

### 함께 사요 (ByTogether)
**지역 기반 공동구매 및 커뮤니티 플랫폼**

**핵심 가치**
- 🏘️ **위치 기반 매칭**: 같은 동네 주민들과 함께 구매
- 💰 **합리적 소비**: 공동구매로 더 저렴하게
- 💬 **실시간 소통**: WebSocket 기반 채팅
- 📱 **반응형 UI**: 모바일/태블릿/PC 완벽 지원

**개발 기간**: 6주 (2024년 9월 ~ 10월)  
**팀 구성**: 프론트엔드 1명 + 백엔드 4명

---

## 2. 개발 방식 - 99% Vibe Coding

### 2.1 Vibe Coding이란?

**AI 페어 프로그래밍을 활용한 고속 개발**

Vibe Coding은 AI 도구(Claude Code, GitHub Copilot 등)와 협업하여 코드를 작성하는 개발 방식입니다. 이 프로젝트는 **99%의 코드를 AI와 함께 작성**했습니다.

### 2.2 Vibe Coding 워크플로우

```
1. 기획 & 설계
   ↓
2. AI에게 요구사항 전달 (자연어)
   ↓
3. AI가 코드 생성 + 개발자 리뷰
   ↓
4. 즉각적인 피드백 & 수정
   ↓
5. 테스트 & 통합
```

### 2.3 실제 개발 사례

#### 예시 1: 컴포넌트 생성

**프롬프트**:
```
"Figma 디자인을 보고 Button 컴포넌트를 만들어줘.
- variant: primary, secondary, outline
- size: sm, md, lg
- TypeScript로 작성
- CSS는 별도 파일로 분리"
```

**결과**: 
- 30초 만에 완성된 Button 컴포넌트
- TypeScript 타입 정의 자동 생성
- CSS 모듈 자동 생성
- Props 인터페이스 완벽 구현

#### 예시 2: API 통합

**프롬프트**:
```
"Axios 인터셉터를 만들어줘.
- 요청 시 JWT 토큰 자동 추가
- 401 에러 시 자동 토큰 갱신
- X-User-Id 헤더 자동 추가"
```

**결과**:
- 완벽한 인터셉터 로직
- 에러 핸들링 포함
- TypeScript 타입 안전성 확보

#### 예시 3: WebSocket 채팅

**프롬프트**:
```
"STOMP over WebSocket으로 채팅 시스템을 만들어줘.
- Zustand로 상태 관리
- 재연결 로직 포함
- 메시지 구독/발행 기능"
```

**결과**:
- 실시간 채팅 완전 구현
- 복잡한 WebSocket 로직 자동 처리
- 상태 관리 완벽 통합

### 2.4 Vibe Coding의 장점

**⚡ 개발 속도 향상**
- 기존 대비 **5~10배 빠른 개발 속도**
- 보일러플레이트 코드 자동 생성
- 반복 작업 최소화

**🎯 코드 품질**
- AI가 베스트 프랙티스 제안
- 타입 안전성 자동 확보
- 일관된 코드 스타일

**🧠 학습 효과**
- AI 코드를 리뷰하며 학습
- 새로운 패턴과 기술 빠르게 습득
- 실시간 멘토링 효과

**🐛 버그 감소**
- AI가 엣지 케이스 고려
- 자동 에러 핸들링
- 테스트 코드 자동 생성

### 2.5 Vibe Coding 통계

**코드 작성 비율**
- 🤖 AI 생성: 99%
- 👨‍💻 수동 작성: 1% (주로 비즈니스 로직 미세 조정)

**개발 시간 단축**
- 예상 개발 기간: 12주
- 실제 개발 기간: 6주
- **시간 절약: 50%**

**생산성 지표**
- 일평균 커밋: 3~5개
- 주평균 PR: 15~20개
- 기능당 평균 개발 시간: 2~4시간

### 2.6 Vibe Coding 도구

**주요 AI 도구**
- **Claude Code**: 복잡한 로직, 아키텍처 설계
- **GitHub Copilot**: 인라인 코드 자동완성
- **Talk to Figma**: 디자인 → 코드 변환
- **Playwright MCP**: AI 기반 테스트 생성

**협업 방식**
```typescript
// 1. 자연어로 요구사항 작성
// "사용자 프로필 편집 기능을 만들어줘"

// 2. AI가 코드 생성
const ProfileEdit = () => {
  // ... 완성된 코드
}

// 3. 개발자 리뷰 & 피드백
// "프로필 이미지 업로드 기능 추가해줘"

// 4. AI가 즉시 반영
const handleImageUpload = async (file: File) => {
  // ... 추가된 코드
}
```

### 2.7 Vibe Coding의 한계와 대응

**한계점**
- 비즈니스 로직의 미묘한 차이는 수동 조정 필요
- 도메인 특화 로직은 명확한 설명 필요
- 백엔드 API 스펙 변경 시 수동 대응

**대응 방법**
- 명확하고 구체적인 프롬프트 작성
- AI 생성 코드는 반드시 리뷰
- 중요한 로직은 테스트 코드 작성
- 문서화 병행

### 2.8 Vibe Coding 성공 요인

**1. 명확한 요구사항**
- 구체적이고 상세한 프롬프트
- 예시 코드 제공
- 예상 결과물 명시

**2. 지속적인 피드백**
- AI 코드 즉시 리뷰
- 개선 사항 즉각 반영
- 반복적 개선

**3. 체계적 문서화**
- AI 생성 코드도 문서화
- 프롬프트 히스토리 관리
- 트러블슈팅 기록

**4. 테스트 주도**
- AI가 생성한 코드는 테스트로 검증
- E2E 테스트 자동 생성
- 회귀 테스트 방지

---

## 3. 기술 스택

### Core Technologies
```
React 19.1.1          - 최신 React 기능
TypeScript 5.8.3      - 타입 안정성
Vite 7.1.7            - 초고속 빌드
```

### State & Communication
```
Zustand 5.0.8         - 경량 상태 관리
Axios 1.12.2          - HTTP 클라이언트
@stomp/stompjs 7.2.1  - WebSocket 실시간 통신
```

### Testing & Maps
```
Playwright 1.56.1     - E2E 테스트
@vis.gl/react-google-maps 1.5.5 - Google Maps
```

---

## 4. Talk to Figma - 디자인 시스템 구축

### 4.1 Figma를 활용한 디자인 시스템

**Talk to Figma 기능 활용**
- 🎨 Figma 디자인을 기반으로 컴포넌트 생성
- 🎯 디자인 토큰 추출 (색상, 타이포그래피, 간격)
- ✨ 일관된 UI/UX 구현

### 4.2 컬러 시스템

```css
:root {
  /* Primary Colors */
  --primary-500: #FF6B35;      /* 메인 오렌지 */
  --secondary-500: #3399FF;    /* 파란색 */
  
  /* Semantic Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
}
```

### 4.3 컴포넌트 시스템 (30+개)

**Form & Input**
- Input, FormField, SearchBar
- Checkbox, ToggleSwitch
- DatePicker, TimePicker

**Display & Feedback**
- Button (variant: primary/secondary/outline)
- Modal, Toast, Skeleton
- Badge, Avatar, Card

**Navigation**
- Header (Desktop), MobileHeader
- BottomNav (모바일 하단 네비게이션)
- FloatingActionButton (FAB)

**Domain-Specific**
- CategoryFilter, CategorySelector
- GoogleMap, LocationModal
- ChatRoom, ChatModal

### 4.4 설계 원칙

**재사용성 & 타입 안정성**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**조합 가능성**
```typescript
<FormField label="이메일">
  <Input type="email" placeholder="example@email.com" />
</FormField>
```

---

## 5. 핵심 기능 개발

### 5.1 인증 시스템

**이메일 + OAuth 2.0 통합**
- ✅ 이메일/비밀번호 회원가입/로그인
- ✅ 카카오/구글 소셜 로그인
- ✅ JWT 토큰 기반 인증
- ✅ 자동 토큰 갱신 (Refresh Token)

**JWT 토큰 관리 (Axios 인터셉터)**
```typescript
// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 시 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      // 재요청
    }
  }
);
```

### 5.2 공동구매 기능

**상품 등록/수정**
- 📸 다중 이미지 업로드 (S3 Presigned URL)
- 🗺️ Google Maps 위치 선택
- 📝 카테고리, 가격, 모집 인원, 마감일 설정

**상품 목록 & 검색**
- 📍 위치 기반 필터링 (현재 동네)
- 🏷️ 카테고리별 탐색
- 🔄 정렬 (최신순, 마감임박순, 저가순, 조회수순)
- ♾️ 무한 스크롤 페이지네이션

**상품 상세 페이지**
- 이미지 갤러리 (다중 이미지 슬라이더)
- 참여자 현황 (프로필 이미지, 역할 표시)
- 좋아요/찜 기능
- 채팅방 입장 버튼

### 5.3 커뮤니티 기능

**게시글 CRUD**
- 작성, 수정, 삭제
- 카테고리별 필터링
- 이미지 업로드

**댓글 시스템**
- 댓글/대댓글 (재귀 구조)
- 실시간 좋아요 토글

```typescript
// 댓글 재귀 렌더링
const CommentItem = ({ comment, depth = 0 }: CommentItemProps) => (
  <div style={{ marginLeft: `${depth * 20}px` }}>
    <Avatar src={comment.authorProfileImageUrl} />
    <p>{comment.content}</p>
    
    {/* 대댓글 재귀 */}
    {comment.replies.map(reply => (
      <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
    ))}
  </div>
);
```

---

## 6. 실시간 채팅 시스템

### 6.1 WebSocket 아키텍처

**STOMP over WebSocket**
```
Client (React)
  ↓ WebSocket
API Gateway (8080)
  ↓ Proxy
Chat Service (8086)
  ↓ STOMP
Message Broker
```

**연결 설정**
```typescript
const client = new Client({
  brokerURL: `${WS_URL}/ws`,
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
  
  onConnect: () => {
    console.log('[WebSocket] 연결 성공');
    set({ wsStatus: 'connected' });
  }
});

client.activate();
```

### 6.2 채팅방 기능

**메시지 송수신**
```typescript
// 메시지 전송
sendMessage: (roomId, content, userId, nickname) => {
  stompClient.publish({
    destination: `/app/chat/${roomId}`,
    body: JSON.stringify({
      chatRoomId: roomId,
      messageContent: content,
      messageType: 'TEXT',
      senderId: userId,
      senderNickname: nickname
    })
  });
}

// 메시지 수신 구독
stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
  const newMessage = JSON.parse(message.body);
  addMessage(newMessage);
});
```

**구매자 확정 & 모집 완료**
- 판매자: 구매자 확정 버튼
- 구매자: 구매 신청/취소 버튼
- 시스템 메시지 (입장/퇴장/구매 알림)
- 마감 시간 연장 기능

### 6.3 주요 트러블슈팅

| 문제 | 해결 |
|------|------|
| CORS 에러 | Vite 프록시 `/ws` 설정 |
| 구독 타이밍 이슈 | `onConnect` 콜백에서 구독 |
| useEffect 중복 구독 | 의존성 배열 수정 |
| 시스템 메시지 userId | 정규식으로 닉네임 치환 |

---

## 7. Playwright MCP - E2E 테스트 자동화

### 7.1 Playwright 설정

**설치 및 구성**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**playwright.config.ts**
```typescript
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

### 7.2 테스트 스크립트

**package.json**
```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug"
  }
}
```

### 7.3 작성된 테스트 파일들

```
tests/
├── app.spec.ts              # 기본 앱 테스트
├── navigation.spec.ts       # 페이지 네비게이션
├── forms.spec.ts            # 폼 유효성 검사
├── components.spec.ts       # 컴포넌트 테스트
├── pages.spec.ts            # 페이지 기능 테스트
├── user-flows.spec.ts       # 사용자 플로우 테스트
├── api-integration.spec.ts  # API 통합 테스트
├── accessibility.spec.ts    # 접근성 테스트
├── performance.spec.ts      # 성능 테스트
├── missing-components.spec.ts
└── missing-pages.spec.ts
```

### 7.4 테스트 시나리오 예시

**네비게이션 테스트**
```typescript
test('메인 페이지 접근', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/함께 사요/);
  await expect(page.locator('header')).toBeVisible();
});

test('로그인 페이지로 이동', async ({ page }) => {
  await page.goto('/');
  await page.click('a[href="/login"]');
  await expect(page).toHaveURL('/login');
});
```

**폼 유효성 검사 테스트**
```typescript
test('로그인 폼 유효성 검사', async ({ page }) => {
  await page.goto('/login');
  
  // 빈 폼 제출
  await page.click('button[type="submit"]');
  await expect(page.locator('text=이메일을 입력하세요')).toBeVisible();
  
  // 잘못된 이메일 형식
  await page.fill('input[name="email"]', 'invalid-email');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=올바른 이메일 형식이 아닙니다')).toBeVisible();
});
```

**사용자 플로우 테스트 (E2E)**
```typescript
test('전체 구매 플로우', async ({ browser }) => {
  // 판매자 컨텍스트
  const sellerContext = await browser.newContext();
  const sellerPage = await sellerContext.newPage();
  
  // 판매자 로그인 → 상품 등록
  await sellerPage.goto('/login');
  await sellerPage.fill('[name="email"]', 'seller@test.com');
  await sellerPage.fill('[name="password"]', 'password123');
  await sellerPage.click('button[type="submit"]');
  
  // 구매자 컨텍스트
  const buyerContext = await browser.newContext();
  const buyerPage = await buyerContext.newPage();
  
  // 구매자 로그인 → 상품 검색 → 채팅 → 구매 신청
  await buyerPage.goto('/login');
  // ... 구매 플로우
  
  // 실시간 채팅 검증
  await expect(sellerPage.locator('text=구매 신청이 들어왔습니다')).toBeVisible();
});
```

**컴포넌트 테스트**
```typescript
test('Button 컴포넌트', async ({ page }) => {
  await page.goto('/showcase');
  
  // Primary 버튼
  const primaryBtn = page.locator('button.btn-primary');
  await expect(primaryBtn).toHaveCSS('background-color', 'rgb(255, 107, 53)');
  
  // Disabled 버튼
  const disabledBtn = page.locator('button:disabled');
  await expect(disabledBtn).toBeDisabled();
});
```

### 7.5 Playwright MCP의 장점

**MCP (Model Context Protocol) 활용**
- 🤖 AI 기반 테스트 생성 지원
- 🔍 자동 셀렉터 추천
- 📊 테스트 커버리지 분석
- 🐛 자동 버그 리포트

**다중 브라우저 테스트**
- ✅ Chromium, Firefox, WebKit
- 📱 모바일 시뮬레이션 (iOS/Android)
- 🌐 크로스 브라우저 호환성 검증

**강력한 디버깅**
- 🎬 테스트 실행 동영상 녹화
- 📸 실패 시 스크린샷 자동 저장
- 🔍 Trace Viewer로 단계별 분석

---

## 8. 주요 트러블슈팅

### 8.1 인증 관련

| 문제 | 원인 | 해결 |
|------|------|------|
| OAuth userId undefined | JWT 토큰 파싱 실패 | `jwt-decode`로 userId 추출 |
| 토큰 위치 불일치 | 백엔드 응답 형식 변경 | 헤더/body 양쪽 체크 |

### 8.2 WebSocket 채팅

| 문제 | 원인 | 해결 |
|------|------|------|
| CORS 에러 | 직접 연결 시 CORS 정책 | Vite proxy 사용 |
| 구독 타이밍 | 연결 전 구독 시도 | onConnect 콜백 활용 |
| 시스템 메시지 표시 | userId가 숫자로 표시 | 정규식으로 닉네임 치환 |
| 중복 입장 요청 | joinChatRoom 과용 | fetchChatRoom 분리 |

### 8.3 API 통합

| 문제 | 원인 | 해결 |
|------|------|------|
| X-User-Id 헤더 누락 | 백엔드 요구사항 변경 | 인터셉터에서 자동 추가 |
| 404를 정상 케이스로 | 빈 목록도 404 반환 | catch에서 빈 배열 처리 |

### 8.4 UI/UX

| 문제 | 원인 | 해결 |
|------|------|------|
| 모달 상단 잘림 | CSS height 계산 오류 | flexbox 레이아웃 수정 |
| 참여자 닉네임 null | 백엔드 데이터 null | fallback 처리 |

---

## 9. 성과 및 배운 점

### 9.1 정량적 성과

**개발 생산성**
- 📝 100+ 커밋
- 🔀 80+ Pull Request
- ⏱️ 6주 개발 기간

**코드 품질**
- ✅ TypeScript 적용률 100%
- 🧩 30+ 재사용 컴포넌트
- 🎯 엄격한 타입 체크

**기능 완성도**
- ✅ 인증 (이메일/OAuth) - 100%
- ✅ 공동구매 CRUD - 100%
- ✅ 커뮤니티 CRUD - 100%
- ✅ 실시간 채팅 - 95%
- ✅ 반응형 UI - 100%

### 9.2 핵심 성과

**🎨 Talk to Figma로 디자인 시스템 구축**
- Figma 디자인을 기반으로 일관된 컴포넌트 시스템 구축
- 디자인 토큰 추출로 통일된 UI/UX
- 30+ 재사용 가능한 컴포넌트 개발

**💬 WebSocket 실시간 채팅 구현**
- STOMP over WebSocket 아키텍처
- 실시간 메시지 송수신
- 구매자 확정 및 모집 완료 기능
- 체계적인 트러블슈팅으로 안정적 구현

**🧪 Playwright MCP로 E2E 테스트 자동화**
- 11개 테스트 파일 작성
- 다중 브라우저 및 모바일 테스트
- AI 기반 테스트 생성 활용
- CI/CD 통합 준비 완료

**🤖 99% Vibe Coding으로 개발**
- AI 페어 프로그래밍 활용
- 개발 기간 50% 단축 (12주 → 6주)
- 일평균 3~5개 커밋, 주평균 15~20개 PR
- 코드 품질과 속도 동시 확보

**🔄 완벽한 반응형 UI**
- 모바일/태블릿/PC 최적화
- MobileHeader, BottomNav, FAB
- 모달 시스템 통합

### 9.3 배운 점

**기술적 역량**
- ✨ React 19의 최신 기능 활용
- 🔌 WebSocket/STOMP 실시간 통신 구현
- 🧪 E2E 테스트 자동화 경험
- 🏗️ 마이크로서비스 아키텍처와의 통합

**협업 능력**
- 👥 프론트엔드/백엔드 협업 프로세스
- 📄 체계적인 문서화 및 커뮤니케이션
- 🐛 이슈 발견 및 피드백 전달
- 🔍 코드 리뷰 문화

**문제 해결 능력**
- 🔧 체계적인 트러블슈팅 프로세스
- 📚 문제 해결 과정 문서화
- 🤝 백엔드 팀과의 협력적 이슈 해결

### 9.4 향후 개선 방향

**단기 (1~2주)**
- [ ] E2E 테스트 커버리지 확대
- [ ] 성능 최적화 (React.memo, useMemo)
- [ ] 접근성 개선 (ARIA 레이블)

**중기 (1~2개월)**
- [ ] PWA 전환 (Service Worker)
- [ ] 실시간 알림 (WebSocket 알림)
- [ ] 고급 검색 (필터 조합)

**장기 (3개월+)**
- [ ] AI 기능 (상품 추천, 챗봇)
- [ ] 결제 시스템 (PG사 연동)
- [ ] 데이터 분석 (Google Analytics)

---

## 마무리

### 핵심 개발 여정

```
99% Vibe Coding
    ↓
Talk to Figma (디자인 → 코드)
    ↓
컴포넌트 시스템 구축 (30+개)
    ↓
핵심 기능 개발 (인증, 공동구매, 커뮤니티)
    ↓
실시간 채팅 (WebSocket/STOMP)
    ↓
Playwright MCP (E2E 테스트)
    ↓
프로덕션 준비 완료
```

### 핵심 메시지

**"99% AI 페어 프로그래밍으로 완성한 프로덕션 급 웹 애플리케이션"**

1. **99% Vibe Coding**으로 6주 만에 완성
2. **Talk to Figma**로 디자인 → 코드 자동화
3. **TypeScript**로 100% 타입 안정성 확보
4. **WebSocket**으로 실시간 채팅 구현
5. **Playwright MCP**로 E2E 테스트 자동화
6. **AI와 함께**하는 새로운 개발 패러다임

---

**감사합니다!**

**GitHub Repository**: [https://github.com/Donghaeng-Team/frontend](https://github.com/Donghaeng-Team/frontend)
