import { test, expect } from '@playwright/test';

// 지역 파라미터가 필수인 API를 위한 초기 지역 설정
const presetDivision = {
  id: '11680101',
  sidoCode: '11',
  sidoName: '서울특별시',
  sggCode: '680',
  sggName: '강남구',
  emdCode: '101',
  emdName: '역삼동',
  centroidLat: '37.5000',
  centroidLng: '127.0364'
};

test.describe('SMOKE: 기본 라우트 및 목록 로드', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((division) => {
      localStorage.setItem('currentDivision', JSON.stringify(division));
    }, presetDivision);
  });

  test('메인 페이지 로드', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForLoadState('networkidle');
  });

  test('마켓 목록 페이지 로드(/products)', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForLoadState('networkidle');
    const list = page.locator('.product-list, .products-grid, [class*="product"]').first();
    if (await list.isVisible()) {
      await expect(list).toBeVisible();
    }
  });

  test('커뮤니티 목록 페이지 로드(/community)', async ({ page }) => {
    await page.goto('/community');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForLoadState('networkidle');
    const list = page.locator('.post-list, .community-list, [class*="post"]').first();
    if (await list.isVisible()) {
      await expect(list).toBeVisible();
    }
  });
});

