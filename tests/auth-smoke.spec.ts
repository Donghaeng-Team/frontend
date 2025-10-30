import { test, expect } from '@playwright/test';

// 옵셔널 로그인 스모크: 환경변수 미설정 시 자동 skip
const hasCreds = !!process.env.E2E_EMAIL && !!process.env.E2E_PASSWORD;

test.describe('SMOKE: 로그인 (옵셔널)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('currentDivision', JSON.stringify({
        id: '11680101',
        sidoCode: '11',
        sidoName: '서울특별시',
        sggCode: '680',
        sggName: '강남구',
        emdCode: '101',
        emdName: '역삼동',
        centroidLat: '37.5000',
        centroidLng: '127.0364'
      }));
    });
  });

  test('로그인 성공 플로우 (env 필요)', async ({ page }) => {
    test.skip(!hasCreds, 'E2E_EMAIL/E2E_PASSWORD 미설정');

    await page.goto('/login-form');
    await expect(page.locator('body')).toBeVisible();

    await page.fill('input[name="email"], input[type="email"]', process.env.E2E_EMAIL!);
    await page.fill('input[name="password"], input[type="password"]', process.env.E2E_PASSWORD!);
    await page.click('button[type="submit"]');

    await page.waitForLoadState('domcontentloaded');
  });
});

