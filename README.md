# 함께 사요 (ByTogether)

> 위치 기반 공동구매 및 커뮤니티 플랫폼

지역 기반으로 이웃과 함께 공동구매를 진행하고, 커뮤니티를 통해 소통하는 플랫폼입니다.

## 📚 목차

- [기술 스택](#-기술-스택)
- [주요 기능](#-주요-기능)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [API 서비스](#-api-서비스)
- [상태 관리](#-상태-관리)
- [스크립트](#-스크립트)
- [브랜치 전략](#-브랜치-전략)
- [기여하기](#-기여하기)
- [문제 해결](#-문제-해결)

---

## 🛠 기술 스택

### Core
- **React 19.1.1** - UI 라이브러리
- **TypeScript 5.8.3** - 타입 안정성
- **Vite 7.1.7** - 빌드 도구 및 개발 서버

### Routing & State Management
- **React Router DOM 7.9.1** - 클라이언트 사이드 라우팅
- **Zustand 5.0.8** - 경량 전역 상태 관리

### API & Communication
- **Axios 1.12.2** - HTTP 클라이언트 및 API 통신
- **@stomp/stompjs 7.2.1** - WebSocket/STOMP 프로토콜 (실시간 채팅)
- **sockjs-client 1.6.1** - WebSocket 폴백

### Maps & Location
- **@vis.gl/react-google-maps 1.5.5** - Google Maps 연동

### Testing
- **Playwright 1.56.1** - E2E 테스트 프레임워크

### Styling
- **CSS Modules** - 컴포넌트 레벨 스타일링
- **Vanilla CSS** - 글로벌 스타일

### Development Tools
- **ESLint 9.36.0** - 코드 품질 및 스타일 가이드
- **TypeScript ESLint 8.44.0** - TypeScript 전용 린팅 규칙

---

## ✨ 주요 기능

### 🛒 공동구매
- 상품 등록 및 수정
- 위치 기반 상품 검색 및 필터링
- 카테고리별 상품 탐색
- 찜하기 및 장바구니
- 구매 내역 관리

### 💬 커뮤니티
- 게시글 작성 및 수정
- 댓글 및 대댓글
- 이미지 업로드 (S3 Presigned URL)
- 카테고리별 게시글 필터링

### 🗨️ 채팅
- **WebSocket/STOMP 기반 실시간 채팅**
- 상품별 채팅방 생성 및 관리
- 실시간 메시지 송수신
- 참여자 관리 및 상태 추적
- 구매자 확정 및 모집 완료 기능
- 시스템 메시지 (입장/퇴장/구매 알림)
- 마감 시간 연장 기능

### 👤 마이페이지
- 프로필 관리
- 구매 내역 및 판매 내역
- 찜한 상품 목록
- 비밀번호 변경

### 🔐 인증
- 이메일 회원가입 및 로그인
- OAuth 2.0 (카카오, 구글)
- JWT 기반 인증
- 자동 토큰 갱신

### 📍 위치 서비스
- Google Maps 연동
- 행정구역 기반 위치 선택
- 위치 기반 상품 필터링
- 현재 위치 자동 감지

### 📱 반응형 디자인
- 모바일 전용 헤더 및 네비게이션
- Bottom Navigation (모바일)
- FAB(Floating Action Button) 버튼
- 데스크톱/모바일 최적화

### 🧪 E2E 테스트
- **Playwright 기반 자동화 테스트**
- 네비게이션 테스트 (주요 페이지 접근)
- 폼 유효성 검사 테스트 (로그인, 회원가입)
- 컴포넌트 테스트 (Button, Modal, Input 등)
- 페이지 기능 테스트 (상품 목록, 커뮤니티 등)
- 다중 브라우저 지원 (Chromium, Firefox, WebKit, Mobile)

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/Donghaeng-Team/frontend.git
cd frontend/bytogether
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:

**Windows (cmd)**
```cmd
copy .env.example .env
```

**Windows (PowerShell) / Mac / Linux**
```bash
cp .env.example .env
```

`.env` 파일을 열어 필요한 값들을 설정합니다:

```env
# API 기본 URL (통합 게이트웨이 사용 시)
VITE_API_BASE_URL=http://localhost:8080

# 마이크로서비스별 개별 URL (필요 시)
VITE_DIVISION_API_URL=http://localhost:8081
VITE_MARKET_API_URL=http://localhost:8082
VITE_USER_API_URL=http://localhost:8083
VITE_COMMUNITY_API_URL=http://localhost:8085
VITE_CHAT_API_URL=http://localhost:8086

# Google Maps API 키
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# WebSocket 설정 (채팅)
VITE_WS_BASE_URL=ws://localhost:8080/ws

# 기타 설정
VITE_DEBUG=false
VITE_API_TIMEOUT=30000
```

> **참고**: 각 마이크로서비스별 포트:
> - **API Gateway** (8080): 통합 API 게이트웨이
> - **Division Service** (8081): 행정구역/위치 관리
> - **Market Service** (8082): 공동구매/상품 관리
> - **User Service** (8083): 사용자/인증 관리
> - **Community Service** (8085): 커뮤니티/댓글 관리
> - **Chat Service** (8086): 채팅 관리

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173)을 열어 확인합니다.

---

## 📁 프로젝트 구조

```
bytogether/
├── public/                    # 정적 파일
├── src/
│   ├── api/                  # API 클라이언트 및 서비스
│   │   ├── client.ts         # Axios 인스턴스 및 인터셉터
│   │   ├── services/         # API 서비스 모듈
│   │   │   ├── auth.ts       # 인증 API
│   │   │   ├── user.ts       # 사용자 API
│   │   │   ├── product.ts    # 상품 API
│   │   │   ├── market.ts     # 공동구매 API
│   │   │   ├── cart.ts       # 장바구니 API
│   │   │   ├── community.ts  # 커뮤니티 API
│   │   │   ├── comment.ts    # 댓글 API
│   │   │   ├── chat.ts       # 채팅 API
│   │   │   ├── image.ts      # 이미지 업로드 API
│   │   │   └── location.ts   # 위치 API
│   │   └── index.ts          # API 서비스 통합 export
│   ├── assets/               # 이미지, 폰트 등
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── Header/           # 헤더 (데스크톱)
│   │   ├── MobileHeader/     # 모바일 전용 헤더
│   │   ├── Footer/           # 푸터
│   │   ├── BottomNav/        # 하단 네비게이션 (모바일)
│   │   ├── Button/           # 공통 버튼
│   │   ├── Card/             # 상품/게시글 카드
│   │   ├── Modal/            # 모달
│   │   ├── LocationModal/    # 위치 선택 모달
│   │   ├── ChatRoom/         # 채팅방
│   │   ├── ChatModal/        # 채팅 모달
│   │   └── FloatingActionButton/  # FAB 버튼
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── Main/             # 메인 페이지
│   │   ├── Login/            # 로그인
│   │   ├── LoginForm/        # 이메일 로그인 폼
│   │   ├── SignUp/           # 회원가입
│   │   ├── ProductList/      # 상품 목록
│   │   ├── ProductDetail/    # 상품 상세
│   │   ├── ProductRegister/  # 상품 등록
│   │   ├── ProductEdit/      # 상품 수정
│   │   ├── CommunityBoard/   # 커뮤니티 게시판
│   │   ├── CommunityPostDetail/  # 게시글 상세
│   │   ├── CommunityPostCreate/  # 게시글 작성
│   │   ├── CommunityPostEdit/    # 게시글 수정
│   │   ├── ChatList/         # 채팅 목록
│   │   ├── ChatRoomPage/     # 채팅방 페이지
│   │   ├── MyPage/           # 마이페이지
│   │   ├── PurchaseHistory/  # 구매/판매 내역
│   │   └── ChangePassword/   # 비밀번호 변경
│   ├── stores/               # Zustand 상태 관리
│   │   ├── authStore.ts      # 인증 상태
│   │   └── locationStore.ts  # 위치 상태
│   ├── types/                # TypeScript 타입 정의
│   │   ├── index.ts          # 공통 타입
│   │   ├── auth.ts           # 인증 관련 타입
│   │   ├── product.ts        # 상품 관련 타입
│   │   ├── community.ts      # 커뮤니티 관련 타입
│   │   └── location.ts       # 위치 관련 타입
│   ├── utils/                # 유틸리티 함수
│   │   ├── token.ts          # 토큰 관리
│   │   ├── date.ts           # 날짜 포맷팅
│   │   └── validation.ts     # 입력 검증
│   ├── styles/               # 글로벌 스타일
│   │   └── reset.css         # CSS 리셋
│   ├── App.tsx               # 앱 루트 컴포넌트
│   └── main.tsx              # 앱 진입점
├── tests/                    # Playwright E2E 테스트
│   ├── basic.spec.ts        # 기본 테스트
│   ├── navigation.spec.ts   # 네비게이션 테스트
│   ├── forms.spec.ts        # 폼 유효성 검사 테스트
│   ├── pages.spec.ts        # 페이지 기능 테스트
│   └── components.spec.ts   # 컴포넌트 테스트
├── .env.example              # 환경 변수 예시
├── .gitignore                # Git 무시 파일
├── package.json              # 프로젝트 의존성
├── tsconfig.json             # TypeScript 설정
├── playwright.config.ts      # Playwright 테스트 설정
├── vite.config.ts            # Vite 설정
├── README.md                 # 프로젝트 문서
└── PLAYWRIGHT_TEST_GUIDE.md  # Playwright 테스트 가이드
```

---

## 🔌 API 서비스

### 인증 (auth.ts)
- `login()` - 이메일 로그인
- `register()` - 회원가입
- `logout()` - 로그아웃
- `refreshToken()` - 토큰 갱신

### 사용자 (user.ts)
- `getUser()` - 사용자 정보 조회
- `updateNickname()` - 닉네임 변경
- `changePassword()` - 비밀번호 변경
- `checkDuplication()` - 중복 확인

### 상품 (product.ts)
- `getProducts()` - 상품 목록 조회
- `getProduct()` - 상품 상세 조회
- `createProduct()` - 상품 등록
- `updateProduct()` - 상품 수정
- `deleteProduct()` - 상품 삭제

### 공동구매 (market.ts)
- `joinPurchase()` - 공동구매 참여
- `leavePurchase()` - 공동구매 취소
- `getPurchaseHistory()` - 구매 내역

### 장바구니 (cart.ts)
- `getCart()` - 장바구니 조회
- `addToCart()` - 장바구니 추가
- `removeFromCart()` - 장바구니 삭제

### 커뮤니티 (community.ts)
- `getPosts()` - 게시글 목록
- `getPost()` - 게시글 상세
- `createPost()` - 게시글 작성
- `updatePost()` - 게시글 수정
- `deletePost()` - 게시글 삭제

### 댓글 (comment.ts)
- `getComments()` - 댓글 목록
- `createComment()` - 댓글 작성
- `updateComment()` - 댓글 수정
- `deleteComment()` - 댓글 삭제

### 채팅 (chat.ts)
- `getChatRoomList()` - 채팅방 목록 조회
- `getChatRoom()` - 채팅방 상세 조회
- `getMessages()` - 메시지 목록 조회 (페이징)
- `getParticipants()` - 참여자 목록 조회
- `leaveChatRoom()` - 채팅방 나가기
- `confirmBuyer()` - 구매자 확정
- `cancelBuyer()` - 구매 취소
- `closeRecruitment()` - 모집 완료
- `extendDeadline()` - 마감 시간 연장
- `kickParticipant()` - 참여자 강퇴

### 이미지 (image.ts)
- `getPresignedUrl()` - S3 Presigned URL 발급
- `uploadImage()` - 이미지 업로드

### 위치 (location.ts)
- `getDivisions()` - 행정구역 목록
- `searchDivisions()` - 행정구역 검색
- `getCoordinates()` - 좌표 조회

---

## 🗄️ 상태 관리

### authStore (Zustand)
```typescript
{
  user: User | null,           // 현재 사용자
  isAuthenticated: boolean,    // 로그인 상태
  login: (user) => void,       // 로그인
  logout: () => void,          // 로그아웃
  updateUser: (user) => void   // 사용자 정보 업데이트
}
```

### locationStore (Zustand)
```typescript
{
  currentDivision: Division | null,  // 현재 선택된 위치
  isLoading: boolean,                // 로딩 상태
  error: string | null,              // 에러 메시지
  setCurrentDivision: (division) => void,  // 위치 설정
  initializeLocation: () => void,          // 위치 초기화
  clearLocation: () => void                // 위치 초기화
}
```

### chatStore (Zustand)
```typescript
{
  wsClient: ChatWebSocketClient | null,    // WebSocket 클라이언트
  wsStatus: ConnectionStatus,              // 연결 상태
  chatRooms: ChatRoomResponse[],           // 채팅방 목록
  currentRoom: ChatRoomResponse | null,    // 현재 채팅방
  messages: ChatMessageResponse[],         // 메시지 목록
  participants: ParticipantResponse[],     // 참여자 목록
  
  initializeWebSocket: () => void,         // WebSocket 초기화
  disconnectWebSocket: () => void,         // WebSocket 연결 해제
  fetchChatRooms: () => Promise<void>,     // 채팅방 목록 조회
  joinChatRoom: (roomId) => Promise<void>, // 채팅방 입장
  sendMessage: (roomId, message, userId, nickname) => void, // 메시지 전송
  confirmBuyer: (roomId) => Promise<void>, // 구매자 확정
  closeRecruitment: (roomId) => Promise<void>, // 모집 완료
  extendDeadline: (roomId, hours) => Promise<void>, // 시간 연장
}
```

---

## 📜 스크립트

### 개발 및 빌드

#### `npm run dev`
개발 모드로 앱을 실행합니다.
- 핫 모듈 교체(HMR) 지원
- 빠른 개발 서버 (Vite)
- 포트: 3000 (설정됨)
- API 프록시 자동 설정 (`/api`, `/ws`, `/upload-url`)

#### `npm run build`
프로덕션용으로 앱을 빌드합니다.
- TypeScript 타입 체크 (`tsc -b`)
- 코드 최적화 및 번들링
- `dist` 폴더에 결과물 생성
- Tree-shaking 및 코드 압축

#### `npm run preview`
빌드된 앱을 미리보기합니다.
- 프로덕션 빌드 로컬 테스트용

#### `npm run lint`
ESLint를 실행하여 코드 품질을 체크합니다.
- TypeScript 린팅 규칙 적용
- 코드 스타일 가이드 검증

### 테스트

#### `npm run test`
Playwright E2E 테스트를 실행합니다.
- 모든 브라우저에서 테스트 실행
- HTML 리포트 생성

#### `npm run test:ui`
Playwright UI 모드로 테스트를 실행합니다.
- 인터랙티브 테스트 디버깅
- 실시간 테스트 결과 확인

#### `npm run test:headed`
헤드 모드로 테스트를 실행합니다.
- 브라우저 창을 표시하며 테스트 실행

#### `npm run test:debug`
디버그 모드로 테스트를 실행합니다.
- 단계별 테스트 실행
- Playwright Inspector 활성화

---

## 🌿 브랜치 전략

### 주요 브랜치
- **`main`** - 프로덕션 배포 브랜치
- **`dev`** - 개발 통합 브랜치

### 기능 브랜치
- **`feat/*`** - 새로운 기능 개발
  - 예: `feat/oauth`, `feat/mobile-fab-button`
- **`fix/*`** - 버그 수정
- **`docs/*`** - 문서 작업
  - 예: `docs/chat-system-todo`
- **`refactor/*`** - 코드 리팩토링
- **`style/*`** - UI/스타일 변경

### 커밋 메시지 컨벤션
```
<type>: <subject>

<body>

<footer>
```

**Type:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드
- `chore`: 빌드 프로세스 또는 보조 도구 변경

---

## 🤝 기여하기

1. 이슈를 생성하거나 담당자 배정
2. 기능 브랜치 생성
   ```bash
   git checkout -b feat/feature-name
   ```
3. 변경사항 커밋
   ```bash
   git commit -m 'feat: add some feature'
   ```
4. 브랜치에 푸시
   ```bash
   git push origin feat/feature-name
   ```
5. Pull Request 생성
   - 변경사항 설명
   - 관련 이슈 번호
   - 스크린샷 (UI 변경 시)

---

## 🔧 문제 해결

### 포트가 이미 사용 중인 경우

개발 서버는 포트 3000을 사용합니다 (`vite.config.ts`에서 설정).

포트가 사용 중인 경우 프로세스를 종료하거나 다른 포트를 사용하세요:
```bash
# Windows에서 포트 사용 중인 프로세스 확인
netstat -ano | findstr :3000

# 프로세스 종료 (PID는 위 명령으로 확인)
taskkill //F //PID <PID>

# 또는 다른 포트 사용
npm run dev -- --port 5173
```

### 빌드 에러

node_modules 삭제 후 재설치:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript 타입 에러

TypeScript 컴파일 체크:
```bash
npm run build
```

특정 파일의 타입 체크:
```bash
npx tsc --noEmit src/path/to/file.ts
```

### API 연결 오류

1. 백엔드 서버가 실행 중인지 확인
2. `.env` 파일의 API URL 확인
3. 브라우저 개발자 도구 Network 탭 확인
4. CORS 설정 확인 (백엔드)

### Google Maps 오류

1. `.env` 파일에 `VITE_GOOGLE_MAPS_API_KEY` 설정 확인
2. API 키 권한 확인 (Maps JavaScript API 활성화)
3. API 키 제한 설정 확인

### WebSocket 연결 오류

1. 백엔드 WebSocket 서버 실행 확인 (포트 8080)
2. `.env` 파일의 `VITE_WS_BASE_URL` 확인
3. `vite.config.ts`의 `/ws` 프록시 설정 확인
4. 브라우저 개발자 도구 Console/Network 탭에서 WebSocket 연결 상태 확인

### E2E 테스트 실패

1. **개발 서버 실행 확인**: `npm run dev`로 앱이 실행 중인지 확인
2. **Playwright 브라우저 설치**: `npx playwright install`
3. **API 서버 실행 확인**: 백엔드 서버가 실행 중인지 확인
4. **특정 테스트만 실행**: `npm run test tests/basic.spec.ts`
5. **디버그 모드 실행**: `npm run test:debug`

---

## 📄 문서

- [Playwright 테스트 가이드](./PLAYWRIGHT_TEST_GUIDE.md) - E2E 테스트 실행 및 작성 가이드

---

## 👥 팀

**Donghaeng Team**

---

## 📝 라이선스

이 프로젝트는 팀 프로젝트입니다.
