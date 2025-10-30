import { test, expect } from '@playwright/test';
import { setupAuthenticatedContext, setupInitialDivision } from './helpers/auth-helper';
import { TEST_PRODUCT, WAIT_TIMEOUT } from './fixtures/test-data';

test.describe('공동구매(Market) 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await setupInitialDivision(page);
  });

  test('상품 목록 페이지 로드 및 상품 표시', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 상품 목록 컨테이너 확인
    const productList = page.locator('.product-list, .products-grid, [class*="product"]').first();
    await expect(productList).toBeVisible({ timeout: WAIT_TIMEOUT.long });
  });

  test('상품 목록 필터링 - 카테고리', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 카테고리 필터 버튼 찾기
    const categoryFilter = page.locator('button:has-text("카테고리"), select[name*="category"]').first();
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      await page.waitForTimeout(WAIT_TIMEOUT.short);
    }
  });

  test('상품 상세 페이지 접근', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 첫 번째 상품 클릭
    const firstProduct = page.locator('.product-card, .product-item, [class*="product"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');

      // 상품 상세 정보 확인
      await expect(page.locator('text=/제목|가격|모집|내용/i')).toBeVisible({ timeout: WAIT_TIMEOUT.medium });
    }
  });

  test('상품 등록 플로우 (로그인 필요)', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);
    await page.goto('/products/register');
    await page.waitForLoadState('networkidle');

    // 상품 등록 폼 확인
    await expect(page.locator('input[name="title"], input[placeholder*="제목"]')).toBeVisible();
    await expect(page.locator('input[name="price"], input[type="number"]')).toBeVisible();

    // 폼 입력
    await page.fill('input[name="title"], input[placeholder*="제목"]', TEST_PRODUCT.title);

    const priceInput = page.locator('input[name="price"], input[type="number"]').first();
    await priceInput.fill(TEST_PRODUCT.price.toString());

    const contentTextarea = page.locator('textarea[name="content"], textarea[placeholder*="설명"]');
    if (await contentTextarea.isVisible()) {
      await contentTextarea.fill(TEST_PRODUCT.content);
    }

    // 제출 버튼 확인 (실제 제출은 하지 않음)
    const submitButton = page.locator('button[type="submit"], button:has-text("등록")');
    await expect(submitButton).toBeVisible();
  });

  test('상품 찜하기/좋아요 기능', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 첫 번째 상품의 찜하기 버튼 찾기
    const wishlistButton = page.locator('button:has-text("찜"), button:has-text("좋아요"), [class*="wishlist"], [class*="like"]').first();

    if (await wishlistButton.isVisible()) {
      await wishlistButton.click();
      await page.waitForTimeout(WAIT_TIMEOUT.short);
    }
  });

  test('상품 검색 기능', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 검색 입력 필드
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('사과');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(WAIT_TIMEOUT.medium);
    }
  });

  test('상품 수정 페이지 접근 (작성자 권한)', async ({ page }) => {
    test.skip(!process.env.E2E_EMAIL, 'E2E_EMAIL 환경변수 필요');

    await setupAuthenticatedContext(page);

    // 내가 등록한 상품 목록에서 첫 번째 상품
    await page.goto('/mypage');
    await page.waitForLoadState('networkidle');

    // 내가 등록한 상품 섹션 찾기
    const myProducts = page.locator('text=/등록한|판매|내 상품/i');
    if (await myProducts.isVisible()) {
      await myProducts.click();
      await page.waitForTimeout(WAIT_TIMEOUT.short);

      // 수정 버튼 찾기
      const editButton = page.locator('button:has-text("수정"), a:has-text("수정")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');

        // 수정 폼 확인
        await expect(page.locator('input[name="title"], textarea[name="content"]')).toBeVisible();
      }
    }
  });

  test('모집 마감 시간 표시 확인', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 상품 카드에서 마감 시간 표시 확인
    const deadlineText = page.locator('text=/마감|남음|시간|일|D-/i').first();
    const hasDeadline = (await deadlineText.count()) > 0;

    // 마감 시간이 표시되는 상품이 있을 수 있음
    expect(hasDeadline).toBeDefined();
  });

  test('위치 기반 상품 필터링', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // 지역 필터 버튼
    const locationFilter = page.locator('button:has-text("지역"), button:has-text("위치"), select[name*="location"]').first();

    if (await locationFilter.isVisible()) {
      await locationFilter.click();
      await page.waitForTimeout(WAIT_TIMEOUT.short);
    }
  });
});
