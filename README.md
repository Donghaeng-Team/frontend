# 함께 사요 (ByTogether)

공동구매 및 커뮤니티 플랫폼 프론트엔드

## 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트
- **Styled Components** - CSS-in-JS

## 시작하기

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
# 백엔드 API 주소 (필수)
VITE_API_BASE_URL=http://localhost:8080/api

# 카카오맵 API 키 (선택)
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here

# 기타 설정들은 기본값 사용 가능
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 을 열어 확인합니다.

## 사용 가능한 스크립트

### `npm run dev`
개발 모드로 앱을 실행합니다.
- 핫 모듈 교체(HMR) 지원
- 빠른 개발 서버

### `npm run build`
프로덕션용으로 앱을 빌드합니다.
- TypeScript 컴파일 및 타입 체크
- 코드 최적화 및 번들링
- `dist` 폴더에 결과물 생성

### `npm run preview`
빌드된 앱을 미리보기합니다.
- 프로덕션 빌드 테스트용

### `npm run lint`
ESLint를 실행하여 코드 품질을 체크합니다.

## 프로젝트 구조

```
bytogether/
├── public/              # 정적 파일
├── src/
│   ├── api/            # API 클라이언트 및 서비스
│   ├── assets/         # 이미지, 폰트 등
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   ├── hooks/          # 커스텀 훅
│   ├── utils/          # 유틸리티 함수
│   ├── types/          # TypeScript 타입 정의
│   ├── App.tsx         # 앱 루트 컴포넌트
│   └── main.tsx        # 앱 진입점
├── .env.example        # 환경 변수 예시
└── package.json        # 프로젝트 의존성
```

## 주요 기능

- 🛒 **공동구매** - 상품 등록, 검색, 참여
- 💬 **커뮤니티** - 게시글 작성, 댓글
- 👤 **마이페이지** - 내 활동 관리
- 🔐 **인증** - 회원가입, 로그인
- 📍 **위치 기반** - 카카오맵 연동

## 브랜치 전략

- `main` - 프로덕션 배포 브랜치
- `dev` - 개발 통합 브랜치
- `feat/*` - 기능 개발 브랜치
- `fix/*` - 버그 수정 브랜치

## 기여하기

1. 이슈를 생성하거나 담당자 배정
2. 기능 브랜치 생성 (`git checkout -b feat/feature-name`)
3. 변경사항 커밋 (`git commit -m 'feat: add some feature'`)
4. 브랜치에 푸시 (`git push origin feat/feature-name`)
5. Pull Request 생성

## 문제 해결

### 포트가 이미 사용 중인 경우

개발 서버 기본 포트(5173)가 이미 사용 중이면 Vite가 자동으로 다른 포트를 선택합니다.

### 빌드 에러

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 타입 에러

```bash
# TypeScript 컴파일 체크
npm run build
```

## 라이선스

이 프로젝트는 팀 프로젝트입니다.
