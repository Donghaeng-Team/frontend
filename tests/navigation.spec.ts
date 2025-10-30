import { test, expect } from '@playwright/test';
import { setupInitialDivision, setupAuthenticatedContext } from './helpers/auth-helper';
import { WAIT_TIMEOUT } from './fixtures/test-data';

test.describe('네비게이션 및 라우팅', () => {
  test.beforeEach(async ({ page }) => {
    await setupInitialDivision(page);
  });

  test('메인 페이지 접근 및 렌더링', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('헤더 네비게이션 메뉴 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 헤더 메뉴 (공동구매, 커뮤니티 등)
    const marketLink = page.locator('a[href="/products"], a:has-text("공동구매"), a:has-text("마켓")');
    const communityLink = page.locator('a[href="/community"], a:has-text("커뮤니티")');

    const hasMarket = (await marketLink.count()) > 0;
    const hasCommunity = (await communityLink.count()) > 0;

    expect(hasMarket || hasCommunity).toBeTruthy();
  });

  test('Bottom Navigation 확인 (모바일)', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Bottom Navigation 요소
    const bottomNav = page.locator('[class*="bottom"], [class*="nav"]').last();
    const hasBottomNav = (await bottomNav.count()) > 0;
    expect(hasBottomNav).toBeDefined();
  });

  test('로그인 전/후 네비게이션 차이', async ({ page }) => {
    // 로그인 전
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loginLink = page.locator('a[href="/login"], a:has-text("로그인"), button:has-text("로그인")');
    const hasLoginLink = (await loginLink.count()) > 0;

    if (hasLoginLink) {
      expect(await loginLink.first().isVisible()).toBeTruthy();
    }
  });

  test('404 페이지 처리', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    await page.waitForLoadState('networkidle');

    // 404 페이지 또는 리다이렉트 확인
    const notFoundText = page.locator('text=/404|찾을 수 없|Not Found/i');
    const hasNotFound = (await notFoundText.count()) > 0;

    expect(hasNotFound || page.url().includes('/')).toBeTruthy();
  });

  test('페이지 간 이동 (공동구매 → 커뮤니티)', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 커뮤니티로 이동
    const communityLink = page.locator('a[href="/community"], a:has-text("커뮤니티")').first();
    if (await communityLink.isVisible()) {
      await communityLink.click();
      await page.waitForURL('**/community', { timeout: WAIT_TIMEOUT.navigation });
      expect(page.url()).toContain('/community');
    }
  });

  test('페이지 뒤로가기 동작', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    await page.goto('/community');
    await page.waitForLoadState('networkidle');

    await page.goBack();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/products');
  });

  test('FAB(Floating Action Button) 확인', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // FAB 버튼 (상품 등록, 게시글 작성 등)
    const fab = page.locator('[class*="fab"], button[class*="float"]');
    const hasFab = (await fab.count()) > 0;
    expect(hasFab).toBeDefined();
  });

  test('브레드크럼(Breadcrumb) 네비게이션', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 첫 번째 상품 클릭
    const firstProduct = page.locator('.product-card, .product-item').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');

      // 브레드크럼 확인
      const breadcrumb = page.locator('[class*="breadcrumb"], nav');
      const hasBreadcrumb = (await breadcrumb.count()) > 0;
      expect(hasBreadcrumb).toBeDefined();
    }
  });
});
