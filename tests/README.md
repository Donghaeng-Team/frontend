# E2E 테스트 가이드

이 디렉토리는 Playwright를 사용한 E2E(End-to-End) 테스트 코드를 포함합니다.

## 📁 테스트 구조

```
tests/
├── fixtures/
│   └── test-data.ts          # 테스트용 공통 데이터
├── helpers/
│   └── auth-helper.ts         # 인증 관련 헬퍼 함수
├── auth.spec.ts               # 인증 플로우 테스트
├── market.spec.ts             # 공동구매 기능 테스트
├── community.spec.ts          # 커뮤니티 기능 테스트
├── mypage.spec.ts             # 마이페이지 기능 테스트
├── navigation.spec.ts         # 네비게이션 및 라우팅 테스트
├── integration.spec.ts        # 통합 시나리오 테스트
├── smoke.spec.ts              # 기본 스모크 테스트
└── auth-smoke.spec.ts         # 로그인 스모크 테스트
```

## 🚀 테스트 실행

### 전체 테스트 실행
```bash
npm test
```

### 특정 테스트 파일 실행
```bash
# 인증 테스트만 실행
npx playwright test auth.spec.ts

# 공동구매 테스트만 실행
npx playwright test market.spec.ts
```

### UI 모드로 실행 (디버깅용)
```bash
npm run test:ui
```

### 브라우저를 열어서 실행 (Headed 모드)
```bash
npm run test:headed
```

### 디버그 모드로 실행
```bash
npm run test:debug
```

### 스모크 테스트만 실행
```bash
npm run test:smoke
```

## 🔐 환경변수 설정

로그인이 필요한 테스트를 실행하려면 환경변수를 설정해야 합니다:

```bash
# .env 파일 생성
E2E_EMAIL=your-test-email@example.com
E2E_PASSWORD=YourTestPassword123!
```

또는 명령어 실행 시 직접 설정:

```bash
E2E_EMAIL=test@example.com E2E_PASSWORD=Test1234! npm test
```

## 📋 테스트 시나리오 목록

### 1. 인증(Authentication) - `auth.spec.ts`
- [x] 회원가입 페이지 접근 및 폼 렌더링
- [x] 로그인 성공 플로우
- [x] 로그인 실패 - 잘못된 비밀번호
- [x] 비밀번호 찾기 페이지 접근
- [x] 비밀번호 찾기 - 이메일 전송 요청
- [x] 로그아웃 플로우
- [x] OAuth 로그인 버튼 렌더링 확인

### 2. 공동구매(Market) - `market.spec.ts`
- [x] 상품 목록 페이지 로드 및 상품 표시
- [x] 상품 목록 필터링 - 카테고리
- [x] 상품 상세 페이지 접근
- [x] 상품 등록 플로우 (로그인 필요)
- [x] 상품 찜하기/좋아요 기능
- [x] 상품 검색 기능
- [x] 상품 수정 페이지 접근 (작성자 권한)
- [x] 모집 마감 시간 표시 확인
- [x] 위치 기반 상품 필터링

### 3. 커뮤니티(Community) - `community.spec.ts`
- [x] 커뮤니티 목록 페이지 로드
- [x] 카테고리별 게시글 필터링
- [x] 게시글 상세 페이지 접근
- [x] 게시글 작성 플로우 (로그인 필요)
- [x] 이미지 업로드 UI 확인
- [x] 게시글 좋아요 기능
- [x] 댓글 작성 기능 (로그인 필요)
- [x] 게시글 수정 페이지 접근 (작성자 권한)
- [x] 게시글 검색 기능
- [x] 조회수 증가 확인

### 4. 마이페이지(MyPage) - `mypage.spec.ts`
- [x] 마이페이지 메인 접근
- [x] 프로필 정보 표시 확인
- [x] 구매 내역 페이지 접근
- [x] 찜한 상품 목록 확인
- [x] 내가 등록한 상품 목록
- [x] 내가 작성한 게시글 목록
- [x] 비밀번호 변경 페이지 접근
- [x] 비밀번호 변경 폼 유효성 검사
- [x] 프로필 이미지 업로드 영역 확인
- [x] 참여 중인 공동구매 목록
- [x] 완료된 공동구매 내역

