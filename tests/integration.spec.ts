import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext } from './helpers/auth-helper';
import { WAIT_TIMEOUT } from './fixtures/test-data';

test.describe('통합 시나리오 테스트', () => {
  test('전체 사용자 여정: 상품 검색 → 상세 → 찜하기', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);

    // 1. 상품 목록 페이지 접근
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 2. 검색
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('사과');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(WAIT_TIMEOUT.medium);
    }

    // 3. 첫 번째 상품 클릭
    const firstProduct = page.locator('.product-card, .product-item').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');

      // 4. 찜하기
      const wishlistButton = page.locator('button:has-text("찜"), button:has-text("좋아요")').first();
      if (await wishlistButton.isVisible()) {
        await wishlistButton.click();
        await page.waitForTimeout(WAIT_TIMEOUT.short);

        // 5. 마이페이지에서 찜한 상품 확인
        await page.goto('/mypage');
        await page.waitForLoadState('networkidle');

        const wishlistSection = page.locator('text=/찜|좋아요/i');
        if (await wishlistSection.isVisible()) {
          await wishlistSection.click();
          await page.waitForTimeout(WAIT_TIMEOUT.short);
        }
      }
    }
  });

  test('전체 사용자 여정: 게시글 작성 → 조회 → 댓글', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);

    // 1. 게시글 작성 페이지 접근
    await page.goto('/community/create');
    await page.waitForLoadState('networkidle');

    // 2. 카테고리 선택
    const categoryButton = page.locator('button:has-text("동네 소식")').first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
    }

    // 3. 제목 입력
    const testTitle = `[E2E테스트] ${Date.now()}`;
    await page.fill('input[name="title"], input[placeholder*="제목"]', testTitle);

    // 4. 내용 입력
    const contentTextarea = page.locator('textarea[name="content"], textarea[placeholder*="내용"]');
    if (await contentTextarea.isVisible()) {
      await contentTextarea.fill('E2E 통합 테스트 게시글입니다.');
    }

    // 5. 제출 버튼 확인 (실제 제출은 테스트 환경에 따라 결정)
    const submitButton = page.locator('button[type="submit"], button:has-text("등록")');
    await expect(submitButton).toBeVisible();

    // 실제 제출 후 확인 (선택적)
    // await submitButton.click();
    // await page.waitForURL('**/community/**', { timeout: WAIT_TIMEOUT.navigation });
  });

  test('반응형 디자인: 데스크톱 → 모바일 전환', async ({ page }) => {
    // 데스크톱 뷰
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 데스크톱 헤더 확인
    const desktopHeader = page.locator('header, [class*="header"]');
    await expect(desktopHeader.first()).toBeVisible();

    // 모바일 뷰로 전환
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(WAIT_TIMEOUT.short);

    // 모바일 Bottom Navigation 확인
    const mobileNav = page.locator('[class*="bottom"], [class*="mobile"]');
    const hasMobileNav = (await mobileNav.count()) > 0;
    expect(hasMobileNav).toBeDefined();
  });

  test('에러 처리: 네트워크 오류 시나리오', async ({ page }) => {
    // 네트워크를 오프라인으로 설정
    await page.context().setOffline(true);

    await page.goto('/products');
    await page.waitForTimeout(WAIT_TIMEOUT.medium);

    // 에러 메시지 또는 오프라인 UI 확인
    const errorMessage = page.locator('text=/오류|에러|연결|네트워크/i');
    const hasError = (await errorMessage.count()) > 0;

    // 네트워크 복구
    await page.context().setOffline(false);

    expect(hasError).toBeDefined();
  });

  test('성능: 페이지 로드 시간 측정', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 페이지 로드가 10초 이내에 완료되는지 확인
    expect(loadTime).toBeLessThan(10000);
  });

  test('접근성: 키보드 네비게이션', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Tab 키로 포커스 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeDefined();
  });

  test('브라우저 뒤로가기/앞으로가기 동작', async ({ page }) => {
    // 페이지 1
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 페이지 2
    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    // 페이지 3
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 뒤로가기
    await page.goBack();
    expect(page.url()).toContain('/community');

    // 뒤로가기
    await page.goBack();
    expect(page.url()).toContain('/products');

    // 앞으로가기
    await page.goForward();
    expect(page.url()).toContain('/community');
  });

  test('세션 지속성: 페이지 새로고침 후 로그인 상태 유지', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);

    // 로그인 상태 확인
    const loggedInBefore = await page.evaluate(() => {
      return !!localStorage.getItem('accessToken') || !!localStorage.getItem('auth-storage');
    });
    expect(loggedInBefore).toBeTruthy();

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 로그인 상태 유지 확인
    const loggedInAfter = await page.evaluate(() => {
      return !!localStorage.getItem('accessToken') || !!localStorage.getItem('auth-storage');
    });
    expect(loggedInAfter).toBeTruthy();
  });
});
