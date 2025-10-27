# Playwright MCP E2E 자동화 테스트 가이드

## 목차
1. [개요](#1-개요)
2. [Playwright MCP 설정](#2-playwright-mcp-설정)
3. [테스트 시나리오 및 우선순위](#3-테스트-시나리오-및-우선순위)
4. [Playwright MCP 사용법](#4-playwright-mcp-사용법)
5. [테스트 작성 가이드](#5-테스트-작성-가이드)
6. [CI/CD 통합](#6-cicd-통합)
7. [모범 사례](#7-모범-사례)

---

## 1. 개요

이 문서는 **함께 사요(Bytogether)** 프로젝트의 Playwright MCP를 활용한 E2E 자동화 테스트 가이드입니다.

### 1.1 목적
- 사용자 플로우의 자동화된 검증
- 회귀 테스트 자동화
- 브라우저 간 호환성 테스트
- AI 기반 테스트 자동화

### 1.2 기술 스택
- **Playwright MCP**: AI 기반 E2E 테스트 자동화
- **Claude Code**: MCP 서버 실행 환경
- **TypeScript/JavaScript**: 테스트 스크립트
- **GitHub Actions**: CI/CD 자동화

### 1.3 Playwright MCP란?

Playwright MCP는 Model Context Protocol을 통해 Claude와 Playwright를 연결하여, 자연어로 E2E 테스트를 작성하고 실행할 수 있게 해주는 도구입니다.

**장점:**
- 자연어로 테스트 시나리오 작성
- 브라우저 자동화 및 스크린샷 캡처
- 실시간 디버깅 및 분석
- 코드 작성 없이 테스트 가능

---

## 2. Playwright MCP 설정

### 2.1 Claude Code 설치

```bash
# Claude Code CLI 설치
npm install -g @anthropic-ai/claude-code
```

### 2.2 MCP 서버 설정

Claude Code 설정 파일에 Playwright MCP 서버를 추가합니다:

**경로:** `~/.config/claude-code/config.json` (Linux/Mac) 또는 `%APPDATA%\claude-code\config.json` (Windows)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 2.3 Claude Code 실행

```bash
# Claude Code 시작
claude-code

# 또는 프로젝트 디렉토리에서
cd C:\Users\user\Desktop\sesac\frontend\bytogether
claude-code
```

### 2.4 Playwright MCP 도구 확인

Claude Code 실행 후 사용 가능한 MCP 도구들:

- `playwright_navigate`: 페이지 이동
- `playwright_click`: 요소 클릭
- `playwright_fill`: 입력 필드 채우기
- `playwright_screenshot`: 스크린샷 캡처
- `playwright_evaluate`: JavaScript 실행
- `playwright_select`: 드롭다운 선택
- 기타 Playwright 모든 기능

---

## 3. 테스트 시나리오 및 우선순위

### 3.1 우선순위 1 (Critical Path) - 핵심 사용자 플로우

#### A. 인증 (Authentication)
- ✅ 이메일/비밀번호로 로그인 성공
- ✅ 잘못된 비밀번호로 로그인 실패
- ✅ 존재하지 않는 이메일로 로그인 실패
- ✅ 로그인 후 토큰 저장 확인

#### B. 공동구매 전체 플로우
- ✅ 상품 생성부터 구매 완료까지 전체 시나리오
- ✅ 채팅방 자동 생성
- ✅ 다중 사용자 참여
- ✅ 구매 신청 및 확정

#### C. 채팅 기본 기능
- ✅ 채팅방 참여
- ✅ WebSocket 연결
- ✅ 메시지 전송/수신
- ✅ 실시간 다중 사용자 채팅

### 3.2 우선순위 2 (High Priority) - 주요 기능

#### D. 상품 관리
- 상품 생성 (필수 정보 입력, 이미지 업로드, 위치 설정)
- 상품 상세 정보 표시
- 참여자 현황 표시
- 찜하기 기능

#### E. 커뮤니티
- 게시글 작성 (텍스트, 이미지)
- 댓글/대댓글 작성
- 댓글 수정/삭제

### 3.3 우선순위 3 (Medium Priority) - 부가 기능

#### F. 검색 및 필터
- 키워드 검색
- 카테고리/가격/지역 필터

#### G. 마이페이지
- 프로필 정보 표시
- 통계 정보
- 프로필 수정

---

## 4. Playwright MCP 사용법

### 4.1 기본 테스트 시나리오 예제

Claude Code에서 자연어로 테스트를 요청할 수 있습니다:

```
"로그인 페이지로 이동해서 이메일 test@example.com, 비밀번호 Test1234!로 로그인하고 스크린샷 찍어줘"

"상품 목록 페이지에서 첫 번째 상품을 클릭하고 상세 페이지가 제대로 로드되는지 확인해줘"

"채팅방에 메시지를 입력하고 전송 버튼을 클릭한 후 메시지가 표시되는지 확인해줘"
```

### 4.2 일반적인 테스트 패턴

#### 로그인 테스트

```
1. http://localhost:5173/login-form 페이지로 이동
2. 이메일 입력 필드에 seller@test.com 입력
3. 비밀번호 입력 필드에 Test1234! 입력
4. 로그인 버튼 클릭
5. URL이 /로 변경되는지 확인
6. 스크린샷 캡처
```

#### 상품 목록 테스트

```
1. http://localhost:5173/products 페이지로 이동
2. 상품 카드가 표시되는지 확인
3. 검색 입력 필드에 "사과" 입력
4. 검색 결과가 표시되는지 확인
5. 스크린샷 캡처
```

#### 채팅 테스트

```
1. http://localhost:5173/chat/1 페이지로 이동
2. 메시지 입력 필드에 "안녕하세요" 입력
3. 전송 버튼 클릭
4. 메시지가 화면에 표시되는지 확인
5. 스크린샷 캡처
```

### 4.3 스크린샷 및 디버깅

```
"현재 페이지의 스크린샷을 찍어줘"

"페이지의 HTML 구조를 확인해줘"

"특정 요소가 존재하는지 확인해줘"

"JavaScript 콘솔 에러가 있는지 확인해줘"
```

---

## 5. 테스트 작성 가이드

### 5.1 테스트 시나리오 작성 원칙

#### BDD 스타일 (Given-When-Then)

```
Given: 사용자가 로그인 페이지에 있을 때
When: 유효한 이메일과 비밀번호를 입력하고 로그인 버튼을 클릭하면
Then: 홈페이지로 리다이렉트되고 사용자 아이콘이 표시된다
```

#### 명확한 시나리오 설명

```
테스트 이름: "이메일/비밀번호로 로그인 성공"

단계:
1. 로그인 폼 페이지 접속
2. 이메일 입력: seller@test.com
3. 비밀번호 입력: Test1234!
4. 로그인 버튼 클릭
5. 홈페이지(/) 리다이렉트 확인
6. 헤더에 사용자 아이콘 표시 확인
```

### 5.2 Selector 전략

#### 우선순위

1. ✅ `data-testid` 속성 (권장)
2. ✅ Role 기반 (`button`, `link`, `textbox`)
3. ✅ Label 텍스트
4. ⚠️ CSS 클래스 (변경 가능성)
5. ❌ XPath (취약함)

#### 예제

```
"이메일 입력 필드" → input#email 또는 input[name="email"]
"로그인 버튼" → button:has-text("로그인")
"상품 카드" → .product-card
"첫 번째 상품" → .product-card:first-child
```

### 5.3 대기 전략

Playwright MCP는 자동으로 요소가 나타날 때까지 대기하지만, 필요시 명시적으로 요청할 수 있습니다:

```
"페이지가 완전히 로드될 때까지 기다려줘"

"상품 카드가 표시될 때까지 기다려줘"

"API 응답이 완료될 때까지 기다려줘"
```

---

## 6. CI/CD 통합

### 6.1 GitHub Actions 워크플로우

`.github/workflows/e2e-tests.yml` 파일 생성:

```yaml
name: E2E Tests with Playwright MCP

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start dev server
        run: npm run dev &
        env:
          CI: true

      - name: Wait for server
        run: npx wait-on http://localhost:5173

      - name: Run E2E tests
        run: npx playwright test
        env:
          CI: true
          BASE_URL: http://localhost:5173

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### 6.2 환경 변수 설정

`.env.test` 파일:

```env
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:8080

TEST_SELLER_EMAIL=seller@test.com
TEST_SELLER_PASSWORD=Test1234!

TEST_BUYER1_EMAIL=buyer1@test.com
TEST_BUYER1_PASSWORD=Test1234!
```

---

## 7. 모범 사례

### 7.1 테스트 작성 원칙

#### 독립적인 테스트
- 각 테스트는 다른 테스트에 의존하지 않아야 함
- 테스트 간 상태 공유 금지

#### 명확한 테스트 이름
- ✅ "이메일/비밀번호로 로그인 성공"
- ❌ "test1", "로그인"

#### 적절한 대기
- 하드코딩된 timeout 피하기
- 요소 출현 대기 사용

### 7.2 성능 최적화

1. **병렬 실행 제한**
   - DB 상태 공유 시 순차 실행

2. **API 직접 호출**
   - UI를 거치지 않고 테스트 데이터 생성

3. **브라우저 컨텍스트 재사용**
   - 로그인 상태 저장/복원

### 7.3 디버깅 팁

```
"현재 페이지의 HTML을 보여줘"

"특정 요소의 CSS 스타일을 확인해줘"

"JavaScript 콘솔 로그를 보여줘"

"네트워크 요청을 모니터링해줘"
```

---

## 8. 실전 예제

### 8.1 전체 공동구매 플로우 테스트

```
시나리오: 판매자가 상품을 등록하고 구매자가 참여하는 전체 플로우

1. [판매자] 로그인
   - /login-form 접속
   - seller@test.com / Test1234! 로그인

2. [판매자] 상품 등록
   - /products/register 접속
   - 상품명: "유기농 사과 공동구매"
   - 가격: 25000
   - 설명: "신선한 유기농 사과입니다"
   - 이미지 업로드
   - 등록 버튼 클릭

3. [구매자] 로그아웃 후 로그인
   - 로그아웃
   - buyer1@test.com / Test1234! 로그인

4. [구매자] 상품 찾기 및 채팅방 참여
   - /products 접속
   - "유기농 사과" 검색
   - 상품 클릭
   - 채팅방 참여 버튼 클릭

5. [구매자] 메시지 전송
   - "참여하고 싶습니다" 입력
   - 전송 버튼 클릭

6. [구매자] 구매 신청
   - 구매 신청 버튼 클릭
   - 확인

7. 스크린샷 캡처 및 검증
```

### 8.2 커뮤니티 게시글 작성 테스트

```
시나리오: 사용자가 커뮤니티에 게시글을 작성하고 댓글을 남김

1. 로그인
   - /login-form 접속
   - test@example.com / Test1234! 로그인

2. 커뮤니티 페이지 접속
   - /community 클릭

3. 게시글 작성
   - 글쓰기 버튼 클릭
   - 카테고리: 동네 소식
   - 제목: "테스트 게시글"
   - 내용: "이것은 테스트 게시글입니다"
   - 등록 버튼 클릭

4. 댓글 작성
   - 댓글 입력: "좋은 정보 감사합니다"
   - 댓글 등록 버튼 클릭

5. 검증
   - 게시글이 목록에 표시되는지 확인
   - 댓글이 표시되는지 확인
```

---

## 9. 문의 및 기여

테스트 관련 문의사항이나 개선 제안은 팀 슬랙 채널 또는 GitHub Issue로 등록해주세요.

### 참고 자료

- [Playwright MCP 공식 문서](https://github.com/microsoft/playwright-mcp)
- [Playwright 공식 문서](https://playwright.dev)
- [Claude Code 문서](https://docs.anthropic.com/claude-code)
- [Model Context Protocol](https://modelcontextprotocol.io)