### 5. 네비게이션(Navigation) - `navigation.spec.ts`
- [x] 메인 페이지 접근 및 렌더링
- [x] 헤더 네비게이션 메뉴 확인
- [x] Bottom Navigation 확인 (모바일)
- [x] 로그인 전/후 네비게이션 차이
- [x] 404 페이지 처리
- [x] 페이지 간 이동 (공동구매 → 커뮤니티)
- [x] 페이지 뒤로가기 동작
- [x] FAB(Floating Action Button) 확인
- [x] 브레드크럼(Breadcrumb) 네비게이션

### 6. 통합 시나리오(Integration) - `integration.spec.ts`
- [x] 전체 사용자 여정: 상품 검색 → 상세 → 찜하기
- [x] 전체 사용자 여정: 게시글 작성 → 조회 → 댓글
- [x] 반응형 디자인: 데스크톱 → 모바일 전환
- [x] 에러 처리: 네트워크 오류 시나리오
- [x] 성능: 페이지 로드 시간 측정
- [x] 접근성: 키보드 네비게이션
- [x] 브라우저 뒤로가기/앞으로가기 동작
- [x] 세션 지속성: 페이지 새로고침 후 로그인 상태 유지

## 🛠 헬퍼 함수

### `auth-helper.ts`
```typescript
// 로그인
await login(page, email, password);

// 로그아웃
await logout(page);

// 로그인 상태 확인
const isLoggedIn = await isLoggedIn(page);

// 초기 지역 설정
await setupInitialDivision(page);

// 로그인 + 지역 설정
await setupAuthenticatedContext(page);
```

## 📊 테스트 리포트

테스트 실행 후 HTML 리포트가 자동으로 생성됩니다:

```bash
npx playwright show-report
```

## 🔍 디버깅 팁

### 1. 특정 테스트만 실행
```typescript
test.only('테스트 이름', async ({ page }) => {
  // ...
});
```

### 2. 테스트 일시 중지 (디버깅)
```typescript
await page.pause();
```

### 3. 스크린샷 캡처
```typescript
await page.screenshot({ path: 'debug.png' });
```

### 4. 브라우저 콘솔 로그 확인
```typescript
page.on('console', msg => console.log(msg.text()));
```

## ⚠️ 주의사항

1. **환경변수**: 로그인이 필요한 테스트는 `E2E_EMAIL`, `E2E_PASSWORD` 설정 필요
2. **테스트 데이터**: 실제 데이터 생성/삭제를 수반할 수 있으므로 테스트 계정 사용 권장
3. **네트워크**: 백엔드 서버가 실행 중이어야 함 (기본값: `http://localhost:8080`)
4. **병렬 실행**: CI 환경에서는 순차 실행, 로컬에서는 병렬 실행

## 🎯 테스트 커버리지

| 기능 영역 | 테스트 수 | 커버리지 |
|----------|----------|----------|
| 인증 | 7 | ✅ 높음 |
| 공동구매 | 9 | ✅ 높음 |
| 커뮤니티 | 10 | ✅ 높음 |
| 마이페이지 | 11 | ✅ 높음 |
| 네비게이션 | 9 | ✅ 높음 |
| 통합 시나리오 | 8 | ✅ 높음 |

**총 테스트 케이스: 54개**

## 📝 테스트 작성 가이드

새로운 테스트를 추가할 때 다음 구조를 따라주세요:

```typescript
import { test, expect } from '@playwright/test';
import { setupInitialDivision } from './helpers/auth-helper';

test.describe('기능 영역', () => {
  test.beforeEach(async ({ page }) => {
    await setupInitialDivision(page);
  });

  test('테스트 설명', async ({ page }) => {
    // 1. 페이지 이동
    await page.goto('/your-page');
    await page.waitForLoadState('networkidle');

    // 2. 액션 수행
    await page.click('button');

    // 3. 검증
    await expect(page.locator('element')).toBeVisible();
  });
});
```

## 🚦 CI/CD 통합

GitHub Actions에서 자동 실행:

```yaml
- name: Run E2E tests
  run: npm run test
  env:
    E2E_EMAIL: ${{ secrets.E2E_EMAIL }}
    E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
```

## 📚 참고 자료

- [Playwright 공식 문서](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [프로젝트 README](../README.md)
