# Playwright E2E 자동화 테스트 가이드

## 목차
1. [개요](#1-개요)
2. [프로젝트 초기 설정](#2-프로젝트-초기-설정)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [테스트 시나리오 및 우선순위](#4-테스트-시나리오-및-우선순위)
5. [Page Object Model (POM) 구현](#5-page-object-model-pom-구현)
6. [테스트 픽스처 및 헬퍼](#6-테스트-픽스처-및-헬퍼)
7. [실제 테스트 예제](#7-실제-테스트-예제)
8. [실행 및 CI/CD 통합](#8-실행-및-cicd-통합)
9. [모범 사례 및 주의사항](#9-모범-사례-및-주의사항)
10. [단계별 구현 로드맵](#10-단계별-구현-로드맵)

---

## 1. 개요

이 문서는 **함께 사요(Bytogether)** 프로젝트의 Playwright E2E 자동화 테스트 구성 및 실행 가이드입니다.

### 1.1 목적
- 사용자 플로우의 자동화된 검증
- 회귀 테스트 자동화
- 브라우저 간 호환성 테스트
- CI/CD 파이프라인 통합

### 1.2 기술 스택
- **Playwright**: E2E 테스트 프레임워크
- **TypeScript**: 타입 안전한 테스트 코드
- **GitHub Actions**: CI/CD 자동화

---

## 2. 프로젝트 초기 설정

### 2.1 Playwright 설치

```bash
# 프로젝트 루트에서 실행
cd C:\Users\user\Desktop\sesac\frontend\bytogether

# Playwright 설치
npm init playwright@latest

# 또는 기존 프로젝트에 추가
npm install -D @playwright/test
npx playwright install
```

### 2.2 설치 시 선택 옵션

| 질문 | 권장 선택 |
|------|----------|
| TypeScript 사용? | ✅ Yes |
| 테스트 폴더 위치 | `e2e/` |
| GitHub Actions workflow 추가 | 선택 사항 |
| Playwright Test 예제 추가 | ✅ Yes |

### 2.3 추가 패키지 설치

```bash
# Faker (테스트 데이터 생성용)
npm install -D @faker-js/faker
```

---

## 3. 프로젝트 구조

```
bytogether/
├── e2e/                          # E2E 테스트 루트
│   ├── .auth/                   # 인증 상태 저장
│   │   ├── seller.json
│   │   └── buyer.json
│   │
│   ├── fixtures/                 # 테스트 픽스처
│   │   ├── auth.fixture.ts      # 인증 관련 픽스처
│   │   ├── db.fixture.ts        # DB 데이터 설정
│   │   └── index.ts             # 픽스처 통합
│   │
│   ├── pages/                    # Page Object Model
│   │   ├── base.page.ts         # 기본 페이지 클래스
│   │   ├── login.page.ts        # 로그인 페이지
│   │   ├── product-list.page.ts # 상품 목록 페이지
│   │   ├── product-detail.page.ts # 상품 상세 페이지
│   │   ├── chat-room.page.ts    # 채팅방 페이지
│   │   ├── community.page.ts    # 커뮤니티 페이지
│   │   └── mypage.page.ts       # 마이페이지
│   │
│   ├── tests/                    # 실제 테스트 파일
│   │   ├── auth/                # 인증 관련 테스트
│   │   │   ├── login.spec.ts
│   │   │   ├── logout.spec.ts
│   │   │   └── signup.spec.ts
│   │   │
│   │   ├── product/             # 공동구매 관련 테스트
│   │   │   ├── create-product.spec.ts
│   │   │   ├── product-list.spec.ts
│   │   │   ├── product-detail.spec.ts
│   │   │   ├── wishlist.spec.ts
│   │   │   └── filter-search.spec.ts
│   │   │
│   │   ├── chat/                # 채팅 관련 테스트
│   │   │   ├── chat-room-join.spec.ts
│   │   │   ├── chat-messaging.spec.ts
│   │   │   ├── buyer-confirm.spec.ts
│   │   │   ├── chat-list.spec.ts
│   │   │   └── websocket.spec.ts
│   │   │
│   │   ├── community/           # 커뮤니티 관련 테스트
│   │   │   ├── post-create.spec.ts
│   │   │   ├── post-detail.spec.ts
│   │   │   ├── comment.spec.ts
│   │   │   └── reply.spec.ts
│   │   │
│   │   └── integration/         # 통합 시나리오 테스트
│   │       ├── full-purchase-flow.spec.ts
│   │       └── user-journey.spec.ts
│   │
│   ├── utils/                    # 유틸리티 함수
│   │   ├── test-data.ts         # 테스트 데이터 생성
│   │   ├── api-helpers.ts       # API 헬퍼
│   │   ├── db-helpers.ts        # DB 헬퍼
│   │   └── custom-matchers.ts   # 커스텀 Matcher
│   │
│   └── config/                   # 테스트 설정
│       ├── test-users.ts        # 테스트 사용자 정보
│       └── test-env.ts          # 환경별 설정
│
├── playwright.config.ts          # Playwright 설정
├── .env.test                     # 테스트 환경변수
└── package.json
```

---

## 4. 테스트 시나리오 및 우선순위

### 4.1 우선순위 1 (Critical Path) - 핵심 사용자 플로우

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

### 4.2 우선순위 2 (High Priority) - 주요 기능

#### D. 상품 관리
- 상품 생성 (필수 정보 입력, 이미지 업로드, 위치 설정)
- 상품 상세 정보 표시
- 참여자 현황 표시
- 찜하기 기능

#### E. 커뮤니티
- 게시글 작성 (텍스트, 이미지)
- 댓글/대댓글 작성
- 댓글 수정/삭제

### 4.3 우선순위 3 (Medium Priority) - 부가 기능

#### F. 검색 및 필터
- 키워드 검색
- 카테고리/가격/지역 필터

#### G. 마이페이지
- 프로필 정보 표시
- 통계 정보
- 프로필 수정

---

## 5. Page Object Model (POM) 구현

### 5.1 Base Page 예제

```typescript
// e2e/pages/base.page.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly footer: Locator;
  readonly bottomNav: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header.header');
    this.footer = page.locator('footer');
    this.bottomNav = page.locator('.bottom-nav');
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToProducts() {
    await this.header.locator('a[href="/products"]').click();
  }

  async navigateToCommunity() {
    await this.header.locator('a[href="/community"]').click();
  }

  async logout() {
    const isMobile = await this.page.viewportSize()
      .then(vp => vp && vp.width <= 768);

    if (isMobile) {
      await this.header.locator('.hamburger-btn').click();
    }
    await this.page.getByText('로그아웃').click();
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.header.locator('.header-icon-btn').count() > 0;
  }
}
```

자세한 POM 구현은 [`Page-Object-Models.md`](./Page-Object-Models.md) 참조

---

## 6. 테스트 픽스처 및 헬퍼

### 6.1 테스트 사용자 정의

```typescript
// e2e/fixtures/auth.fixture.ts
export const TEST_USERS = {
  seller: {
    email: 'seller@example.com',
    password: 'Test1234!',
    nickname: 'Seller User'
  },
  buyer1: {
    email: 'buyer1@example.com',
    password: 'Test1234!',
    nickname: 'Buyer One'
  },
  buyer2: {
    email: 'buyer2@example.com',
    password: 'Test1234!',
    nickname: 'Buyer Two'
  }
};
```

### 6.2 테스트 데이터 생성

```typescript
// e2e/utils/test-data.ts
import { faker } from '@faker-js/faker/locale/ko';

export class TestDataGenerator {
  static generateProduct() {
    return {
      title: `${faker.commerce.productName()} 공동구매`,
      category: '식품',
      price: faker.number.int({ min: 10000, max: 100000 }),
      minBuyers: faker.number.int({ min: 2, max: 5 }),
      maxBuyers: faker.number.int({ min: 5, max: 20 }),
      description: faker.commerce.productDescription(),
      location: '서울시 강남구 역삼동',
      endTime: faker.date.future({ years: 0.1 }).toISOString()
    };
  }
}
```

자세한 픽스처 구현은 [`Test-Fixtures.md`](./Test-Fixtures.md) 참조

---

## 7. 실제 테스트 예제

### 7.1 로그인 테스트

```typescript
// e2e/tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { TEST_USERS } from '../../fixtures/auth.fixture';

test.describe('로그인', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('이메일/비밀번호로 로그인 성공', async ({ page }) => {
    // Given: 유효한 사용자 정보
    const user = TEST_USERS.seller;

    // When: 로그인 시도
    await loginPage.login(user.email, user.password);

    // Then: 로그인 성공하고 홈으로 이동
    await loginPage.expectLoginSuccess();
    expect(await loginPage.isLoggedIn()).toBe(true);
  });

  test('잘못된 비밀번호로 로그인 실패', async ({ page }) => {
    // Given: 잘못된 비밀번호
    const user = TEST_USERS.seller;

    // When: 잘못된 비밀번호로 로그인 시도
    await loginPage.login(user.email, 'WrongPassword123!');

    // Then: 에러 메시지 표시
    await loginPage.expectLoginError('비밀번호가 일치하지 않습니다');
  });
});
```

### 7.2 공동구매 전체 플로우 테스트

```typescript
// e2e/tests/integration/full-purchase-flow.spec.ts
test('생성부터 구매 완료까지', async ({ browser }) => {
  // 판매자와 구매자 2명의 컨텍스트 생성
  const sellerContext = await browser.newContext();
  const buyer1Context = await browser.newContext();

  const sellerPage = await sellerContext.newPage();
  const buyer1Page = await buyer1Context.newPage();

  try {
    // Step 1: 판매자 로그인 및 상품 생성
    // Step 2: 구매자1 로그인 및 채팅방 참여
    // Step 3: 구매 신청
    // Step 4: 참여자 현황 확인
    // Step 5: 모집 확정
    // ... (자세한 코드는 Test-Examples.md 참조)

  } finally {
    await sellerContext.close();
    await buyer1Context.close();
  }
});
```

자세한 테스트 예제는 [`Test-Examples.md`](./Test-Examples.md) 참조

---

## 8. 실행 및 CI/CD 통합

### 8.1 로컬 실행 명령어

```bash
# 모든 테스트 실행
npm run test:e2e

# UI 모드로 실행
npm run test:e2e:ui

# 헤드 모드로 실행 (브라우저 보면서)
npm run test:e2e:headed

# 디버그 모드
npm run test:e2e:debug

# 특정 브라우저만 실행
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:mobile

# 리포트 보기
npm run test:e2e:report

# 테스트 코드 생성기
npm run test:e2e:codegen
```

### 8.2 package.json 스크립트

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:chromium": "playwright test --project=chromium",
    "test:e2e:firefox": "playwright test --project=firefox",
    "test:e2e:mobile": "playwright test --project=mobile-chrome",
    "test:e2e:report": "playwright show-report",
    "test:e2e:codegen": "playwright codegen http://localhost:3000"
  }
}
```

### 8.3 GitHub Actions 워크플로우

`.github/workflows/e2e-tests.yml` 파일 생성:

```yaml
name: E2E Tests

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

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm run test:e2e
        env:
          CI: true

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

자세한 CI/CD 설정은 [`CI-CD-Integration.md`](./CI-CD-Integration.md) 참조

---

## 9. 모범 사례 및 주의사항

### 9.1 테스트 작성 원칙

#### AAA 패턴 (Arrange-Act-Assert)

```typescript
test('테스트 이름', async ({ page }) => {
  // Arrange: 테스트 설정
  const loginPage = new LoginPage(page);

  // Act: 실행
  await loginPage.login('user@example.com', 'password');

  // Assert: 검증
  await loginPage.expectLoginSuccess();
});
```

#### 명확한 테스트 이름
- ✅ "무엇을", "어떤 조건에서", "어떻게 되어야 하는지" 포함
- ✅ 예: `'이메일/비밀번호로 로그인 성공'`
- ❌ 나쁜 예: `'test1'`, `'로그인'`

#### 독립적인 테스트
- 각 테스트는 다른 테스트에 의존하지 않아야 함
- `beforeEach`로 초기 상태 설정

### 9.2 Selector 전략

#### 우선순위

1. ✅ `data-testid` 속성 (권장)
2. ✅ Role 기반 (`getByRole`)
3. ✅ Label 텍스트 (`getByLabel`)
4. ⚠️ CSS 클래스 (변경 가능성)
5. ❌ XPath (취약함)

#### 예제

```typescript
// ✅ 좋은 예
page.getByTestId('login-button');
page.getByRole('button', { name: '로그인' });
page.getByLabel('이메일');

// ❌ 나쁜 예
page.locator('.btn-primary.login-btn');
page.locator('//div[@class="form"]/button[1]');
```

### 9.3 대기 전략

#### 자동 대기 활용 (Playwright 내장)

```typescript
// 자동으로 요소가 나타날 때까지 대기
await page.click('button');
```

#### 명시적 대기

```typescript
// 네트워크 요청 완료 대기
await page.waitForResponse(
  resp => resp.url().includes('/api/products')
);

// 특정 상태 대기
await page.waitForLoadState('networkidle');
```

#### 피해야 할 것

```typescript
// ❌ 하드코딩된 timeout
await page.waitForTimeout(3000);
```

### 9.4 성능 최적화

1. **병렬 실행 제한**
   - DB 상태 공유 시 순차 실행
   - `fullyParallel: false` 설정

2. **API 직접 호출**
   - UI를 거치지 않고 테스트 데이터 생성
   - 테스트 속도 향상

3. **브라우저 컨텍스트 재사용**
   - 로그인 상태 저장/복원
   - Setup 단계 활용

자세한 내용은 [`Best-Practices.md`](./Best-Practices.md) 참조

---

## 10. 단계별 구현 로드맵

### Phase 1: 기본 설정 (1-2일)
- [ ] Playwright 설치 및 설정
- [ ] 프로젝트 구조 생성
- [ ] Base Page 구현
- [ ] 테스트 사용자 설정

### Phase 2: 핵심 기능 테스트 (3-5일)
- [ ] 로그인/로그아웃 테스트
- [ ] 상품 생성 테스트
- [ ] 채팅방 참여 테스트
- [ ] 구매 신청 테스트

### Phase 3: 통합 시나리오 (3-4일)
- [ ] 전체 공동구매 플로우 테스트
- [ ] 실시간 채팅 테스트
- [ ] 커뮤니티 기능 테스트

### Phase 4: CI/CD 통합 (1-2일)
- [ ] GitHub Actions 설정
- [ ] 리포트 자동화
- [ ] 슬랙/디스코드 알림 연동

### Phase 5: 고도화 (진행 중)
- [ ] Visual Regression Testing
- [ ] 접근성(A11y) 테스트
- [ ] 성능 테스트
- [ ] 모바일 시나리오 추가

---

## 참고 문서

- [Playwright 공식 문서](https://playwright.dev)
- [Page Object Models 상세 가이드](./Page-Object-Models.md)
- [Test Fixtures 가이드](./Test-Fixtures.md)
- [Test Examples 모음](./Test-Examples.md)
- [CI/CD Integration 가이드](./CI-CD-Integration.md)
- [Best Practices](./Best-Practices.md)
- [Playwright Configuration 상세](./Playwright-Configuration.md)

---

## 문의 및 기여

테스트 관련 문의사항이나 개선 제안은 팀 슬랙 채널 또는 GitHub Issue로 등록해주세요.
